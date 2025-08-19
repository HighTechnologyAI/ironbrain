# IronBrain Jetson Software

Данная папка содержит все компоненты для развертывания клиентской части системы IronBrain на Jetson Nano.

## Структура папки

```
jetson_soft/
├── tcp_mavlink_bridge.py      # TCP MAVLink мост
├── orange_cube_setup.py       # Настройка автопилота
├── jetson_deployment.sh       # Скрипт развертывания
├── README.md                  # Оригинальный README (Pro Mega Spot)
└── README_IRONBRAIN.md        # Данный файл (IronBrain)
```

## Компоненты

### TCP MAVLink Bridge

**tcp_mavlink_bridge.py** - Основной компонент для связи между автопилотом и внешними системами через TCP.

Функции:
- Подключение к Orange Cube через Serial (921600 baud)
- TCP сервер на порту 14560
- Двусторонняя передача MAVLink сообщений
- Статистика и мониторинг соединений
- Поддержка множественных клиентов

### Orange Cube Setup

**orange_cube_setup.py** - Скрипт для оптимальной настройки параметров автопилота.

Функции:
- Настройка SERIAL1 для внешней телеметрии
- Оптимизация скорости передачи (921600 baud)
- Конфигурация потоков данных
- Сохранение параметров в EEPROM

### Deployment Script

**jetson_deployment.sh** - Автоматический скрипт развертывания всей Jetson инфраструктуры.

Функции:
- Установка всех зависимостей
- Настройка systemd сервисов
- Конфигурация ngrok туннелей
- Создание управляющих скриптов
- Мониторинг системы

## Быстрый старт

### Автоматическое развертывание

```bash
# Клонирование репозитория
git clone https://github.com/HighTechnologyAI/ironbrain.git
cd ironbrain

# Запуск развертывания
./jetson_soft/jetson_deployment.sh
```

### Ручное развертывание

```bash
# Установка зависимостей
sudo apt update && sudo apt install -y python3 python3-pip
pip3 install --user pymavlink requests pyserial

# Копирование файлов
mkdir -p ~/ironbrain-real
cp jetson_soft/tcp_mavlink_bridge.py ~/ironbrain-real/
cp jetson_soft/orange_cube_setup.py ~/ironbrain-real/

# Настройка автопилота
python3 ~/ironbrain-real/orange_cube_setup.py

# Запуск TCP моста
python3 ~/ironbrain-real/tcp_mavlink_bridge.py
```

## Конфигурация

### Подключение автопилота

```bash
# Проверка подключения Orange Cube
ls -la /dev/ttyACM*

# Добавление пользователя в группу dialout
sudo usermod -a -G dialout $USER

# Проверка прав доступа
groups $USER | grep dialout
```

### Параметры автопилота

Оптимальные параметры для Orange Cube:

```
SERIAL1_PROTOCOL = 2      # MAVLink2
SERIAL1_BAUD = 921        # 921600 baud
SR1_EXT_STAT = 2         # Extended status 2Hz
SR1_EXTRA1 = 4           # Extra1 4Hz
SR1_EXTRA2 = 4           # Extra2 4Hz
SR1_EXTRA3 = 2           # Extra3 2Hz
SR1_POSITION = 2         # Position 2Hz
SR1_RAW_SENS = 2         # Raw sensors 2Hz
SR1_RC_CHAN = 2          # RC channels 2Hz
```

### Ngrok туннели

```bash
# Установка ngrok
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz
tar xzf ngrok-v3-stable-linux-arm64.tgz
sudo mv ngrok /usr/local/bin/

# Запуск SSH туннеля
ngrok tcp 22

# Запуск MAVLink туннеля
ngrok tcp 14560
```

## Использование

### Управляющие команды

После развертывания доступны следующие алиасы:

```bash
# Запуск TCP моста
ib-start

# Настройка ngrok туннелей
ib-ngrok

# Мониторинг системы
ib-monitor

# Просмотр логов
ib-logs

# Статус сервисов
ib-status
```

### Systemd сервисы

```bash
# Запуск TCP моста
sudo systemctl start ironbrain-tcp-bridge

# Остановка TCP моста
sudo systemctl stop ironbrain-tcp-bridge

# Статус сервиса
sudo systemctl status ironbrain-tcp-bridge

# Просмотр логов
journalctl -u ironbrain-tcp-bridge -f
```

### Screen сессии

```bash
# Просмотр активных сессий
screen -list

# Подключение к TCP мосту
screen -r tcp_bridge

# Подключение к ngrok SSH
screen -r ngrok_ssh

# Подключение к ngrok MAVLink
screen -r ngrok_mavlink
```

## Мониторинг

### Логи системы

```bash
# TCP мост логи
tail -f ~/ironbrain-real/logs/tcp_bridge.log

# Ngrok логи
tail -f ~/ironbrain-real/logs/ngrok_*.log

# Системные логи
journalctl -u ironbrain-tcp-bridge -f
```

### Статистика TCP моста

TCP мост выводит статистику каждые 30 секунд:

```
📊 === TCP MAVLINK BRIDGE STATISTICS ===
⏱️ Uptime: 0:05:23
📡 Messages from autopilot: 12394
👥 Messages to clients: 419
💓 Heartbeat messages: 424
📋 Parameters processed: 1062
🔗 Active connections: 1
❌ Errors: 0
```

### Проверка соединений

```bash
# Проверка автопилота
python3 -c "
from pymavlink import mavutil
master = mavutil.mavlink_connection('/dev/ttyACM0', baud=921600)
master.wait_heartbeat()
print('Autopilot connected:', master.target_system)
"

# Проверка TCP моста
netstat -tuln | grep :14560

# Проверка ngrok туннелей
curl -s http://localhost:4040/api/tunnels
```

## Устранение неполадок

### Автопилот не отвечает

```bash
# Проверка физического подключения
lsusb | grep -i cube

# Проверка устройства
ls -la /dev/ttyACM*

# Проверка прав доступа
sudo chmod 666 /dev/ttyACM0

# Тест подключения
python3 -c "
import serial
ser = serial.Serial('/dev/ttyACM0', 921600, timeout=1)
print('Serial port opened successfully')
ser.close()
"
```

### TCP мост не запускается

```bash
# Проверка занятости порта
netstat -tuln | grep :14560

# Остановка конфликтующих процессов
pkill -f tcp_mavlink_bridge

# Проверка логов
tail -f ~/ironbrain-real/logs/tcp_bridge.log

# Ручной запуск для диагностики
python3 ~/ironbrain-real/tcp_mavlink_bridge.py
```

### Ngrok туннели не работают

```bash
# Проверка процессов ngrok
ps aux | grep ngrok

# Перезапуск ngrok
pkill ngrok
sleep 3
screen -dmS ngrok_ssh bash -c "ngrok tcp 22"
screen -dmS ngrok_mavlink bash -c "ngrok tcp 14560"

# Проверка туннелей
curl -s http://localhost:4040/api/tunnels | python3 -m json.tool
```

### Mission Planner не подключается

```bash
# Получение ngrok URL
curl -s http://localhost:4040/api/tunnels | grep "tcp.*14560"

# Тест подключения к TCP мосту
python3 -c "
from pymavlink import mavutil
master = mavutil.mavlink_connection('tcp:localhost:14560')
master.wait_heartbeat()
print('TCP bridge working')
"

# Проверка статистики моста
# (статистика выводится в логи каждые 30 секунд)
```

## Обновление

### Обновление TCP моста

```bash
# Остановка сервиса
sudo systemctl stop ironbrain-tcp-bridge

# Обновление кода
cp jetson_soft/tcp_mavlink_bridge.py ~/ironbrain-real/

# Запуск сервиса
sudo systemctl start ironbrain-tcp-bridge
```

### Обновление настроек автопилота

```bash
# Запуск скрипта настройки
python3 jetson_soft/orange_cube_setup.py

# Проверка применения параметров
python3 -c "
from pymavlink import mavutil
master = mavutil.mavlink_connection('/dev/ttyACM0', baud=921600)
master.wait_heartbeat()
master.mav.param_request_read_send(master.target_system, master.target_component, b'SERIAL1_BAUD', -1)
"
```

## Производительность

### Оптимизация системы

```bash
# Увеличение приоритета TCP моста
sudo renice -10 $(pgrep -f tcp_mavlink_bridge)

# Настройка CPU governor
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Мониторинг ресурсов
htop
```

### Мониторинг температуры

```bash
# Проверка температуры
cat /sys/class/thermal/thermal_zone*/temp

# Мониторинг в реальном времени
watch -n 1 'echo "CPU: $(($(cat /sys/class/thermal/thermal_zone0/temp)/1000))°C"'
```

## Интеграция

### Подключение к VPS

TCP мост автоматически работает с VPS через ngrok туннели. Для прямого подключения:

```bash
# Настройка статического IP (если доступен)
# В tcp_mavlink_bridge.py изменить:
# VPS_HOST = "87.120.254.156"
# VPS_PORT = 14551
```

### Подключение к Tiger CRM

Tiger CRM использует отдельный HTTP клиент:

```bash
# Проверка HTTP клиента
ps aux | grep jetson_client

# Запуск HTTP клиента (если не запущен)
python3 /opt/ironbrain/jetson_client.py &
```

## Безопасность

### Настройка firewall

```bash
# Установка ufw
sudo apt install ufw

# Базовые правила
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Разрешенные порты
sudo ufw allow 22/tcp        # SSH
sudo ufw allow 14560/tcp     # TCP MAVLink Bridge

# Включение firewall
sudo ufw enable
```

### SSH ключи

```bash
# Генерация SSH ключа
ssh-keygen -t rsa -b 4096 -f ~/.ssh/jetson_key

# Добавление в authorized_keys
cat ~/.ssh/jetson_key.pub >> ~/.ssh/authorized_keys

# Настройка прав
chmod 600 ~/.ssh/jetson_key
chmod 644 ~/.ssh/jetson_key.pub
```

## Поддержка

Для получения поддержки:

1. Проверьте логи системы: `ib-logs`
2. Запустите мониторинг: `ib-monitor`
3. Проверьте статус сервисов: `ib-status`
4. Создайте issue в GitHub репозитории
5. Обратитесь к документации в `readme/19_08_checkpoint/`

## Версии

- **v1.0** - Базовая функциональность UDP MAVLink
- **v2.0** - TCP MAVLink мост для Mission Planner
- **v2.1** - Планируется: улучшенная диагностика и автовосстановление

## Совместимость

### Поддерживаемые автопилоты
- Orange Cube (Pixhawk 2.1)
- Pixhawk 4/5/6
- Cube Orange+
- Другие ArduPilot совместимые

### Поддерживаемые наземные станции
- Mission Planner (TCP)
- QGroundControl (TCP)
- MAVProxy (TCP)
- Tiger CRM (HTTP)


# Руководство по внедрению IronBrain v2.0

**Автор:** Manus AI  
**Дата:** 19 августа 2025  
**Версия:** 2.0  
**Статус:** Готово к внедрению

## Обзор

Данное руководство содержит пошаговые инструкции по развертыванию оптимизированной системы IronBrain с поддержкой Mission Planner через TCP MAVLink архитектуру. Система обеспечивает универсальную совместимость с Tiger CRM и Mission Planner одновременно.

## Архитектура системы

### Компоненты системы

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mission       │    │      VPS        │    │     Jetson      │
│   Planner       │◄──►│   TCP Proxy     │◄──►│   TCP Bridge    │
│                 │    │  87.120.254.156 │    │  192.168.1.236  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                ▲                        ▲
                                │                        │
┌─────────────────┐             │              ┌─────────────────┐
│   Tiger CRM     │◄────────────┘              │  Orange Cube    │
│   Web Interface │                            │   Autopilot     │
└─────────────────┘                            └─────────────────┘
```

### Протоколы связи

- **Tiger CRM ↔ VPS:** HTTP/HTTPS через ngrok
- **Mission Planner ↔ VPS:** TCP через ngrok
- **VPS ↔ Jetson:** TCP через ngrok туннель
- **Jetson ↔ Autopilot:** MAVLink через Serial (921600 baud)

## Развертывание VPS

### Предварительные требования

- Ubuntu 22.04 LTS
- Минимум 2GB RAM, 20GB диск
- Публичный IP адрес
- Права root доступа

### Автоматическое развертывание

```bash
# Скачивание репозитория
git clone https://github.com/HighTechnologyAI/ironbrain.git
cd ironbrain

# Запуск автоматического развертывания
sudo ./VPS/deployment_scripts/deploy_vps.sh
```

### Ручное развертывание

#### 1. Установка зависимостей

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка пакетов
sudo apt install -y python3 python3-pip nginx supervisor ufw

# Python зависимости
pip3 install flask flask-cors pymavlink gunicorn
```

#### 2. Конфигурация сервисов

```bash
# Копирование API сервисов
sudo cp VPS/api_services/drone_control_api_v2.py /opt/ironbrain/api/
sudo cp VPS/tcp_proxy/mavlink_tcp_proxy.py /opt/ironbrain/api/

# Конфигурация Nginx
sudo cp VPS/nginx_configs/ironbrain.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/ironbrain.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

#### 3. Настройка systemd сервисов

```bash
# Создание сервиса API v2
sudo tee /etc/systemd/system/ironbrain-api-v2.service > /dev/null << 'EOF'
[Unit]
Description=IronBrain API v2 Service
After=network.target

[Service]
Type=simple
User=ironbrain
WorkingDirectory=/opt/ironbrain/api
ExecStart=/usr/bin/python3 drone_control_api_v2.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Запуск сервисов
sudo systemctl daemon-reload
sudo systemctl enable ironbrain-api-v2
sudo systemctl start ironbrain-api-v2
```

#### 4. Конфигурация Firewall

```bash
# Настройка UFW
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 3002/tcp    # API v2
sudo ufw allow 14551/tcp   # MAVLink TCP Proxy
sudo ufw enable
```

### Проверка развертывания VPS

```bash
# Проверка сервисов
sudo systemctl status ironbrain-api-v2
sudo systemctl status nginx

# Тест API
curl http://localhost/health
curl http://localhost/api/v2/mavlink/status

# Проверка портов
netstat -tuln | grep -E ":80|:3002|:14551"
```

## Развертывание Jetson

### Предварительные требования

- Jetson Nano с Ubuntu 18.04/20.04
- Orange Cube подключен к /dev/ttyACM0
- Доступ к интернету
- Права sudo

### Автоматическое развертывание

```bash
# Скачивание репозитория
git clone https://github.com/HighTechnologyAI/ironbrain.git
cd ironbrain

# Запуск развертывания
./jetson_soft/jetson_deployment.sh
```

### Ручное развертывание

#### 1. Установка зависимостей

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка пакетов
sudo apt install -y python3 python3-pip curl wget git screen

# Python зависимости
pip3 install --user pymavlink requests pyserial
```

#### 2. Настройка автопилота

```bash
# Проверка подключения
ls -la /dev/ttyACM*

# Добавление пользователя в группу dialout
sudo usermod -a -G dialout $USER

# Настройка Orange Cube
python3 jetson_soft/orange_cube_setup.py
```

#### 3. Установка ngrok

```bash
# Скачивание ngrok для ARM64
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz
tar xzf ngrok-v3-stable-linux-arm64.tgz
sudo mv ngrok /usr/local/bin/
```

#### 4. Запуск TCP MAVLink моста

```bash
# Копирование скрипта
cp jetson_soft/tcp_mavlink_bridge.py ~/ironbrain-real/

# Запуск в screen сессии
screen -dmS tcp_bridge bash -c "cd ~/ironbrain-real && python3 tcp_mavlink_bridge.py"

# Проверка работы
screen -r tcp_bridge
```

#### 5. Настройка ngrok туннелей

```bash
# Запуск SSH туннеля
screen -dmS ngrok_ssh bash -c "ngrok tcp 22"

# Запуск MAVLink туннеля
screen -dmS ngrok_mavlink bash -c "ngrok tcp 14560"

# Получение URL туннелей
curl -s http://localhost:4040/api/tunnels | python3 -m json.tool
```

### Проверка развертывания Jetson

```bash
# Проверка процессов
ps aux | grep -E "tcp_mavlink|ngrok"

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

## Настройка Mission Planner

### Подключение через TCP

1. **Получение ngrok URL:**
   ```bash
   # На Jetson
   curl -s http://localhost:4040/api/tunnels | grep "tcp.*14560"
   ```

2. **Настройка Mission Planner:**
   - Connection Type: **TCP**
   - IP Address: **X.tcp.eu.ngrok.io** (из ngrok URL)
   - Port: **XXXXX** (из ngrok URL)
   - Baud Rate: **Не важно для TCP**

3. **Подключение:**
   - Нажать **Connect**
   - Дождаться загрузки параметров (30-60 секунд)
   - Проверить получение телеметрии

### Альтернативное подключение через VPS

1. **Настройка Mission Planner:**
   - Connection Type: **TCP**
   - IP Address: **87.120.254.156**
   - Port: **14551**

2. **Требования:**
   - VPS TCP прокси должен быть запущен
   - Jetson должен быть подключен к VPS

## Настройка Tiger CRM

### Конфигурация API

Tiger CRM продолжает работать через существующую HTTP архитектуру:

- **API Endpoint:** `https://46622cbabc95.ngrok.app/api/v1/`
- **Health Check:** `GET /api/v1/health`
- **Drone Status:** `GET /api/v1/drones/{id}/status`
- **Send Command:** `POST /api/v1/drones/{id}/command`

### Примеры команд

```bash
# Проверка состояния
curl https://46622cbabc95.ngrok.app/api/v1/health

# Получение статуса дрона
curl https://46622cbabc95.ngrok.app/api/v1/drones/jetson_001/status

# Отправка команды ARM
curl -X POST https://46622cbabc95.ngrok.app/api/v1/drones/jetson_001/command \
  -H "Content-Type: application/json" \
  -d '{"command": "ARM"}'
```

## Мониторинг и диагностика

### Логи системы

#### VPS логи
```bash
# API логи
tail -f /var/log/ironbrain/api_v2.log

# TCP прокси логи
tail -f /var/log/ironbrain/tcp_proxy.log

# Nginx логи
tail -f /var/log/nginx/ironbrain_access.log
```

#### Jetson логи
```bash
# TCP мост логи
tail -f ~/ironbrain-real/logs/tcp_bridge.log

# Ngrok логи
tail -f ~/ironbrain-real/logs/ngrok_*.log

# Системные логи
journalctl -u ironbrain-tcp-bridge -f
```

### Команды диагностики

#### Проверка соединений
```bash
# На VPS
netstat -tuln | grep -E ":80|:3002|:14551"
curl http://localhost/api/v2/mavlink/status

# На Jetson
netstat -tuln | grep :14560
curl -s http://localhost:4040/api/tunnels
```

#### Тестирование MAVLink
```bash
# Прямое подключение к автопилоту
python3 -c "
from pymavlink import mavutil
master = mavutil.mavlink_connection('/dev/ttyACM0', baud=921600)
master.wait_heartbeat()
print('System ID:', master.target_system)
"

# Тест через TCP мост
python3 -c "
from pymavlink import mavutil
master = mavutil.mavlink_connection('tcp:localhost:14560')
master.wait_heartbeat()
print('TCP Bridge working')
"
```

## Устранение неполадок

### Проблема: Mission Planner зависает на "Getting Params"

**Решение:**
1. Проверить ngrok туннель на Jetson
2. Убедиться что TCP мост запущен
3. Проверить подключение автопилота
4. Перезапустить TCP мост

```bash
# На Jetson
screen -S tcp_bridge -X quit
screen -dmS tcp_bridge bash -c "cd ~/ironbrain-real && python3 tcp_mavlink_bridge.py"
```

### Проблема: Tiger CRM не получает данные

**Решение:**
1. Проверить HTTP клиент на Jetson
2. Проверить ngrok HTTPS туннель
3. Проверить API v2 на VPS

```bash
# Проверка HTTP клиента
ps aux | grep jetson_client

# Тест API
curl https://46622cbabc95.ngrok.app/api/v1/health
```

### Проблема: Автопилот не отвечает

**Решение:**
1. Проверить физическое подключение USB
2. Проверить права доступа к /dev/ttyACM0
3. Перезапустить автопилот

```bash
# Проверка устройства
ls -la /dev/ttyACM*

# Проверка прав
groups $USER | grep dialout

# Тест подключения
python3 -c "
import serial
ser = serial.Serial('/dev/ttyACM0', 921600, timeout=1)
print('Serial port opened successfully')
ser.close()
"
```

## Обслуживание системы

### Регулярные задачи

#### Еженедельно
- Проверка логов на ошибки
- Мониторинг использования диска
- Обновление системных пакетов

#### Ежемесячно
- Ротация логов
- Проверка производительности
- Резервное копирование конфигураций

### Команды обслуживания

```bash
# Перезапуск всех сервисов VPS
sudo systemctl restart ironbrain-api-v2
sudo systemctl restart nginx

# Перезапуск сервисов Jetson
sudo systemctl restart ironbrain-tcp-bridge
screen -S ngrok_ssh -X quit && screen -dmS ngrok_ssh bash -c "ngrok tcp 22"

# Очистка логов
sudo truncate -s 0 /var/log/ironbrain/*.log
truncate -s 0 ~/ironbrain-real/logs/*.log
```

## Масштабирование

### Добавление дронов

Для добавления дополнительных дронов:

1. Развернуть Jetson софт на новом устройстве
2. Настроить уникальные ngrok туннели
3. Обновить конфигурацию VPS API
4. Добавить мониторинг новых устройств

### Балансировка нагрузки

Для высоких нагрузок:

1. Развернуть несколько VPS серверов
2. Настроить load balancer (nginx/HAProxy)
3. Использовать Redis для синхронизации состояния
4. Настроить мониторинг кластера

## Заключение

Данное руководство обеспечивает полное развертывание системы IronBrain v2.0 с поддержкой Mission Planner. Система готова к продуктивному использованию и может быть масштабирована для коммерческих применений.

Для получения поддержки обращайтесь к технической документации или создавайте issues в GitHub репозитории.


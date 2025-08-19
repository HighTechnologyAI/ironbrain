# Чек-лист развертывания IronBrain

## 🎯 Предварительные требования

### VPS Сервер
- [ ] Ubuntu 22.04 LTS установлена
- [ ] SSH доступ настроен (порт 22)
- [ ] Firewall провайдера настроен
- [ ] Статический IP адрес назначен

### Jetson Nano
- [ ] JetPack SDK установлен
- [ ] Python 3.8+ доступен
- [ ] WiFi/Ethernet подключение настроено
- [ ] SSH доступ к устройству

### Сетевая инфраструктура
- [ ] VPN сервер настроен (опционально)
- [ ] DNS записи созданы (опционально)
- [ ] SSL сертификаты получены (опционально)

## 🔧 Установка VPS компонентов

### 1. Базовая настройка системы
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка необходимых пакетов
sudo apt install -y python3 python3-pip nginx git curl wget

# Настройка firewall
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 5000/tcp
sudo ufw allow 5001/tcp
sudo ufw allow 8554/tcp
sudo ufw allow 51820/udp
```

### 2. Установка Drone Control API
```bash
# Клонирование репозитория
git clone <repository_url> /opt/drone-control-api
cd /opt/drone-control-api

# Установка зависимостей
pip3 install -r requirements.txt

# Настройка конфигурации
cp config.example.json config.json
# Отредактировать config.json с правильными настройками

# Создание systemd сервиса
sudo cp systemd/drone-control-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable drone-control-api
sudo systemctl start drone-control-api
```

### 3. Настройка Nginx
```bash
# Копирование конфигурации
sudo cp nginx/ironbrain.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/ironbrain.conf /etc/nginx/sites-enabled/

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 4. Проверка VPS установки
```bash
# Проверка статуса сервисов
sudo systemctl status drone-control-api
sudo systemctl status nginx

# Проверка портов
ss -tlnp | grep -E ":(22|80|3001)"

# Тест API
curl http://localhost:3001/api/v1/health
```

## 🤖 Установка Jetson Nano компонентов

### 1. Подготовка системы
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Python зависимостей
sudo apt install -y python3-pip python3-dev

# Установка системных зависимостей
sudo apt install -y libopencv-dev python3-opencv
```

### 2. Установка GCS Backend
```bash
# Клонирование репозитория
git clone <repository_url> /opt/jetson-gcs
cd /opt/jetson-gcs

# Установка зависимостей
pip3 install -r requirements.txt

# Настройка конфигурации
cp jetson_config.example.json jetson_config.json
# Отредактировать jetson_config.json с IP адресом VPS

# Создание systemd сервиса
sudo cp systemd/jetson-gcs-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable jetson-gcs-backend
sudo systemctl start jetson-gcs-backend
```

### 3. Настройка тепловизионной камеры (если доступна)
```bash
# Установка драйверов камеры
# (специфично для модели камеры)

# Настройка thermal camera сервиса
sudo cp systemd/thermal-camera.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable thermal-camera
sudo systemctl start thermal-camera
```

### 4. Проверка Jetson установки
```bash
# Проверка статуса сервисов
sudo systemctl status jetson-gcs-backend
sudo systemctl status thermal-camera

# Проверка подключения к VPS
ping <VPS_IP>

# Тест локальных сервисов
curl http://localhost:5000/health
curl http://localhost:5001/health
```

## 🔗 Настройка интеграции

### 1. Тестирование соединения VPS ↔ Jetson
```bash
# На Jetson: тест отправки телеметрии
python3 test_telemetry_send.py

# На VPS: проверка получения данных
tail -f /var/log/drone-control-api.log
```

### 2. Настройка Tiger CRM интеграции
```javascript
// Добавить в Tiger CRM конфигурацию
const IRONBRAIN_CONFIG = {
  api_base_url: "http://<VPS_IP>:3001/api/v1",
  websocket_url: "http://<VPS_IP>:3001",
  ssh_tunnel: {
    enabled: true,
    local_port: 3001,
    remote_host: "<VPS_IP>",
    remote_port: 3001
  }
};
```

### 3. Настройка VPN (рекомендуется)
```bash
# На VPS: установка WireGuard
sudo apt install -y wireguard

# Генерация ключей
wg genkey | tee privatekey | wg pubkey > publickey

# Настройка конфигурации
sudo nano /etc/wireguard/wg0.conf

# Запуск VPN сервера
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0
```

## ✅ Финальная проверка

### Чек-лист готовности системы
- [ ] VPS API отвечает на health check
- [ ] Jetson GCS Backend работает
- [ ] Thermal Camera (если есть) функционирует
- [ ] Интеграция VPS ↔ Jetson работает
- [ ] Firewall настроен корректно
- [ ] Все сервисы автозапускаются
- [ ] Логирование настроено
- [ ] Мониторинг работает

### Тесты производительности
```bash
# Запуск комплексного теста
python3 comprehensive_system_test.py

# Проверка результатов
cat test_results.json
```

### Документация готова
- [ ] Техническая документация
- [ ] Инструкции по эксплуатации
- [ ] Руководство по устранению неполадок
- [ ] API документация
- [ ] Контакты поддержки

## 🚀 Запуск в продакшен

### Финальные шаги
1. **Backup конфигураций** - создать резервные копии всех настроек
2. **Мониторинг** - настроить алерты и уведомления
3. **Документация** - передать техническую документацию команде
4. **Обучение** - провести обучение операторов системы
5. **Go-Live** - официальный запуск системы

### Контакты поддержки
- **Техническая поддержка:** [контактная информация]
- **Экстренные ситуации:** [контактная информация]
- **Документация:** [ссылка на репозиторий]

---

**Статус:** ✅ Готово к развертыванию  
**Версия:** 1.0.0  
**Дата:** 18 августа 2025


# IronBrain VPS Components

Данная папка содержит все компоненты для развертывания серверной части системы IronBrain на VPS.

## Структура папки

```
VPS/
├── api_services/           # API сервисы
│   └── drone_control_api_v2.py
├── nginx_configs/          # Конфигурации Nginx
│   └── ironbrain.conf
├── tcp_proxy/             # TCP прокси для MAVLink
│   └── mavlink_tcp_proxy.py
├── deployment_scripts/    # Скрипты развертывания
│   └── deploy_vps.sh
├── monitoring/           # Мониторинг (будущие компоненты)
└── README.md            # Данный файл
```

## Компоненты

### API Services

**drone_control_api_v2.py** - Основной API сервис для интеграции с Tiger CRM и поддержки Mission Planner.

Функции:
- REST API endpoints для Tiger CRM
- Статус MAVLink соединений
- Мониторинг системы
- Обработка телеметрии

Порты:
- 3002 - Основной API

### TCP Proxy

**mavlink_tcp_proxy.py** - TCP прокси для перенаправления MAVLink трафика от Mission Planner к Jetson через ngrok.

Функции:
- TCP сервер на порту 14551
- Перенаправление на ngrok туннель Jetson
- Статистика соединений
- Логирование трафика

### Nginx Configuration

**ironbrain.conf** - Полная конфигурация Nginx для IronBrain системы.

Функции:
- Reverse proxy для API сервисов
- CORS поддержка
- Rate limiting
- Логирование
- SSL termination (готовность)

### Deployment Scripts

**deploy_vps.sh** - Автоматический скрипт развертывания всей VPS инфраструктуры.

Функции:
- Установка всех зависимостей
- Конфигурация сервисов
- Настройка firewall
- Создание systemd сервисов
- Мониторинг системы

## Быстрый старт

### Автоматическое развертывание

```bash
# Клонирование репозитория
git clone https://github.com/HighTechnologyAI/ironbrain.git
cd ironbrain

# Запуск развертывания (требует root)
sudo ./VPS/deployment_scripts/deploy_vps.sh
```

### Ручное развертывание

```bash
# Установка зависимостей
sudo apt update && sudo apt install -y python3 python3-pip nginx
pip3 install flask flask-cors pymavlink

# Копирование файлов
sudo mkdir -p /opt/ironbrain/api
sudo cp VPS/api_services/*.py /opt/ironbrain/api/
sudo cp VPS/nginx_configs/ironbrain.conf /etc/nginx/sites-available/

# Запуск сервисов
sudo systemctl enable nginx
sudo systemctl start nginx
python3 /opt/ironbrain/api/drone_control_api_v2.py
```

## Конфигурация

### Переменные окружения

```bash
# API Configuration
export IRONBRAIN_API_PORT=3002
export IRONBRAIN_LOG_LEVEL=INFO

# TCP Proxy Configuration  
export MAVLINK_PROXY_PORT=14551
export NGROK_TARGET_HOST=7.tcp.eu.ngrok.io
export NGROK_TARGET_PORT=10317
```

### Порты

- **80** - HTTP (Nginx)
- **443** - HTTPS (Nginx, если настроен SSL)
- **3001** - API v1 (legacy)
- **3002** - API v2 (основной)
- **14551** - MAVLink TCP Proxy
- **8554** - RTSP (видео потоки)

### Firewall

```bash
# Основные порты
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 3002/tcp    # API v2
sudo ufw allow 14551/tcp   # MAVLink Proxy
```

## Мониторинг

### Логи

```bash
# API логи
tail -f /var/log/ironbrain/api_v2.log

# TCP Proxy логи
tail -f /var/log/ironbrain/tcp_proxy.log

# Nginx логи
tail -f /var/log/nginx/ironbrain_access.log
tail -f /var/log/nginx/ironbrain_error.log
```

### Статус сервисов

```bash
# Проверка systemd сервисов
sudo systemctl status ironbrain-api-v2
sudo systemctl status ironbrain-tcp-proxy
sudo systemctl status nginx

# Проверка портов
netstat -tuln | grep -E ":80|:3002|:14551"
```

### Health Checks

```bash
# API health check
curl http://localhost/health
curl http://localhost/api/v2/mavlink/status

# TCP proxy test
telnet localhost 14551
```

## Устранение неполадок

### API не отвечает

```bash
# Проверка процесса
ps aux | grep drone_control_api_v2

# Перезапуск сервиса
sudo systemctl restart ironbrain-api-v2

# Проверка логов
journalctl -u ironbrain-api-v2 -f
```

### TCP Proxy не работает

```bash
# Проверка ngrok соединения
curl -s http://7.tcp.eu.ngrok.io:10317 || echo "Ngrok недоступен"

# Перезапуск прокси
sudo systemctl restart ironbrain-tcp-proxy

# Тест подключения
python3 -c "
import socket
s = socket.socket()
s.connect(('localhost', 14551))
print('TCP Proxy доступен')
s.close()
"
```

### Nginx проблемы

```bash
# Тест конфигурации
sudo nginx -t

# Перезагрузка конфигурации
sudo nginx -s reload

# Проверка статуса
sudo systemctl status nginx
```

## Обновление

### Обновление API

```bash
# Остановка сервиса
sudo systemctl stop ironbrain-api-v2

# Обновление кода
sudo cp VPS/api_services/drone_control_api_v2.py /opt/ironbrain/api/

# Запуск сервиса
sudo systemctl start ironbrain-api-v2
```

### Обновление конфигурации Nginx

```bash
# Резервная копия
sudo cp /etc/nginx/sites-available/ironbrain.conf /etc/nginx/sites-available/ironbrain.conf.backup

# Обновление конфигурации
sudo cp VPS/nginx_configs/ironbrain.conf /etc/nginx/sites-available/

# Тест и перезагрузка
sudo nginx -t && sudo nginx -s reload
```

## Безопасность

### SSL/TLS

Для продуктивного использования рекомендуется настроить SSL:

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d yourdomain.com

# Автоматическое обновление
sudo crontab -e
# Добавить: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Аутентификация API

Для защиты API endpoints добавьте аутентификацию:

```python
# В drone_control_api_v2.py
from functools import wraps

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth = request.headers.get('Authorization')
        if not auth or not validate_token(auth):
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function
```

## Поддержка

Для получения поддержки:

1. Проверьте логи системы
2. Используйте команды диагностики
3. Создайте issue в GitHub репозитории
4. Обратитесь к документации в `readme/19_08_checkpoint/`

## Версии

- **v1.0** - Базовая функциональность Tiger CRM
- **v2.0** - Добавлена поддержка Mission Planner через TCP
- **v2.1** - Планируется: улучшенный мониторинг и масштабирование


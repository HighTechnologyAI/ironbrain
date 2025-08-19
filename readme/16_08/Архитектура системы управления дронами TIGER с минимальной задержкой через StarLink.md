# Архитектура системы управления дронами TIGER с минимальной задержкой через StarLink

## Введение

Данный документ представляет комплексную архитектуру системы управления дронами TIGER, оптимизированную для работы через спутниковую связь StarLink с минимальной задержкой. Архитектура учитывает ограничения CGNAT, требования к реальному времени и необходимость обеспечения надежной связи для критических операций.

## Общая архитектура системы

### Компоненты системы

Система состоит из следующих основных компонентов:

1. **Бортовая подсистема (Jetson Nano)**
   - Ground Control Station (GCS) Backend
   - MAVLink интерфейс к автопилоту
   - Видеокодировщик H.264
   - Сетевые адаптеры связи

2. **Наземная станция управления**
   - Tiger CRM веб-интерфейс
   - GCS Frontend
   - AI Assistant для автоматизации

3. **Облачная инфраструктура**
   - Relay серверы
   - WebRTC signaling серверы
   - База данных телеметрии

4. **Сетевая инфраструктура**
   - StarLink терминалы
   - VPN туннели
   - Резервные каналы связи

### Топология сети

```
TIGER 1 (Jetson Nano) ──┐
                        │
TIGER 2 (Jetson Nano) ──┼── StarLink ── Internet ── Cloud Relay ── Ground Control Station
                        │                                      │
TIGER 3 (Jetson Nano) ──┘                                      └── Tiger CRM System
```

## Детальная архитектура бортовой подсистемы

### Jetson Nano конфигурация

Каждый дрон TIGER оснащен следующими компонентами:

**Вычислительная платформа:**
- NVIDIA Jetson Nano 4GB
- Ubuntu 18.04+ с оптимизированным ядром
- Docker контейнеры для изоляции сервисов

**Автопилот и сенсоры:**
- Orange Cube автопилот
- 2x GPS модули Here3+
- IMU, барометр, магнитометр
- Камера для видеопотока

**Связь:**
- StarLink Gen3 роутер
- Резервный 4G/5G модем
- Wi-Fi для локального управления

### Программная архитектура Jetson Nano

```
┌─────────────────────────────────────────────┐
│                Tiger GCS                    │
├─────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────────────┐│
│  │   Frontend  │  │       Backend           ││
│  │   (React)   │  │    (Node.js/Python)    ││
│  └─────────────┘  └─────────────────────────┘│
├─────────────────────────────────────────────┤
│              Communication Layer            │
│  ┌─────────────┐  ┌─────────────────────────┐│
│  │   MAVLink   │  │    Video Streaming      ││
│  │  Interface  │  │     (GStreamer)         ││
│  └─────────────┘  └─────────────────────────┘│
├─────────────────────────────────────────────┤
│               Network Layer                 │
│  ┌─────────────┐  ┌─────────────────────────┐│
│  │ VPN Client  │  │   WebRTC Client         ││
│  │(WireGuard)  │  │                         ││
│  └─────────────┘  └─────────────────────────┘│
└─────────────────────────────────────────────┘
```

### Сервисы на Jetson Nano

**1. GCS Backend Service**
```python
# Основной сервис управления дроном
class DroneControlService:
    def __init__(self):
        self.mavlink_connection = MAVLinkConnection()
        self.video_streamer = VideoStreamer()
        self.network_manager = NetworkManager()
    
    async def start_services(self):
        await asyncio.gather(
            self.mavlink_connection.start(),
            self.video_streamer.start(),
            self.network_manager.start()
        )
```

**2. MAVLink Interface**
- Подключение к Orange Cube через UART/USB
- Обработка телеметрии в реальном времени
- Передача команд управления
- Буферизация критических сообщений

**3. Video Streaming Service**
```bash
# GStreamer pipeline для H.264 с минимальной задержкой
gst-launch-1.0 v4l2src device=/dev/video0 ! \
    video/x-raw,width=1920,height=1080,framerate=30/1 ! \
    omxh264enc bitrate=5000000 control-rate=2 ! \
    h264parse ! rtph264pay config-interval=1 pt=96 ! \
    udpsink host=relay-server.com port=5600
```

## Сетевая архитектура и обход ограничений StarLink

### Многоуровневая система связи

Для обеспечения минимальной задержки и максимальной надежности используется многоуровневая система связи:

**Уровень 1: Прямое WebRTC соединение (приоритет)**
- Попытка установления P2P соединения через STUN
- Использование для видеопотока при успешном соединении
- Задержка: 5-20ms дополнительно

**Уровень 2: VPN туннель (основной канал)**
- WireGuard VPN через выделенный VPS
- Используется для MAVLink телеметрии
- Задержка: 20-50ms дополнительно

**Уровень 3: Cloud Relay (резервный канал)**
- WebSocket соединения через облачный relay
- Активируется при недоступности других каналов
- Задержка: 30-100ms дополнительно

### Конфигурация VPN туннеля

**На VPS сервере:**
```bash
# WireGuard конфигурация сервера
[Interface]
PrivateKey = <server_private_key>
Address = 10.0.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT

# Клиент TIGER 1
[Peer]
PublicKey = <tiger1_public_key>
AllowedIPs = 10.0.0.2/32

# Клиент TIGER 2
[Peer]
PublicKey = <tiger2_public_key>
AllowedIPs = 10.0.0.3/32
```

**На Jetson Nano:**
```bash
# WireGuard конфигурация клиента
[Interface]
PrivateKey = <client_private_key>
Address = 10.0.0.2/24
DNS = 8.8.8.8

[Peer]
PublicKey = <server_public_key>
Endpoint = your-vps.com:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
```

### WebRTC архитектура

**Signaling Server:**
```javascript
// WebRTC signaling сервер
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        // Relay signaling messages between drone and GCS
        broadcastToOthers(ws, data);
    });
});
```

**STUN/TURN серверы:**
```json
{
  "iceServers": [
    { "urls": "stun:stun.l.google.com:19302" },
    { 
      "urls": "turn:your-turn-server.com:3478",
      "username": "user",
      "credential": "pass"
    }
  ]
}
```

## Наземная станция управления

### Tiger CRM интеграция

Наземная станция управления интегрируется с существующей Tiger CRM системой, обеспечивая единый интерфейс для управления флотом дронов.

**Архитектура веб-интерфейса:**
```
┌─────────────────────────────────────────────┐
│              Tiger CRM Frontend             │
│                (React/TypeScript)           │
├─────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────────────┐│
│  │   Drone     │  │      Mission            ││
│  │ Management  │  │     Planning            ││
│  └─────────────┘  └─────────────────────────┘│
│  ┌─────────────┐  ┌─────────────────────────┐│
│  │  Real-time  │  │    AI Assistant         ││
│  │ Telemetry   │  │                         ││
│  └─────────────┘  └─────────────────────────┘│
├─────────────────────────────────────────────┤
│              Backend Services               │
│                (Supabase)                   │
└─────────────────────────────────────────────┘
```

### Компоненты интерфейса

**1. Селектор дронов**
- Список доступных дронов TIGER
- Статус подключения каждого дрона
- Переключение между дронами
- Групповое управление

**2. Панель телеметрии**
- GPS координаты и высота
- Скорость и направление
- Состояние батареи
- Статус автопилота
- Качество связи

**3. Видеопоток**
- H.264 декодер в браузере
- Полноэкранный режим
- Запись видео
- Снимки экрана

**4. Панель управления**
- Взлет/посадка
- Изменение режимов полета
- Управление камерой
- Экстренная остановка

## Протоколы связи и оптимизация

### MAVLink оптимизация

**Приоритизация сообщений:**
```python
# Конфигурация потоков MAVLink
STREAM_RATES = {
    'HEARTBEAT': 1,           # 1 Hz
    'SYS_STATUS': 1,          # 1 Hz  
    'GPS_RAW_INT': 5,         # 5 Hz
    'ATTITUDE': 10,           # 10 Hz
    'LOCAL_POSITION_NED': 10, # 10 Hz
    'RC_CHANNELS_RAW': 5,     # 5 Hz
    'SERVO_OUTPUT_RAW': 2,    # 2 Hz
}
```

**Адаптивная частота обновления:**
```python
class AdaptiveMAVLink:
    def adjust_rates_by_latency(self, latency_ms):
        if latency_ms > 200:
            # Снижаем частоту при высокой задержке
            self.reduce_stream_rates(0.5)
        elif latency_ms < 50:
            # Увеличиваем частоту при низкой задержке
            self.increase_stream_rates(1.5)
```

### Видеопоток оптимизация

**Адаптивный битрейт:**
```python
class AdaptiveBitrate:
    def __init__(self):
        self.target_latency = 100  # ms
        self.current_bitrate = 5000000  # 5 Mbps
    
    def adjust_bitrate(self, network_stats):
        if network_stats.packet_loss > 0.05:
            self.current_bitrate *= 0.8
        elif network_stats.latency > self.target_latency:
            self.current_bitrate *= 0.9
        else:
            self.current_bitrate *= 1.1
```

**Буферизация и предсказание:**
```python
class VideoBuffer:
    def __init__(self):
        self.buffer_size = 3  # frames
        self.prediction_enabled = True
    
    def optimize_for_latency(self):
        # Минимальная буферизация для низкой задержки
        self.buffer_size = 1
        self.enable_frame_dropping = True
```

## Обеспечение отказоустойчивости

### Автоматическое переключение каналов

```python
class ConnectionManager:
    def __init__(self):
        self.connections = {
            'webrtc': WebRTCConnection(),
            'vpn': VPNConnection(), 
            'relay': RelayConnection()
        }
        self.active_connection = None
    
    async def monitor_connections(self):
        while True:
            best_connection = self.select_best_connection()
            if best_connection != self.active_connection:
                await self.switch_connection(best_connection)
            await asyncio.sleep(1)
    
    def select_best_connection(self):
        # Выбор соединения по критериям:
        # 1. Задержка
        # 2. Потеря пакетов
        # 3. Пропускная способность
        pass
```

### Локальная автономность

**Автопилот резервирование:**
- Предзагруженные миссии на Orange Cube
- Автоматический возврат домой при потере связи
- Локальное избежание препятствий

**Jetson Nano автономность:**
- Локальное принятие решений
- Кэширование критических данных
- Автоматическое восстановление соединений

## Мониторинг и диагностика

### Система метрик

```python
class MetricsCollector:
    def collect_network_metrics(self):
        return {
            'latency_ms': self.measure_latency(),
            'packet_loss_percent': self.measure_packet_loss(),
            'bandwidth_mbps': self.measure_bandwidth(),
            'connection_type': self.get_active_connection(),
            'signal_strength': self.get_signal_strength()
        }
    
    def collect_drone_metrics(self):
        return {
            'battery_voltage': self.get_battery_voltage(),
            'gps_satellites': self.get_gps_satellites(),
            'flight_mode': self.get_flight_mode(),
            'altitude_m': self.get_altitude(),
            'speed_ms': self.get_speed()
        }
```

### Алерты и уведомления

- Критические алерты через Telegram API
- Email уведомления для администраторов
- SMS для экстренных ситуаций
- Интеграция с Tiger CRM системой уведомлений

## Безопасность системы

### Шифрование данных

**MAVLink шифрование:**
```python
# AES-256 шифрование MAVLink сообщений
from cryptography.fernet import Fernet

class SecureMAVLink:
    def __init__(self, key):
        self.cipher = Fernet(key)
    
    def encrypt_message(self, mavlink_msg):
        return self.cipher.encrypt(mavlink_msg.pack())
    
    def decrypt_message(self, encrypted_data):
        return self.cipher.decrypt(encrypted_data)
```

**Видеопоток шифрование:**
- SRTP для WebRTC соединений
- WireGuard шифрование для VPN
- TLS для облачных relay соединений

### Аутентификация и авторизация

**JWT токены:**
```python
class DroneAuth:
    def generate_drone_token(self, drone_id):
        payload = {
            'drone_id': drone_id,
            'exp': datetime.utcnow() + timedelta(hours=24),
            'permissions': ['telemetry', 'control', 'video']
        }
        return jwt.encode(payload, SECRET_KEY, algorithm='HS256')
```

**Роли пользователей:**
- Pilot: Полное управление назначенными дронами
- Observer: Только просмотр телеметрии и видео
- Administrator: Управление системой и пользователями
- Emergency: Экстренное управление всеми дронами


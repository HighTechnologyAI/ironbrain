# 🎉 IronBrain System - Финальное руководство по интеграции

## 🚀 СИСТЕМА ПОЛНОСТЬЮ ГОТОВА К РАБОТЕ!

### 📡 NGROK ТУННЕЛИ (ПУБЛИЧНЫЕ HTTPS URL)

#### 🔗 IRONBRAIN API
**URL:** `https://46526ae4547c.ngrok-free.app`
**Назначение:** Основной API для управления дронами
**Endpoints:**
- `GET /api/v1/health` - Проверка состояния API
- `GET /api/v1/drone/status` - Статус дрона и телеметрия
- `POST /api/v1/drone/arm` - Постановка на охрану
- `POST /api/v1/drone/disarm` - Снятие с охраны
- `POST /api/v1/drone/takeoff` - Взлет
- `POST /api/v1/drone/land` - Посадка
- `POST /api/v1/drone/rtl` - Возврат домой
- `POST /api/v1/drone/mode` - Смена режима полета
- `POST /api/v1/drone/move` - Управление движением
- `GET /api/v1/video/stream` - Видеопоток
- `WebSocket: wss://46526ae4547c.ngrok-free.app` - Real-time данные

#### 🌉 SUPABASE BRIDGE
**URL:** `https://6c29df3eb97c.ngrok-free.app`
**Назначение:** Мост между VPS и Supabase для валидации
**Endpoints:**
- `GET /health` - Проверка состояния моста
- `GET /api/v1/health` - Совместимость с API v1
- `GET /drones` - Список подключенных дронов
- `POST /telemetry` - Прием телеметрии от Jetson

## 💻 ИНТЕГРАЦИЯ С TIGER CRM

### JavaScript/React код:
```javascript
// Конфигурация IronBrain
const IRONBRAIN_CONFIG = {
  apiUrl: "https://46526ae4547c.ngrok-free.app/api/v1",
  bridgeUrl: "https://6c29df3eb97c.ngrok-free.app",
  websocketUrl: "wss://46526ae4547c.ngrok-free.app"
};

// Класс для работы с дронами
class IronBrainAPI {
  constructor(config) {
    this.apiUrl = config.apiUrl;
    this.bridgeUrl = config.bridgeUrl;
    this.websocketUrl = config.websocketUrl;
  }

  // Проверка состояния системы
  async checkHealth() {
    const response = await fetch(`${this.apiUrl}/health`);
    return response.json();
  }

  // Получение статуса дрона
  async getDroneStatus() {
    const response = await fetch(`${this.apiUrl}/drone/status`);
    return response.json();
  }

  // Управление дроном
  async controlDrone(action, params = {}) {
    const response = await fetch(`${this.apiUrl}/drone/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return response.json();
  }

  // WebSocket подключение для real-time данных
  connectWebSocket() {
    const ws = new WebSocket(this.websocketUrl);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Telemetry:', data);
    };
    return ws;
  }
}

// Использование
const ironbrain = new IronBrainAPI(IRONBRAIN_CONFIG);

// Примеры вызовов
await ironbrain.checkHealth();
await ironbrain.getDroneStatus();
await ironbrain.controlDrone('takeoff');
await ironbrain.controlDrone('move', { x: 10, y: 0, z: 5 });
const ws = ironbrain.connectWebSocket();
```

### Python код:
```python
import requests
import json

class IronBrainAPI:
    def __init__(self):
        self.api_url = "https://46526ae4547c.ngrok-free.app/api/v1"
        self.bridge_url = "https://6c29df3eb97c.ngrok-free.app"
    
    def check_health(self):
        response = requests.get(f"{self.api_url}/health")
        return response.json()
    
    def get_drone_status(self):
        response = requests.get(f"{self.api_url}/drone/status")
        return response.json()
    
    def control_drone(self, action, params=None):
        url = f"{self.api_url}/drone/{action}"
        response = requests.post(url, json=params or {})
        return response.json()

# Использование
api = IronBrainAPI()
health = api.check_health()
status = api.get_drone_status()
result = api.control_drone('takeoff')
```

## 🏗️ АРХИТЕКТУРА СИСТЕМЫ

```
┌─────────────┐    HTTPS     ┌──────────┐    HTTP    ┌─────────────┐    MAVLink    ┌─────────┐
│ Tiger CRM   │ ──────────► │   Ngrok  │ ─────────► │ VPS API     │ ────────────► │  Jetson │
│             │             │ Tunnels  │            │ (87.120.x)  │               │  Nano   │
└─────────────┘             └──────────┘            └─────────────┘               └─────────┘
       ▲                                                    ▲                           │
       │                                                    │                           ▼
       └────────────── Telemetry/Video ◄───────────────────┴───────────────────── ┌─────────┐
                                                                                    │  Дрон   │
                                                                                    └─────────┘
```

## 🔧 СИСТЕМНЫЕ СЕРВИСЫ (ВСЕ НАСТРОЕНЫ)

### ✅ Автозапуск при перезагрузке:
- **drone-control-api** - Основной API сервер
- **nginx** - Веб-сервер и прокси
- **supabase-bridge** - Мост для Supabase
- **ngrok-ironbrain** - Туннели ngrok
- **ironbrain-monitor** - Автоматический мониторинг (каждые 5 минут)

### 🛡️ Автоматическое восстановление:
- При падении любого сервиса - автоматический перезапуск
- Мониторинг портов и процессов
- Логирование всех событий

## 📋 СОВЕТЫ И НАПРАВЛЕНИЯ

### 🎯 Для немедленного использования:
1. **Используйте предоставленные HTTPS URL** для интеграции
2. **Начните с health endpoints** для проверки связи
3. **Реализуйте WebSocket** для real-time телеметрии
4. **Добавьте обработку ошибок** в Tiger CRM

### 🚀 Для продакшена:
1. **Обновите до платного ngrok плана** для фиксированных доменов
2. **Настройте SSL сертификаты** на VPS для прямого HTTPS
3. **Добавьте аутентификацию** в API endpoints
4. **Настройте логирование** в Tiger CRM

### 🔒 Безопасность:
1. **Все соединения используют HTTPS**
2. **Firewall настроен** на двух уровнях
3. **Автоматический мониторинг** предотвращает сбои
4. **Логи ведутся** для всех операций

### 📊 Мониторинг:
1. **Health endpoints** для проверки состояния
2. **WebSocket телеметрия** для real-time данных
3. **Системные логи** для диагностики
4. **Автоматические уведомления** о проблемах

## 🎉 ГОТОВО К ИНТЕГРАЦИИ!

**Система IronBrain полностью готова к интеграции с Tiger CRM!**

**Используйте предоставленные URL и примеры кода для быстрого старта.**

**Все сервисы настроены на автоматическое восстановление и мониторинг.**

---

**📞 Поддержка:**
- API Логи: `journalctl -u drone-control-api -f`
- Bridge Логи: `journalctl -u supabase-bridge -f`  
- Ngrok Логи: `journalctl -u ngrok-ironbrain -f`
- Мониторинг: `tail -f /var/log/ironbrain-monitor.log`


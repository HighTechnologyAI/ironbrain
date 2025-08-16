"""
Модульный MAVLink сервис - интеграция всех компонентов
Использует новую архитектуру с разделением ответственности
"""

import time
import logging
from typing import Dict, Any, Optional
from dataclasses import dataclass, asdict

from .mavlink_bridge import mavlink_bridge, MAVLinkBridge
from .telemetry_buffer import telemetry_buffer, TelemetryBuffer, TelemetryRecord
from .central_server_sync import central_server_sync, CentralServerSync
from ..utils.serialization import SerializationUtils

logger = logging.getLogger(__name__)


@dataclass
class TelemetryData:
    """Consolidated telemetry data structure"""
    battery_level: float = 0.0
    battery_voltage: float = 0.0
    battery_current: float = 0.0
    altitude_meters: float = 0.0
    speed_ms: float = 0.0
    location_latitude: Optional[float] = None
    location_longitude: Optional[float] = None
    heading_degrees: float = 0.0
    armed: bool = False
    flight_mode: str = "UNKNOWN"
    gps_satellites: int = 0
    temperature_celsius: float = 0.0
    humidity_percent: float = 0.0
    vibration_level: float = 0.0
    signal_strength: float = 0.0
    timestamp: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class ModularMAVLinkService:
    """
    Модульный MAVLink сервис с разделением ответственности
    Интегрирует MAVLink Bridge, Telemetry Buffer и Central Server Sync
    """
    
    def __init__(self, drone_id: str = "jetson_drone_001"):
        self.drone_id = drone_id
        self.telemetry = TelemetryData()
        
        # Подключаем модульные сервисы
        self.bridge = mavlink_bridge
        self.buffer = telemetry_buffer  
        self.sync = central_server_sync
        
        # Регистрируем обработчики сообщений
        self._register_message_handlers()
        
        logger.info(f"🚁 Modular MAVLink service initialized for drone: {drone_id}")
    
    def _register_message_handlers(self):
        """Регистрируем обработчики MAVLink сообщений"""
        
        # HEARTBEAT (ID: 0)
        self.bridge.register_message_handler(0, self._handle_heartbeat)
        
        # SYS_STATUS (ID: 1) 
        self.bridge.register_message_handler(1, self._handle_sys_status)
        
        # GPS_RAW_INT (ID: 24)
        self.bridge.register_message_handler(24, self._handle_gps_raw)
        
        # ATTITUDE (ID: 30)
        self.bridge.register_message_handler(30, self._handle_attitude)
        
        # VFR_HUD (ID: 74)
        self.bridge.register_message_handler(74, self._handle_vfr_hud)
        
        # BATTERY_STATUS (ID: 147)
        self.bridge.register_message_handler(147, self._handle_battery_status)
    
    def _handle_heartbeat(self, message: Dict[str, Any]):
        """Обработка HEARTBEAT сообщений"""
        try:
            payload = message.get('payload', b'')
            if len(payload) >= 9:
                # Parse basic flight info
                flight_mode_num = int.from_bytes(payload[4:5], 'little')
                self.telemetry.flight_mode = self.bridge.flight_modes.get(flight_mode_num, "UNKNOWN")
                self.telemetry.armed = bool(payload[6] & 0x80)  # MAV_MODE_FLAG_SAFETY_ARMED
                
                self._update_telemetry()
                
        except Exception as e:
            logger.error(f"Heartbeat handling error: {e}")
    
    def _handle_sys_status(self, message: Dict[str, Any]):
        """Обработка SYS_STATUS сообщений"""
        try:
            payload = message.get('payload', b'')
            if len(payload) >= 31:
                # Parse system status
                battery_voltage = int.from_bytes(payload[4:6], 'little') / 1000.0  # mV to V
                battery_current = int.from_bytes(payload[6:8], 'little', signed=True) / 100.0  # cA to A
                battery_remaining = int.from_bytes(payload[8:9], 'little')  # %
                
                self.telemetry.battery_voltage = battery_voltage
                self.telemetry.battery_current = battery_current
                self.telemetry.battery_level = battery_remaining
                
                self._update_telemetry()
                
        except Exception as e:
            logger.error(f"SYS_STATUS handling error: {e}")
    
    def _handle_gps_raw(self, message: Dict[str, Any]):
        """Обработка GPS_RAW_INT сообщений"""
        try:
            payload = message.get('payload', b'')
            if len(payload) >= 30:
                # Parse GPS data
                lat = int.from_bytes(payload[8:12], 'little', signed=True) / 1e7
                lon = int.from_bytes(payload[12:16], 'little', signed=True) / 1e7
                alt = int.from_bytes(payload[16:20], 'little', signed=True) / 1000.0  # mm to m
                satellites = int.from_bytes(payload[29:30], 'little')
                
                self.telemetry.location_latitude = lat
                self.telemetry.location_longitude = lon
                self.telemetry.altitude_meters = alt
                self.telemetry.gps_satellites = satellites
                
                self._update_telemetry()
                
        except Exception as e:
            logger.error(f"GPS_RAW handling error: {e}")
    
    def _handle_attitude(self, message: Dict[str, Any]):
        """Обработка ATTITUDE сообщений"""
        try:
            payload = message.get('payload', b'')
            if len(payload) >= 28:
                # Parse attitude data
                import struct
                yaw = struct.unpack('<f', payload[16:20])[0]  # radians
                heading = (yaw * 180.0 / 3.14159) % 360  # Convert to degrees
                
                self.telemetry.heading_degrees = heading
                self._update_telemetry()
                
        except Exception as e:
            logger.error(f"ATTITUDE handling error: {e}")
    
    def _handle_vfr_hud(self, message: Dict[str, Any]):
        """Обработка VFR_HUD сообщений"""
        try:
            payload = message.get('payload', b'')
            if len(payload) >= 20:
                # Parse VFR HUD data
                import struct
                airspeed = struct.unpack('<f', payload[0:4])[0]  # m/s
                groundspeed = struct.unpack('<f', payload[4:8])[0]  # m/s
                alt = struct.unpack('<f', payload[8:12])[0]  # m
                
                self.telemetry.speed_ms = groundspeed
                if self.telemetry.altitude_meters == 0.0:  # Use VFR alt if GPS alt not available
                    self.telemetry.altitude_meters = alt
                
                self._update_telemetry()
                
        except Exception as e:
            logger.error(f"VFR_HUD handling error: {e}")
    
    def _handle_battery_status(self, message: Dict[str, Any]):
        """Обработка BATTERY_STATUS сообщений"""
        try:
            payload = message.get('payload', b'')
            if len(payload) >= 36:
                # Parse detailed battery status
                import struct
                current_battery = struct.unpack('<i', payload[0:4])[0] / 100.0  # cA to A
                
                # Extract voltages (10 cells max)
                voltages = []
                for i in range(10):
                    voltage = struct.unpack('<H', payload[4 + i*2:6 + i*2])[0]
                    if voltage != 65535:  # Valid voltage
                        voltages.append(voltage / 1000.0)  # mV to V
                
                if voltages:
                    self.telemetry.battery_voltage = sum(voltages)
                self.telemetry.battery_current = current_battery
                
                self._update_telemetry()
                
        except Exception as e:
            logger.error(f"BATTERY_STATUS handling error: {e}")
    
    def _update_telemetry(self):
        """Обновление телеметрии и запись в буфер"""
        self.telemetry.timestamp = time.time()
        
        # Добавляем в буфер для store-and-forward
        self.buffer.add_telemetry(self.drone_id, self.telemetry.to_dict())
        
        # Отправляем real-time обновление (если подключены)
        if self.sync.stats.websocket_connected:
            self.sync.send_realtime_update(
                'drone_telemetry',
                'INSERT',
                {
                    'drone_id': self.drone_id,
                    'telemetry': self.telemetry.to_dict()
                }
            )
    
    def connect(self, connection_string: str = "udp:0.0.0.0:14550") -> bool:
        """Подключение к MAVLink источнику"""
        # Запускаем все сервисы
        self.sync.start()
        
        # Подключаемся к MAVLink
        success = self.bridge.connect(connection_string)
        
        if success:
            logger.info(f"✅ Modular MAVLink service connected: {connection_string}")
            
            # Отправляем статус дрона
            self.sync.send_drone_status(self.drone_id, {
                'status': 'online',
                'connection_string': connection_string,
                'connected_at': time.time()
            })
        
        return success
    
    def disconnect(self):
        """Отключение от MAVLink источника"""
        # Сохраняем буферизованные данные
        self.buffer.stop()
        
        # Отключаемся от центрального сервера
        self.sync.stop()
        
        # Отключаемся от MAVLink
        self.bridge.disconnect()
        
        logger.info("🛑 Modular MAVLink service disconnected")
    
    def send_command(self, command: str, params: Dict[str, Any] = None) -> bool:
        """Отправка команды автопилоту"""
        return self.bridge.send_command(command, params or {})
    
    def get_telemetry(self) -> Dict[str, Any]:
        """Получение текущей телеметрии"""
        return SerializationUtils.add_timestamp(self.telemetry.to_dict())
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Получение статистики подключения"""
        return self.bridge.get_connection_stats()
    
    def get_service_health(self) -> Dict[str, Any]:
        """Получение состояния всех сервисов"""
        return {
            'mavlink_bridge': {
                'connected': self.bridge.is_connected,
                'stats': self.bridge.get_connection_stats()
            },
            'telemetry_buffer': {
                'stats': self.buffer.get_buffer_stats()
            },
            'central_sync': {
                'health': self.sync.health_check(),
                'stats': self.sync.get_sync_stats()
            },
            'timestamp': time.time()
        }
    
    @property
    def is_connected(self) -> bool:
        """Проверка подключения"""
        return self.bridge.is_connected


# Создаем глобальный экземпляр (заменяет старый mavlink_service)
mavlink_service = ModularMAVLinkService()
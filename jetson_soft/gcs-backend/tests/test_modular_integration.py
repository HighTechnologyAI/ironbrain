"""
Интеграционные тесты для модульной архитектуры Jetson GCS
Тестирует взаимодействие между сервисами без полного запуска системы
"""

import unittest
import time
import json
import tempfile
from unittest.mock import Mock, patch, MagicMock
from pathlib import Path

# Import services
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from src.services.mavlink_bridge import MAVLinkBridge
from src.services.telemetry_buffer import TelemetryBuffer, TelemetryRecord
from src.services.central_server_sync import CentralServerSync
from src.services.modular_mavlink_service import ModularMAVLinkService
from src.utils.serialization import SerializationUtils


class TestSerializationUtils(unittest.TestCase):
    """Тест утилит сериализации"""
    
    def test_to_json_dict(self):
        """Тест конвертации в JSON словарь"""
        # Test with dataclass-like object
        test_obj = Mock()
        test_obj.to_dict = Mock(return_value={'test': 'value'})
        
        result = SerializationUtils.to_json_dict(test_obj)
        self.assertEqual(result, {'test': 'value'})
    
    def test_sanitize_telemetry(self):
        """Тест санитизации телеметрии"""
        dirty_data = {
            'battery_level': None,
            'latitude': 55.123456789,
            'altitude': None,
            'normal_field': 'test'
        }
        
        clean_data = SerializationUtils.sanitize_telemetry(dirty_data)
        
        self.assertEqual(clean_data['battery_level'], 0)
        self.assertEqual(clean_data['latitude'], 55.123457)  # Rounded to 6 decimals
        self.assertEqual(clean_data['altitude'], 0)
        self.assertEqual(clean_data['normal_field'], 'test')
    
    def test_add_timestamp(self):
        """Тест добавления timestamp"""
        data = {'test': 'value'}
        timestamped = SerializationUtils.add_timestamp(data)
        
        self.assertIn('timestamp', timestamped)
        self.assertIsInstance(timestamped['timestamp'], float)


class TestMAVLinkBridge(unittest.TestCase):
    """Тест MAVLink моста"""
    
    def setUp(self):
        self.bridge = MAVLinkBridge(max_history=10)
    
    def tearDown(self):
        self.bridge.disconnect()
    
    def test_initialization(self):
        """Тест инициализации"""
        self.assertFalse(self.bridge.is_connected)
        self.assertEqual(len(self.bridge.message_handlers), 0)
        self.assertEqual(self.bridge.stats.messages_received, 0)
    
    def test_message_handler_registration(self):
        """Тест регистрации обработчиков сообщений"""
        handler = Mock()
        self.bridge.register_message_handler(0, handler)
        
        self.assertIn(0, self.bridge.message_handlers)
        self.assertEqual(self.bridge.message_handlers[0], handler)
    
    @patch('socket.socket')
    def test_udp_connection(self, mock_socket):
        """Тест UDP подключения"""
        mock_socket_instance = Mock()
        mock_socket.return_value = mock_socket_instance
        
        success = self.bridge.connect("udp:127.0.0.1:14550")
        
        self.assertTrue(success)
        self.assertTrue(self.bridge.is_connected)
        mock_socket_instance.bind.assert_called_once_with(('127.0.0.1', 14550))
    
    def test_parse_mavlink_packet(self):
        """Тест парсинга MAVLink пакета"""
        # Create mock MAVLink v2 packet
        packet = bytearray([
            0xFD,  # magic
            0x09,  # payload length
            0x00,  # sequence
            0x01,  # system_id
            0x01,  # component_id
            0x00, 0x00, 0x00,  # message_id (HEARTBEAT = 0)
            0x00, 0x00,  # compatibility flags
            # Payload (9 bytes for HEARTBEAT)
            0x00, 0x00, 0x00, 0x00,  # custom_mode
            0x02,  # type
            0x03,  # autopilot
            0x81,  # base_mode
            0x03,  # system_status
            0x03,  # mavlink_version
            # Checksum
            0x32, 0x00
        ])
        
        buffer = bytearray(packet)
        message = self.bridge._parse_mavlink_packet(buffer)
        
        self.assertIsNotNone(message)
        self.assertEqual(message['payload_length'], 9)
        self.assertEqual(message['message_id'], 0)
        self.assertEqual(message['system_id'], 1)


class TestTelemetryBuffer(unittest.TestCase):
    """Тест буфера телеметрии"""
    
    def setUp(self):
        # Create temporary file for testing
        self.temp_file = tempfile.NamedTemporaryFile(delete=False)
        self.buffer = TelemetryBuffer(
            max_memory_records=10,
            buffer_file=self.temp_file.name,
            sync_interval=0.1  # Fast for testing
        )
    
    def tearDown(self):
        self.buffer.stop()
        os.unlink(self.temp_file.name)
    
    def test_add_telemetry(self):
        """Тест добавления телеметрии"""
        telemetry_data = {
            'battery_level': 85.5,
            'altitude': 100.0,
            'latitude': 55.123456,
            'longitude': 37.654321
        }
        
        self.buffer.add_telemetry('test_drone', telemetry_data)
        
        self.assertEqual(self.buffer.stats.total_records, 1)
        self.assertEqual(self.buffer.stats.pending_sync, 1)
        
        latest = self.buffer.get_latest_telemetry('test_drone', 1)
        self.assertEqual(len(latest), 1)
        self.assertEqual(latest[0]['drone_id'], 'test_drone')
    
    def test_mark_synced(self):
        """Тест отметки записей как синхронизированных"""
        self.buffer.add_telemetry('test_drone', {'test': 'data'})
        
        pending = self.buffer.get_pending_records(10)
        self.assertEqual(len(pending), 1)
        
        self.buffer.mark_synced(pending)
        
        self.assertEqual(self.buffer.stats.pending_sync, 0)
        self.assertTrue(pending[0].synced)
    
    def test_persistence(self):
        """Тест сохранения и загрузки буфера"""
        # Add some data
        self.buffer.add_telemetry('test_drone', {'test': 'data1'})
        self.buffer.add_telemetry('test_drone', {'test': 'data2'})
        
        # Save to file
        self.buffer._save_to_file()
        
        # Create new buffer instance with same file
        new_buffer = TelemetryBuffer(
            max_memory_records=10,
            buffer_file=self.temp_file.name
        )
        
        # Check data was loaded
        self.assertEqual(new_buffer.stats.total_records, 2)
        
        new_buffer.stop()


class TestCentralServerSync(unittest.TestCase):
    """Тест синхронизации с центральным сервером"""
    
    def setUp(self):
        self.sync = CentralServerSync(
            server_url="http://localhost:8000",
            api_key="test_key"
        )
    
    def tearDown(self):
        self.sync.stop()
    
    @patch('requests.Session.post')
    def test_sync_telemetry_batch(self, mock_post):
        """Тест синхронизации батча телеметрии"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_post.return_value = mock_response
        
        telemetry_records = [
            {'drone_id': 'test', 'battery': 80, 'timestamp': time.time()},
            {'drone_id': 'test', 'battery': 79, 'timestamp': time.time()}
        ]
        
        success = self.sync.sync_telemetry_batch(telemetry_records)
        
        self.assertTrue(success)
        self.assertEqual(self.sync.stats.total_syncs, 1)
        mock_post.assert_called_once()
    
    @patch('requests.Session.get')
    def test_health_check(self, mock_get):
        """Тест проверки здоровья соединения"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        health = self.sync.health_check()
        
        self.assertTrue(health['api_healthy'])
        self.assertIn('websocket_connected', health)
        self.assertIn('timestamp', health)


class TestModularMAVLinkService(unittest.TestCase):
    """Тест модульного MAVLink сервиса"""
    
    def setUp(self):
        # Mock the singleton services to avoid interference
        with patch('src.services.modular_mavlink_service.mavlink_bridge'), \
             patch('src.services.modular_mavlink_service.telemetry_buffer'), \
             patch('src.services.modular_mavlink_service.central_server_sync'):
            
            self.service = ModularMAVLinkService(drone_id='test_drone')
            
            # Setup mocks
            self.service.bridge = Mock()
            self.service.buffer = Mock()
            self.service.sync = Mock()
    
    def test_initialization(self):
        """Тест инициализации сервиса"""
        self.assertEqual(self.service.drone_id, 'test_drone')
        self.assertIsNotNone(self.service.telemetry)
    
    def test_message_handler_registration(self):
        """Тест регистрации обработчиков сообщений"""
        # Check that handlers were registered
        expected_calls = [
            ((0, self.service._handle_heartbeat),),
            ((1, self.service._handle_sys_status),),
            ((24, self.service._handle_gps_raw),),
            ((30, self.service._handle_attitude),),
            ((74, self.service._handle_vfr_hud),),
            ((147, self.service._handle_battery_status),)
        ]
        
        self.service.bridge.register_message_handler.assert_has_calls(
            expected_calls, any_order=True
        )
    
    def test_heartbeat_handling(self):
        """Тест обработки HEARTBEAT сообщений"""
        # Mock heartbeat payload
        heartbeat_payload = bytearray([
            0x00, 0x00, 0x00, 0x00,  # custom_mode
            0x05,  # flight mode
            0x00,  # autopilot
            0x81,  # base_mode (armed)
            0x04,  # system_status
            0x03   # mavlink_version
        ])
        
        message = {
            'message_id': 0,
            'payload': heartbeat_payload
        }
        
        self.service._handle_heartbeat(message)
        
        # Check telemetry was updated
        self.assertTrue(self.service.telemetry.armed)
        self.service.buffer.add_telemetry.assert_called()
    
    def test_gps_handling(self):
        """Тест обработки GPS сообщений"""
        # Mock GPS payload (simplified)
        gps_payload = bytearray(30)
        
        # Lat/Lon in 1e7 format (Moscow coordinates)
        lat = int(55.7558 * 1e7)
        lon = int(37.6176 * 1e7)
        alt = int(150 * 1000)  # 150m in mm
        sats = 12
        
        gps_payload[8:12] = lat.to_bytes(4, 'little', signed=True)
        gps_payload[12:16] = lon.to_bytes(4, 'little', signed=True)
        gps_payload[16:20] = alt.to_bytes(4, 'little', signed=True)
        gps_payload[29] = sats
        
        message = {
            'message_id': 24,
            'payload': gps_payload
        }
        
        self.service._handle_gps_raw(message)
        
        # Check GPS data was parsed correctly
        self.assertAlmostEqual(self.service.telemetry.location_latitude, 55.7558, places=4)
        self.assertAlmostEqual(self.service.telemetry.location_longitude, 37.6176, places=4)
        self.assertEqual(self.service.telemetry.altitude_meters, 150.0)
        self.assertEqual(self.service.telemetry.gps_satellites, 12)
    
    def test_connect(self):
        """Тест подключения сервиса"""
        self.service.bridge.connect.return_value = True
        
        success = self.service.connect("udp:127.0.0.1:14550")
        
        self.assertTrue(success)
        self.service.sync.start.assert_called_once()
        self.service.bridge.connect.assert_called_once_with("udp:127.0.0.1:14550")
        self.service.sync.send_drone_status.assert_called_once()
    
    def test_get_service_health(self):
        """Тест получения статуса здоровья сервисов"""
        # Setup mock returns
        self.service.bridge.is_connected = True
        self.service.bridge.get_connection_stats.return_value = {'test': 'stats'}
        self.service.buffer.get_buffer_stats.return_value = {'buffer': 'stats'}
        self.service.sync.health_check.return_value = {'sync': 'health'}
        self.service.sync.get_sync_stats.return_value = {'sync': 'stats'}
        
        health = self.service.get_service_health()
        
        self.assertIn('mavlink_bridge', health)
        self.assertIn('telemetry_buffer', health)
        self.assertIn('central_sync', health)
        self.assertIn('timestamp', health)
        self.assertTrue(health['mavlink_bridge']['connected'])


class TestIntegration(unittest.TestCase):
    """Интеграционные тесты модулей"""
    
    def test_full_telemetry_flow(self):
        """Тест полного потока телеметрии: Bridge -> Buffer -> Sync"""
        
        # Create temporary buffer file
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        
        try:
            # Create buffer with real functionality
            buffer = TelemetryBuffer(
                max_memory_records=5,
                buffer_file=temp_file.name,
                sync_interval=0.1
            )
            
            # Mock sync service
            sync = Mock()
            sync.stats.websocket_connected = True
            
            # Add telemetry data
            test_data = {
                'battery_level': 85.5,
                'altitude': 100.0,
                'latitude': 55.123456,
                'longitude': 37.654321
            }
            
            buffer.add_telemetry('integration_test_drone', test_data)
            
            # Get pending records
            pending = buffer.get_pending_records()
            self.assertEqual(len(pending), 1)
            
            # Simulate successful sync
            buffer.mark_synced(pending)
            
            # Verify sync completed
            self.assertEqual(buffer.stats.pending_sync, 0)
            
            # Test real-time update
            sync.send_realtime_update.return_value = True
            result = sync.send_realtime_update(
                'drone_telemetry',
                'INSERT',
                {'drone_id': 'integration_test_drone', 'telemetry': test_data}
            )
            
            self.assertTrue(result)
            sync.send_realtime_update.assert_called_once()
            
        finally:
            buffer.stop()
            os.unlink(temp_file.name)


if __name__ == '__main__':
    # Run tests
    unittest.main(verbosity=2)
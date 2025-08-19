#!/usr/bin/env python3
"""
Исправленный скрипт настройки Orange Cube для внешней телеметрии
Настраивает параметры автопилота для работы с Mission Planner через VPS
"""

from pymavlink import mavutil
import time
import sys

def setup_orange_cube():
    """Настройка Orange Cube для внешней телеметрии"""
    
    print("🚁 Подключение к Orange Cube...")
    
    try:
        # Подключение к автопилоту
        master = mavutil.mavlink_connection('/dev/ttyACM0', baud=57600)
        master.wait_heartbeat()
        print("✅ Подключен к Orange Cube")
        
        # Получение информации о системе
        print(f"📡 System ID: {master.target_system}")
        print(f"📡 Component ID: {master.target_component}")
        
        # Настройка SERIAL1 для внешней телеметрии
        print("\n🔧 Настройка SERIAL1 для телеметрии...")
        
        # SERIAL1_PROTOCOL = 2 (MAVLink2)
        master.mav.param_set_send(
            master.target_system, 
            master.target_component, 
            b'SERIAL1_PROTOCOL', 
            2.0,
            mavutil.mavlink.MAV_PARAM_TYPE_REAL32
        )
        time.sleep(1)
        
        # SERIAL1_BAUD = 921 (921600 baud)
        master.mav.param_set_send(
            master.target_system, 
            master.target_component, 
            b'SERIAL1_BAUD', 
            921.0,
            mavutil.mavlink.MAV_PARAM_TYPE_REAL32
        )
        time.sleep(1)
        
        # SR1_EXT_STAT = 2 (Extended status at 2Hz)
        master.mav.param_set_send(
            master.target_system, 
            master.target_component, 
            b'SR1_EXT_STAT', 
            2.0,
            mavutil.mavlink.MAV_PARAM_TYPE_REAL32
        )
        time.sleep(1)
        
        # SR1_POSITION = 2 (Position at 2Hz)
        master.mav.param_set_send(
            master.target_system, 
            master.target_component, 
            b'SR1_POSITION', 
            2.0,
            mavutil.mavlink.MAV_PARAM_TYPE_REAL32
        )
        time.sleep(1)
        
        # SR1_RAW_SENS = 2 (Raw sensors at 2Hz)
        master.mav.param_set_send(
            master.target_system, 
            master.target_component, 
            b'SR1_RAW_SENS', 
            2.0,
            mavutil.mavlink.MAV_PARAM_TYPE_REAL32
        )
        time.sleep(1)
        
        # SR1_RC_CHAN = 2 (RC channels at 2Hz)
        master.mav.param_set_send(
            master.target_system, 
            master.target_component, 
            b'SR1_RC_CHAN', 
            2.0,
            mavutil.mavlink.MAV_PARAM_TYPE_REAL32
        )
        time.sleep(1)
        
        # SR1_EXTRA1 = 4 (Extra1 at 4Hz)
        master.mav.param_set_send(
            master.target_system, 
            master.target_component, 
            b'SR1_EXTRA1', 
            4.0,
            mavutil.mavlink.MAV_PARAM_TYPE_REAL32
        )
        time.sleep(1)
        
        # SR1_EXTRA2 = 4 (Extra2 at 4Hz)
        master.mav.param_set_send(
            master.target_system, 
            master.target_component, 
            b'SR1_EXTRA2', 
            4.0,
            mavutil.mavlink.MAV_PARAM_TYPE_REAL32
        )
        time.sleep(1)
        
        # SR1_EXTRA3 = 2 (Extra3 at 2Hz)
        master.mav.param_set_send(
            master.target_system, 
            master.target_component, 
            b'SR1_EXTRA3', 
            2.0,
            mavutil.mavlink.MAV_PARAM_TYPE_REAL32
        )
        time.sleep(1)
        
        # SR1_PARAMS = 10 (Parameters at 10Hz)
        master.mav.param_set_send(
            master.target_system, 
            master.target_component, 
            b'SR1_PARAMS', 
            10.0,
            mavutil.mavlink.MAV_PARAM_TYPE_REAL32
        )
        time.sleep(1)
        
        print("✅ Параметры SERIAL1 настроены")
        
        # Настройка потоков данных
        print("\n📡 Настройка потоков телеметрии...")
        
        # Запрос всех потоков данных
        streams = [
            (mavutil.mavlink.MAV_DATA_STREAM_RAW_SENSORS, 2),
            (mavutil.mavlink.MAV_DATA_STREAM_EXTENDED_STATUS, 2),
            (mavutil.mavlink.MAV_DATA_STREAM_RC_CHANNELS, 2),
            (mavutil.mavlink.MAV_DATA_STREAM_POSITION, 2),
            (mavutil.mavlink.MAV_DATA_STREAM_EXTRA1, 4),
            (mavutil.mavlink.MAV_DATA_STREAM_EXTRA2, 4),
            (mavutil.mavlink.MAV_DATA_STREAM_EXTRA3, 2)
        ]
        
        for stream_id, rate in streams:
            master.mav.request_data_stream_send(
                master.target_system, 
                master.target_component,
                stream_id, 
                rate, 
                1  # Enable
            )
            print(f"✅ Поток {stream_id}: {rate}Hz")
            time.sleep(0.5)
        
        # Сохранение параметров
        print("\n💾 Сохранение параметров...")
        master.mav.command_long_send(
            master.target_system,
            master.target_component,
            mavutil.mavlink.MAV_CMD_PREFLIGHT_STORAGE,
            0,  # confirmation
            1,  # param1: 1=save parameters
            0, 0, 0, 0, 0, 0  # unused parameters
        )
        
        print("✅ Параметры сохранены в EEPROM")
        
        print("\n🎉 Orange Cube настроен для внешней телеметрии!")
        print("\n📋 СЛЕДУЮЩИЕ ШАГИ:")
        print("1. Параметры сохранены в автопилоте")
        print("2. Запустите оптимизированный MAVLink мост")
        print("3. Подключите Mission Planner к VPS")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка настройки: {e}")
        return False

def test_connection():
    """Тест подключения к автопилоту"""
    
    print("\n🔍 Тестирование подключения к автопилоту...")
    
    try:
        master = mavutil.mavlink_connection('/dev/ttyACM0', baud=57600)
        master.wait_heartbeat()
        
        print("✅ Heartbeat получен!")
        print(f"📡 System ID: {master.target_system}")
        print(f"📡 Component ID: {master.target_component}")
        
        # Запрос версии автопилота
        master.mav.command_long_send(
            master.target_system,
            master.target_component,
            mavutil.mavlink.MAV_CMD_REQUEST_AUTOPILOT_CAPABILITIES,
            0, 1, 0, 0, 0, 0, 0, 0
        )
        
        # Ждем ответ
        msg = master.recv_match(type='AUTOPILOT_VERSION', blocking=True, timeout=5)
        if msg:
            print(f"✅ Автопилот версия: {msg.flight_sw_version}")
            print(f"✅ Тип автопилота: {msg.autopilot}")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка подключения: {e}")
        return False

if __name__ == "__main__":
    print("🚁 НАСТРОЙКА ORANGE CUBE ДЛЯ MISSION PLANNER")
    print("=" * 50)
    
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        test_connection()
    else:
        setup_orange_cube()


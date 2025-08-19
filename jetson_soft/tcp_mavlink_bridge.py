#!/usr/bin/env python3
"""
TCP MAVLink Bridge для работы через ngrok туннель
Решает проблему UDP блокировки между Jetson и VPS
"""

import socket
import threading
import time
import logging
from pymavlink import mavutil

class TCPMAVLinkBridge:
    def __init__(self):
        # Конфигурация
        self.autopilot_port = '/dev/ttyACM0'
        self.autopilot_baud = 921600
        self.tcp_port = 14550  # TCP порт для ngrok
        
        # Статистика
        self.stats = {
            'messages_from_autopilot': 0,
            'messages_to_clients': 0,
            'clients_connected': 0,
            'heartbeats': 0,
            'params': 0,
            'errors': 0
        }
        
        # Подключенные клиенты
        self.clients = []
        self.running = True
        
        # Настройка логирования
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
        
    def connect_autopilot(self):
        """Подключение к автопилоту"""
        try:
            self.logger.info(f"🔌 Подключение к автопилоту {self.autopilot_port}@{self.autopilot_baud}")
            self.master = mavutil.mavlink_connection(
                self.autopilot_port, 
                baud=self.autopilot_baud,
                timeout=5
            )
            
            # Ожидание heartbeat
            self.logger.info("⏳ Ожидание heartbeat от автопилота...")
            self.master.wait_heartbeat(timeout=10)
            self.logger.info(f"✅ Heartbeat получен от system {self.master.target_system}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Ошибка подключения к автопилоту: {e}")
            return False
    
    def start_tcp_server(self):
        """Запуск TCP сервера для клиентов"""
        try:
            self.tcp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.tcp_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.tcp_socket.bind(('0.0.0.0', self.tcp_port))
            self.tcp_socket.listen(5)
            
            self.logger.info(f"🌐 TCP сервер запущен на порту {self.tcp_port}")
            self.logger.info("📡 Готов к подключению Mission Planner через ngrok")
            
            # Поток для принятия подключений
            accept_thread = threading.Thread(target=self.accept_clients, daemon=True)
            accept_thread.start()
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Ошибка запуска TCP сервера: {e}")
            return False
    
    def accept_clients(self):
        """Принятие подключений клиентов"""
        while self.running:
            try:
                client_socket, addr = self.tcp_socket.accept()
                self.logger.info(f"📱 Mission Planner подключен: {addr}")
                
                # Добавляем клиента
                self.clients.append(client_socket)
                self.stats['clients_connected'] += 1
                
                # Поток для обработки клиента
                client_thread = threading.Thread(
                    target=self.handle_client, 
                    args=(client_socket, addr),
                    daemon=True
                )
                client_thread.start()
                
            except Exception as e:
                if self.running:
                    self.logger.error(f"❌ Ошибка принятия подключения: {e}")
    
    def handle_client(self, client_socket, addr):
        """Обработка клиента Mission Planner"""
        try:
            while self.running:
                # Получаем команды от Mission Planner
                data = client_socket.recv(1024)
                if not data:
                    break
                
                # Отправляем команды автопилоту
                try:
                    self.master.write(data)
                    self.logger.debug(f"📤 Команда от {addr} отправлена автопилоту: {len(data)} байт")
                except Exception as e:
                    self.logger.error(f"❌ Ошибка отправки команды автопилоту: {e}")
                    self.stats['errors'] += 1
                    
        except Exception as e:
            self.logger.error(f"❌ Ошибка обработки клиента {addr}: {e}")
        finally:
            # Удаляем клиента
            if client_socket in self.clients:
                self.clients.remove(client_socket)
            client_socket.close()
            self.logger.info(f"📱 Mission Planner отключен: {addr}")
    
    def autopilot_reader(self):
        """Чтение данных от автопилота и отправка клиентам"""
        self.logger.info("📡 Запуск чтения данных от автопилота...")
        
        while self.running:
            try:
                # Получаем сообщение от автопилота
                msg = self.master.recv_match(blocking=False, timeout=0.1)
                if msg:
                    self.stats['messages_from_autopilot'] += 1
                    
                    # Подсчет типов сообщений
                    msg_type = msg.get_type()
                    if msg_type == 'HEARTBEAT':
                        self.stats['heartbeats'] += 1
                    elif 'PARAM' in msg_type:
                        self.stats['params'] += 1
                        self.logger.debug(f"📊 Параметр: {msg_type}")
                    
                    # Отправляем всем подключенным клиентам
                    msg_buf = msg.get_msgbuf()
                    for client in self.clients[:]:  # Копия списка для безопасности
                        try:
                            client.send(msg_buf)
                            self.stats['messages_to_clients'] += 1
                        except Exception as e:
                            self.logger.error(f"❌ Ошибка отправки клиенту: {e}")
                            self.clients.remove(client)
                            self.stats['errors'] += 1
                
                time.sleep(0.001)  # Минимальная задержка
                
            except Exception as e:
                self.logger.error(f"❌ Ошибка чтения от автопилота: {e}")
                self.stats['errors'] += 1
                time.sleep(0.1)
    
    def print_stats(self):
        """Вывод статистики"""
        while self.running:
            time.sleep(30)  # Каждые 30 секунд
            
            self.logger.info("📊 === СТАТИСТИКА TCP MAVLINK BRIDGE ===")
            self.logger.info(f"📡 Сообщений от автопилота: {self.stats['messages_from_autopilot']}")
            self.logger.info(f"📱 Сообщений клиентам: {self.stats['messages_to_clients']}")
            self.logger.info(f"💓 Heartbeat сообщений: {self.stats['heartbeats']}")
            self.logger.info(f"📋 Параметров: {self.stats['params']}")
            self.logger.info(f"👥 Подключенных клиентов: {len(self.clients)}")
            self.logger.info(f"❌ Ошибок: {self.stats['errors']}")
            self.logger.info("=" * 45)
    
    def run(self):
        """Основной цикл работы"""
        self.logger.info("🚀 Запуск TCP MAVLink Bridge...")
        
        # Подключение к автопилоту
        if not self.connect_autopilot():
            return False
        
        # Запуск TCP сервера
        if not self.start_tcp_server():
            return False
        
        # Запуск потоков
        autopilot_thread = threading.Thread(target=self.autopilot_reader, daemon=True)
        stats_thread = threading.Thread(target=self.print_stats, daemon=True)
        
        autopilot_thread.start()
        stats_thread.start()
        
        self.logger.info("✅ TCP MAVLink Bridge запущен успешно!")
        self.logger.info("🔗 Настройте ngrok: ngrok tcp 14550")
        self.logger.info("📱 Подключите Mission Planner к ngrok URL")
        
        try:
            # Основной цикл
            while self.running:
                time.sleep(1)
                
        except KeyboardInterrupt:
            self.logger.info("🛑 Получен сигнал остановки...")
            self.running = False
            
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Очистка ресурсов"""
        self.logger.info("🧹 Очистка ресурсов...")
        
        self.running = False
        
        # Закрываем соединения с клиентами
        for client in self.clients:
            try:
                client.close()
            except:
                pass
        
        # Закрываем TCP сокет
        try:
            self.tcp_socket.close()
        except:
            pass
        
        self.logger.info("✅ TCP MAVLink Bridge остановлен")

if __name__ == "__main__":
    bridge = TCPMAVLinkBridge()
    bridge.run()


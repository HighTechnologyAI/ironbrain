#!/usr/bin/env python3
"""
MAVLink TCP Proxy for VPS
Provides TCP proxy functionality for Mission Planner connections

Author: Manus AI
Date: 2025-08-19
Version: 1.0
"""

import socket
import threading
import time
import logging
from datetime import datetime

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/ironbrain/tcp_proxy.log'),
        logging.StreamHandler()
    ]
)

class MAVLinkTCPProxy:
    def __init__(self, listen_port=14551, target_host='7.tcp.eu.ngrok.io', target_port=10317):
        self.listen_port = listen_port
        self.target_host = target_host
        self.target_port = target_port
        self.running = False
        self.server_socket = None
        self.client_connections = []
        self.stats = {
            'connections_total': 0,
            'connections_active': 0,
            'bytes_forwarded': 0,
            'errors': 0,
            'start_time': datetime.now()
        }
        
    def start(self):
        """Запуск TCP прокси сервера"""
        try:
            self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.server_socket.bind(('0.0.0.0', self.listen_port))
            self.server_socket.listen(5)
            
            self.running = True
            logging.info(f"🚀 MAVLink TCP Proxy started on port {self.listen_port}")
            logging.info(f"📡 Forwarding to {self.target_host}:{self.target_port}")
            
            # Запуск потока статистики
            stats_thread = threading.Thread(target=self._stats_reporter, daemon=True)
            stats_thread.start()
            
            while self.running:
                try:
                    client_socket, client_address = self.server_socket.accept()
                    logging.info(f"📱 New connection from {client_address}")
                    
                    # Создание потока для обработки клиента
                    client_thread = threading.Thread(
                        target=self._handle_client,
                        args=(client_socket, client_address),
                        daemon=True
                    )
                    client_thread.start()
                    
                except socket.error as e:
                    if self.running:
                        logging.error(f"❌ Accept error: {e}")
                        self.stats['errors'] += 1
                        
        except Exception as e:
            logging.error(f"❌ Proxy start error: {e}")
            self.stats['errors'] += 1
            
    def _handle_client(self, client_socket, client_address):
        """Обработка клиентского подключения"""
        target_socket = None
        
        try:
            self.stats['connections_total'] += 1
            self.stats['connections_active'] += 1
            
            # Подключение к целевому серверу (ngrok)
            target_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            target_socket.settimeout(10)
            target_socket.connect((self.target_host, self.target_port))
            
            logging.info(f"🔗 Connected to target {self.target_host}:{self.target_port}")
            
            # Создание потоков для двусторонней передачи данных
            client_to_target = threading.Thread(
                target=self._forward_data,
                args=(client_socket, target_socket, "Client->Target"),
                daemon=True
            )
            target_to_client = threading.Thread(
                target=self._forward_data,
                args=(target_socket, client_socket, "Target->Client"),
                daemon=True
            )
            
            client_to_target.start()
            target_to_client.start()
            
            # Ожидание завершения потоков
            client_to_target.join()
            target_to_client.join()
            
        except Exception as e:
            logging.error(f"❌ Client handling error: {e}")
            self.stats['errors'] += 1
            
        finally:
            # Закрытие соединений
            try:
                if client_socket:
                    client_socket.close()
                if target_socket:
                    target_socket.close()
                    
                self.stats['connections_active'] -= 1
                logging.info(f"📱 Connection from {client_address} closed")
                
            except Exception as e:
                logging.error(f"❌ Connection cleanup error: {e}")
                
    def _forward_data(self, source_socket, destination_socket, direction):
        """Пересылка данных между сокетами"""
        try:
            while self.running:
                try:
                    data = source_socket.recv(4096)
                    if not data:
                        break
                        
                    destination_socket.send(data)
                    self.stats['bytes_forwarded'] += len(data)
                    
                    if len(data) > 0:
                        logging.debug(f"📦 {direction}: {len(data)} bytes")
                        
                except socket.timeout:
                    continue
                except socket.error:
                    break
                    
        except Exception as e:
            logging.error(f"❌ Data forwarding error ({direction}): {e}")
            self.stats['errors'] += 1
            
    def _stats_reporter(self):
        """Периодический отчет о статистике"""
        while self.running:
            try:
                time.sleep(60)  # Отчет каждую минуту
                
                uptime = datetime.now() - self.stats['start_time']
                
                logging.info("📊 === TCP PROXY STATISTICS ===")
                logging.info(f"⏱️ Uptime: {uptime}")
                logging.info(f"🔗 Total connections: {self.stats['connections_total']}")
                logging.info(f"👥 Active connections: {self.stats['connections_active']}")
                logging.info(f"📦 Bytes forwarded: {self.stats['bytes_forwarded']}")
                logging.info(f"❌ Errors: {self.stats['errors']}")
                logging.info("================================")
                
            except Exception as e:
                logging.error(f"❌ Stats reporter error: {e}")
                
    def stop(self):
        """Остановка прокси сервера"""
        logging.info("🛑 Stopping TCP proxy...")
        self.running = False
        
        if self.server_socket:
            try:
                self.server_socket.close()
            except Exception as e:
                logging.error(f"❌ Server socket close error: {e}")
                
        logging.info("✅ TCP proxy stopped")

def main():
    """Главная функция"""
    proxy = MAVLinkTCPProxy()
    
    try:
        proxy.start()
    except KeyboardInterrupt:
        logging.info("🛑 Received interrupt signal")
    except Exception as e:
        logging.error(f"❌ Main error: {e}")
    finally:
        proxy.stop()

if __name__ == '__main__':
    main()


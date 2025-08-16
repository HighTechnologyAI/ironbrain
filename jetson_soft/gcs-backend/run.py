#!/usr/bin/env python3
"""
Pro Mega Spot Technology AI GCS Backend
Production runner script for Jetson Nano

Usage:
    python3 run.py [--host HOST] [--port PORT] [--debug]
"""

import os
import sys
import argparse
import logging

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.main import app, socketio, gcs_backend

def setup_logging(debug=False):
    """Setup logging configuration"""
    level = logging.DEBUG if debug else logging.INFO
    
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('/tmp/gcs_backend.log')
        ]
    )

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Pro Mega Spot Technology AI GCS Backend')
    parser.add_argument('--host', default='0.0.0.0', help='Host to bind to')
    parser.add_argument('--port', type=int, default=5000, help='Port to bind to')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    # Setup logging
    setup_logging(args.debug)
    
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("🌟 Pro Mega Spot Technology AI GCS Backend")
        logger.info("🎯 Optimized for Jetson Nano")
        logger.info(f"🔗 Starting server on {args.host}:{args.port}")
        
        # Start backend services
        gcs_backend.start()
        
        # Run with SocketIO
        socketio.run(
            app,
            host=args.host,
            port=args.port,
            debug=args.debug,
            use_reloader=False,  # Disable reloader for stability
            log_output=not args.debug  # Reduce log noise in production
        )
        
    except KeyboardInterrupt:
        logger.info("🛑 Shutting down gracefully...")
        gcs_backend.stop()
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        gcs_backend.stop()
        sys.exit(1)

if __name__ == '__main__':
    main()


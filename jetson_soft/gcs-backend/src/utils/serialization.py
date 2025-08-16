"""
Serialization utilities for Tiger CRM Jetson GCS
Consolidates JSON conversion logic to eliminate duplication
"""

import json
import time
from typing import Dict, Any, List, Optional
from dataclasses import asdict


class SerializationUtils:
    """Centralized serialization utilities"""
    
    @staticmethod
    def to_json_dict(obj: Any) -> Dict[str, Any]:
        """Convert object to JSON-serializable dictionary"""
        if hasattr(obj, 'to_dict'):
            return obj.to_dict()
        elif hasattr(obj, '__dict__'):
            return asdict(obj) if hasattr(obj, '__dataclass_fields__') else obj.__dict__
        else:
            return obj
    
    @staticmethod
    def add_timestamp(data: Dict[str, Any]) -> Dict[str, Any]:
        """Add timestamp to data dictionary"""
        data['timestamp'] = time.time()
        return data
    
    @staticmethod
    def sanitize_telemetry(telemetry_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sanitize telemetry data for transmission"""
        sanitized = {}
        
        for key, value in telemetry_data.items():
            # Handle None values
            if value is None:
                sanitized[key] = 0 if key in ['battery_level', 'altitude', 'speed'] else value
            # Handle float precision
            elif isinstance(value, float):
                sanitized[key] = round(value, 6)  # 6 decimal places for GPS precision
            else:
                sanitized[key] = value
        
        return sanitized
    
    @staticmethod
    def format_stats_response(stats: Dict[str, Any], connection_info: Optional[Dict] = None) -> Dict[str, Any]:
        """Format standardized stats response"""
        response = {
            'stats': SerializationUtils.sanitize_telemetry(stats),
            'timestamp': time.time()
        }
        
        if connection_info:
            response['connection'] = connection_info
            
        return response
    
    @staticmethod
    def batch_serialize(items: List[Any]) -> List[Dict[str, Any]]:
        """Batch serialize list of objects"""
        return [SerializationUtils.to_json_dict(item) for item in items]
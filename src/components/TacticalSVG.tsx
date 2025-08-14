import React, { useState, useEffect } from 'react';
import { Drone } from '@/hooks/use-drones';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Target, Zap } from 'lucide-react';

interface TacticalSVGProps {
  drones: Drone[];
  className?: string;
}

const TacticalSVG: React.FC<TacticalSVGProps> = ({ drones, className = '' }) => {
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);
  const [viewBox, setViewBox] = useState({ x: -500, y: -300, width: 1000, height: 600 });
  const [scale, setScale] = useState(1);

  // Преобразование координат в SVG пространство
  const coordToSVG = (lat: number, lon: number) => {
    // Базовые координаты аэродрома Timarevo: 43.3889, 26.8855
    const baseLat = 43.3889;
    const baseLon = 26.8855;
    
    // Масштабируем координаты для SVG (примерно 1 градус = 100px)
    const x = (lon - baseLon) * 10000;
    const y = -(lat - baseLat) * 10000; // инвертируем Y для SVG
    
    return { x, y };
  };

  // Получение статуса цвета
  const getStatusColor = (status: string) => {
    const colors = {
      ready: '#00ff41',
      armed: '#ff9f00',
      in_flight: '#00ccff',
      warning: '#ffff00',
      critical: '#ff0000',
      offline: '#666666',
      maintenance: '#9966ff'
    };
    return colors[status as keyof typeof colors] || '#666666';
  };

  // Проверка онлайн статуса
  const isOnline = (drone: Drone) => {
    return drone.status !== 'offline' && drone.last_contact && 
      new Date().getTime() - new Date(drone.last_contact).getTime() < 5 * 60 * 1000;
  };

  // Масштабирование карты
  const zoomTo = (drone: Drone) => {
    if (drone.location_lat && drone.location_lon) {
      const { x, y } = coordToSVG(drone.location_lat, drone.location_lon);
      setViewBox({ x: x - 150, y: y - 150, width: 300, height: 300 });
      setScale(3);
      setSelectedDrone(drone.id);
    }
  };

  // Сброс масштаба
  const resetView = () => {
    setViewBox({ x: -500, y: -300, width: 1000, height: 600 });
    setScale(1);
    setSelectedDrone(null);
  };

  // Автоматическое размещение всех дронов в поле зрения
  useEffect(() => {
    const dronesWithLocation = drones.filter(d => d.location_lat && d.location_lon);
    if (dronesWithLocation.length > 0 && scale === 1) {
      const coords = dronesWithLocation.map(d => coordToSVG(d.location_lat!, d.location_lon!));
      const minX = Math.min(...coords.map(c => c.x)) - 100;
      const maxX = Math.max(...coords.map(c => c.x)) + 100;
      const minY = Math.min(...coords.map(c => c.y)) - 100;
      const maxY = Math.max(...coords.map(c => c.y)) + 100;
      
      setViewBox({
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      });
    }
  }, [drones, scale]);

  const onlineDrones = drones.filter(d => d.status !== 'offline').length;
  const offlineDrones = drones.length - onlineDrones;

  return (
    <div className={`relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-lg overflow-hidden ${className}`}>
      {/* Статистика и контролы */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Badge variant="secondary" className="bg-black/80 text-cyan-400 border-cyan-400/50">
          <Wifi className="h-3 w-3 mr-1" />
          {onlineDrones} онлайн
        </Badge>
        <Badge variant="secondary" className="bg-black/80 text-gray-400 border-gray-400/50">
          <WifiOff className="h-3 w-3 mr-1" />
          {offlineDrones} офлайн
        </Badge>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={resetView}
          className="px-3 py-1 bg-black/80 text-cyan-400 border border-cyan-400/50 rounded text-sm hover:bg-cyan-400/20 transition-colors"
        >
          Обзор
        </button>
      </div>

      {/* Информация о выбранном дроне */}
      {selectedDrone && (
        <div className="absolute bottom-4 left-4 z-10 bg-black/90 border border-cyan-400/50 rounded-lg p-3 text-white">
          {(() => {
            const drone = drones.find(d => d.id === selectedDrone);
            if (!drone) return null;
            
            return (
              <>
                <div className="font-bold text-cyan-400 mb-1">{drone.name}</div>
                <div className="text-sm text-gray-300">{drone.model}</div>
                <div className="text-xs mt-1">
                  <span style={{ color: getStatusColor(drone.status) }}>●</span>
                  <span className="ml-1 capitalize">{drone.status}</span>
                  {drone.battery_level && (
                    <span className="ml-2">🔋 {Math.round(drone.battery_level)}%</span>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* SVG карта */}
      <svg 
        className="w-full h-64"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
      >
        {/* Фоновая сетка */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,255,255,0.1)" strokeWidth="1"/>
          </pattern>
          
          {/* Градиенты для дронов */}
          <radialGradient id="droneGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
          </radialGradient>
          
          {/* Эффект пульсации */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Центральная точка (аэродром) */}
        <g transform="translate(0,0)">
          <circle 
            cx="0" 
            cy="0" 
            r="8" 
            fill="rgba(0,255,255,0.3)" 
            stroke="#00ffff" 
            strokeWidth="2"
          />
          <Target className="w-4 h-4 text-cyan-400" x="-8" y="-8" />
          <text 
            x="15" 
            y="5" 
            fill="#00ffff" 
            fontSize="12" 
            className="font-mono"
          >
            Timarevo Airfield
          </text>
        </g>

        {/* Дроны */}
        {drones.map(drone => {
          if (!drone.location_lat || !drone.location_lon) return null;
          
          const { x, y } = coordToSVG(drone.location_lat, drone.location_lon);
          const color = getStatusColor(drone.status);
          const online = isOnline(drone);
          const selected = selectedDrone === drone.id;
          
          return (
            <g key={drone.id} transform={`translate(${x},${y})`}>
              {/* Пульсирующий круг для онлайн дронов */}
              {online && (
                <circle 
                  cx="0" 
                  cy="0" 
                  r="15" 
                  fill="none" 
                  stroke={color} 
                  strokeWidth="1" 
                  opacity="0.6"
                >
                  <animate 
                    attributeName="r" 
                    values="15;25;15" 
                    dur="2s" 
                    repeatCount="indefinite"
                  />
                  <animate 
                    attributeName="opacity" 
                    values="0.6;0.1;0.6" 
                    dur="2s" 
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              
              {/* Основной маркер дрона */}
              <circle
                cx="0"
                cy="0"
                r={selected ? "8" : "6"}
                fill={color}
                stroke={selected ? "#ffffff" : color}
                strokeWidth={selected ? "2" : "1"}
                filter="url(#glow)"
                className="cursor-pointer hover:opacity-80 transition-all duration-300"
                onClick={() => zoomTo(drone)}
              />
              
              {/* Индикатор статуса */}
              <circle
                cx="0"
                cy="0"
                r="3"
                fill="rgba(0,0,0,0.7)"
              />
              
              {/* Иконка статуса */}
              {drone.status === 'in_flight' && (
                <Zap className="w-2 h-2 text-white" x="-4" y="-4" />
              )}
              
              {/* Название дрона */}
              <text
                x="12"
                y="4"
                fill={color}
                fontSize="10"
                className="font-mono pointer-events-none"
                style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.8))' }}
              >
                {drone.name}
              </text>
              
              {/* Батарея */}
              {drone.battery_level && (
                <text
                  x="12"
                  y="16"
                  fill={drone.battery_level > 30 ? '#00ff41' : '#ff9f00'}
                  fontSize="8"
                  className="font-mono pointer-events-none"
                >
                  {Math.round(drone.battery_level)}%
                </text>
              )}
              
              {/* Линия связи с базой для активных дронов */}
              {online && drone.status === 'in_flight' && (
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="0"
                  stroke={color}
                  strokeWidth="1"
                  strokeDasharray="3,3"
                  opacity="0.4"
                >
                  <animate 
                    attributeName="stroke-dashoffset" 
                    values="0;6" 
                    dur="1s" 
                    repeatCount="indefinite"
                  />
                </line>
              )}
            </g>
          );
        })}

        {/* Зона покрытия аэродрома */}
        <circle 
          cx="0" 
          cy="0" 
          r="100" 
          fill="none" 
          stroke="rgba(0,255,255,0.2)" 
          strokeWidth="1" 
          strokeDasharray="5,5"
        />
        
        {/* Дальняя зона */}
        <circle 
          cx="0" 
          cy="0" 
          r="200" 
          fill="none" 
          stroke="rgba(255,159,0,0.1)" 
          strokeWidth="1" 
          strokeDasharray="10,10"
        />
      </svg>

      {/* Эффект сканирования */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"
          style={{
            animation: 'scan 4s ease-in-out infinite',
            top: '0%'
          }}
        />
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          50% { top: 100%; opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default TacticalSVG;
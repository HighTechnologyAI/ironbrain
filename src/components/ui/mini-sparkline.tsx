import React from 'react';
import { LineChart, Line, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { cn } from '@/lib/utils';

interface SparklineData {
  value: number;
  timestamp?: string | Date;
}

interface MiniSparklineProps {
  data: SparklineData[];
  height?: number;
  width?: number;
  color?: string;
  strokeWidth?: number;
  variant?: 'line' | 'area';
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const MiniSparkline = ({ 
  data, 
  height = 40, 
  width = 120,
  color,
  strokeWidth = 2,
  variant = 'line',
  trend,
  className
}: MiniSparklineProps) => {
  // Определяем цвет на основе тренда или используем переданный
  const getColor = () => {
    if (color) return color;
    
    switch (trend) {
      case 'up': return 'hsl(var(--primary))';
      case 'down': return 'hsl(var(--destructive))';
      case 'neutral': return 'hsl(var(--muted-foreground))';
      default: return 'hsl(var(--primary))';
    }
  };

  const sparklineColor = getColor();

  if (!data || data.length === 0) {
    return (
      <div 
        className={cn("flex items-center justify-center bg-muted/20 rounded", className)}
        style={{ height, width }}
      >
        <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
      </div>
    );
  }

  // Подготавливаем данные для Recharts
  const chartData = data.map((item, index) => ({
    index,
    value: item.value,
    timestamp: item.timestamp
  }));

  return (
    <div className={cn("", className)} style={{ height, width }}>
      <ResponsiveContainer width="100%" height="100%">
        {variant === 'area' ? (
          <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <Area
              type="monotone"
              dataKey="value"
              stroke={sparklineColor}
              strokeWidth={strokeWidth}
              fill={sparklineColor}
              fillOpacity={0.2}
              dot={false}
              activeDot={false}
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={sparklineColor}
              strokeWidth={strokeWidth}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export { MiniSparkline, type SparklineData };
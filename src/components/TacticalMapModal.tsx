import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Map, Maximize2, X } from 'lucide-react';
import TacticalMapbox from './TacticalMapbox';
import TacticalSVG from './TacticalSVG';
import { Badge } from '@/components/ui/badge';
import { Drone } from '@/hooks/use-drones';

interface TacticalMapModalProps {
  drones: Drone[];
  trigger?: React.ReactNode;
}

const TacticalMapModal: React.FC<TacticalMapModalProps> = ({ drones, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mapType, setMapType] = useState<'mapbox' | 'svg'>('mapbox');

  const defaultTrigger = (
    <Button 
      variant="outline" 
      className="w-full bg-surface-2 border-border hover:bg-surface-3 text-foreground"
    >
      <Map className="h-4 w-4 mr-2" />
      Открыть тактическую карту
      <Maximize2 className="h-4 w-4 ml-2" />
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-background border-border">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Map className="h-6 w-6 text-primary" />
              <DialogTitle className="text-xl font-semibold text-foreground">
                Тактическая карта
              </DialogTitle>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Переключатель типа карты */}
              <div className="flex items-center gap-2">
                <Badge 
                  variant={mapType === 'svg' ? 'default' : 'secondary'} 
                  className="cursor-pointer transition-colors"
                  onClick={() => setMapType('svg')}
                >
                  Кибер SVG
                </Badge>
                <Badge 
                  variant={mapType === 'mapbox' ? 'default' : 'secondary'} 
                  className="cursor-pointer transition-colors"
                  onClick={() => setMapType('mapbox')}
                >
                  Mapbox Спутник
                </Badge>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-2">
            {mapType === 'mapbox' 
              ? 'Спутниковая карта Mapbox с реальными координатами (требуется токен)'
              : 'Кибер-карта с анимированными элементами'
            }
          </p>
        </DialogHeader>
        
        <div className="flex-1 p-6">
          {mapType === 'mapbox' ? (
            <TacticalMapbox 
              drones={drones} 
              className="h-full min-h-[600px]"
            />
          ) : (
            <TacticalSVG 
              drones={drones} 
              className="h-full min-h-[600px]"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TacticalMapModal;
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Map, Maximize2, X } from 'lucide-react';
import TacticalMapbox from './TacticalMapbox';
import { Drone } from '@/hooks/use-drones';

interface TacticalMapModalProps {
  drones: Drone[];
  trigger?: React.ReactNode;
}

const TacticalMapModal: React.FC<TacticalMapModalProps> = ({ drones, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultTrigger = (
    <Button 
      variant="outline" 
      className="w-full bg-surface-2 border-border hover:bg-surface-3 text-foreground transition-colors"
    >
      <Map className="h-4 w-4 mr-2" />
      Открыть тактическую карту
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-7xl h-[90vh] p-0 bg-surface-1 border-border">
        <DialogHeader className="px-6 py-4 border-b border-border bg-surface-2">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold font-ui text-foreground">
                Тактическая карта - Реальное время
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Интерактивная карта с позициями дронов и навигацией
              </p>
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
        </DialogHeader>
        
        <div className="flex-1 p-0">
          <TacticalMapbox 
            drones={drones} 
            className="h-full min-h-[600px]"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TacticalMapModal;
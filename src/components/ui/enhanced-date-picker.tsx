import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EnhancedDatePickerProps {
  date?: Date;
  onDateSelect: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function EnhancedDatePicker({ 
  date, 
  onDateSelect, 
  placeholder = "Выберите дату",
  className 
}: EnhancedDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [month, setMonth] = React.useState(date?.getMonth() ?? new Date().getMonth());
  const [year, setYear] = React.useState(date?.getFullYear() ?? new Date().getFullYear());

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const handleMonthChange = (newMonth: string) => {
    setMonth(parseInt(newMonth));
  };

  const handleYearChange = (newYear: string) => {
    setYear(parseInt(newYear));
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    setYear(prev => direction === 'prev' ? prev - 5 : prev + 5);
  };

  const calendarDate = new Date(year, month);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateSelect(selectedDate);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal transition-all duration-200",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd.MM.yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-background/95 backdrop-blur-sm border-border/60" align="start">
        <div className="p-3 border-b border-border/40">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateYear('prev')}
              className="h-7 w-7 p-0 hover:bg-secondary/80"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="text-xs text-muted-foreground">Быстрая навигация</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateYear('next')}
              className="h-7 w-7 p-0 hover:bg-secondary/80"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Select value={month.toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((monthName, index) => (
                  <SelectItem key={index} value={index.toString()} className="text-xs">
                    {monthName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={year.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((yearOption) => (
                  <SelectItem key={yearOption} value={yearOption.toString()} className="text-xs">
                    {yearOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          month={calendarDate}
          onMonthChange={(newDate) => {
            setMonth(newDate.getMonth());
            setYear(newDate.getFullYear());
          }}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
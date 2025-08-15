import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Plus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const iconCategories = {
  'Юриспруденция': ['⚖️', '📝', '🏛️', '📋', '🗂️'],
  'Переговоры': ['🤝', '💬', '🗣️', '📞', '🎯'],
  'Разработка': ['💻', '🛠️', '🔧', '⚙️', '🔬'],
  'Дроны': ['🚁', '✈️', '📡', '🛰️', '🎯'],
  'Бизнес': ['💼', '📊', '🌐', '💰', '📈'],
  'Производство': ['🏭', '🔩', '🧪', '🛡️', '⚡']
} as const;

interface TagIconSelectorProps {
  onTagAdd: (tag: { name: string; icon: string }) => void;
  placeholder?: string;
  className?: string;
  buttonText?: string;
}

export function TagIconSelector({ onTagAdd, placeholder = "Добавить тег...", className, buttonText = "Добавить тег" }: TagIconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");

  const filteredCategories = Object.entries(iconCategories).filter(([category, icons]) =>
    category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    icons.some(icon => icon.includes(searchQuery))
  );

  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon);
  };

  const handleAddTag = () => {
    if (newTagName.trim() && selectedIcon) {
      onTagAdd({ name: newTagName.trim(), icon: selectedIcon });
      setNewTagName("");
      setSelectedIcon("");
      setIsOpen(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // In a real implementation, you'd upload this to storage
      // For now, we'll use a placeholder
      setSelectedIcon("🖼️");
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          type="button" 
          className={cn("shrink-0 transition-all duration-200 hover:scale-105", className)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-sm border-border/60" align="start">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по категориям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {filteredCategories.map(([category, icons]) => (
              <div key={category} className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                  {category}
                </Label>
                <div className="grid grid-cols-8 gap-1">
                  {icons.map((icon, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant={selectedIcon === icon ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0 text-lg transition-all duration-200",
                        selectedIcon === icon && "scale-110 shadow-lg"
                      )}
                      onClick={() => handleIconSelect(icon)}
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border/40 pt-3">
            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
              Кастомная иконка
            </Label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  asChild
                >
                  <div>
                    <Upload className="h-4 w-4" />
                  </div>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
              <span className="text-xs text-muted-foreground">Загрузить изображение</span>
            </div>
          </div>

          <div className="border-t border-border/40 pt-3 space-y-2">
            <Input
              placeholder="Название тега..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="text-sm"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedIcon && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="text-base">{selectedIcon}</span>
                    <span>Выбрано</span>
                  </div>
                )}
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleAddTag}
                disabled={!newTagName.trim() || !selectedIcon}
                className="transition-all duration-200 hover:scale-105"
              >
                Добавить
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
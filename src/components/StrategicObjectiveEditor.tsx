import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker";
import { TagIconSelector } from "@/components/ui/tag-icon-selector";
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, DollarSign, Hash, X, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface StrategicObjectiveEditorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  budget: string;
  currency: string;
  date: string;
  tags: string[];
  onSave: (data: {
    title: string;
    description: string;
    budget: string;
    currency: string;
    date: string;
    tags: string[];
  }) => void;
  onCancel: () => void;
  localized: {
    editTitle: string;
    saveChanges: string;
    cancel: string;
    titleLabel: string;
    descriptionLabel: string;
    budgetLabel: string;
    dateLabel: string;
    tagsLabel: string;
    addTag: string;
  };
}

export default function StrategicObjectiveEditor({
  isOpen,
  onOpenChange,
  title,
  description,
  budget,
  currency,
  date,
  tags,
  onSave,
  onCancel,
  localized
}: StrategicObjectiveEditorProps) {
  const [editData, setEditData] = useState({
    title: title || '',
    description: description || '',
    budget: budget || '',
    currency: currency || 'BGN',
    date: date || '',
    tags: tags ? [...tags] : []
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    date && date.trim() ? (() => {
      try {
        const [day, month, year] = date.split('.');
        if (day && month && year) {
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        return undefined;
      } catch {
        return undefined;
      }
    })() : undefined
  );
  const [newTag, setNewTag] = useState("");

  // Update local state when props change
  useEffect(() => {
    setEditData({
      title: title || '',
      description: description || '',
      budget: budget || '',
      currency: currency || 'BGN',
      date: date || '',
      tags: tags ? [...tags] : []
    });
    
    if (date && date.trim()) {
      try {
        const [day, month, year] = date.split('.');
        if (day && month && year) {
          setSelectedDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
        }
      } catch {
        setSelectedDate(undefined);
      }
    } else {
      setSelectedDate(undefined);
    }
  }, [title, description, budget, currency, date, tags]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = format(date, 'dd.MM.yyyy');
      setEditData(prev => ({ ...prev, date: formattedDate }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !editData.tags.includes(newTag.trim())) {
      setEditData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const addTagWithIcon = (tagData: { name: string; icon: string }) => {
    const tagWithIcon = `${tagData.icon} ${tagData.name}`;
    if (!editData.tags.includes(tagWithIcon)) {
      setEditData(prev => ({
        ...prev,
        tags: [...prev.tags, tagWithIcon]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = () => {
    onSave(editData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {localized.editTitle}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info Section */}
          <Card className="bg-surface-1/50 backdrop-blur-sm border-border/60">
            <CardContent className="p-4 space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  {localized.titleLabel}
                </Label>
                <Input 
                  id="title"
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1.5 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  {localized.descriptionLabel}
                </Label>
                <Textarea 
                  id="description"
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="mt-1.5 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Section - Always Visible */}
          <Card className="bg-surface-1/50 backdrop-blur-sm border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">{localized.budgetLabel}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="budget" className="text-xs text-muted-foreground">
                    Сумма
                  </Label>
                  <Input 
                    id="budget"
                    type="number"
                    min="0"
                    step="1000"
                    value={editData.budget}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
                        setEditData(prev => ({ ...prev, budget: value }));
                      }
                    }}
                    className="mt-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    placeholder="75000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="currency" className="text-xs text-muted-foreground">
                    Валюта
                  </Label>
                  <select 
                    id="currency"
                    value={editData.currency}
                    onChange={(e) => setEditData(prev => ({ ...prev, currency: e.target.value }))}
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200"
                  >
                    <option value="BGN">BGN (лв)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="UAH">UAH (₴)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Date Section */}
          <Card className="bg-surface-1/50 backdrop-blur-sm border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">{localized.dateLabel}</h3>
              </div>
              
              <EnhancedDatePicker
                date={selectedDate}
                onDateSelect={handleDateSelect}
                placeholder="Выберите дату"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </CardContent>
          </Card>

          {/* Tags Section */}
          <Card className="bg-surface-1/50 backdrop-blur-sm border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">{localized.tagsLabel || 'Теги'}</h3>
              </div>
              
              <div className="space-y-3">
                <TagIconSelector 
                  onTagAdd={addTagWithIcon}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2 py-3 rounded-lg"
                  buttonText="Создать интеллектуальный тег"
                />
                
                {editData.tags.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {editData.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="flex items-center gap-1 transition-all duration-200 hover:bg-secondary/80 animate-fade-in justify-between p-2"
                      >
                        <span className="text-sm">{tag}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:bg-transparent opacity-70 hover:opacity-100 transition-opacity"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="transition-all duration-200 hover:bg-secondary/80"
            >
              {localized.cancel}
            </Button>
            <Button 
              onClick={handleSave}
              className="transition-all duration-200 hover:scale-105"
            >
              {localized.saveChanges}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
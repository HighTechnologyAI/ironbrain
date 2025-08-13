import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { 
  Settings, 
  Zap, 
  Heart, 
  Shield, 
  Users,
  BookOpen,
  Lightbulb,
  Target
} from 'lucide-react';

type AITone = 'professional' | 'friendly' | 'expert' | 'motivational' | 'analytical' | 'creative' | 'concise' | 'detailed';

interface ToneSelectorProps {
  selectedTone: AITone;
  onToneChange: (tone: AITone) => void;
  size?: 'sm' | 'md' | 'lg';
}

const toneConfig: Record<AITone, {
  icon: any;
  label: { en: string; ru: string; bg: string };
  description: { en: string; ru: string; bg: string };
  color: string;
}> = {
  professional: {
    icon: Shield,
    label: { en: 'Professional', ru: 'Профессиональный', bg: 'Професионален' },
    description: { en: 'Formal and business-oriented', ru: 'Формальный и деловой', bg: 'Формален и бизнес-ориентиран' },
    color: 'text-blue-500'
  },
  friendly: {
    icon: Heart,
    label: { en: 'Friendly', ru: 'Дружелюбный', bg: 'Приятелски' },
    description: { en: 'Warm and approachable', ru: 'Теплый и доступный', bg: 'Топъл и достъпен' },
    color: 'text-green-500'
  },
  expert: {
    icon: BookOpen,
    label: { en: 'Expert', ru: 'Эксперт', bg: 'Експерт' },
    description: { en: 'Technical and detailed', ru: 'Технический и детальный', bg: 'Технически и детайлен' },
    color: 'text-purple-500'
  },
  motivational: {
    icon: Zap,
    label: { en: 'Motivational', ru: 'Мотивирующий', bg: 'Мотивиращ' },
    description: { en: 'Inspiring and energetic', ru: 'Вдохновляющий и энергичный', bg: 'Вдъхновяващ и енергичен' },
    color: 'text-orange-500'
  },
  analytical: {
    icon: Settings,
    label: { en: 'Analytical', ru: 'Аналитический', bg: 'Аналитичен' },
    description: { en: 'Data-driven and logical', ru: 'На основе данных и логики', bg: 'Базиран на данни и логичен' },
    color: 'text-cyan-500'
  },
  creative: {
    icon: Lightbulb,
    label: { en: 'Creative', ru: 'Креативный', bg: 'Креативен' },
    description: { en: 'Innovative and imaginative', ru: 'Инновационный и изобретательный', bg: 'Иновативен и въображаем' },
    color: 'text-pink-500'
  },
  concise: {
    icon: Target,
    label: { en: 'Concise', ru: 'Краткий', bg: 'Кратък' },
    description: { en: 'Brief and to the point', ru: 'Краткий и по существу', bg: 'Кратък и по същество' },
    color: 'text-red-500'
  },
  detailed: {
    icon: Users,
    label: { en: 'Detailed', ru: 'Подробный', bg: 'Подробен' },
    description: { en: 'Comprehensive and thorough', ru: 'Всеобъемлющий и тщательный', bg: 'Цялостен и основен' },
    color: 'text-indigo-500'
  }
};

const ToneSelector = ({ selectedTone, onToneChange, size = 'md' }: ToneSelectorProps) => {
  const { language } = useLanguage();
  const lang = language as 'en' | 'ru' | 'bg';

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Settings className={iconSize} />
        {lang === 'ru' ? 'Тональность AI' : lang === 'bg' ? 'Тон на AI' : 'AI Tone'}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(toneConfig).map(([tone, config]) => {
          const Icon = config.icon;
          const isSelected = selectedTone === tone;
          
          return (
            <Button
              key={tone}
              variant={isSelected ? "default" : "outline"}
              size={buttonSize}
              onClick={() => onToneChange(tone as AITone)}
              className={`flex flex-col gap-1 h-auto py-2 px-3 ${
                isSelected ? 'ring-2 ring-primary' : ''
              } hover:scale-105 transition-transform`}
              title={config.description[lang]}
            >
              <Icon className={`${iconSize} ${isSelected ? 'text-primary-foreground' : config.color}`} />
              <span className="text-xs font-medium truncate">
                {config.label[lang]}
              </span>
            </Button>
          );
        })}
      </div>

      {selectedTone && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            {toneConfig[selectedTone].label[lang]}
          </Badge>
          <span>{toneConfig[selectedTone].description[lang]}</span>
        </div>
      )}
    </div>
  );
};

export { ToneSelector, toneConfig, type AITone };
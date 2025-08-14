import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
];

const LanguageSwitcherV2 = React.memo(() => {
  const { i18n } = useTranslation();

  const currentLang = React.useMemo(() => 
    languages.find(lang => lang.code === i18n.language), 
    [i18n.language]
  );

  const handleLanguageChange = React.useCallback(async (newLanguage: string) => {
    if (newLanguage !== i18n.language) {
      await i18n.changeLanguage(newLanguage);
    }
  }, [i18n]);

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-40">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <SelectValue>
            {currentLang && (
              <span className="flex items-center gap-2">
                <span>{currentLang.flag}</span>
                <span className="hidden sm:inline">{currentLang.nativeName}</span>
              </span>
            )}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.nativeName}</span>
              <span className="text-muted-foreground text-xs">({lang.name})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

LanguageSwitcherV2.displayName = 'LanguageSwitcherV2';

export default LanguageSwitcherV2;
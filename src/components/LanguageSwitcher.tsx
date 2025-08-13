import React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { languages } from '@/lib/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

const LanguageSwitcher = React.memo(() => {
  const { language, setLanguage } = useLanguage();

  const currentLanguage = React.useMemo(() => 
    languages.find(lang => lang.code === language), 
    [language]
  );

  const handleLanguageChange = React.useCallback((newLanguage: string) => {
    if (newLanguage !== language) {
      setLanguage(newLanguage);
    }
  }, [language, setLanguage]);

  return (
    <Select value={language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-40">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <SelectValue>
            {currentLanguage && (
              <span className="flex items-center gap-2">
                <span>{currentLanguage.flag}</span>
                <span className="hidden sm:inline">{currentLanguage.name}</span>
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
              <span>{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

LanguageSwitcher.displayName = 'LanguageSwitcher';

export default LanguageSwitcher;
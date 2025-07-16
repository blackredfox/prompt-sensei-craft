import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const languages = [
    { code: 'en', label: '🇺🇸 English', name: 'English' },
    { code: 'ru', label: '🇷🇺 Русский', name: 'Russian' },
    { code: 'es', label: '🇪🇸 Español', name: 'Spanish' },
    { code: 'de', label: '🇩🇪 Deutsch', name: 'German' },
    { code: 'fr', label: '🇫🇷 Français', name: 'French' },
    { code: 'zh', label: '🇨🇳 中文', name: 'Chinese' },
    { code: 'ar', label: '🇸🇦 العربية', name: 'Arabic' },
    { code: 'ja', label: '🇯🇵 日本語', name: 'Japanese' },
    { code: 'he', label: '🇮🇱 עברית', name: 'Hebrew' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Globe className="w-4 h-4 mr-2" />
          {currentLanguage.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={i18n.language === language.code ? 'bg-accent' : ''}
          >
            {language.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
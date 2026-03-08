import { useTranslation } from 'react-i18next';
import { LANGUAGES } from 'shared/i18n/constants';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <div
      className="flex items-center gap-1 text-charcoal-light text-sm"
      dir="ltr"
    >
      {Object.values(LANGUAGES).map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`px-2 py-1 rounded-lg transition-all duration-300 hover:scale-105 ${
            i18n.language === lang.code
              ? 'text-sage font-medium opacity-100'
              : 'opacity-70 hover:opacity-100 hover:text-sage'
          }`}
          title={lang.name}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  );
}

import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'en' | 'kn';

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (obj: { en?: string; kn?: string } | string | undefined, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: () => '',
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>(
    () => (localStorage.getItem('fort_lang') as Lang) || 'en'
  );

  const changeLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem('fort_lang', l);
  };

  const t = (obj: { en?: string; kn?: string } | string | undefined, fallback = ''): string => {
    if (!obj) return fallback;
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj.en || fallback;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);

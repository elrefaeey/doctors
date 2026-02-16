import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import enTranslations from '@/locales/en.json';
import arTranslations from '@/locales/ar.json';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('health-connect-lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });
  const [translations, setTranslations] = useState<Record<string, any>>({
    en: enTranslations,
    ar: arTranslations,
  });
  const [loading, setLoading] = useState(true);

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  // Try to fetch translations from Firestore, fallback to local JSON
  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const enDoc = await getDoc(doc(db, 'translations', 'en'));
        const arDoc = await getDoc(doc(db, 'translations', 'ar'));
        
        // Only update if Firestore has data, otherwise keep local JSON
        if (enDoc.exists() || arDoc.exists()) {
          setTranslations({
            en: enDoc.exists() ? enDoc.data() : enTranslations,
            ar: arDoc.exists() ? arDoc.data() : arTranslations,
          });
        }
      } catch (error) {
        console.warn('Using local translations. To use Firestore translations, update security rules and run: npm run seed');
        // Keep using local translations on error
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, []);

  useEffect(() => {
    localStorage.setItem('health-connect-lang', language);
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
  }, [language, dir]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  }, [language, translations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, loading }}>
      {!loading && children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

import { createContext, useContext, useEffect, useState } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Tenta recuperar do localStorage
    const saved = localStorage.getItem('language');
    if (saved && (saved === 'pt' || saved === 'en')) return saved;
    
    // Usa português como padrão
    return 'pt';
  });

  useEffect(() => {
    // Salva a preferência no localStorage
    localStorage.setItem('language', language);
    
    // Atualiza o atributo lang do HTML
    document.documentElement.setAttribute('lang', language === 'pt' ? 'pt-BR' : 'en');
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'pt' ? 'en' : 'pt');
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
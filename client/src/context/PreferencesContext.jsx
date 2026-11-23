import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from '../i18n/translations.js';
import { readStorage, writeStorage } from '../lib/storage.js';

const PreferencesContext = createContext(null);

function initialTheme() {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  return 'dark';
}

function initialLanguage() {
  const saved = readStorage('language');
  if (saved === 'pt' || saved === 'en') return saved;
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

function lookup(dict, key) {
  let value = dict;
  for (const part of key.split('.')) {
    if (value == null || typeof value !== 'object') return undefined;
    value = value[part];
  }
  return value;
}

export function PreferencesProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme);
  const [language, setLanguage] = useState(initialLanguage);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    writeStorage('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', language === 'pt' ? 'pt-BR' : 'en');
    writeStorage('language', language);
  }, [language]);

  /**
   * Traduz uma chave (com suporte a caminho "a.b.c") e substitui {variáveis}.
   * Cai para português e, por fim, para a própria chave.
   */
  const t = useCallback(
    (key, vars) => {
      let value = lookup(translations[language], key);
      if (value === undefined) value = lookup(translations.pt, key);
      if (value === undefined) {
        if (import.meta.env.DEV) console.warn(`[i18n] chave ausente: ${key}`);
        return key;
      }
      if (typeof value !== 'string' || !vars) return value;
      return value.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
    },
    [language]
  );

  const value = useMemo(
    () => ({
      theme,
      language,
      locale: language === 'pt' ? 'pt-BR' : 'en-US',
      t,
      toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
      toggleLanguage: () => setLanguage((prev) => (prev === 'pt' ? 'en' : 'pt')),
    }),
    [theme, language, t]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences precisa estar dentro de PreferencesProvider');
  return ctx;
}

/** Atalho para quem só precisa traduzir. */
export function useT() {
  return usePreferences().t;
}

function interpolate(value, vars) {
  if (typeof value !== 'string' || !vars) return value;
  return value.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}

/**
 * Traduções locais de uma página: `{ pt: {...}, en: {...} }`.
 * Chaves que não existirem no dicionário local caem nas traduções globais.
 */
export function usePageT(dict) {
  const { t, language } = usePreferences();
  return useCallback(
    (key, vars) => {
      const local = dict[language]?.[key] ?? dict.pt?.[key];
      return local === undefined ? t(key, vars) : interpolate(local, vars);
    },
    [dict, language, t]
  );
}

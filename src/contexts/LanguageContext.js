import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'gp_lang';

export const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  toggleLang: () => {},
  loc: (val) => '',
});

/** Pick a localized value ({ en, ur } or plain string) for the active language. */
export const pickLocale = (val, lang = 'en') => {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (lang === 'ur') return val.ur || val.en || '';
  return val.en || val.ur || '';
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'en' || saved === 'ur') setLangState(saved);
    });
  }, []);

  const setLang = useCallback((next) => {
    setLangState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((cur) => {
      const next = cur === 'en' ? 'ur' : 'en';
      AsyncStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const loc = useCallback((val) => pickLocale(val, lang), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, loc }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

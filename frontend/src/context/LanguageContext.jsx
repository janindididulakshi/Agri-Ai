import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import si from "../translations/sinhala.js";
import en from "../translations/english.js";
import ta from "../translations/tamil.js";

const bundles = { si, en, ta };

const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("sf_lang") || "en");

  useEffect(() => {
    localStorage.setItem("sf_lang", lang);
  }, [lang]);

  const setLang = useCallback((l) => {
    try {
      setLangState(l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useMemo(() => {
    const table = bundles[lang] || bundles.si;
    return (key) => table[key] || bundles.si[key] || key;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  return useContext(LanguageContext);
}

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  cashierTranslations,
  type CashierTextKey,
} from "@/constants/cashierTranslations";

export type CashierLanguage = "vi" | "en";

interface CashierLocaleContextValue {
  language: CashierLanguage;
  setLanguage: (language: CashierLanguage) => void;
  isEnglish: boolean;
  t: (key: CashierTextKey) => string;
}

const CashierLocaleContext = createContext<CashierLocaleContextValue | null>(null);
const viText = cashierTranslations.vi.text;
const enText = cashierTranslations.en.text;
const viToEn = Object.fromEntries(Object.entries(viText)) as Record<string, string>;
const enToVi = Object.fromEntries(
  Object.entries(enText).map(([vietnamese, english]) => [english, vietnamese]),
) as Record<string, string>;

function translateCashierDom(language: CashierLanguage) {
  const dictionary = language === "en" ? viToEn : enToVi;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  textNodes.forEach((node) => {
    const value = node.nodeValue ?? "";
    const trimmed = value.trim();
    const translated = dictionary[trimmed];

    if (translated && translated !== trimmed) {
      node.nodeValue = value.replace(trimmed, translated);
    }
  });

  document
    .querySelectorAll<HTMLElement>("[placeholder], [title], [aria-label]")
    .forEach((element) => {
      ["placeholder", "title", "aria-label"].forEach((attribute) => {
        const value = element.getAttribute(attribute);
        if (value && dictionary[value]) element.setAttribute(attribute, dictionary[value]);
      });
    });
}

function getInitialLanguage(): CashierLanguage {
  if (typeof window === "undefined") return "vi";
  return window.localStorage.getItem("cashier-language") === "en" ? "en" : "vi";
}

export function CashierLocaleProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<CashierLanguage>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem("cashier-language", language);
    translateCashierDom(language);

    const observer = new MutationObserver(() => translateCashierDom(language));
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      isEnglish: language === "en",
      t: (key: CashierTextKey) => cashierTranslations[language].text[key],
    }),
    [language],
  );

  return (
    <CashierLocaleContext.Provider value={value}>
      {children}
    </CashierLocaleContext.Provider>
  );
}

export function useCashierLocale() {
  const context = useContext(CashierLocaleContext);

  if (!context) {
    throw new Error("useCashierLocale must be used inside CashierLocaleProvider");
  }

  return context;
}

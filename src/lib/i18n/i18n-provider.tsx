"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createContext, useContext, useEffect, ReactNode } from "react";
import { dictionary, Locale } from "./dictionary";

type I18nState = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: "en",
      setLocale: (l) => set({ locale: l }),
      t: (key, vars) => translate(get().locale, key, vars),
    }),
    {
      name: "atlas-i18n",
      // Only persist the locale — never the functions, so the store can never
      // be corrupted by stale/serialized function values.
      partialize: (state) => ({ locale: state.locale }) as I18nState,
    }
  )
);

function translate(locale: Locale, key: string, vars?: Record<string, string | number>) {
  const dict = dictionary[locale] as Record<string, any>;
  const parts = key.split(".");
  let cur: any = dict;
  for (const p of parts) {
    cur = cur?.[p];
    if (cur === undefined) break;
  }
  let str: string = typeof cur === "string" ? cur : "";
  if (!str) {
    const enDict = dictionary.en as Record<string, any>;
    let fb: any = enDict;
    for (const p of parts) {
      fb = fb?.[p];
      if (fb === undefined) break;
    }
    str = typeof fb === "string" ? fb : key;
  }
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return str;
}

const I18nContext = createContext<I18nState | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const store = useI18nStore();
  useEffect(() => {
    const el = document.documentElement;
    el.lang = store.locale;
    el.dir = store.locale === "ar" ? "rtl" : "ltr";
  }, [store.locale]);
  return <I18nContext.Provider value={store}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  const fallback = useI18nStore();
  return ctx ?? fallback;
}

export function formatMAD(amount: number, locale: Locale = "en") {
  const localeTag = locale === "fr" ? "fr-MA" : locale === "ar" ? "ar-MA" : "en-MA";
  try {
    return new Intl.NumberFormat(localeTag, {
      style: "currency",
      currency: "MAD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} MAD`;
  }
}

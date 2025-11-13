"use client";

import * as React from "react";

import type { LanguageAlternateMap } from "@/lib/polylang";
import type { Locale } from "@/i18n/config";

const EVENT_NAME = "languagealternateschange";

declare global {
  interface Window {
    __LANG_ALTERNATES__?: {
      alternates: LanguageAlternateMap;
      activeLocale: Locale;
    };
  }
}

type LanguageAlternatesScriptProps = {
  alternates: LanguageAlternateMap;
  activeLocale: Locale;
};

export function LanguageAlternatesScript({
  alternates,
  activeLocale,
}: LanguageAlternatesScriptProps) {
  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.__LANG_ALTERNATES__ = { alternates, activeLocale };
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: window.__LANG_ALTERNATES__,
      })
    );
  }, [alternates, activeLocale]);

  return null;
}

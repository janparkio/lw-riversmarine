"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { Locale, locales } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LanguageAlternateMap } from "@/lib/polylang";

type LanguageAlternatesWindowPayload = {
  alternates: LanguageAlternateMap;
  activeLocale: Locale;
};

const EVENT_NAME = "languagealternateschange";

type LanguageSwitcherProps = {
  currentLocale: Locale;
  label: string;
  unavailableLabel: string;
  className?: string;
};

export function LanguageSwitcher({
  currentLocale,
  label,
  unavailableLabel,
  className,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = React.useState<LanguageAlternatesWindowPayload | null>(null);

  React.useEffect(() => {
    const handle = (event: Event) => {
      const customEvent = event as CustomEvent<LanguageAlternatesWindowPayload>;
      setState(customEvent.detail);
    };

    if (typeof window !== "undefined" && window.__LANG_ALTERNATES__) {
      setState(window.__LANG_ALTERNATES__);
    }

    window.addEventListener(EVENT_NAME, handle as EventListener);
    return () => window.removeEventListener(EVENT_NAME, handle as EventListener);
  }, []);

  const handleSwitch = React.useCallback(
    (nextLocale: Locale, targetPath: string | null) => {
      if (!targetPath || nextLocale === currentLocale) {
        return;
      }

      router.push(targetPath);
    },
    [currentLocale, router]
  );

  const buildFallbackPath = React.useCallback(
    (targetLocale: Locale) => {
      if (!pathname) {
        return null;
      }

      const segments = pathname.split("/");
      if (segments.length > 1) {
        segments[1] = targetLocale;
      }

      const nextPath = segments.join("/") || "/";
      return nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
    },
    [pathname]
  );

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex gap-1 rounded-full border border-border/60 bg-background/80 p-1">
        {locales.map((locale) => {
          const isActive = locale === currentLocale;
          const alternatePath =
            state?.alternates?.[locale] ?? buildFallbackPath(locale);
          const hasExplicitAlternate = state?.alternates
            ? Object.prototype.hasOwnProperty.call(state.alternates, locale)
            : false;
          const isUnavailable =
            hasExplicitAlternate && state?.alternates?.[locale] === null;
          const disabled = isUnavailable || isActive;

          return (
            <Button
              key={locale}
              type="button"
              size="sm"
              variant={isActive ? "default" : "ghost"}
              disabled={disabled}
              aria-pressed={isActive}
              aria-label={`${label}: ${locale.toUpperCase()}`}
              title={isUnavailable ? unavailableLabel : undefined}
              className={cn(
                "px-3 py-1 text-xs uppercase tracking-wide rounded-full",
                disabled && "opacity-60 cursor-not-allowed"
              )}
              onClick={() => handleSwitch(locale, alternatePath ?? null)}
            >
              {locale.toUpperCase()}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

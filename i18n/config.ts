export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeMap: Record<Locale, string> = {
  en: "en-US",
  es: "es-PY",
};

export function isLocale(value: string | undefined | null): value is Locale {
  if (!value) {
    return false;
  }

  return (locales as readonly string[]).includes(value);
}

export function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split("/");
  const potentialLocale = segments[1];

  return isLocale(potentialLocale) ? potentialLocale : null;
}

export function withLocalePath(locale: Locale, pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (normalized === "/") {
    return `/${locale}`;
  }

  return `/${locale}${normalized}`;
}

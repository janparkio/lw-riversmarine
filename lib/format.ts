import { localeMap, Locale, defaultLocale } from "@/i18n/config";

const defaultNumberLocale = localeMap[defaultLocale];

const currencyFractionDigits: Record<string, number> = {
  USD: 2,
  PYG: 0,
};

const resolveIntlLocale = (locale: Locale) => {
  return localeMap[locale] ?? defaultNumberLocale;
};

export function formatNumber(
  value: number | null | undefined,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "";
  }

  const formatter = new Intl.NumberFormat(resolveIntlLocale(locale), options);
  return formatter.format(value);
}

export function formatCurrency(
  value: number | null | undefined,
  currency: string,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "";
  }

  const normalizedCurrency = currency?.toUpperCase?.() || "USD";
  const resolvedOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency: normalizedCurrency,
    ...options,
  };

  if (
    options?.minimumFractionDigits === undefined &&
    options?.maximumFractionDigits === undefined
  ) {
    const digits = currencyFractionDigits[normalizedCurrency] ?? 2;
    resolvedOptions.minimumFractionDigits = digits;
    resolvedOptions.maximumFractionDigits = digits;
  }

  const formatter = new Intl.NumberFormat(
    resolveIntlLocale(locale),
    resolvedOptions
  );
  return formatter.format(value);
}

export function formatDate(
  value: Date | string | number,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat(resolveIntlLocale(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });

  return formatter.format(date);
}

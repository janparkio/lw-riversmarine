import { defaultLocale, Locale, locales } from "@/i18n/config";
import en from "@/i18n/en/site.json";
import es from "@/i18n/es/site.json";

type Dictionary = Record<string, string>;

export type Translator = (
  key: string,
  vars?: Record<string, string | number>
) => string;

const dictionaries: Record<Locale, Dictionary> = {
  en,
  es,
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const normalized = locales.includes(locale) ? locale : defaultLocale;
  return dictionaries[normalized];
}

export async function getTranslator(locale: Locale): Promise<Translator> {
  const dict = await getDictionary(locale);

  return (key: string, vars?: Record<string, string | number>) => {
    const template = dict[key] ?? dictionaries[defaultLocale][key] ?? key;

    if (!vars) {
      return template;
    }

    return Object.entries(vars).reduce((acc, [varKey, value]) => {
      return acc.replace(new RegExp(`{${varKey}}`, "g"), String(value));
    }, template);
  };
}

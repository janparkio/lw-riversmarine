import { Locale, locales, withLocalePath, isLocale } from "@/i18n/config";
import type { PolylangMeta } from "./wordpress.d";

export type PolylangEntity = {
  id: number;
  slug: string;
  polylang?: PolylangMeta;
};

type FetchBySlug<T extends PolylangEntity> = (
  slug: string,
  locale: Locale
) => Promise<T | undefined>;

type FetchById<T extends PolylangEntity> = (
  id: number,
  locale: Locale
) => Promise<T | undefined>;

export type LanguageAlternateMap = Record<Locale, string | null>;

export interface PolylangResolution<T extends PolylangEntity> {
  resource: T;
  alternates: LanguageAlternateMap;
  contentLocale: Locale | null;
  translationMissing: boolean;
  redirectPath?: string;
}

export interface ResolvePolylangResourceOptions<T extends PolylangEntity> {
  slug: string;
  locale: Locale;
  fetchBySlug: FetchBySlug<T>;
  fetchById: FetchById<T>;
  buildPath: (slug: string) => string;
}

export async function resolvePolylangResource<
  T extends PolylangEntity
>(
  options: ResolvePolylangResourceOptions<T>
): Promise<PolylangResolution<T> | null> {
  const { slug, locale, fetchBySlug, fetchById, buildPath } = options;

  const primary = await fetchBySlug(slug, locale);

  if (primary) {
    const alternates = await buildAlternatesMap(primary, fetchById, buildPath);
    alternates[locale] ??= withLocalePath(locale, buildPath(primary.slug));

    const contentLocale = getLocaleFromMeta(primary.polylang);

    return {
      resource: primary,
      alternates,
      contentLocale,
      translationMissing: Boolean(contentLocale && contentLocale !== locale),
    };
  }

  for (const otherLocale of locales) {
    if (otherLocale === locale) {
      continue;
    }

    const candidate = await fetchBySlug(slug, otherLocale);

    if (!candidate) {
      continue;
    }

    const translationId = candidate.polylang?.translations?.[locale];

    if (translationId) {
      const translated = await fetchById(translationId, locale);

      if (!translated) {
        continue;
      }

      const alternates = await buildAlternatesMap(
        translated,
        fetchById,
        buildPath
      );
      alternates[locale] ??= withLocalePath(locale, buildPath(translated.slug));

      return {
        resource: translated,
        alternates,
        contentLocale: getLocaleFromMeta(translated.polylang),
        translationMissing: false,
        redirectPath: withLocalePath(
          locale,
          buildPath(translated.slug)
        ),
      };
    }

    const alternates = await buildAlternatesMap(
      candidate,
      fetchById,
      buildPath
    );
    alternates[locale] ??= withLocalePath(locale, buildPath(slug));

    const contentLocale = getLocaleFromMeta(candidate.polylang);

    return {
      resource: candidate,
      alternates,
      contentLocale,
      translationMissing: Boolean(contentLocale && contentLocale !== locale),
    };
  }

  return null;
}

export function getLocaleFromMeta(meta?: PolylangMeta): Locale | null {
  if (!meta?.lang) {
    return null;
  }

  return isLocale(meta.lang) ? meta.lang : null;
}

async function buildAlternatesMap<T extends PolylangEntity>(
  resource: T,
  fetchById: FetchById<T>,
  buildPath: (slug: string) => string
): Promise<LanguageAlternateMap> {
  if (!resource.polylang) {
    return Object.fromEntries(
      locales.map((locale) => [
        locale,
        withLocalePath(locale, buildPath(resource.slug)),
      ])
    ) as LanguageAlternateMap;
  }

  const entries: [Locale, string | null][] = [];
  const baseLocale = getLocaleFromMeta(resource.polylang);

  for (const locale of locales) {
    if (locale === baseLocale) {
      entries.push([
        locale,
        withLocalePath(locale, buildPath(resource.slug)),
      ]);
      continue;
    }

    const translationId = resource.polylang.translations?.[locale];

    if (!translationId) {
      entries.push([locale, null]);
      continue;
    }

    const translation = await fetchById(translationId, locale);
    const slug = translation?.slug;

    entries.push([
      locale,
      slug ? withLocalePath(locale, buildPath(slug)) : null,
    ]);
  }

  return Object.fromEntries(entries) as LanguageAlternateMap;
}

export function buildStaticAlternates(
  builder: (locale: Locale) => string
): LanguageAlternateMap {
  return Object.fromEntries(
    locales.map((locale) => [locale, builder(locale)])
  ) as LanguageAlternateMap;
}

export function partitionEntitiesByLocale<T extends PolylangEntity>(
  items: T[],
  locale: Locale
) {
  const matches: T[] = [];
  const fallbacks: T[] = [];

  for (const item of items) {
    const itemLocale = getLocaleFromMeta(item.polylang);

    if (itemLocale === locale) {
      matches.push(item);
    } else {
      fallbacks.push(item);
    }
  }

  return { matches, fallbacks };
}

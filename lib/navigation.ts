import { menuFallbacks, type MenuConfigLocation } from "@/menu.config";
import { Locale, isLocale, withLocalePath } from "@/i18n/config";
import type { Translator } from "@/lib/i18n";
import type { MenuItem } from "@/lib/wordpress";
import { siteConfig } from "@/site.config";

type ResolvedHref = {
  href: string;
  external: boolean;
};

const siteHostname = safeHostname(siteConfig.site_domain);
const wordpressHostname = safeHostname(process.env.WORDPRESS_URL);
const internalHostnames = [siteHostname, wordpressHostname]
  .filter((value): value is string => Boolean(value))
  .map(normalizeHostname);

export type NavigationLink = {
  id: string | number;
  label: string;
  href: string;
  target?: string | null;
  rel?: string | null;
  external: boolean;
  children?: NavigationLink[];
};

export function resolveMenuLinks(
  items: MenuItem[] | null,
  locale: Locale
): NavigationLink[] {
  if (!items?.length) {
    return [];
  }

  return items.map((item) => {
    const { href, external } = resolveHref(item.href, locale);
    const children = item.children?.length
      ? resolveMenuLinks(item.children, locale)
      : undefined;

    return {
      id: item.id,
      label: item.label,
      href,
      target: item.target ?? (external ? "_blank" : null),
      rel: item.rel ?? (external ? "noreferrer" : null),
      external,
      children,
    };
  });
}

export function buildFallbackMenuLinks(
  location: MenuConfigLocation,
  locale: Locale,
  t: Translator
): NavigationLink[] {
  const configItems = menuFallbacks[location] ?? [];

  return configItems.map((item, index) => {
    const { href, external } = resolveHref(item.href, locale);

    return {
      id: item.id ?? `${location}-${index}`,
      label: t(item.labelKey),
      href,
      target: external ? "_blank" : null,
      rel: external ? "noreferrer" : null,
      external,
    };
  });
}

function resolveHref(rawHref: string, locale: Locale): ResolvedHref {
  const trimmed = (rawHref ?? "").trim();

  if (!trimmed) {
    return { href: withLocalePath(locale, "/"), external: false };
  }

  if (trimmed.startsWith("#")) {
    return { href: trimmed, external: false };
  }

  if (trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) {
    return { href: trimmed, external: true };
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (isInternalHost(url.hostname)) {
        const localized = withLocaleAwarePath(
          `${url.pathname}${url.search}${url.hash}`,
          locale
        );
        return { href: localized, external: false };
      }
    } catch {
      // Ignore malformed URLs and treat them as external links.
    }
    return { href: trimmed, external: true };
  }

  return {
    href: withLocaleAwarePath(trimmed, locale),
    external: false,
  };
}

function withLocaleAwarePath(pathname: string, locale: Locale): string {
  if (!pathname || pathname === "/") {
    return withLocalePath(locale, "/");
  }

  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const [_, possibleLocale] = normalized.split("/");

  if (possibleLocale && isLocale(possibleLocale)) {
    return normalized;
  }

  return withLocalePath(locale, normalized);
}

function safeHostname(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

function normalizeHostname(hostname: string): string {
  return hostname.replace(/^www\./i, "").toLowerCase();
}

function isInternalHost(hostname: string): boolean {
  if (!hostname) {
    return false;
  }

  const normalized = normalizeHostname(hostname);
  return internalHostnames.includes(normalized);
}

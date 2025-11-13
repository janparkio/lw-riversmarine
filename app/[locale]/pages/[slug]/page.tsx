import { getPageBySlug, getPageById, getAllPages } from "@/lib/wordpress";
import { Section, Container, Prose } from "@/components/craft";
import { siteConfig } from "@/site.config";
import { locales, Locale, withLocalePath } from "@/i18n/config";
import { resolvePolylangResource } from "@/lib/polylang";
import { LanguageAlternatesScript } from "@/components/language/language-alternates-script";
import { TranslationFallback } from "@/components/language/translation-fallback";
import { getTranslator } from "@/lib/i18n";
import { notFound, redirect } from "next/navigation";

import type { Metadata } from "next";

// Revalidate pages every hour
export const revalidate = 3600;

export async function generateStaticParams() {
  const params = await Promise.all(
    locales.map(async (locale) => {
      const pages = await getAllPages(locale);
      return pages.map((page) => ({
        locale,
        slug: page.slug,
      }));
    })
  );

  return params.flat();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolution = await resolvePolylangResource({
    slug,
    locale,
    fetchBySlug: getPageBySlug,
    fetchById: getPageById,
    buildPath: (resolvedSlug) => `/pages/${resolvedSlug}`,
  });

  if (!resolution) {
    return {};
  }

  const page = resolution.resource;

  const ogUrl = new URL(`${siteConfig.site_domain}/api/og`);
  ogUrl.searchParams.append("title", page.title.rendered);
  // Strip HTML tags for description and limit length
  const description = page.excerpt?.rendered
    ? page.excerpt.rendered.replace(/<[^>]*>/g, "").trim()
    : page.content.rendered
        .replace(/<[^>]*>/g, "")
        .trim()
        .slice(0, 200) + "...";
  ogUrl.searchParams.append("description", description);

  const localePath = withLocalePath(locale, `/pages/${page.slug}`);
  const absoluteUrl = `${siteConfig.site_domain}${localePath}`;
  const languageAlternates = Object.fromEntries(
    Object.entries(resolution.alternates).filter(
      ([, value]) => Boolean(value)
    )
  ) as Record<string, string>;

  return {
    title: page.title.rendered,
    description: description,
    alternates: {
      canonical: absoluteUrl,
      languages: languageAlternates,
    },
    openGraph: {
      title: page.title.rendered,
      description: description,
      type: "article",
      url: absoluteUrl,
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: page.title.rendered,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title.rendered,
      description: description,
      images: [ogUrl.toString()],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslator(locale);
  const resolution = await resolvePolylangResource({
    slug,
    locale,
    fetchBySlug: getPageBySlug,
    fetchById: getPageById,
    buildPath: (resolvedSlug) => `/pages/${resolvedSlug}`,
  });

  if (!resolution) {
    notFound();
  }

  if (resolution.redirectPath) {
    redirect(resolution.redirectPath);
  }

  const { resource: page, alternates, translationMissing, contentLocale } =
    resolution;
  const sourceLocale = contentLocale ?? locale;
  const fallbackDescription = t("languageSwitcher.fallback.description", {
    sourceLocale: t(`languageSwitcher.locale.${sourceLocale}`),
    targetLocale: t(`languageSwitcher.locale.${locale}`),
  });

  return (
    <>
      <LanguageAlternatesScript alternates={alternates} activeLocale={locale} />
      <Section>
        <Container>
          {translationMissing && (
            <TranslationFallback
              title={t("languageSwitcher.fallback.title")}
              description={fallbackDescription}
              className="mb-6"
            />
          )}
          <Prose>
            <h2>{page.title.rendered}</h2>
            <div dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
          </Prose>
        </Container>
      </Section>
    </>
  );
}

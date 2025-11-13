import {
  getPostBySlug,
  getPostById,
  getFeaturedMediaById,
  getAuthorById,
  getCategoryById,
  getAllPostSlugs,
} from "@/lib/wordpress";

import { Section, Container, Article, Prose } from "@/components/craft";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/site.config";
import { getTranslator } from "@/lib/i18n";

import { locales, Locale, withLocalePath } from "@/i18n/config";
import { formatDate } from "@/lib/format";
import { LanguageAlternatesScript } from "@/components/language/language-alternates-script";
import { TranslationFallback } from "@/components/language/translation-fallback";
import { resolvePolylangResource } from "@/lib/polylang";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Balancer from "react-wrap-balancer";

import type { Metadata } from "next";

export async function generateStaticParams() {
  const params = await Promise.all(
    locales.map(async (locale) => {
      const slugs = await getAllPostSlugs(locale);
      return slugs.map(({ slug }) => ({
        locale,
        slug,
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
    fetchBySlug: getPostBySlug,
    fetchById: getPostById,
    buildPath: (resolvedSlug) => `/posts/${resolvedSlug}`,
  });

  if (!resolution) {
    return {};
  }

  const post = resolution.resource;

  const ogUrl = new URL(`${siteConfig.site_domain}/api/og`);
  ogUrl.searchParams.append("title", post.title.rendered);
  // Strip HTML tags for description
  const description = post.excerpt.rendered.replace(/<[^>]*>/g, "").trim();
  ogUrl.searchParams.append("description", description);

  const localePath = withLocalePath(locale, `/posts/${post.slug}`);
  const absoluteUrl = `${siteConfig.site_domain}${localePath}`;
  const languageAlternates = Object.fromEntries(
    Object.entries(resolution.alternates).filter(
      ([, value]) => Boolean(value)
    )
  ) as Record<string, string>;

  return {
    title: post.title.rendered,
    description: description,
    alternates: {
      canonical: absoluteUrl,
      languages: languageAlternates,
    },
    openGraph: {
      title: post.title.rendered,
      description: description,
      type: "article",
      url: absoluteUrl,
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: post.title.rendered,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title.rendered,
      description: description,
      images: [ogUrl.toString()],
      site: siteConfig.site_domain,
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
    fetchBySlug: getPostBySlug,
    fetchById: getPostById,
    buildPath: (resolvedSlug) => `/posts/${resolvedSlug}`,
  });

  if (!resolution) {
    notFound();
  }

  if (resolution.redirectPath) {
    redirect(resolution.redirectPath);
  }

  const { resource: post, alternates, translationMissing, contentLocale } =
    resolution;

  const showFallback = translationMissing;
  const sourceLocale = contentLocale ?? locale;
  const fallbackDescription = t("languageSwitcher.fallback.description", {
    sourceLocale: t(`languageSwitcher.locale.${sourceLocale}`),
    targetLocale: t(`languageSwitcher.locale.${locale}`),
  });
  const featuredMedia = post.featured_media
    ? await getFeaturedMediaById(post.featured_media, locale)
    : null;
  const author = await getAuthorById(post.author, locale);
  const date = formatDate(post.date, locale);
  const category = await getCategoryById(post.categories[0], locale);

  return (
    <>
      <LanguageAlternatesScript alternates={alternates} activeLocale={locale} />
      <Section>
      <Container>
        {showFallback && (
          <TranslationFallback
            title={t("languageSwitcher.fallback.title")}
            description={fallbackDescription}
            className="mb-6"
          />
        )}
        <Prose>
          <h1>
            <Balancer>
              <span
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              ></span>
            </Balancer>
          </h1>
          <div className="flex justify-between items-center gap-4 text-sm mb-4">
            <h5>
              {t("posts.detail.publishedPrefix", { date })}{" "}
              {author.name && (
                <Link href={withLocalePath(locale, `/posts/?author=${author.id}`)}>
                  {author.name}
                </Link>
              )}
            </h5>

            <Link
              href={withLocalePath(locale, `/posts/?category=${category.id}`)}
              className={cn(
                badgeVariants({ variant: "outline" }),
                "!no-underline"
              )}
            >
              {category.name}
            </Link>
          </div>
          {featuredMedia?.source_url && (
            <div className="h-96 my-12 md:h-[500px] overflow-hidden flex items-center justify-center border rounded-lg bg-accent/25">
              {/* eslint-disable-next-line */}
              <img
                className="w-full h-full object-cover"
                src={featuredMedia.source_url}
                alt={post.title.rendered}
              />
            </div>
          )}
        </Prose>

        <Article dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
      </Container>
      </Section>
    </>
  );
}

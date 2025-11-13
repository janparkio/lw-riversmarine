import { MetadataRoute } from "next";

import {
  getAllPosts,
  getAllPages,
  getAllVessels,
} from "@/lib/wordpress";
import { siteConfig } from "@/site.config";
import { locales, withLocalePath } from "@/i18n/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const localeData = await Promise.all(
    locales.map(async (locale) => {
      const [posts, pages, vessels] = await Promise.all([
        getAllPosts(undefined, locale),
        getAllPages(locale),
        getAllVessels(undefined, locale),
      ]);

      return { locale, posts, pages, vessels };
    })
  );

  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = locales.flatMap((locale) => [
    {
      url: `${siteConfig.site_domain}${withLocalePath(locale, "/")}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 1,
    },
    {
      url: `${siteConfig.site_domain}${withLocalePath(locale, "/posts")}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${siteConfig.site_domain}${withLocalePath(locale, "/pages")}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${siteConfig.site_domain}${withLocalePath(locale, "/posts/authors")}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${siteConfig.site_domain}${withLocalePath(locale, "/posts/categories")}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${siteConfig.site_domain}${withLocalePath(locale, "/posts/tags")}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${siteConfig.site_domain}${withLocalePath(locale, "/vessel")}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${siteConfig.site_domain}${withLocalePath(locale, "/privacy-policy")}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
  ]);

  const dynamicUrls: MetadataRoute.Sitemap = localeData.flatMap(
    ({ locale, posts, pages, vessels }) => [
      ...posts.map((post) => ({
        url: `${siteConfig.site_domain}${withLocalePath(
          locale,
          `/posts/${post.slug}`
        )}`,
        lastModified: new Date(post.modified ?? post.date),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...pages.map((page) => ({
        url: `${siteConfig.site_domain}${withLocalePath(
          locale,
          `/pages/${page.slug}`
        )}`,
        lastModified: new Date(page.modified ?? page.date),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
      ...vessels.map((vessel) => ({
        url: `${siteConfig.site_domain}${withLocalePath(
          locale,
          `/vessel/${vessel.slug}`
        )}`,
        lastModified: new Date(vessel.modified ?? vessel.date),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ]
  );

  return [...staticUrls, ...dynamicUrls];
}

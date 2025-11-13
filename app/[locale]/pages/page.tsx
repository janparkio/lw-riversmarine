import { getAllPages } from "@/lib/wordpress";
import { Section, Container, Prose } from "@/components/craft";
import { Metadata } from "next";
import BackButton from "@/components/back";
import Link from "next/link";
import { Locale, withLocalePath } from "@/i18n/config";
import { getTranslator } from "@/lib/i18n";
import { LanguageAlternatesScript } from "@/components/language/language-alternates-script";
import { buildStaticAlternates } from "@/lib/polylang";

export const metadata: Metadata = {
  title: "All Pages",
  description: "Browse all pages of our blog posts",
  alternates: {
    canonical: "/posts/pages",
  },
};

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslator(locale);
  const pages = await getAllPages(locale);
  const alternates = buildStaticAlternates((entryLocale) =>
    withLocalePath(entryLocale, "/pages")
  );

  return (
    <>
      <LanguageAlternatesScript alternates={alternates} activeLocale={locale} />
      <Section>
        <Container className="space-y-6">
        <Prose className="mb-8">
          <h2>{t("pages.list.heading")}</h2>
          <ul className="grid">
            {pages.map((page: any) => (
              <li key={page.id}>
                <Link href={withLocalePath(locale, `/pages/${page.slug}`)}>
                  {page.title.rendered}
                </Link>
              </li>
            ))}
          </ul>
        </Prose>
        <BackButton label={t("backButton")} />
        </Container>
      </Section>
    </>
  );
}

import { getAllCategories } from "@/lib/wordpress";
import { Section, Container, Prose } from "@/components/craft";
import { Metadata } from "next";
import BackButton from "@/components/back";
import Link from "next/link";
import { Locale, withLocalePath } from "@/i18n/config";
import { getTranslator } from "@/lib/i18n";
import { LanguageAlternatesScript } from "@/components/language/language-alternates-script";
import { buildStaticAlternates } from "@/lib/polylang";

export const metadata: Metadata = {
  title: "All Categories",
  description: "Browse all categories of our blog posts",
  alternates: {
    canonical: "/posts/categories",
  },
};

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslator(locale);
  const categories = await getAllCategories(locale);
  const alternates = buildStaticAlternates((entryLocale) =>
    withLocalePath(entryLocale, "/posts/categories")
  );

  return (
    <>
      <LanguageAlternatesScript alternates={alternates} activeLocale={locale} />
      <Section>
        <Container className="space-y-6">
        <Prose className="mb-8">
          <h2>{t("posts.categories.heading")}</h2>
          <ul className="grid">
            {categories.map((category: any) => (
              <li key={category.id}>
                <Link
                  href={withLocalePath(locale, `/posts/?category=${category.id}`)}
                >
                  {category.name}
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

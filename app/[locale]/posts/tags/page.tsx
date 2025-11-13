import { getAllTags } from "@/lib/wordpress";
import { Section, Container, Prose } from "@/components/craft";
import { Metadata } from "next";
import BackButton from "@/components/back";
import Link from "next/link";
import { Locale, withLocalePath } from "@/i18n/config";
import { getTranslator } from "@/lib/i18n";
import { LanguageAlternatesScript } from "@/components/language/language-alternates-script";
import { buildStaticAlternates } from "@/lib/polylang";

export const metadata: Metadata = {
  title: "All Tags",
  description: "Browse all tags of our blog posts",
  alternates: {
    canonical: "/posts/tags",
  },
};

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslator(locale);
  const tags = await getAllTags(locale);
  const alternates = buildStaticAlternates((entryLocale) =>
    withLocalePath(entryLocale, "/posts/tags")
  );

  return (
    <>
      <LanguageAlternatesScript alternates={alternates} activeLocale={locale} />
      <Section>
        <Container className="space-y-6">
        <Prose className="mb-8">
          <h2>{t("posts.tags.heading")}</h2>
          <ul className="grid">
            {tags.map((tag: any) => (
              <li key={tag.id}>
                <Link href={withLocalePath(locale, `/posts/?tag=${tag.id}`)}>
                  {tag.name}
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

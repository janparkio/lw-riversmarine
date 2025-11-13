import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Balancer from "react-wrap-balancer";

import { Section, Container } from "@/components/craft";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { DynamicBody } from "@/components/dynamic-body";
import { Analytics } from "@vercel/analytics/next";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";

import { isLocale, Locale, locales, withLocalePath } from "@/i18n/config";
import { getTranslator, Translator } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language/language-switcher";

export const metadata: Metadata = {
  title: "Rivers Marine",
  description: "Rivers Marine",
  metadataBase: new URL(siteConfig.site_domain),
  alternates: {
    canonical: "/",
  },
};

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : null;

  if (!locale) {
    notFound();
  }

  const t = await getTranslator(locale);

  return (
    <>
      <DynamicBody />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Nav locale={locale} t={t} />
        {children}
        <Footer locale={locale} t={t} />
      </ThemeProvider>
      <Analytics />
    </>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const Nav = ({
  className,
  children,
  id,
  locale,
  t,
}: NavProps & { locale: Locale; t: Translator }) => {
  return (
    <nav
      className={cn("sticky z-50 top-0 bg-background/20 backdrop-blur-sm", "border-b", className)}
      id={id}
    >
      <div
        id="nav-container"
        className="max-w-7xl mx-auto py-4 px-6 sm:px-8 flex justify-between items-center"
      >
        <Link
          className="hover:opacity-75 transition-all flex gap-4 items-center"
          href={withLocalePath(locale, "/")}
        >
          <h2 className="font-bold text-xl">{t("site.name")}</h2>
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher
            currentLocale={locale}
            label={t("languageSwitcher.label")}
            unavailableLabel={t("languageSwitcher.unavailable")}
          />
          {children}
        </div>
      </div>
    </nav>
  );
};

const Footer = ({ locale, t }: { locale: Locale; t: Translator }) => {
  return (
    <footer>
      <Section>
        <Container className="grid md:grid-cols-[1.5fr_0.5fr_0.5fr] gap-12">
          <div className="flex flex-col gap-6 not-prose">
            <Link href={withLocalePath(locale, "/")}>
              <h3 className="sr-only">{siteConfig.site_name}</h3>
            </Link>
            <p>
              <Balancer>{t("site.description")}</Balancer>
            </p>
          </div>
        </Container>
        <Container className="border-t not-prose flex flex-col md:flex-row md:gap-2 gap-6 justify-between md:items-end">
          <div className="text-muted-foreground">
            &copy; {new Date().getFullYear()} Rivers Marine LLC. All rights reserved.{" "}
            <br className="block" />
            St. Louis, MO, USA. Asunción, Paraguay.
            <br className="block" />
            <Link
              href={withLocalePath(locale, "/privacy-policy")}
              className="pt-2 md:pt-4 hover:underline underline-offset-4 pointer-cursor"
            >
              {t("footer.privacy")}
            </Link>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ThemeToggle />
            <p className="text-muted-foreground">
              {t("footer.developedBy")}{" "}
              <a
                href="https://leadwise.pro"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline underline-offset-4 pointer-cursor"
              >
                LeadWise
              </a>
            </p>
          </div>
        </Container>
      </Section>
    </footer>
  );
};

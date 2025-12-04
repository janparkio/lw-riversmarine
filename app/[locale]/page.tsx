// Craft Imports
import { Section, Container } from "@/components/craft";
import { Button } from "@/components/ui/button";


// Next.js Imports
import Link from "next/link";

import { Locale, withLocalePath } from "@/i18n/config";
import { getTranslator, Translator } from "@/lib/i18n";
import { LanguageAlternatesScript } from "@/components/language/language-alternates-script";
import { buildStaticAlternates } from "@/lib/polylang";

// Config
import { siteConfig } from "@/site.config";
import { Reveal } from "@/components/ui/reveal";


// This page is using the craft.tsx component and design system
export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslator(locale);
  const alternates = buildStaticAlternates((entryLocale) =>
    withLocalePath(entryLocale, "/")
  );
  return (
    <>
      <LanguageAlternatesScript alternates={alternates} activeLocale={locale} />
      <Section>
        <Container className="overflow-hidden md:overflow-visible">
          <Hero t={t} />
          <Feature locale={locale} t={t} />
          <About t={t} />
        </Container>
      </Section>
    </>
  );
}

const Hero = ({ t }: { t: Translator }) => {
  return (
    <main>
      <section>
        <div className="mx-auto">
          <div className="mx-auto lg:mx-0 text-pretty">
            {/* <Reveal as="span" className="inline-flex items-center rounded-full bg-accent/50 text-accent-foreground px-2 py-0.5 text-base font-medium ring-1 ring-accent-foreground/10">
              {t("home.hero.badge")}
            </Reveal> */}
            <Reveal as="h2" className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t("home.hero.title")}
            </Reveal>
            <Reveal as="p" className="mt-4 text-xl font-medium text-pretty text-muted-foreground sm:text-3xl">
              {t("home.hero.subtitle")}
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
};

const Feature = ({ locale, t }: { locale: Locale; t: Translator }) => {
  const cards = [
    {
      variant: "stat" as const,
      stat: "25+",
      label: t("home.features.statLabel"),
    },
    {
      heading: t("home.features.card.specialized.heading"),
      lines: [t("home.features.card.specialized.line1")],
    },
    {
      heading: t("home.features.card.supporting.heading"),
      lines: [
        t("home.features.card.supporting.line1"),
        t("home.features.card.supporting.line2"),
      ],
    },
  ];
  return (
    <div className="py-16 lg:py-0">
      <div className="mx-auto">
        <div className="relative mx-auto grid grid-cols-1 gap-x-8 gap-y-12 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-5 lg:items-center justify-between">
          <div className="lg:pt-4 md:col-span-4 lg:col-span-3">
            <div className="lg:max-w-2xl">
              <Reveal as="p" className="mt-2 text-pretty font-bold tracking-tight text-xl sm:text-2xl">
                {t("home.features.heading")}
              </Reveal>
              <Reveal as="p" className="mt-2 text-lg/8 text-muted-foreground">
                {t("home.features.subheading")}
              </Reveal>
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-6">
                {cards.map((feature, index) => (
                  <Reveal
                    as="div"
                    key={index}
                    delay={200 + index * 100}
                    className="relative p-8 sm:p-6 lg:p-10 shadow-sm ring-1 ring-muted-foreground/10 bg-card/50"
                  >
                    {feature.variant === 'stat' ? (
                      <div>
                        <div className="text-4xl text-pretty sm:text-5xl font-bold leading-none text-secondary">
                          {feature.stat}
                        </div>
                        <p className="mt-3 text-base text-base">
                          {feature.label}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-2xl text-pretty sm:text-xl font-bold text-secondary">
                          {feature.heading}
                        </p>
                        <div className="mt-3 space-y-1 text-base">
                          {feature.lines?.map((line: string, i: number) => (
                            <p key={i} className="text-base">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
          <div className="relative -mt-48 md:col-span-1 lg:-mt-64 lg:-ml-32 xl:-ml-56 group">
            <div className="relative transition-transform duration-500 ease-out hover:scale-105 drop-shadow-2xl">

              {/* Bottom water wave - behind the boat */}
              <Reveal
                as="img"
                delay={500}
                src="/img/riversmarine-controlled-river-waves-bottom-1.png"
                alt=""
                width={2432}
                height={1442}
                className="absolute inset-0 w-[52rem] max-w-none lg:w-[96rem] dark:invert opacity-100 pointer-events-none"
                style={{ zIndex: 1 }}
              />

              {/* Towboat - middle layer with water-bob animation */}
              <Reveal
                as="img"
                delay={900}
                alt="Towboat Hopper Barge Tug"
                src="/img/riversmarine-controlled-river-waves-towboat-1.png"
                width={2432}
                height={1442}
                className="w-[52rem] max-w-none lg:w-[96rem] relative pointer-events-none"
                style={{ zIndex: 2 }}
              />

              {/* Front water wave - in front of the boat */}
              <Reveal
                as="img"
                delay={500}
                src="/img/riversmarine-controlled-river-waves-front-1.png"
                alt=""
                width={2432}
                height={1442}
                className="absolute inset-0 w-[52rem] max-w-none lg:w-[96rem] dark:invert opacity-100 pointer-events-none"
                style={{ zIndex: 3 }}
              />

            </div>
          </div>
        </div>
        <Reveal delay={700} className="inline-block">
          <Button className="mt-4 pointer-cursor min-w-[200px] py-4 px-6" asChild>
            <Link
              className="hover:opacity-75 transition-all text-xl"
              href={`mailto:${siteConfig.site_email}?subject=Inquiry%20from%20Rivers%20Marine%20Website&body=Hello%20Rivers%20Marine%20Team%2C%0D%0A%0D%0AMy%20name%20is%20%5BYour%20Name%5D.%20I%20am%20interested%20in%20learning%20more%20about%20your%20towboat%20and%20barge%20brokerage%20services.%20Could%20you%20please%20provide%20me%20with%20additional%20information%20regarding%20your%20current%20listings%2C%20brokerage%20process%2C%20and%20how%20your%20team%20can%20assist%20with%20my%20marine%20transportation%20needs%3F%0D%0A%0D%0AThank%20you%20for%20your%20time%20and%20assistance.%0D%0A%0D%0ABest%20regards%2C%0D%0A%5BYour%20Name%5D`}
            >
              {t("home.cta.email")}
            </Link>
          </Button>
        </Reveal>
      </div>
    </div >
  );
};

const About = ({ t }: { t: Translator }) => {
  const highlight = t("home.about.highlight");
  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto">
        <div className="flex items-start gap-6">
          <Reveal as="img"
            src="/img/seanpatric-image.jpg"
            alt="Sean P Smith near a towboat"
            width={96}
            height={96}
            delay={500}
            className="size-24 lg:size-28 object-cover shadow-sm ring-1 ring-muted-foreground/10"
          />
          <Reveal as="p" delay={600} className="text-base text-pretty sm:text-lg text-muted-foreground max-w-lg">
            {t("home.about.body.prefix")}
            <span className="ml-1 font-bold italic text-foreground">{highlight}</span>
            {t("home.about.body.suffix")}
          </Reveal>
        </div>
      </div>
    </section>
  );
};

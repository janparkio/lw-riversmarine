// Craft Imports
import { Section, Container, Prose } from "@/components/craft";
import Balancer from "react-wrap-balancer";
import { Button } from "@/components/ui/button";


// Next.js Imports
import Link from "next/link";

// Icons
import { File, Pen, Tag, Diamond, User, Folder } from "lucide-react";
import { WordPressIcon } from "@/components/icons/wordpress";
import { NextJsIcon } from "@/components/icons/nextjs";

// Config
import { siteConfig } from "@/site.config";
import { Reveal } from "@/components/ui/reveal";


// This page is using the craft.tsx component and design system
export default function Home() {
  return (
    <Section>
      <Container>
        <Hero />
        <Feature />
        <About />
      </Container>
    </Section>
  );
}

const Hero = () => {
  return (
    <main>
      <section>
        <div className="mx-auto">
          <div className="mx-auto lg:mx-0 text-pretty">
            <Reveal as="span" className="inline-flex items-center rounded-full bg-accent/50 text-accent-foreground px-2 py-0.5 text-base font-medium ring-1 ring-accent-foreground/10">
              Coming soon
            </Reveal>
            <Reveal as="h2" className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Towboat & Barge Brokerage You Can Rely On
            </Reveal>
            <Reveal as="p" className="mt-4 text-xl font-medium text-pretty text-muted-foreground sm:text-3xl">
              Supporting waterways in the US and South America
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
};

const features = [
  {
    variant: 'stat',
    stat: '25+',
    label: 'years experience',
  },
  {
    heading: 'Specialized',
    lines: ['in the US and South America'],
  },
  {
    heading: 'Supporting',
    lines: ['towboat owners', 'and operators'],
  },
]

const Feature = () => {
  return (
    <div className="py-16 lg:py-0">
      <div className="mx-auto">
        <div className="relative mx-auto grid grid-cols-1 gap-x-8 gap-y-12 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-5 lg:items-center justify-between">
          <div className="lg:pt-4 md:col-span-4 lg:col-span-3">
            <div className="lg:max-w-2xl">
              <Reveal as="p" className="mt-2 text-pretty font-bold tracking-tight text-xl sm:text-2xl">
                Pushing Forward
              </Reveal>
              <Reveal as="p" className="mt-2 text-lg/8 text-muted-foreground">
                We have supported the economy since 2000
              </Reveal>
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-6">
                {features.map((feature, index) => (
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
              Contact Us - Email
            </Link>
          </Button>
        </Reveal>
      </div>
    </div >
  );
};

const About = () => {
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
            With over 25 years working with US and South American waterways,
            <span className="ml-1 font-bold italic text-foreground">Sean P Smith</span>
            {" "}provides dependable brokerage services for towboats and barges.
          </Reveal>
        </div>
      </div>
    </section>
  );
};

// This is just some example TSX
const ToDelete = () => {
  return (
    <main className="space-y-6">
      <Prose>
        <h1>
          <Balancer>Headless WordPress built with the Next.js</Balancer>
        </h1>

        <p>
          This is <a href="https://github.com/9d8dev/next-wp">next-wp</a>,
          created as a way to build WordPress sites with Next.js at rapid speed.
          This starter is designed with{" "}
          <a href="https://ui.shadcn.com">shadcn/ui</a>,{" "}
          <a href="https://craft-ds.com">craft-ds</a>, and Tailwind CSS. Use{" "}
          <a href="https://components.work">brijr/components</a> to build your
          site with prebuilt components. The data fetching and typesafety is
          handled in <code>lib/wordpress.ts</code> and{" "}
          <code>lib/wordpress.d.ts</code>.
        </p>
      </Prose>

      <div className="flex justify-between items-center gap-4">
        {/* Vercel Clone Starter */}
        <div className="flex items-center gap-3">
          <a
            className="h-auto block"
            href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F9d8dev%2Fnext-wp&env=WORDPRESS_URL,WORDPRESS_HOSTNAME&envDescription=Add%20WordPress%20URL%20with%20Rest%20API%20enabled%20(ie.%20https%3A%2F%2Fwp.example.com)%20abd%20the%20hostname%20for%20Image%20rendering%20in%20Next%20JS%20(ie.%20wp.example.com)&project-name=next-wp&repository-name=next-wp&demo-title=Next%20JS%20and%20WordPress%20Starter&demo-url=https%3A%2F%2Fwp.9d8.dev"
          >
            {/* eslint-disable-next-line */}
            <img
              className="not-prose my-4"
              src="https://vercel.com/button"
              alt="Deploy with Vercel"
              width={105}
              height={32.62}
            />
          </a>
          <p className="!text-sm sr-only sm:not-sr-only text-muted-foreground">
            Deploy with Vercel in seconds.
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <WordPressIcon className="text-foreground" width={32} height={32} />
          <NextJsIcon className="text-foreground" width={32} height={32} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <Link
          className="border h-48 bg-accent/50 rounded-lg p-4 flex flex-col justify-between hover:scale-[1.02] transition-all"
          href="/posts"
        >
          <Pen size={32} />
          <span>
            Posts{" "}
            <span className="block text-sm text-muted-foreground">
              All posts from your WordPress
            </span>
          </span>
        </Link>
        <Link
          className="border h-48 bg-accent/50 rounded-lg p-4 flex flex-col justify-between hover:scale-[1.02] transition-all"
          href="/pages"
        >
          <File size={32} />
          <span>
            Pages{" "}
            <span className="block text-sm text-muted-foreground">
              Custom pages from your WordPress
            </span>
          </span>
        </Link>
        <Link
          className="border h-48 bg-accent/50 rounded-lg p-4 flex flex-col justify-between hover:scale-[1.02] transition-all"
          href="/posts/authors"
        >
          <User size={32} />
          <span>
            Authors{" "}
            <span className="block text-sm text-muted-foreground">
              List of the authors from your WordPress
            </span>
          </span>
        </Link>
        <Link
          className="border h-48 bg-accent/50 rounded-lg p-4 flex flex-col justify-between hover:scale-[1.02] transition-all"
          href="/posts/tags"
        >
          <Tag size={32} />
          <span>
            Tags{" "}
            <span className="block text-sm text-muted-foreground">
              Content by tags from your WordPress
            </span>
          </span>
        </Link>
        <Link
          className="border h-48 bg-accent/50 rounded-lg p-4 flex flex-col justify-between hover:scale-[1.02] transition-all"
          href="/posts/categories"
        >
          <Diamond size={32} />
          <span>
            Categories{" "}
            <span className="block text-sm text-muted-foreground">
              Categories from your WordPress
            </span>
          </span>
        </Link>
        <a
          className="border h-48 bg-accent/50 rounded-lg p-4 flex flex-col justify-between hover:scale-[1.02] transition-all"
          href="https://github.com/9d8dev/next-wp/blob/main/README.md"
        >
          <Folder size={32} />
          <span>
            Documentation{" "}
            <span className="block text-sm text-muted-foreground">
              How to use `next-wp`
            </span>
          </span>
        </a>
      </div>
    </main>
  );
};

// Craft Imports
import { Section, Container, Prose } from "@/components/craft";
import Balancer from "react-wrap-balancer";

// Next.js Imports
import Link from "next/link";

// Icons
import { File, Pen, Tag, Diamond, User, Folder } from "lucide-react";
import { WordPressIcon } from "@/components/icons/wordpress";
import { NextJsIcon } from "@/components/icons/nextjs";

//


// This page is using the craft.tsx component and design system
export default function Home() {
  return (
    <Section>
      <Container>
        <Hero />
        <Feature />
      </Container>
    </Section>
  );
}

const Hero = () => {
  return (
    <main>
      <section>
        <div className="mx-auto">
          <div className="mx-auto lg:mx-0">
            <h2 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Towboat & Barge Brokerage You Can Rely On
            </h2>
            <p className="mt-4 text-xl font-medium text-pretty text-muted-foreground sm:text-3xl">
              Uniting waterways in the US and South America
            </p>
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
    lines: ['in the US', 'and South America'],
  },
  {
    heading: 'Supporting',
    lines: ['towboat owners', 'and operators'],
  },
]

const Feature = () => {
  return (
    <div className="py-12 md:py-24">
      <div className="mx-auto">
        <div className="relative mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-2xl">
              <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
                Pushing Forward
              </p>
              <p className="mt-6 text-lg/8 text-gray-700 dark:text-gray-300">
                We have supported the economy since 2000
              </p>
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="relative rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-900/10 dark:bg-zinc-900 dark:ring-white/10"
                  >
                    {feature.variant === 'stat' ? (
                      <div>
                        <div className="text-5xl font-semibold leading-none text-[#b68a40]">
                          {feature.stat}
                        </div>
                        <p className="mt-3 text-base text-gray-700 dark:text-gray-300">
                          {feature.label}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xl font-semibold text-[#b68a40]">
                          {feature.heading}
                        </p>
                        <div className="mt-3 space-y-1 text-gray-900 dark:text-gray-100">
                          {feature.lines?.map((line: string, i: number) => (
                            <p key={i} className="text-base">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative lg:mt-0">
            <img
              alt="Towboat silhouette"
              src="/img/riversmarine-towboats-and-barges-02.png"
              width={2432}
              height={1442}
              className="w-[44rem] max-w-none sm:w-[40rem] lg:w-[48rem] lg:-ml-16 xl:-ml-24 dark:invert relative z-10"
            />
          </div>
        </div>
      </div>
    </div >
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

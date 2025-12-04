import { siteConfig } from "@/site.config";

export type MenuConfigLocation = "primary" | "content";

export type MenuConfigItem = {
  id: string;
  labelKey: string;
  href: string;
  external?: boolean;
};

export const menuFallbacks: Record<MenuConfigLocation, MenuConfigItem[]> = {
  primary: [
    // {
    //   id: "home",
    //   labelKey: "nav.links.home",
    //   href: "/",
    // },
    {
      id: "vessels",
      labelKey: "nav.links.vessels",
      href: "/vessel",
    },
    // {
    //   id: "posts",
    //   labelKey: "nav.links.posts",
    //   href: "/posts",
    // },
    // {
    //   id: "contact",
    //   labelKey: "nav.links.contact",
    //   href: `mailto:${siteConfig.site_email}`,
    //   external: true,
    // },
  ],
  content: [
    {
      id: "categories",
      labelKey: "nav.links.categories",
      href: "/posts/categories",
    },
    {
      id: "tags",
      labelKey: "nav.links.tags",
      href: "/posts/tags",
    },
    {
      id: "authors",
      labelKey: "nav.links.authors",
      href: "/posts/authors",
    },
  ],
};

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, ArrowRightSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import type { NavigationLink } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

type MobileNavProps = {
  brand: {
    href: string;
    label: string;
  };
  menus: Array<{
    label: string;
    items: NavigationLink[];
  }>;
};

export function MobileNav({ brand, menus }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const visibleMenus = menus.filter((menu) => menu.items.length);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="px-0 border w-10 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetHeader>
          <SheetTitle className="text-left">
            <MobileNavLink
              link={{
                id: "brand",
                label: brand.label,
                href: brand.href,
                external: false,
              }}
              className="flex items-center"
              onNavigate={() => setOpen(false)}
            >
              <ArrowRightSquare className="mr-2 h-4 w-4" />
              <span>{brand.label}</span>
            </MobileNavLink>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-6">
            {visibleMenus.map((menu, index) => (
              <div key={menu.label} className="flex flex-col space-y-3">
                <h3 className={cn("text-small", index === 0 ? "mt-6" : "pt-2")}>
                  {menu.label}
                </h3>
                <Separator />
                {menu.items.map((item) => (
                  <MobileNavLink
                    key={item.id}
                    link={item}
                    className="text-lg"
                    onNavigate={() => setOpen(false)}
                  >
                    {item.label}
                  </MobileNavLink>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

type MobileNavLinkProps = {
  link: NavigationLink;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
};

function MobileNavLink({
  link,
  children,
  className,
  onNavigate,
}: MobileNavLinkProps) {
  const router = useRouter();

  if (link.external) {
    return (
      <a
        href={link.href}
        target={link.target ?? "_blank"}
        rel={link.rel ?? "noreferrer"}
        className={cn("text-lg", className)}
        onClick={() => onNavigate?.()}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      target={link.target ?? undefined}
      rel={link.rel ?? undefined}
      className={cn("text-lg", className)}
      onClick={(event) => {
        event.preventDefault();
        router.push(link.href.toString());
        onNavigate?.();
      }}
    >
      {children}
    </Link>
  );
}

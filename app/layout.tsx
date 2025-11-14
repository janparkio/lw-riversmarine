import "./globals.css";

import { cookies } from "next/headers";
import localFont from "next/font/local";

import { cn } from "@/lib/utils";
import { defaultLocale, isLocale } from "@/i18n/config";

const font = localFont({
  src: [
    { path: "../public/fonts/RedHatDisplay/RedHatDisplay-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/RedHatDisplay/RedHatDisplay-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../public/fonts/RedHatDisplay/RedHatDisplay-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/RedHatDisplay/RedHatDisplay-Italic.ttf", weight: "400", style: "italic" },
    { path: "../public/fonts/RedHatDisplay/RedHatDisplay-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/RedHatDisplay/RedHatDisplay-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../public/fonts/RedHatDisplay/RedHatDisplay-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/RedHatDisplay/RedHatDisplay-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "../public/fonts/RedHatDisplay/RedHatDisplay-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/RedHatDisplay/RedHatDisplay-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../public/fonts/RedHatDisplay/RedHatDisplay-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../public/fonts/RedHatDisplay/RedHatDisplay-ExtraBoldItalic.ttf", weight: "800", style: "italic" },
    { path: "../public/fonts/RedHatDisplay/RedHatDisplay-Black.ttf", weight: "900", style: "normal" },
    { path: "../public/fonts/RedHatDisplay/RedHatDisplay-BlackItalic.ttf", weight: "900", style: "italic" },
  ],
  variable: "--font-sans",
  display: "swap",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const activeLocale = isLocale(localeCookie) ? localeCookie : defaultLocale;

  return (
    <html lang={activeLocale} suppressHydrationWarning>
      <head />
      <body className={cn("min-h-screen font-sans antialiased overflow-x-hidden", font.variable)}>
        {children}
      </body>
    </html>
  );
}

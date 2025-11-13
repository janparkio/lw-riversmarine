import "./globals.css";

import { cookies } from "next/headers";
import localFont from "next/font/local";

import { cn } from "@/lib/utils";
import { defaultLocale, isLocale } from "@/i18n/config";

const font = localFont({
  src: [
    { path: "../public/fonts/Rubik/Rubik-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/Rubik/Rubik-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../public/fonts/Rubik/Rubik-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Rubik/Rubik-Italic.ttf", weight: "400", style: "italic" },
    { path: "../public/fonts/Rubik/Rubik-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/Rubik/Rubik-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../public/fonts/Rubik/Rubik-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/Rubik/Rubik-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "../public/fonts/Rubik/Rubik-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/Rubik/Rubik-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../public/fonts/Rubik/Rubik-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../public/fonts/Rubik/Rubik-ExtraBoldItalic.ttf", weight: "800", style: "italic" },
    { path: "../public/fonts/Rubik/Rubik-Black.ttf", weight: "900", style: "normal" },
    { path: "../public/fonts/Rubik/Rubik-BlackItalic.ttf", weight: "900", style: "italic" },
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

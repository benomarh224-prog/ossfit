import type { Metadata } from "next";
import { Inter, Anton, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { siteOrigin } from "@/lib/site-url";
import { HERO_CAMPAIGN_IMAGE } from "@/lib/hero-media";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const anton = Anton({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const notoKufi = Noto_Kufi_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: "Coach Oussama — Personal Training & Online Coaching",
    template: "%s | Coach Oussama",
  },
  description:
    "Personal training with Coach Oussama. Explore coaching packages, follow your program and track your progress in a private dashboard.",
  keywords: [
    "Coach Oussama",
    "Coach sportif Maroc",
    "Coaching sportif en ligne Maroc",
    "Programme musculation Maroc",
    "Online fitness coach Morocco",
    "Online personal training Morocco",
    "Nutrition coach Maroc",
    "Body transformation Morocco",
  ],
  authors: [{ name: "Coach Oussama" }],
  creator: "Coach Oussama",
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "Coach Oussama — Personal Training & Online Coaching",
    description:
      "A training plan that fits your goals, practical nutrition guidance and direct coach support.",
    url: siteOrigin(),
    siteName: "Coach Oussama",
    type: "website",
    locale: "en_US",
    images: [{ url: HERO_CAMPAIGN_IMAGE, alt: "Strength training — illustrative campaign image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coach Oussama — Online Personal Trainer in Morocco",
    description:
      "Personal training and online coaching with Coach Oussama.",
    images: [HERO_CAMPAIGN_IMAGE],
  },
  alternates: {
    canonical: "/",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${anton.variable} ${notoKufi.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
          <SonnerToaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}

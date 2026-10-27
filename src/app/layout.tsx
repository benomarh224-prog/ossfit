import type { Metadata } from "next";
import { Inter, Anton, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

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
  metadataBase: new URL("https://atlas-coach.ma"),
  title: {
    default: "Atlas Coach — Online Personal Trainer in Tetouan, Morocco",
    template: "%s | Atlas Coach",
  },
  description:
    "Professional online personal training from Tetouan, available across Morocco. Personalized workout programs, nutrition guidance, and real coaching support. Transform your body, transform your life.",
  keywords: [
    "Coach sportif Tetouan",
    "Personal trainer Tetouan",
    "Coaching sportif en ligne Maroc",
    "Programme musculation Maroc",
    "Online fitness coach Morocco",
    "Online personal training Morocco",
    "Nutrition coach Maroc",
    "Body transformation Morocco",
  ],
  authors: [{ name: "Atlas Coach" }],
  creator: "Atlas Coach",
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "Atlas Coach — Online Personal Trainer in Tetouan, Morocco",
    description:
      "Professional online personal training from Tetouan, available across Morocco. Personalized workouts, nutrition guidance, and real coaching support.",
    url: "https://atlas-coach.ma",
    siteName: "Atlas Coach",
    type: "website",
    locale: "en_US",
    images: [{ url: "/images/hero.jpg", width: 1440, height: 720, alt: "Atlas Coach" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas Coach — Online Personal Trainer in Morocco",
    description:
      "Professional online personal training from Tetouan, available across Morocco.",
    images: ["/images/hero.jpg"],
  },
  alternates: {
    canonical: "/",
    languages: { en: "/", fr: "/", ar: "/" },
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

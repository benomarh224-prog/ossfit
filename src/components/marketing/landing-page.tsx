"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { AuthModal } from "@/components/auth/auth-modal";
import { Hero } from "./hero";
import {
  MeetCoach,
  WhyChoose,
  Services,
  HowItWorks,
  Transformations,
  Packages,
  Testimonials,
  FAQ,
  FinalCTA,
} from "./sections";

type SiteData = {
  content: any;
  services: any[];
  packages: any[];
  testimonials: any[];
  transformations: any[];
  faqs: any[];
};

export function LandingPage({ data }: { data: SiteData }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as string | undefined;
      setAuthTab(detail === "register" ? "register" : "login");
      setAuthOpen(true);
    };
    window.addEventListener("atlas:open-auth", handler);
    return () => window.removeEventListener("atlas:open-auth", handler);
  }, []);

  const { content } = data;

  // JSON-LD structured data for SEO (Person + LocalBusiness + WebSite)
  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: content?.coachName,
        jobTitle: "Online Personal Trainer",
        address: { "@type": "PostalAddress", addressLocality: "Tetouan", addressCountry: "MA" },
        knowsAbout: ["Personal Training", "Body Transformation", "Nutrition Coaching", "Strength Training"],
      },
      {
        "@type": "LocalBusiness",
        name: content?.brandName,
        description: content?.heroSubtitle,
        address: { "@type": "PostalAddress", addressLocality: "Tetouan", addressCountry: "MA" },
        areaServed: "Morocco",
        priceRange: "MAD",
        url: "https://atlas-coach.ma",
      },
      {
        "@type": "WebSite",
        name: content?.brandName,
        url: "https://atlas-coach.ma",
        inLanguage: ["en", "fr", "ar"],
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
      <SiteHeader brandName={content?.brandName} />
      <main className="flex-1">
        <Hero content={content} />
        <MeetCoach content={content} />
        <WhyChoose />
        <Services services={data.services} />
        <HowItWorks />
        <Transformations transformations={data.transformations} />
        <Packages packages={data.packages} whatsappNumber={content?.whatsappNumber} />
        <Testimonials testimonials={data.testimonials} />
        <FAQ faqs={data.faqs} />
        <FinalCTA content={content} />
      </main>
      <SiteFooter content={content} />
      <WhatsAppFloat content={content} />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab={authTab} />
    </div>
  );
}

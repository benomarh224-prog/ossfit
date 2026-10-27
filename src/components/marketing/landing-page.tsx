"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { AuthModal } from "@/components/auth/auth-modal";
import { Hero } from "./hero";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { localizeMarketing, localizeSiteContent } from "@/lib/marketing-copy";
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

export function LandingPage({ data, siteUrl }: { data: SiteData; siteUrl: string }) {
  const { locale } = useI18n();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.packageId) sessionStorage.setItem("preferredPackageId", detail.packageId);
      setAuthTab(detail === "register" || detail?.tab === "register" ? "register" : "login");
      setAuthOpen(true);
    };
    window.addEventListener("atlas:open-auth", handler);
    return () => window.removeEventListener("atlas:open-auth", handler);
  }, []);

  const content = localizeSiteContent(data.content, locale);

  // JSON-LD structured data for SEO (Person + LocalBusiness + WebSite)
  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: content?.coachName,
        jobTitle: "Online Personal Trainer",
        areaServed: { "@type": "Country", name: "Morocco" },
        knowsAbout: ["Personal Training", "Body Transformation", "Nutrition Coaching", "Strength Training"],
      },
      {
        "@type": "Service",
        name: content?.brandName,
        description: content?.heroSubtitle,
        provider: { "@type": "Person", name: content?.coachName },
        areaServed: "Morocco",
        priceRange: "MAD",
        url: siteUrl,
      },
      {
        "@type": "WebSite",
        name: content?.brandName,
        url: siteUrl,
        inLanguage: ["en", "fr", "ar"],
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld).replace(/</g, "\\u003c") }}
      />
      <SiteHeader brandName={content?.brandName} showResults={data.transformations.length > 0} showTestimonials={data.testimonials.length > 0} />
      <main className="flex-1">
        <Hero content={content} />
        <MeetCoach content={content} />
        <WhyChoose />
        <Services services={data.services.map((item) => localizeMarketing("services", item.slug, item, locale))} />
        <HowItWorks />
        <Transformations transformations={data.transformations} />
        <Packages packages={data.packages.map((item) => localizeMarketing("packages", item.slug, item, locale))} whatsappNumber={content?.whatsappNumber} />
        <Testimonials testimonials={data.testimonials} />
        <FAQ faqs={data.faqs.map((item) => localizeMarketing("faqs", item.id, item, locale))} />
        <FinalCTA content={content} />
      </main>
      <SiteFooter content={content} showResults={data.transformations.length > 0} />
      <WhatsAppFloat content={content} />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab={authTab} />
    </div>
  );
}

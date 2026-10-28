import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSiteContent, parseJSON } from "@/lib/server-utils";
import { LandingPage } from "@/components/marketing/landing-page";
import { ClientApp } from "@/components/dashboard/client-app";
import { redirect } from "next/navigation";
import { publicSiteContent } from "@/lib/site-content";
import type { Metadata } from "next";
import { siteOrigin } from "@/lib/site-url";
import { signedInDestination } from "@/lib/login-access";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const title = `${content.brandName} — Personal Training & Online Coaching`;
  return { title: { absolute: title }, description: content.heroSubtitle,
    openGraph: { title, description: content.heroSubtitle, url: siteOrigin(), siteName: content.brandName, images: [{ url: content.heroImage || "/images/hero.jpg" }] },
    twitter: { title, description: content.heroSubtitle, images: [content.heroImage || "/images/hero.jpg"] },
  };
}

// Server-side fetch of all public marketing data (mirrors GET /api/site).
async function getPublicSiteData() {
  const [content, services, packages, testimonials, transformations, faqs] =
    await Promise.all([
      getSiteContent(),
      db.service.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
      db.package.findMany({ where: { available: true }, orderBy: { order: "asc" } }),
      db.testimonial.findMany({ where: { published: true, consent: true }, orderBy: { order: "asc" } }),
      db.transformation.findMany({ where: { published: true, consent: true }, orderBy: { order: "asc" } }),
      db.fAQ.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
    ]);

  return {
    content: {
      ...publicSiteContent(content),
      heroStats: {
        clients: content.heroStatClients,
        programs: content.heroStatPrograms,
        years: content.heroStatYears,
        success: content.heroStatSuccess,
        verified: content.statsVerified,
      },
    },
    services: services.map((s) => ({ ...s, features: parseJSON<string[]>(s.features, []) })),
    packages: packages.map((p) => ({ ...p, features: parseJSON<string[]>(p.features, []) })),
    testimonials,
    transformations,
    faqs,
  };
}

export default async function Home({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const session = await getServerSession(authOptions);
  const { view } = await searchParams;

  // Authenticated coach → admin dashboard
  if (signedInDestination(session?.user) === "/admin" && view !== "site") {
    redirect("/admin");
  }

  // Authenticated client → client dashboard (handles onboarding gate client-side)
  if (signedInDestination(session?.user) === "/" && view !== "site") {
    return <ClientApp />;
  }

  // Anonymous visitor → SSR marketing landing page (good for SEO)
  const data = await getPublicSiteData();
  return <LandingPage data={data} siteUrl={siteOrigin()} />;
}

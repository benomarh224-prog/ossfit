import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseJSON } from "@/lib/server-utils";
import { LandingPage } from "@/components/marketing/landing-page";
import { ClientApp } from "@/components/dashboard/client-app";
import { AdminApp } from "@/components/admin/admin-app";

// Server-side fetch of all public marketing data (mirrors GET /api/site).
async function getPublicSiteData() {
  const [content, services, packages, testimonials, transformations, faqs] =
    await Promise.all([
      db.siteContent.findUnique({ where: { id: "singleton" } }).then((c) => c ?? null),
      db.service.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
      db.package.findMany({ where: { available: true }, orderBy: { order: "asc" } }),
      db.testimonial.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
      db.transformation.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
      db.fAQ.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
    ]);

  return {
    content: content
      ? {
          ...content,
          heroStats: {
            clients: content.heroStatClients,
            programs: content.heroStatPrograms,
            years: content.heroStatYears,
            success: content.heroStatSuccess,
            verified: content.statsVerified,
          },
        }
      : null,
    services: services.map((s) => ({ ...s, features: parseJSON<string[]>(s.features, []) })),
    packages: packages.map((p) => ({ ...p, features: parseJSON<string[]>(p.features, []) })),
    testimonials,
    transformations,
    faqs,
  };
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Authenticated coach → admin dashboard
  if (session?.user?.role === "COACH") {
    return <AdminApp />;
  }

  // Authenticated client → client dashboard (handles onboarding gate client-side)
  if (session?.user?.role === "CLIENT") {
    return <ClientApp />;
  }

  // Anonymous visitor → SSR marketing landing page (good for SEO)
  const data = await getPublicSiteData();
  return <LandingPage data={data} />;
}

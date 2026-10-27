import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSiteContent, parseJSON } from "@/lib/server-utils";

export async function GET() {
  const content = await getSiteContent();
  const services = await db.service.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  const packages = await db.package.findMany({
    where: { available: true },
    orderBy: { order: "asc" },
  });
  const testimonials = await db.testimonial.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  const transformations = await db.transformation.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  const faqs = await db.fAQ.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({
    content: {
      ...content,
      heroStats: {
        clients: content.heroStatClients,
        programs: content.heroStatPrograms,
        years: content.heroStatYears,
        success: content.heroStatSuccess,
        verified: content.statsVerified,
      },
    },
    services: services.map((s) => ({
      ...s,
      features: parseJSON<string[]>(s.features, []),
    })),
    packages: packages.map((p) => ({
      ...p,
      features: parseJSON<string[]>(p.features, []),
    })),
    testimonials,
    transformations,
    faqs,
  });
}

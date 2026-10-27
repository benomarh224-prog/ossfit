import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://atlas-coach.ma";
  const lastModified = new Date();
  const sections = [
    "",
    "#about",
    "#services",
    "#how",
    "#packages",
    "#results",
    "#testimonials",
    "#faq",
  ];
  return sections.map((s) => ({
    url: `${base}/${s}`,
    lastModified,
    changeFrequency: s === "" ? ("weekly" as const) : ("monthly" as const),
    priority: s === "" ? 1 : 0.7,
  }));
}

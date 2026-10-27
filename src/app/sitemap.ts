import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteOrigin();
  const lastModified = new Date();
  const sections = ["", "privacy", "terms"];
  return sections.map((s) => ({
    url: `${base}/${s}`,
    lastModified,
    changeFrequency: s === "" ? ("weekly" as const) : ("monthly" as const),
    priority: s === "" ? 1 : 0.7,
  }));
}

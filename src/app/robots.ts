import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = siteOrigin();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/setup", "/admin", "/reset-password"] },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

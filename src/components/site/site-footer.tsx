"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { buildWhatsappLink } from "@/lib/client-utils";
import { marketingCopy } from "@/components/marketing/copy";

type SiteContent = {
  brandName?: string; coachCity?: string; whatsappNumber?: string; whatsappEnabled?: boolean;
  instagramUrl?: string | null; tiktokUrl?: string | null; youtubeUrl?: string | null; facebookUrl?: string | null;
};

export function SiteFooter({ content, showResults = false }: { content: SiteContent | null; showResults?: boolean }) {
  const { t, locale } = useI18n(); const c = marketingCopy[locale];
  const brand = content?.brandName || "Coach Oussama";
  const social = [{ name: "Instagram", href: content?.instagramUrl }, { name: "Facebook", href: content?.facebookUrl }, { name: "YouTube", href: content?.youtubeUrl }, { name: "TikTok", href: content?.tiktokUrl }].filter(item => item.href);
  return <footer className="marketing-footer"><div className="marketing-wrap">
    <Link href="#top" className="marketing-wordmark">{brand}</Link>
    <div className="marketing-footer-links">
      <div><p className="max-w-xs text-base leading-relaxed">{t("footer.tagline")}</p>{content?.coachCity && <p className="mt-4 text-base">{content.coachCity}</p>}</div>
      <div><h3>{t("footer.quickLinks")}</h3><ul><li><Link href="#services">{t("nav.services")}</Link></li><li><Link href="#about">{t("nav.about")}</Link></li><li><Link href="#packages">{t("nav.packages")}</Link></li>{showResults && <li><Link href="#results">{t("nav.results")}</Link></li>}<li><Link href="#faq">{t("nav.faq")}</Link></li></ul></div>
      <div><h3>{c.contact}</h3><ul>{content?.whatsappEnabled !== false && <li><a href={buildWhatsappLink(content?.whatsappNumber, c.contact)} target="_blank" rel="noreferrer">WhatsApp</a></li>}{social.map(item => <li key={item.name}><a href={item.href!} target="_blank" rel="noreferrer">{item.name}</a></li>)}</ul></div>
      <div><h3>{t("footer.legal")}</h3><ul><li><Link href="/privacy">{t("footer.privacy")}</Link></li><li><Link href="/terms">{t("footer.terms")}</Link></li></ul></div>
    </div>
    <div className="marketing-footer-bottom"><p>© {new Date().getFullYear()} {brand}. {t("footer.rights")}</p><a href="#top" className="marketing-link">{t("nav.home")}</a></div>
  </div></footer>;
}

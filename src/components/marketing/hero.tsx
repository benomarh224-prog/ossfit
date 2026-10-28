"use client";

import { ArrowRight, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { buildWhatsappLink } from "@/lib/client-utils";
import { HERO_CAMPAIGN_IMAGE, HERO_CAMPAIGN_MOBILE, heroImageSource } from "@/lib/hero-media";

type HeroStats = { clients: number; programs: number; years: number; success: number; verified: boolean };
type Content = {
  heroTitle: string; heroSubtitle: string; heroImage?: string;
  whatsappNumber?: string; whatsappEnabled?: boolean; heroStats?: HeroStats;
};
const copy = {
  en: { primary: "Choose your plan", secondary: "How it works", image: "Strength training", message: "Hello! I'm interested in your online personal training programs." },
  fr: { primary: "Choisir mon programme", secondary: "Comment ça marche", image: "Entraînement de musculation", message: "Bonjour ! Je suis intéressé(e) par vos programmes de coaching en ligne." },
  ar: { primary: "اختار البرنامج ديالك", secondary: "كيفاش كيخدم", image: "تدريب القوة", message: "مرحبا! أنا مهتم ببرامج التدريب الشخصي عبر الإنترنت." },
};

export function Hero({ content }: { content: Content }) {
  const { t, locale } = useI18n(); const c = copy[locale];
  const image = heroImageSource(content.heroImage); const campaignImage = image === HERO_CAMPAIGN_IMAGE;
  const stats = content.heroStats;
  const statItems = stats?.verified ? [
    { value: stats.clients, label: t("hero.statClients") }, { value: stats.programs, label: t("hero.statPrograms") },
    { value: stats.years, label: t("hero.statYears") }, { value: `${stats.success}%`, label: t("hero.statSuccess") },
  ] : null;
  return <section id="top" className="pt-16"><div className="marketing-wrap">
    <div className="marketing-hero">
      <div className="marketing-hero-media"><img src={image}
        srcSet={campaignImage ? `${HERO_CAMPAIGN_MOBILE} 800w, ${HERO_CAMPAIGN_IMAGE} 1536w` : undefined}
        sizes={campaignImage ? "(min-width: 1280px) 1216px, (min-width: 1024px) calc(100vw - 3rem), (min-width: 640px) 912px, 840px" : undefined}
        alt={c.image} width={1536} height={1024} fetchPriority="high" decoding="async"
        className={`absolute inset-0 h-full w-full object-cover rtl:-scale-x-100 ${campaignImage ? "object-[70%_0%]" : "object-center"}`} /></div>
      <div className="hero-campaign-scrim pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="marketing-hero-content">
        <h1 className="marketing-hero-title">{content.heroTitle}</h1>
        <p className="marketing-hero-copy">{content.heroSubtitle}</p>
        <div className="marketing-hero-actions"><a className="marketing-action" href="#packages">{c.primary}<ArrowRight className="rtl:rotate-180" aria-hidden="true" /></a><a className="marketing-link" href="#how">{c.secondary}<ArrowRight className="rtl:rotate-180" aria-hidden="true" /></a></div>
        {content.whatsappEnabled !== false && <a href={buildWhatsappLink(content.whatsappNumber, c.message)} target="_blank" rel="noreferrer" className="marketing-link mt-3 self-start"><MessageCircle className="size-4" aria-hidden="true" />{t("hero.whatsapp")}</a>}
      </div>
    </div>
    {statItems && <dl className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">{statItems.map(stat => <div key={stat.label}><dd className="text-3xl font-semibold tabular-nums">{stat.value}</dd><dt className="mt-1 text-sm">{stat.label}</dt></div>)}</dl>}
  </div></section>;
}

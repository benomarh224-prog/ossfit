"use client";

import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { buildWhatsappLink } from "@/lib/client-utils";
import { Button } from "@/components/ui/button";
import { HERO_CAMPAIGN_IMAGE, HERO_CAMPAIGN_MOBILE, heroImageSource } from "@/lib/hero-media";

type HeroStats = { clients: number; programs: number; years: number; success: number; verified: boolean };
type Content = {
  heroTitle: string; heroSubtitle: string; heroImage?: string;
  whatsappNumber?: string; whatsappEnabled?: boolean; heroStats?: HeroStats;
};
const copy = {
  en: { badge: "Personal coaching · Online", primary: "Choose your plan", secondary: "How it works", training: "Personal training", nutrition: "Nutrition guidance", progress: "Progress check-ins", image: "Strength training", message: "Hello! I'm interested in your online personal training programs." },
  fr: { badge: "Coaching personnel · En ligne", primary: "Choisir mon programme", secondary: "Comment ça marche", training: "Entraînement sur mesure", nutrition: "Repères nutritionnels", progress: "Suivi des progrès", image: "Entraînement de musculation", message: "Bonjour ! Je suis intéressé(e) par vos programmes de coaching en ligne." },
  ar: { badge: "تدريب شخصي · عبر الإنترنت", primary: "اختار البرنامج ديالك", secondary: "كيفاش كيخدم", training: "تدريب شخصي", nutrition: "توجيه غذائي", progress: "تتبع التقدم", image: "تدريب القوة", message: "مرحبا! أنا مهتم ببرامج التدريب الشخصي عبر الإنترنت." },
};

export function Hero({ content }: { content: Content }) {
  const { t, locale } = useI18n();
  const c = copy[locale];
  const stats = content.heroStats;
  const image = heroImageSource(content.heroImage);
  const campaignImage = image === HERO_CAMPAIGN_IMAGE;
  const titleWords = content.heroTitle.trim().split(/\s+/);
  const titleAccent = titleWords.pop();
  const titleLead = titleWords.join(" ");
  const wa = buildWhatsappLink(content.whatsappNumber, c.message);
  const statItems = stats?.verified ? [
    { value: stats.clients, label: t("hero.statClients") },
    { value: stats.programs, label: t("hero.statPrograms") },
    { value: stats.years, label: t("hero.statYears") },
    { value: `${stats.success}%`, label: t("hero.statSuccess") },
  ] : null;

  return <section id="top" className="relative isolate overflow-hidden pb-8 pt-20 sm:pb-12 sm:pt-24 lg:pb-16 lg:pt-28">
    <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-lime opacity-50" aria-hidden="true" />
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="hero-campaign relative isolate overflow-hidden rounded-3xl border border-white/10 shadow-[0_16px_48px_rgb(0_0_0/0.14)] sm:rounded-[2rem]">
        <img
          src={image}
          srcSet={campaignImage ? `${HERO_CAMPAIGN_MOBILE} 800w, ${HERO_CAMPAIGN_IMAGE} 1536w` : undefined}
          sizes={campaignImage ? "(min-width: 1280px) 1216px, (min-width: 1024px) calc(100vw - 3rem), (min-width: 640px) 900px, 816px" : undefined}
          alt={c.image}
          width={1536}
          height={1024}
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover rtl:-scale-x-100 ${campaignImage ? "object-[70%_0%]" : "object-center"}`}
        />
        <div className="hero-campaign-scrim pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative z-10 flex min-h-[34rem] min-w-0 flex-col justify-center px-5 py-8 sm:min-h-[36rem] sm:p-10 lg:min-h-[38rem] lg:px-14 lg:py-16">
          <div className="max-w-xl">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[11px] font-medium text-white/90 backdrop-blur-md sm:text-xs"><span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />{c.badge}</span>
            <h1 className="mt-4 break-words text-balance font-display text-[2.4rem] uppercase leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-[4.5rem]">{titleLead && `${titleLead} `}<span className="text-primary">{titleAccent}</span></h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85 sm:mt-5 sm:text-base">{content.heroSubtitle}</p>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:flex sm:flex-wrap sm:gap-3">
              <Button asChild size="lg" className="h-auto min-h-12 min-w-0 whitespace-normal rounded-xl px-3 py-3 text-[13px] has-[>svg]:px-3 sm:px-5 sm:text-sm"><a href="#packages">{c.primary}<ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" /></a></Button>
              <Button asChild size="lg" variant="outline" className="h-auto min-h-12 min-w-0 whitespace-normal rounded-xl border-white/30 bg-white/10 px-3 py-3 text-[13px] text-white shadow-none backdrop-blur-md hover:bg-white/20 hover:text-white dark:border-white/30 dark:bg-white/10 dark:hover:bg-white/20 sm:px-5 sm:text-sm"><a href="#how">{c.secondary}</a></Button>
            </div>
            {content.whatsappEnabled !== false && <a href={wa} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-xs font-medium text-white/85 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><MessageCircle className="size-4 text-primary" aria-hidden="true" />{t("hero.whatsapp")}<ArrowRight className="size-3 rtl:rotate-180" aria-hidden="true" /></a>}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/20 pt-4 text-[11px] text-white/80 sm:text-xs">
              {[c.training, c.nutrition, c.progress].map(label => <span key={label} className="inline-flex items-center gap-1.5"><Check className="size-3.5 shrink-0 text-primary" aria-hidden="true" />{label}</span>)}
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/80 to-transparent" aria-hidden="true" />
      </div>
      {statItems && <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-border/60 pt-6 sm:grid-cols-4 sm:pt-8">{statItems.map(stat => <div key={stat.label} className="border-s-2 border-primary/40 ps-3"><dd className="font-display text-2xl tabular-nums sm:text-3xl">{stat.value}</dd><dt className="mt-1 text-xs text-muted-foreground">{stat.label}</dt></div>)}</dl>}
    </div>
  </section>;
}

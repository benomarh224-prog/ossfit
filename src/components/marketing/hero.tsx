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
      <div className="grid items-center gap-5 sm:gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
        <div className="min-w-0">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-[11px] font-medium text-primary sm:text-xs"><span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />{c.badge}</span>
          <h1 className="mt-3 max-w-2xl break-words text-balance font-display text-[2.4rem] uppercase leading-[1.08] tracking-tight sm:mt-4 sm:text-6xl lg:text-[4.5rem]">{titleLead && `${titleLead} `}<span className="text-primary">{titleAccent}</span></h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base">{content.heroSubtitle}</p>
          <div className="mt-6 grid gap-2.5 sm:flex sm:flex-wrap">
            <Button asChild size="lg" className="h-auto min-h-12 whitespace-normal rounded-xl px-5 py-3 text-sm"><a href="#packages">{c.primary}<ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" /></a></Button>
            <Button asChild size="lg" variant="outline" className="h-auto min-h-12 whitespace-normal rounded-xl border-border/80 bg-card px-5 py-3 text-sm shadow-none"><a href="#how">{c.secondary}</a></Button>
          </div>
          {content.whatsappEnabled !== false && <a href={wa} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><MessageCircle className="size-4 text-primary" aria-hidden="true" />{t("hero.whatsapp")}<ArrowRight className="size-3 rtl:rotate-180" aria-hidden="true" /></a>}
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-border/60 pt-4 text-[11px] text-muted-foreground sm:text-xs">
            {[c.training, c.nutrition, c.progress].map(label => <span key={label} className="inline-flex items-center gap-1.5"><Check className="size-3.5 shrink-0 text-primary" aria-hidden="true" />{label}</span>)}
          </div>
        </div>
        <div className="relative order-first min-w-0 lg:order-last">
          <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[3rem] bg-primary/12 blur-2xl" aria-hidden="true" />
          <figure className="relative isolate overflow-hidden rounded-[1.5rem] border border-border/70 bg-[#121713] shadow-[0_16px_48px_rgb(0_0_0/0.14)] sm:rounded-[2rem]">
            <div className="relative aspect-[3/2] lg:aspect-[4/5]">
              <img
                src={image}
                srcSet={campaignImage ? `${HERO_CAMPAIGN_MOBILE} 800w, ${HERO_CAMPAIGN_IMAGE} 1536w` : undefined}
                sizes={campaignImage ? "(min-width: 1280px) 580px, (min-width: 1024px) 45vw, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)" : undefined}
                alt={c.image}
                width={1536}
                height={1024}
                fetchPriority="high"
                decoding="async"
                className={`absolute inset-0 h-full w-full object-cover ${campaignImage ? "object-[75%_50%]" : "object-center"}`}
              />
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" aria-hidden="true" />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#b5eb65]/80 to-transparent" aria-hidden="true" />
          </figure>
        </div>
      </div>
      {statItems && <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-border/60 pt-6 sm:grid-cols-4 sm:pt-8">{statItems.map(stat => <div key={stat.label} className="border-s-2 border-primary/40 ps-3"><dd className="font-display text-2xl tabular-nums sm:text-3xl">{stat.value}</dd><dt className="mt-1 text-xs text-muted-foreground">{stat.label}</dt></div>)}</dl>}
    </div>
  </section>;
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Dumbbell, MessageCircle, Salad, TrendingUp } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { buildWhatsappLink } from "@/lib/client-utils";
import { Button } from "@/components/ui/button";

type HeroStats = { clients: number; programs: number; years: number; success: number; verified: boolean };
type Content = {
  heroTitle: string; heroSubtitle: string; heroImage?: string;
  coachName?: string; coachPortrait?: string;
  whatsappNumber?: string; whatsappEnabled?: boolean; heroStats?: HeroStats;
};
const copy = {
  en: { badge: "Personal coaching · Online", primary: "Choose your plan", secondary: "How it works", training: "Personal training", nutrition: "Nutrition guidance", progress: "Progress check-ins", caption: "A plan built around you.", image: "Strength training", message: "Hello! I'm interested in your online personal training programs." },
  fr: { badge: "Coaching personnel · En ligne", primary: "Choisir mon programme", secondary: "Comment ça marche", training: "Entraînement sur mesure", nutrition: "Repères nutritionnels", progress: "Suivi des progrès", caption: "Un programme qui vous ressemble.", image: "Entraînement de musculation", message: "Bonjour ! Je suis intéressé(e) par vos programmes de coaching en ligne." },
  ar: { badge: "تدريب شخصي · عبر الإنترنت", primary: "اختار البرنامج ديالك", secondary: "كيفاش كيخدم", training: "تدريب شخصي", nutrition: "توجيه غذائي", progress: "تتبع التقدم", caption: "برنامج على قد أهدافك.", image: "تدريب القوة", message: "مرحبا! أنا مهتم ببرامج التدريب الشخصي عبر الإنترنت." },
};

export function Hero({ content }: { content: Content }) {
  const { t, locale } = useI18n();
  const c = copy[locale];
  const reduceMotion = useReducedMotion();
  const stats = content.heroStats;
  const ownPortrait = content.coachPortrait && !["/images/service-coaching.jpg", "/images/coach-portrait.jpg", "/images/gym-bg.jpg"].includes(content.coachPortrait);
  const image = ownPortrait ? content.coachPortrait : content.heroImage;
  const wa = buildWhatsappLink(content.whatsappNumber, c.message);
  const statItems = stats?.verified ? [
    { value: stats.clients, label: t("hero.statClients") },
    { value: stats.programs, label: t("hero.statPrograms") },
    { value: stats.years, label: t("hero.statYears") },
    { value: `${stats.success}%`, label: t("hero.statSuccess") },
  ] : null;

  return <section id="top" className="relative isolate overflow-hidden pb-8 pt-24 sm:pb-12 sm:pt-28 lg:pb-16 lg:pt-32">
    <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-lime opacity-35" aria-hidden="true" />
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid items-center gap-7 sm:gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="min-w-0">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-[11px] font-medium text-primary sm:text-xs"><span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />{c.badge}</span>
          <h1 className="mt-4 max-w-2xl break-words text-balance font-display text-[2.5rem] uppercase leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.25rem]">{content.heroTitle}</h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base">{content.heroSubtitle}</p>
          <div className="mt-6 grid gap-2.5 sm:flex sm:flex-wrap">
            <Button asChild size="lg" className="h-auto min-h-12 whitespace-normal rounded-xl px-5 py-3 text-sm"><a href="#packages">{c.primary}<ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" /></a></Button>
            <Button asChild size="lg" variant="outline" className="h-auto min-h-12 whitespace-normal rounded-xl border-border/80 bg-card px-5 py-3 text-sm shadow-none"><a href="#how">{c.secondary}</a></Button>
          </div>
          {content.whatsappEnabled !== false && <a href={wa} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><MessageCircle className="size-4 text-primary" aria-hidden="true" />{t("hero.whatsapp")}<ArrowRight className="size-3 rtl:rotate-180" aria-hidden="true" /></a>}
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-border/60 pt-4 text-[11px] text-muted-foreground sm:text-xs">
            {[c.training, c.nutrition, c.progress].map(label => <span key={label} className="inline-flex items-center gap-1.5"><Check className="size-3.5 shrink-0 text-primary" aria-hidden="true" />{label}</span>)}
          </div>
        </motion.div>
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} className="relative min-w-0">
          <div className="relative isolate overflow-hidden rounded-3xl border border-border/70 bg-secondary">
            {image ? <img src={image} alt={ownPortrait ? content.coachName || "Oussama" : c.image} fetchPriority="high" decoding="async" className="aspect-[16/9] w-full object-cover object-center sm:aspect-[4/3] lg:aspect-[4/5]" /> : <div className="flex aspect-[16/9] items-center justify-center bg-primary/5 sm:aspect-[4/3] lg:aspect-[4/5]"><Dumbbell className="size-24 text-primary/25" aria-hidden="true" /></div>}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-5 pb-5 pt-16 sm:px-6 sm:pb-6">
              <div className="mb-3 flex gap-2" aria-hidden="true">{[Dumbbell, Salad, TrendingUp].map((Icon, index) => <span key={index} className="flex size-8 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-md"><Icon className="size-4" /></span>)}</div>
              <p className="max-w-xs text-lg font-semibold leading-snug text-white sm:text-xl">{c.caption}</p>
            </div>
          </div>
        </motion.div>
      </div>
      {statItems && <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-border/60 pt-6 sm:grid-cols-4 sm:pt-8">{statItems.map(stat => <div key={stat.label} className="border-s-2 border-primary/40 ps-3"><dd className="font-display text-2xl tabular-nums sm:text-3xl">{stat.value}</dd><dt className="mt-1 text-xs text-muted-foreground">{stat.label}</dt></div>)}</dl>}
    </div>
  </section>;
}

"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { buildWhatsappLink } from "@/lib/client-utils";
import { Button } from "@/components/ui/button";

type HeroStats = {
  clients: number;
  programs: number;
  years: number;
  success: number;
  verified: boolean;
};

type Content = {
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  whatsappNumber?: string;
  whatsappEnabled?: boolean;
  heroStats?: HeroStats;
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any } },
};

export function Hero({ content }: { content: Content }) {
  const { t, locale } = useI18n();
  const stats = content.heroStats;
  const waMessages: Record<string, string> = {
    en: "Hello! I'm interested in your online personal training programs.",
    fr: "Bonjour ! Je suis intéressé(e) par vos programmes de coaching en ligne.",
    ar: "مرحبا! أنا مهتم ببرامج التدريب الشخصي عبر الإنترنت.",
  };
  const wa = buildWhatsappLink(content.whatsappNumber, waMessages[locale] ?? waMessages.en);

  const statItems = stats?.verified
    ? [
        { value: stats.clients, label: t("hero.statClients") },
        { value: stats.programs, label: t("hero.statPrograms") },
        { value: stats.years, label: t("hero.statYears") },
        { value: `${stats.success}%`, label: t("hero.statSuccess") },
      ]
    : null;

  return (
    <section id="top" className="relative isolate flex items-center overflow-hidden pb-10 pt-24 sm:pb-16 sm:pt-28 lg:min-h-[85svh] lg:pb-24 lg:pt-32">
      {/* Background image with overlay */}
      <div className="absolute inset-0 -z-10">
        {content.heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.heroImage}
            alt="Coach Oussama — online personal trainer"
            className="h-full w-full object-cover object-center opacity-45 dark:opacity-60 lg:opacity-100"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60 dark:via-background/85 dark:to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        <div className="absolute inset-0 bg-radial-lime opacity-70" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-3xl"
        >
          <motion.div variants={item}>
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary sm:text-xs">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {locale === "ar" ? "أسامة · تدريب شخصي عبر الإنترنت" : locale === "fr" ? "Oussama · Coaching personnel en ligne" : "Oussama · Personal coaching, online"}
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-4 text-balance font-display text-4xl font-bold uppercase leading-[1.05] tracking-tight text-foreground sm:mt-5 sm:text-6xl lg:text-7xl"
          >
            {content.heroTitle}
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-4 max-w-xl text-[15px] leading-relaxed text-foreground/70 sm:mt-6 sm:text-lg"
          >
            {content.heroSubtitle}
          </motion.p>

          <motion.div variants={item} className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
            <Button asChild size="lg" className="group min-h-12 w-full whitespace-normal bg-primary px-4 py-3 text-primary-foreground hover:bg-primary/90 sm:w-auto">
              <a href="#packages">
                {t("hero.primaryCta")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-h-12 w-full whitespace-normal border-border/60 bg-background/60 px-4 py-3 backdrop-blur-sm hover:bg-accent sm:w-auto">
              <a href="#packages">
                {t("hero.secondaryCta")}
              </a>
            </Button>
            {content.whatsappEnabled !== false && (
              <Button asChild size="lg" variant="ghost" className="min-h-11 w-full whitespace-normal px-4 py-3 text-foreground/80 hover:text-primary sm:w-auto">
                <a href={wa} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5 text-[#25D366]" />
                  {t("hero.whatsapp")}
                </a>
              </Button>
            )}
          </motion.div>

          {statItems && (
            <motion.dl
              variants={item}
              className="mt-8 grid grid-cols-2 gap-4 sm:mt-12 sm:grid-cols-4 sm:gap-6"
            >
              {statItems.map((s, i) => (
                <div key={i} className="border-l-2 border-primary/50 pl-4">
                  <dd className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                    {s.value}
                  </dd>
                  <dt className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </dt>
                </div>
              ))}
            </motion.dl>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-muted-foreground lg:flex"
      >
        <span className="text-[10px] uppercase tracking-widest">{t("hero.scroll")}</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}

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
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden pt-16">
      {/* Background image with overlay */}
      <div className="absolute inset-0 -z-10">
        {content.heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.heroImage}
            alt="Atlas Coach — online personal trainer"
            className="h-full w-full object-cover object-center"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
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
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Tetouan · Online across Morocco
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-5 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            {content.heroTitle}
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-base text-foreground/70 sm:text-lg"
          >
            {content.heroSubtitle}
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="#packages">
              <Button size="lg" className="group w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto">
                {t("hero.primaryCta")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
            <a href="#services">
              <Button size="lg" variant="outline" className="w-full border-border/60 bg-background/40 backdrop-blur-sm hover:bg-accent sm:w-auto">
                {t("hero.secondaryCta")}
              </Button>
            </a>
            {content.whatsappEnabled !== false && (
              <a href={wa} target="_blank" rel="noreferrer" className="inline-flex">
                <Button size="lg" variant="ghost" className="w-full text-foreground/80 hover:text-primary sm:w-auto">
                  <MessageCircle className="mr-2 h-5 w-5 text-[#25D366]" />
                  {t("hero.whatsapp")}
                </Button>
              </a>
            )}
          </motion.div>

          {statItems && (
            <motion.dl
              variants={item}
              className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4"
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

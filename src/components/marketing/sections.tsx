"use client";

import { motion } from "framer-motion";
import {
  Dumbbell, Flame, Salad, Video, ShieldCheck, TrendingUp, Users, Clock,
  Target, HeartPulse, CheckCircle2, Star, ArrowRight, Sparkles, MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { useI18n, formatMAD } from "@/lib/i18n/i18n-provider";
import { buildWhatsappLink } from "@/lib/client-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/* ---------- shared heading ---------- */
function SectionHeading({
  eyebrow,
  title,
  tag,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  tag?: string;
  center?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-24px" }}
      transition={{ duration: 0.6 }}
      className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}
    >
      {eyebrow && (
        <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-[10px] font-medium leading-relaxed text-primary sm:text-xs">
          <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 text-balance font-display text-[1.75rem] font-bold uppercase leading-tight tracking-tight text-foreground sm:mt-4 sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {tag && <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{tag}</p>}
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as any },
  }),
};

/* ---------- 1. Meet your coach ---------- */
export function MeetCoach({ content }: { content: any }) {
  const { t, locale } = useI18n();
  const wa = buildWhatsappLink(content.whatsappNumber, t("coach.contactWhatsapp"));
  const illustrativePortrait = ["/images/service-coaching.jpg", "/images/coach-portrait.jpg"].includes(content.coachPortrait);
  const portrait = illustrativePortrait ? "/images/gym-bg.jpg" : content.coachPortrait;

  const specs = [
    { icon: Dumbbell, label: locale === "fr" ? "Hypertrophie & Force" : locale === "ar" ? "الضخامة والقوة" : "Hypertrophy & Strength" },
    { icon: Flame, label: locale === "fr" ? "Perte de gras" : locale === "ar" ? "خسارة الدهون" : "Fat Loss" },
    { icon: Salad, label: locale === "fr" ? "Nutrition ciblée" : locale === "ar" ? "تغذية مستهدفة" : "Targeted Nutrition" },
    { icon: HeartPulse, label: locale === "fr" ? "Santé & énergie" : locale === "ar" ? "الصحة والطاقة" : "Health & Energy" },
  ];

  return (
    <section id="about" className="relative py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("sections.meetCoachTag")}
          title={t("sections.meetCoach")}
        />
        <div className="mt-7 grid items-center gap-7 sm:mt-10 lg:mt-14 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto w-full max-w-sm"
          >
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/10 blur-2xl" />
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
              {portrait ? (
                <img
                  src={portrait}
                  alt={illustrativePortrait ? "Strength training space" : content.coachName}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover object-top sm:aspect-[3/4]"
                />
              ) : (
                <div className="aspect-[4/3] w-full bg-gradient-to-br from-primary/20 to-card sm:aspect-[3/4]" />
              )}
            </div>
            <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 border border-primary/30 bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary shadow-lg">
              {content.coachCity || t("coach.city")}
            </Badge>
          </motion.div>

          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-display text-2xl font-bold uppercase text-foreground sm:text-3xl"
            >
              {content.coachName}
            </motion.p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-primary">
              {t("coach.role")}
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                  {t("coach.storyTitle")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {content.aboutStory}
                </p>
              </div>
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                  {t("coach.philosophyTitle")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {content.aboutPhilosophy}
                </p>
              </div>
            </div>

            <div className="mt-7">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                {t("coach.specializationTitle")}
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {specs.map((s, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/60 p-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <s.icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-medium text-foreground/80">{s.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <Button asChild className="min-h-11 whitespace-normal bg-primary py-3 text-primary-foreground hover:bg-primary/90">
                <a href={wa} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {t("coach.contactWhatsapp")}
                </a>
              </Button>
              <Button asChild variant="outline" className="min-h-11 whitespace-normal border-border/60 py-3">
                <a href="#packages">
                  {t("cta.explore")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 2. Why choose ---------- */
export function WhyChoose() {
  const { t, locale } = useI18n();
  const reasons = [
    { icon: Target, title: "Personalized Programming", desc: "Programs built around your body, equipment, schedule and specific goals — never generic templates." },
    { icon: TrendingUp, title: "A clear view of your progress", desc: "Check-ins, workout logs and program reviews keep your next step clear." },
    { icon: Salad, title: "Nutrition That Fits Life", desc: "Calorie and macro targets plus meal guidance adapted to Moroccan lifestyle and food culture." },
    { icon: Users, title: "Direct Coach Access", desc: "Message your coach directly through WhatsApp and your private dashboard — no call centers." },
    { icon: ShieldCheck, title: "Evidence-Based Methods", desc: "No gimmicks or dangerous protocols. Sustainable, science-backed coaching you can trust." },
    { icon: Clock, title: "Truly Online, All Morocco", desc: "From Tangier to Agadir — train wherever you are with full coaching support." },
  ].map((reason, index) => {
    const translated = {
      fr: [
        ["Un programme qui vous ressemble", "Votre niveau, vos objectifs et votre matériel définissent votre entraînement."],
        ["Des progrès visibles", "Bilans, carnet de séances et révisions pour avancer avec clarté."],
        ["Une nutrition pratique", "Des repères et habitudes alimentaires adaptés à votre quotidien."],
        ["Un échange direct", "Messagerie privée et WhatsApp pour rester en contact avec votre coach."],
        ["Une démarche réaliste", "Des objectifs clairs, une progression régulière et des ajustements réfléchis."],
        ["L'entraînement où vous êtes", "À la maison ou en salle, votre programme vous accompagne."],
      ],
      ar: [
        ["برنامج مبني عليك", "أهدافك ومستواك ومعداتك هي أساس خطتك التدريبية."],
        ["تقدم واضح", "تقييمات وسجل للحصص ومراجعات للبرنامج توضح خطوتك القادمة."],
        ["تغذية عملية", "عادات وإرشادات غذائية تناسب حياتك اليومية."],
        ["تواصل مباشر", "رسائل خاصة وواتساب للبقاء على تواصل مع مدربك."],
        ["منهج واقعي", "أهداف واضحة وتدرج منتظم وتعديلات مدروسة."],
        ["تدرب أينما كنت", "في المنزل أو القاعة، برنامجك يرافقك."],
      ],
    };
    const text = locale === "en" ? null : translated[locale][index];
    return text ? { ...reason, title: text[0], desc: text[1] } : reason;
  });
  return (
    <section className="relative border-y border-border/40 bg-card/30 py-8 sm:py-12 lg:py-16">
      <div className="bg-grid absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("sections.whyChooseTag")} title={t("sections.whyChoose")} />
        <div className="mt-7 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:mt-14 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-24px" }}
            >
              <Card className="group h-full gap-0 border-border/50 bg-card/60 py-0 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="flex gap-3 p-4 sm:flex-col sm:gap-4 sm:p-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <r.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-bold uppercase tracking-tight sm:text-lg">{r.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. Services ---------- */
export function Services({ services }: { services: any[] }) {
  const { t } = useI18n();
  const icons: Record<string, any> = { dumbbell: Dumbbell, flame: Flame, salad: Salad, video: Video };
  return (
    <section id="services" className="py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("sections.servicesTag")} title={t("sections.services")} />
        <div className="mt-7 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:mt-14 lg:grid-cols-4">
          {services.map((s, i) => {
            const Icon = icons[s.icon] ?? Dumbbell;
            return (
              <motion.div
                key={s.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-24px" }}
              >
                <Card className="group grid h-full grid-cols-[4.5rem_1fr] gap-3 overflow-hidden border-border/50 bg-card/60 p-3 sm:flex sm:flex-col sm:gap-0 sm:p-0">
                  <div className="relative h-24 overflow-hidden rounded-lg sm:aspect-[4/3] sm:h-auto sm:rounded-none">
                    {s.image ? (
                      <img src={s.image} alt={s.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary/20 to-card" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                    <span className="absolute bottom-2 start-2 flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg sm:bottom-auto sm:start-4 sm:top-4 sm:size-10">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <CardContent className="min-w-0 p-0 sm:p-5">
                    <h3 className="font-display text-base font-bold uppercase tracking-tight sm:text-lg">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.shortDesc}</p>
                    <ul className="mt-3 space-y-1.5">
                      {s.features?.slice(0, 3).map((f: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-foreground/70">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- 4. How it works ---------- */
export function HowItWorks() {
  const { t, locale } = useI18n();
  const steps = [
    { n: "01", title: "Create your account", desc: "Register in seconds and complete your fitness assessment." },
    { n: "02", title: "Get your program", desc: "Your coach builds a personalized workout and nutrition plan after reviewing your assessment." },
    { n: "03", title: "Train & track", desc: "Follow your plan in the app, log workouts, meals and progress photos." },
    { n: "04", title: "Adjust & progress", desc: "Weekly check-ins keep your program adapting so you never plateau." },
  ].map((step, index) => {
    const translated = {
      fr: [["Créez votre compte", "Inscrivez-vous et complétez votre bilan de départ."], ["Recevez votre programme", "Le coach étudie vos objectifs puis prépare votre entraînement et vos repères nutritionnels."], ["Entraînez-vous et suivez", "Retrouvez vos séances et notez vos habitudes et vos progrès dans votre espace."], ["Ajustez et avancez", "Les bilans permettent d'adapter le programme à votre évolution."]],
      ar: [["أنشئ حسابك", "سجّل وأكمل تقييمك الأولي."], ["احصل على برنامجك", "يراجع المدرب أهدافك ويعد برنامج التدريب والتوجيه الغذائي."], ["تدرب وتتبع", "تابع حصصك وسجّل عاداتك وتقدمك في حسابك الخاص."], ["راجع وتقدم", "تساعد التقييمات على تكييف البرنامج مع تطورك."]],
    };
    const text = locale === "en" ? null : translated[locale][index];
    return text ? { ...step, title: text[0], desc: text[1] } : step;
  });
  return (
    <section id="how" className="border-y border-border/40 bg-card/30 py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("sections.howItWorksTag")} title={t("sections.howItWorks")} />
        <div className="relative mt-6 sm:mt-8 lg:mt-10">
          <div className="absolute left-0 top-12 hidden h-px w-full bg-gradient-to-r from-primary/40 via-primary/20 to-transparent lg:block" />
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="relative grid grid-cols-[2.75rem_1fr] gap-x-3 sm:block"
              >
                <div className="row-span-2 font-display text-3xl font-bold text-primary/50 sm:text-5xl sm:text-primary/20">{s.n}</div>
                <h3 className="font-display text-lg font-bold uppercase tracking-tight sm:mt-2">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:mt-2">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 5. Transformations gallery ---------- */
export function Transformations({ transformations }: { transformations: any[] }) {
  const { t, locale } = useI18n();
  if (!transformations?.length) return null;
  return (
    <section id="results" className="py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("sections.galleryTag")} title={t("sections.gallery")} />
        <div className="mt-6 sm:mt-8 lg:mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {transformations.map((tr, i) => (
            <motion.div
              key={tr.id}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-24px" }}
            >
              <Card className="group gap-0 overflow-hidden border-border/50 bg-card/60 py-0">
                <div className="grid grid-cols-2">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {tr.beforeImg ? (
                      <img src={tr.beforeImg} alt="Before" className="h-full w-full object-cover grayscale" />
                    ) : (
                      <div className="h-full w-full bg-card" />
                    )}
                    <span className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-0.5 text-[10px] font-bold uppercase">Before</span>
                  </div>
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {tr.afterImg ? (
                      <img src={tr.afterImg} alt="After" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-card" />
                    )}
                    <span className="absolute bottom-2 left-2 rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">After</span>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2">
                    {tr.consent && <Badge className="bg-primary/15 text-primary"><ShieldCheck className="mr-1 h-3 w-3" />{t("common.verified")}</Badge>}
                    {!tr.consent && <Badge variant="outline" className="text-muted-foreground">{t("common.demo")}</Badge>}
                  </div>
                  <h3 className="mt-2 font-display text-base font-bold uppercase tracking-tight">{tr.clientName}</h3>
                  {tr.goal && <p className="text-xs text-primary">{tr.goal}</p>}
                  {tr.duration && <p className="mt-1 text-xs text-muted-foreground">{tr.duration}</p>}
                  {tr.story && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{tr.story}</p>}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
          {locale === "ar" ? "تُنشر صور التحول بعد موافقة أصحابها فقط. النتائج تختلف حسب كل شخص." : locale === "fr" ? "Photos publiées avec le consentement des clients. Les résultats varient selon la personne." : "Shared with client consent. Individual results vary."}
        </p>
      </div>
    </section>
  );
}

/* ---------- 6. Packages ---------- */
export function Packages({ packages, whatsappNumber }: { packages: any[]; whatsappNumber?: string }) {
  const { t, locale } = useI18n();
  const authTrigger = (packageId: string) => {
    const event = new CustomEvent("atlas:open-auth", { detail: { tab: "register", packageId } });
    window.dispatchEvent(event);
  };

  return (
    <section id="packages" className="scroll-mt-20 border-y border-border/40 bg-card/30 py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("sections.packagesTag")} title={t("sections.packages")} />
        {packages.length === 0 && (
          <p role="status" className="mt-10 text-center text-muted-foreground">
            {t("sections.packagesEmpty")}
          </p>
        )}
        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 lg:mt-10 lg:grid-cols-3">
          {packages.map((p, i) => {
            const featured = p.featured;
            const waMsg = `Hello! I'm interested in the "${p.title}" package (${p.priceMAD} MAD). Can you share the next steps?`;
            const wa = buildWhatsappLink(whatsappNumber, waMsg);
            return (
              <motion.div
                key={p.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-24px" }}
                className="min-w-0"
              >
                <Card
                  className={`relative flex h-full flex-col gap-0 overflow-hidden p-0 ${
                    featured ? "border-primary/60 ring-1 ring-primary/15" : "border-border/75"
                  }`}
                >
                  <div className={`h-1 w-full ${featured ? "bg-primary" : "bg-secondary"}`} aria-hidden="true" />
                  <div className="p-5 pb-0 sm:p-6 sm:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="break-words text-lg font-semibold tracking-tight">{p.title}</h3>
                      {featured && <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground"><Star className="h-3 w-3" />{t("common.featured")}</span>}
                    </div>
                    <p className="mt-2 break-words text-xs leading-relaxed text-muted-foreground sm:text-sm lg:min-h-10">{p.tagline}</p>
                    <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1" aria-label={formatMAD(p.priceMAD, locale)}>
                      <bdi className="text-5xl font-semibold leading-none tracking-tight tabular-nums">{new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-MA" : "en-MA", { maximumFractionDigits: 0 }).format(p.priceMAD)}</bdi>
                      <span className="text-xs font-medium text-muted-foreground">{locale === "ar" ? "درهم" : "MAD"}</span>
                    </div>
                    {p.durationLabel && <p className="mt-2 text-xs text-muted-foreground">{p.durationLabel.toLowerCase().includes("month") ? t("common.monthly") : p.durationLabel}</p>}
                    {p.supportLevel && <p className="mt-4 flex items-start gap-2 rounded-xl bg-primary/6 px-3 py-2.5 text-xs leading-relaxed text-primary"><MessageCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />{p.supportLevel}</p>}
                  </div>
                  <CardContent className="flex flex-1 flex-col px-5 pb-5 sm:px-6 sm:pb-6">
                    <ul className="mt-4 space-y-3 border-t border-border/60 pt-4">
                      {p.features?.map((f: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed text-foreground/85 sm:text-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                          <span className="min-w-0 break-words">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex flex-col gap-1.5 pt-6">
                      <Button
                        onClick={() => authTrigger(p.id)}
                        className={`h-auto min-h-12 w-full whitespace-normal rounded-xl py-3 shadow-none ${featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border-border/80"}`}
                        variant={featured ? "default" : "outline"}
                        aria-label={`${t("cta.start")} — ${p.title}`}
                      >
                        {t("cta.start")}
                        <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="min-h-11 w-full whitespace-normal py-3 text-foreground/70 hover:text-primary">
                        <a href={wa} target="_blank" rel="noreferrer">
                          <MessageCircle className="mr-2 h-4 w-4 text-[#25D366]" />
                          {t("actions.inquire")}
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
        <p className="mx-auto mt-6 flex max-w-2xl items-start gap-2.5 rounded-2xl border border-border/60 bg-background/70 p-4 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          {locale === "fr"
            ? "Paiement par virement bancaire en dirhams (MAD). L'abonnement est activé après vérification du coach."
            : locale === "ar"
            ? "الدفع بالتحويل البنكي بالدرهم المغربي. يتم تفعيل الاشتراك بعد تأكيد المدرب."
            : "Payment by bank transfer in Moroccan dirhams (MAD). Subscription is activated after coach verification."}
        </p>
      </div>
    </section>
  );
}

/* ---------- 7. Testimonials ---------- */
export function Testimonials({ testimonials }: { testimonials: any[] }) {
  const { t } = useI18n();
  if (!testimonials?.length) return null;
  return (
    <section id="testimonials" className="py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("sections.testimonialsTag")} title={t("sections.testimonials")} />
        <div className="mt-6 sm:mt-8 lg:mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((tm, i) => (
            <motion.div
              key={tm.id}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-24px" }}
            >
              <Card className="h-full gap-0 border-border/50 bg-card/60 py-0">
                <CardContent className="flex h-full flex-col p-5 sm:p-6">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: tm.rating ?? 5 }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                    {!tm.consent && (
                      <Badge variant="outline" className="ml-auto text-[10px] text-muted-foreground">
                        {t("common.demo")}
                      </Badge>
                    )}
                  </div>
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/80">
                    “{tm.quote}”
                  </blockquote>
                  <div className="mt-5 flex items-center gap-3 border-t border-border/50 pt-4">
                    <Avatar>
                      <AvatarImage src={tm.avatar} />
                      <AvatarFallback className="bg-primary/15 text-primary">
                        {tm.clientName?.charAt(0) ?? "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{tm.clientName}</p>
                      {tm.clientCity && <p className="text-xs text-muted-foreground">{tm.clientCity}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
          Testimonials are published only with explicit client consent. Demo placeholders are clearly marked.
        </p>
      </div>
    </section>
  );
}

/* ---------- 8. FAQ ---------- */
export function FAQ({ faqs }: { faqs: any[] }) {
  const { t } = useI18n();
  if (!faqs?.length) return null;
  return (
    <section id="faq" className="border-y border-border/40 bg-card/30 py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("sections.faqTag")} title={t("sections.faq")} />
        <Accordion type="single" collapsible className="mt-7 w-full sm:mt-10">
          {faqs.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <AccordionItem value={f.id} className="border-border/50">
                <AccordionTrigger className="min-h-12 text-start font-display text-base font-bold uppercase tracking-tight hover:text-primary">
                  {f.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {f.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ---------- 9. Final CTA ---------- */
export function FinalCTA({ content }: { content: any }) {
  const { t, locale } = useI18n();
  const wa = buildWhatsappLink(content?.whatsappNumber, t("coach.contactWhatsapp"));
  const [trigger] = useState(() => () => {
    window.dispatchEvent(new CustomEvent("atlas:open-auth", { detail: "register" }));
  });

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/15 via-background to-background" />
      <div className="absolute inset-0 -z-10 bg-grid opacity-30" />
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl font-bold uppercase tracking-tight sm:text-5xl"
        >
          {t("sections.finalCta")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg"
        >
          {t("sections.finalCtaTag")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 flex flex-col items-stretch justify-center gap-2.5 sm:mt-8 sm:flex-row sm:items-center sm:gap-3"
        >
          <Button size="lg" onClick={trigger} className="min-h-12 whitespace-normal bg-primary px-4 py-3 text-primary-foreground hover:bg-primary/90">
            {t("hero.primaryCta")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          {content?.whatsappEnabled !== false && (
            <Button asChild size="lg" variant="outline" className="min-h-12 whitespace-normal border-border/60 px-4 py-3">
              <a href={wa} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-5 w-5 text-[#25D366]" />
                {t("cta.contact")}
              </a>
            </Button>
          )}
        </motion.div>
      </div>
    </section>
  );
}

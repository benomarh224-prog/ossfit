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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="h-3 w-3" />
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {tag && <p className="mt-3 text-base text-muted-foreground sm:text-lg">{tag}</p>}
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

  const specs = [
    { icon: Dumbbell, label: locale === "fr" ? "Hypertrophie & Force" : locale === "ar" ? "الضخامة والقوة" : "Hypertrophy & Strength" },
    { icon: Flame, label: locale === "fr" ? "Perte de gras" : locale === "ar" ? "خسارة الدهون" : "Fat Loss" },
    { icon: Salad, label: locale === "fr" ? "Nutrition ciblée" : locale === "ar" ? "تغذية مستهدفة" : "Targeted Nutrition" },
    { icon: HeartPulse, label: locale === "fr" ? "Santé & énergie" : locale === "ar" ? "الصحة والطاقة" : "Health & Energy" },
  ];

  return (
    <section id="about" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("sections.meetCoachTag")}
          title={t("sections.meetCoach")}
        />
        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto max-w-sm"
          >
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/10 blur-2xl" />
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
              {content.coachPortrait ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={content.coachPortrait}
                  alt="Personal training and strength coaching"
                  className="aspect-[3/4] w-full object-cover"
                />
              ) : (
                <div className="aspect-[3/4] w-full bg-gradient-to-br from-primary/20 to-card" />
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
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <s.icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-medium text-foreground/80">{s.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <a href={wa} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {t("coach.contactWhatsapp")}
                </a>
              </Button>
              <Button asChild variant="outline" className="border-border/60">
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
    <section className="relative border-y border-border/40 bg-card/30 py-20 sm:py-28">
      <div className="bg-grid absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("sections.whyChooseTag")} title={t("sections.whyChoose")} />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
            >
              <Card className="group h-full border-border/50 bg-card/60 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                <CardHeader className="flex flex-row items-center gap-3 pb-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <r.icon className="h-5 w-5" />
                  </span>
                </CardHeader>
                <CardContent>
                  <h3 className="font-display text-lg font-bold uppercase tracking-tight">{r.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
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
    <section id="services" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("sections.servicesTag")} title={t("sections.services")} />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => {
            const Icon = icons[s.icon] ?? Dumbbell;
            return (
              <motion.div
                key={s.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
              >
                <Card className="group h-full overflow-hidden border-border/50 bg-card/60">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {s.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.image} alt={s.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary/20 to-card" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                    <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-display text-lg font-bold uppercase tracking-tight">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.shortDesc}</p>
                    <ul className="mt-4 space-y-1.5">
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
    <section id="how" className="border-y border-border/40 bg-card/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("sections.howItWorksTag")} title={t("sections.howItWorks")} />
        <div className="relative mt-14">
          <div className="absolute left-0 top-12 hidden h-px w-full bg-gradient-to-r from-primary/40 via-primary/20 to-transparent lg:block" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="relative"
              >
                <div className="font-display text-5xl font-bold text-primary/20">{s.n}</div>
                <h3 className="mt-2 font-display text-lg font-bold uppercase tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
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
    <section id="results" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("sections.galleryTag")} title={t("sections.gallery")} />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {transformations.map((tr, i) => (
            <motion.div
              key={tr.id}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
            >
              <Card className="group overflow-hidden border-border/50 bg-card/60">
                <div className="grid grid-cols-2">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {tr.beforeImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tr.beforeImg} alt="Before" className="h-full w-full object-cover grayscale" />
                    ) : (
                      <div className="h-full w-full bg-card" />
                    )}
                    <span className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-0.5 text-[10px] font-bold uppercase">Before</span>
                  </div>
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {tr.afterImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
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
    <section id="packages" className="scroll-mt-20 border-y border-border/40 bg-card/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("sections.packagesTag")} title={t("sections.packages")} />
        {packages.length === 0 && (
          <p role="status" className="mt-10 text-center text-muted-foreground">
            {t("sections.packagesEmpty")}
          </p>
        )}
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
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
                viewport={{ once: true, margin: "-60px" }}
                className={featured ? "lg:-mt-4 lg:mb-4" : ""}
              >
                <Card
                  className={`relative flex h-full flex-col overflow-hidden border ${
                    featured ? "border-primary bg-card shadow-2xl shadow-primary/10" : "border-border/50 bg-card/60"
                  }`}
                >
                  {featured && (
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                      <Star className="h-3 w-3" /> {t("common.featured")}
                    </span>
                  )}
                  <CardHeader className="pb-2">
                    <h3 className="font-display text-xl font-bold uppercase tracking-tight">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">{p.tagline}</p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl font-bold text-primary">
                        {formatMAD(p.priceMAD, locale)}
                      </span>
                      <span className="text-xs text-muted-foreground">/ {p.durationLabel?.toLowerCase().includes("month") ? t("common.monthly") : p.durationLabel}</span>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MessageCircle className="h-3.5 w-3.5 text-primary" />
                      {p.supportLevel}
                    </p>
                    <ul className="mt-5 space-y-2.5">
                      {p.features?.map((f: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex flex-col gap-2 pt-6">
                      <Button
                        onClick={() => authTrigger(p.id)}
                        className={featured ? "w-full bg-primary text-primary-foreground hover:bg-primary/90" : "w-full"}
                        variant={featured ? "default" : "outline"}
                      >
                        {t("cta.start")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="w-full text-foreground/70 hover:text-primary">
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
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
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
    <section id="testimonials" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("sections.testimonialsTag")} title={t("sections.testimonials")} />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((tm, i) => (
            <motion.div
              key={tm.id}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
            >
              <Card className="h-full border-border/50 bg-card/60">
                <CardContent className="flex h-full flex-col p-6">
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
    <section id="faq" className="border-y border-border/40 bg-card/30 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("sections.faqTag")} title={t("sections.faq")} />
        <Accordion type="single" collapsible className="mt-10 w-full">
          {faqs.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <AccordionItem value={f.id} className="border-border/50">
                <AccordionTrigger className="text-left font-display text-base font-bold uppercase tracking-tight hover:text-primary">
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
    <section className="relative overflow-hidden py-24">
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
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button size="lg" onClick={trigger} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {t("hero.primaryCta")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          {content?.whatsappEnabled !== false && (
            <Button asChild size="lg" variant="outline" className="border-border/60">
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

"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, MessageCircle, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { buildWhatsappLink } from "@/lib/client-utils";
import { heroImageSource } from "@/lib/hero-media";
import { marketingCopy } from "./copy";
import { Reveal } from "./reveal";

type CoachContent = {
  coachName?: string; coachPortrait?: string; coachCity?: string;
  aboutStory?: string; aboutPhilosophy?: string; heroImage?: string;
  whatsappNumber?: string; whatsappEnabled?: boolean;
};
type Service = { id: string; title: string; shortDesc?: string; image?: string; features?: string[] };
type CoachingPackage = { id: string; title: string; tagline?: string; priceMAD: number; durationLabel?: string; supportLevel?: string; features?: string[]; featured?: boolean };
type Transformation = { id: string; consent?: boolean; clientName: string; beforeImg?: string; afterImg?: string; goal?: string; duration?: string; story?: string };
type Testimonial = { id: string; consent?: boolean; clientName: string; clientCity?: string; quote: string; rating?: number | null };

function Heading({ title, intro }: { title: string; intro?: string }) {
  return <Reveal className="marketing-heading"><h2 className="marketing-title">{title}</h2>{intro && <p className="marketing-intro">{intro}</p>}</Reveal>;
}

export function Services({ services }: { services: Service[] }) {
  const { locale } = useI18n(); const c = marketingCopy[locale];
  return <section id="services" className="marketing-section"><div className="marketing-wrap">
    <Heading title={c.services} intro={c.servicesIntro} />
    <div className="marketing-services">{services.map(service => <Reveal key={service.id} className="marketing-service">
      <article>
        {service.image && <div className="marketing-service-photo"><img src={service.image} alt={service.title} width={1200} height={800} loading="lazy" decoding="async" /></div>}
        <h3>{service.title}</h3><p>{service.shortDesc}</p>
        {!!service.features?.length && <ul>{service.features.map(feature => <li key={feature}>{feature}</li>)}</ul>}
      </article>
    </Reveal>)}</div>
  </div></section>;
}

export function MeetCoach({ content }: { content: CoachContent }) {
  const { t, locale } = useI18n(); const c = marketingCopy[locale];
  const actualPortrait = content.coachPortrait && !["/images/service-coaching.jpg", "/images/coach-portrait.jpg", "/images/coach.jpg", "/images/gym-bg.jpg"].includes(content.coachPortrait);
  const wa = buildWhatsappLink(content.whatsappNumber, t("coach.contactWhatsapp"));
  return <section id="about" className="marketing-section marketing-field"><div className="marketing-wrap marketing-about">
    <Reveal><h2 className="marketing-title">{content.coachName || c.about}</h2><p className="marketing-intro">{t("coach.role")}</p>{actualPortrait && <img className="marketing-portrait mt-6" src={content.coachPortrait} alt={content.coachName || c.about} width={800} height={1000} loading="lazy" />}</Reveal>
    <Reveal>
      <div className="marketing-about-copy">
        <div><h3>{t("coach.storyTitle")}</h3><p>{content.aboutStory}</p></div>
        <div><h3>{t("coach.philosophyTitle")}</h3><p>{content.aboutPhilosophy}</p></div>
      </div>
      <div className="marketing-close-actions">{content.whatsappEnabled !== false && <a className="marketing-link" href={wa} target="_blank" rel="noreferrer">{c.contact}<ArrowRight className="rtl:rotate-180" aria-hidden="true" /></a>}<a className="marketing-link" href="#packages">{t("cta.explore")}<ArrowRight className="rtl:rotate-180" aria-hidden="true" /></a></div>
    </Reveal>
  </div></section>;
}

export function HowItWorks() {
  const { locale } = useI18n(); const c = marketingCopy[locale];
  return <section id="how" className="marketing-section"><div className="marketing-wrap marketing-method">
    <Reveal><h2 className="marketing-title">{c.method}</h2><p className="marketing-intro">{c.methodIntro}</p></Reveal>
    <div className="marketing-method-sheet"><ol>{c.stages.map(([title, description]) => <li key={title}><Reveal><h3>{title}</h3><p>{description}</p></Reveal></li>)}</ol></div>
  </div></section>;
}

export function Packages({ packages, whatsappNumber }: { packages: CoachingPackage[]; whatsappNumber?: string }) {
  const { locale, t } = useI18n(); const c = marketingCopy[locale];
  const [selected, setSelected] = useState<string | null>(null);
  const active = packages.some(item => item.id === selected) ? selected : null;
  const shown = active ? packages.filter(item => item.id === active) : packages;
  function choose(packageId: string) { window.dispatchEvent(new CustomEvent("atlas:open-auth", { detail: { tab: "register", packageId } })); }
  return <section id="packages" className="marketing-section"><div className="marketing-wrap">
    <Heading title={c.packages} intro={c.packagesIntro} />
    {packages.length > 1 && <div className="marketing-plan-choices" role="group" aria-label={c.packages}>
      <button type="button" aria-pressed={!active} aria-controls="coaching-plans" onClick={() => setSelected(null)}>{c.all}</button>
      {packages.map(item => <button key={item.id} type="button" aria-pressed={active === item.id} aria-controls="coaching-plans" onClick={() => setSelected(item.id)}>{item.title}</button>)}
    </div>}
    <p className="sr-only" aria-live="polite">{c.matches}: {shown.length}</p>
    <div id="coaching-plans" className="marketing-plans">
      {shown.map(item => {
        const amount = new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-MA" : "en-MA", { maximumFractionDigits: 0 }).format(item.priceMAD);
        const message = locale === "ar" ? `مرحبا، بغيت نسول على برنامج ${item.title} بثمن ${item.priceMAD} درهم.` : locale === "fr" ? `Bonjour, je souhaite en savoir plus sur ${item.title} à ${item.priceMAD} MAD.` : `Hello, I'd like to ask about ${item.title} at ${item.priceMAD} MAD.`;
        return <Reveal key={item.id}><article className="marketing-plan" data-featured={!!item.featured} aria-labelledby={`plan-${item.id}`}>
          <div className="marketing-plan-head"><div><h3 id={`plan-${item.id}`}>{item.title}</h3>{item.featured && <p className="mt-2 text-sm font-medium">{c.featured}</p>}</div><div><p className="marketing-plan-price"><bdi>{amount}</bdi></p><span className="marketing-plan-currency">{locale === "ar" ? "درهم" : "MAD"}{item.durationLabel ? ` / ${item.durationLabel.toLowerCase().includes("month") ? t("common.monthly") : item.durationLabel}` : ""}</span></div></div>
          {item.tagline && <p className="marketing-plan-tagline">{item.tagline}</p>}
          <div className="marketing-plan-info">{item.supportLevel && <p>{item.supportLevel}</p>}
            {!!item.features?.length && <details open={active === item.id || !!item.featured}><summary>{c.included}<ChevronDown aria-hidden="true" /></summary><ul className="marketing-plan-features">{item.features.map(feature => <li key={feature}>{feature}</li>)}</ul></details>}
          </div>
          <div className="marketing-plan-actions"><button type="button" className="marketing-action" onClick={() => choose(item.id)} aria-label={`${c.choose}: ${item.title}`}>{c.choose}<ArrowRight className="rtl:rotate-180" aria-hidden="true" /></button><a className="marketing-link" href={buildWhatsappLink(whatsappNumber, message)} target="_blank" rel="noreferrer">{c.ask}<MessageCircle aria-hidden="true" /></a></div>
        </article></Reveal>;
      })}
    </div>
    {!packages.length && <p role="status" className="marketing-intro">{t("sections.packagesEmpty")}</p>}
    {!!packages.length && <p className="marketing-payment-note">{c.payment}</p>}
  </div></section>;
}

export function FAQ({ faqs }: { faqs: { id: string; question: string; answer: string }[] }) {
  const { locale } = useI18n(); const c = marketingCopy[locale];
  if (!faqs.length) return null;
  return <section id="faq" className="marketing-section marketing-field"><div className="marketing-wrap marketing-faq">
    <Reveal><h2 className="marketing-title">{c.faq}</h2><p className="marketing-intro">{c.faqIntro}</p></Reveal>
    <div className="marketing-faq-list">{faqs.map((faq, index) => <Reveal key={faq.id}><details name="coaching-questions" open={index === 0}><summary>{faq.question}<ChevronDown aria-hidden="true" /></summary><p>{faq.answer}</p></details></Reveal>)}</div>
  </div></section>;
}

export function FinalCTA({ content }: { content: CoachContent }) {
  const { locale } = useI18n(); const c = marketingCopy[locale];
  function register() { window.dispatchEvent(new CustomEvent("atlas:open-auth", { detail: "register" })); }
  return <section className="marketing-section"><div className="marketing-wrap marketing-close">
    <Reveal><h2 className="marketing-title">{c.close}</h2><p className="marketing-intro">{c.closeIntro}</p><div className="marketing-close-actions"><button type="button" className="marketing-action" onClick={register}>{c.join}<ArrowRight className="rtl:rotate-180" aria-hidden="true" /></button>{content.whatsappEnabled !== false && <a className="marketing-link" href={buildWhatsappLink(content.whatsappNumber, c.contact)} target="_blank" rel="noreferrer">{c.contact}</a>}</div></Reveal>
    <img src={heroImageSource(content.heroImage)} alt={c.training} width={1536} height={1024} loading="lazy" decoding="async" />
  </div></section>;
}

export function Transformations({ transformations }: { transformations: Transformation[] }) {
  const { locale } = useI18n(); const c = marketingCopy[locale];
  const shared = transformations.filter(item => item.consent);
  if (!shared.length) return null;
  return <section id="results" className="marketing-section"><div className="marketing-wrap"><Heading title={c.results} /><div className="marketing-proof">{shared.map(item => <Reveal key={item.id}><figure><div className="marketing-proof-photos">{item.beforeImg && <img src={item.beforeImg} alt={`${item.clientName} — before`} width={600} height={800} loading="lazy" />}{item.afterImg && <img src={item.afterImg} alt={`${item.clientName} — after`} width={600} height={800} loading="lazy" />}</div><figcaption><strong>{item.clientName}</strong>{item.goal && <p>{item.goal}</p>}{item.duration && <p>{item.duration}</p>}{item.story && <p className="mt-2 leading-relaxed">{item.story}</p>}</figcaption></figure></Reveal>)}</div><p className="marketing-payment-note">{c.resultNotice}</p></div></section>;
}

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const { locale } = useI18n(); const c = marketingCopy[locale];
  const shared = testimonials.filter(item => item.consent);
  if (!shared.length) return null;
  return <section id="testimonials" className="marketing-section marketing-field"><div className="marketing-wrap"><Heading title={c.testimonials} /><div className="marketing-proof">{shared.map(item => <Reveal key={item.id}><figure><blockquote>{item.quote}</blockquote><figcaption><strong>{item.clientName}</strong>{item.clientCity && <p>{item.clientCity}</p>}{typeof item.rating === "number" && <span className="mt-2 flex gap-1" aria-label={`${item.rating}/5`}>{Array.from({ length: Math.max(0, Math.min(5, Math.round(item.rating))) }, (_, index) => <Star key={index} className="size-4 fill-current" aria-hidden="true" />)}</span>}</figcaption></figure></Reveal>)}</div></div></section>;
}

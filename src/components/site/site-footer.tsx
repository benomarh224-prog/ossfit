"use client";

import Link from "next/link";
import { Dumbbell, Instagram, Facebook, Youtube, MapPin, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { buildWhatsappLink } from "@/lib/client-utils";

type SiteContent = {
  brandName?: string;
  coachCity?: string;
  whatsappNumber?: string;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
  facebookUrl?: string | null;
};

export function SiteFooter({ content, showResults = false }: { content: SiteContent | null; showResults?: boolean }) {
  const { t } = useI18n();

  const wa = buildWhatsappLink(
    content?.whatsappNumber,
    "Hello! I'd like to know more about your coaching programs."
  );

  return (
    <footer className="mt-auto border-t border-border/50 bg-card/40">
      <div className="bg-grid">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div className="md:col-span-2 lg:col-span-1">
            <Link href="#top" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Dumbbell className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-bold uppercase tracking-tight">
                {content?.brandName || "Coach Oussama"}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>
            <div className="mt-5 flex items-center gap-3">
              {content?.instagramUrl && (
                <a href={content.instagramUrl} target="_blank" rel="noreferrer" className="text-muted-foreground transition-colors hover:text-primary" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {content?.facebookUrl && (
                <a href={content.facebookUrl} target="_blank" rel="noreferrer" className="text-muted-foreground transition-colors hover:text-primary" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {content?.youtubeUrl && (
                <a href={content.youtubeUrl} target="_blank" rel="noreferrer" className="text-muted-foreground transition-colors hover:text-primary" aria-label="YouTube">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label="WhatsApp"
              >
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider">
              {t("footer.quickLinks")}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="#about" className="hover:text-primary">{t("nav.about")}</Link></li>
              <li><Link href="#services" className="hover:text-primary">{t("nav.services")}</Link></li>
              <li><Link href="#packages" className="hover:text-primary">{t("nav.packages")}</Link></li>
              {showResults && <li><Link href="#results" className="hover:text-primary">{t("nav.results")}</Link></li>}
              <li><Link href="#faq" className="hover:text-primary">{t("nav.faq")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider">
              {t("footer.services")}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="#services" className="hover:text-primary">Online Coaching</Link></li>
              <li><Link href="#services" className="hover:text-primary">Body Transformation</Link></li>
              <li><Link href="#services" className="hover:text-primary">Nutrition Guidance</Link></li>
              <li><Link href="#services" className="hover:text-primary">1-to-1 Consultation</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider">
              {t("footer.legal")}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary">{t("footer.privacy")}</Link></li>
              <li><Link href="/terms" className="hover:text-primary">{t("footer.terms")}</Link></li>
            </ul>
            {content?.coachCity && (
              <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                {content.coachCity}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {content?.brandName || "Coach Oussama"}. {t("footer.rights")}</p>
          <p>{t("footer.madeIn")}</p>
        </div>
      </div>
    </footer>
  );
}

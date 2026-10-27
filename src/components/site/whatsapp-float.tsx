"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { buildWhatsappLink } from "@/lib/client-utils";

type SiteContent = {
  whatsappNumber?: string;
  whatsappEnabled?: boolean;
  coachName?: string;
};

export function WhatsAppFloat({ content }: { content: SiteContent | null }) {
  const { t, locale } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (content?.whatsappEnabled === false) return null;

  const messages: Record<string, string> = {
    en: `Hello! I'm interested in your online personal training programs. Can you tell me more?`,
    fr: `Bonjour ! Je suis intéressé(e) par vos programmes de coaching sportif en ligne. Pouvez-vous m'en dire plus ?`,
    ar: `مرحبا! أنا مهتم ببرامج التدريب الشخصي عبر الإنترنت. هل يمكنك إخباري بالمزيد؟`,
  };

  const link = buildWhatsappLink(
    content?.whatsappNumber,
    messages[locale] ?? messages.en
  );

  return (
    <AnimatePresence>
      <motion.a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("hero.whatsapp")}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: show ? 1 : 0.85,
          opacity: 1,
          y: show ? 0 : 20,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 ring-4 ring-[#25D366]/20 transition-transform hover:scale-110 sm:bottom-7 sm:right-7"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/40 [animation-duration:2.5s]" />
        <MessageCircle className="relative h-7 w-7" />
        <span className="sr-only">{t("hero.whatsapp")}</span>
      </motion.a>
    </AnimatePresence>
  );
}

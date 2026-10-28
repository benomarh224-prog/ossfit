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
        className="fixed bottom-[calc(1rem_+_env(safe-area-inset-bottom))] end-4 z-40 flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/25 ring-4 ring-[#25D366]/15 transition-transform hover:scale-105 sm:bottom-7 sm:end-7 sm:size-14"
      >
        <MessageCircle className="size-6 sm:size-7" />
        <span className="sr-only">{t("hero.whatsapp")}</span>
      </motion.a>
    </AnimatePresence>
  );
}

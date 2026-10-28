"use client";

import { Dumbbell, Home, MessageSquare, Salad, UserRound } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import type { ClientSection } from "@/lib/dashboard-overview";
import { cn } from "@/lib/utils";

const copy = {
  en: { label: "Your coaching space", home: "Home", workouts: "Workouts", nutrition: "Nutrition", messages: "Messages", account: "Account", unread: "Unread messages" },
  fr: { label: "Votre espace coaching", home: "Accueil", workouts: "Séances", nutrition: "Nutrition", messages: "Messages", account: "Compte", unread: "Messages non lus" },
  ar: { label: "فضاء التدريب ديالك", home: "الرئيسية", workouts: "التمارين", nutrition: "التغذية", messages: "الرسائل", account: "حسابي", unread: "رسائل غير مقروءة" },
};

export function MobileNav({ section, unread = 0, onNavigate }: { section: ClientSection; unread?: number; onNavigate: (section: ClientSection) => void }) {
  const { locale } = useI18n();
  const c = copy[locale];
  const items = [
    { id: "overview", icon: Home, label: c.home },
    { id: "workouts", icon: Dumbbell, label: c.workouts },
    { id: "nutrition", icon: Salad, label: c.nutrition },
    { id: "messages", icon: MessageSquare, label: c.messages },
    { id: "profile", icon: UserRound, label: c.account },
  ] as const;

  return <nav aria-label={c.label} className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 shadow-[0_-6px_24px_rgb(0_0_0/0.04)] backdrop-blur-xl lg:hidden">
    <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
      {items.map(item => {
        const active = section === item.id;
        return <button key={item.id} type="button" onClick={() => onNavigate(item.id)} aria-current={active ? "page" : undefined} className={cn("relative flex min-h-16 min-w-0 flex-col items-center justify-start gap-1 rounded-xl px-0.5 pb-2 pt-1 text-[11px] font-medium leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none", active ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
          <span className={cn("relative flex h-8 w-12 items-center justify-center rounded-xl transition-colors", active ? "bg-primary/12" : "bg-transparent")}>
            <item.icon className="size-5" strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
            {item.id === "messages" && unread > 0 && <span aria-label={`${c.unread}: ${unread}`} className="absolute -end-1 -top-0.5 min-w-4 rounded-full border-2 border-card bg-primary px-1 text-[9px] font-bold leading-4 text-primary-foreground">{unread > 99 ? "99+" : unread}</span>}
          </span>
          <span className="max-w-full break-words">{item.label}</span>
        </button>;
      })}
    </div>
  </nav>;
}

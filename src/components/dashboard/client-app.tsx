"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard, Dumbbell, Salad, TrendingUp, MessageSquare,
  CreditCard, Calendar, User, LogOut, Dumbbell as Logo, Menu, X,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { apiFetch } from "@/lib/client-utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Notifications } from "@/components/notifications";
import { Skeleton } from "@/components/ui/skeleton";
import { Onboarding } from "@/components/auth/onboarding";
import { SectionLoading } from "./shared";
import { ClientOverview } from "./overview";
import type { ClientSection } from "@/lib/dashboard-overview";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { ThemeSwitcher } from "@/components/site/theme-switcher";
import { MobileNav } from "./mobile-nav";

const Workouts = dynamic(() => import("./sections").then(module => module.Workouts), { loading: () => <SectionLoading /> });
const Nutrition = dynamic(() => import("./sections").then(module => module.Nutrition), { loading: () => <SectionLoading /> });
const ProgressSection = dynamic(() => import("./sections").then(module => module.ProgressSection), { loading: () => <SectionLoading /> });
const Messages = dynamic(() => import("./sections").then(module => module.Messages), { loading: () => <SectionLoading /> });
const Subscription = dynamic(() => import("./sections").then(module => module.Subscription), { loading: () => <SectionLoading /> });
const Consultations = dynamic(() => import("./sections").then(module => module.Consultations), { loading: () => <SectionLoading /> });
const Profile = dynamic(() => import("./sections").then(module => module.Profile), { loading: () => <SectionLoading /> });

type Section = ClientSection;

const NAV: { id: Section; icon: any; key: string }[] = [
  { id: "overview", icon: LayoutDashboard, key: "dashboard.overview" },
  { id: "workouts", icon: Dumbbell, key: "dashboard.workouts" },
  { id: "nutrition", icon: Salad, key: "dashboard.nutrition" },
  { id: "progress", icon: TrendingUp, key: "dashboard.progress" },
  { id: "messages", icon: MessageSquare, key: "dashboard.messages" },
  { id: "subscription", icon: CreditCard, key: "dashboard.subscription" },
  { id: "consultations", icon: Calendar, key: "dashboard.consultations" },
  { id: "profile", icon: User, key: "dashboard.profile" },
];

export function ClientApp() {
  const { t, locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const qc = useQueryClient();
  const { data: session } = useSession();
  const [section, setSection] = useState<Section>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [workoutDayIndex, setWorkoutDayIndex] = useState<number | undefined>(undefined);
  function switchSection(value: Section, dayIndex?: number) {
    if (value === "workouts") setWorkoutDayIndex(dayIndex);
    setSection(value); setMobileOpen(false);
    if (value !== "workouts" || dayIndex === undefined) window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }
  function openNotification(type: string) {
    const destination: Record<string, Section> = { message: "messages", workout: "workouts", nutrition: "nutrition", payment: "subscription", success: "subscription", warning: "subscription", consultation: "consultations", security: "profile", checkin: "progress" };
    for (const key of ["me", "dashboard-overview", "workouts", "checkins", "consultations"]) void qc.invalidateQueries({ queryKey: [key] });
    switchSection(destination[type] ?? "overview");
  }

  const meQ = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<any>("/api/me"),
    enabled: !!session,
    refetchOnWindowFocus: true,
  });
  const siteQ = useQuery({
    queryKey: ["site"],
    queryFn: () => apiFetch<any>("/api/site"),
  });

  const me = meQ.data;
  const content = siteQ.data?.content;
  const packages = siteQ.data?.packages ?? [];
  const whatsapp = content?.whatsappNumber;

  // Onboarding gate
  if (meQ.isLoading || (!me && !meQ.isError)) return <DashboardSkeleton />;
  if (meQ.isError) return <main className="flex min-h-screen items-center justify-center p-5"><div className="max-w-md space-y-4 rounded-2xl border border-border bg-card p-6"><h1 className="font-display text-2xl">{t("common.error")}</h1><Button onClick={() => meQ.refetch()}>{locale === "ar" ? "عاود المحاولة" : locale === "fr" ? "Réessayer" : "Try again"}</Button><Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>{t("nav.logout")}</Button></div></main>;
  if (me && (!me.profile || me.profile.onboarded === false)) {
    return <Onboarding packages={packages} />;
  }

  const initials = (me?.user?.name || "C").split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase();

  const NavContent = (
    <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {NAV.map((n) => (
        <button
          key={n.id}
          onClick={() => switchSection(n.id)}
          aria-current={section === n.id ? "page" : undefined}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            section === n.id
              ? "bg-primary text-primary-foreground"
              : "text-foreground/70 hover:bg-accent hover:text-foreground"
          }`}
        >
          <n.icon className="h-4 w-4" />
          {t(n.key)}
          {n.id === "messages" && me?.unreadMessages > 0 && (
            <Badge className={`ms-auto ${section === n.id ? "bg-primary-foreground text-primary" : "bg-primary/15 text-primary"}`}>{me.unreadMessages}</Badge>
          )}
        </button>
      ))}
      <div className="mt-auto pt-3">
        <Button asChild variant="ghost" size="sm" className="min-h-11 w-full justify-start text-foreground/60"><a href="/">{locale === "ar" ? "الرجوع للموقع الرئيسي" : locale === "fr" ? "Retour au site" : "Back to website"}</a></Button>
        <Button variant="ghost" size="sm" className="w-full justify-start text-foreground/60" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("nav.logout")}
        </Button>
      </div>
    </nav>
  );

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-2 px-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="size-11 shrink-0 rounded-xl lg:hidden" aria-label={locale === "ar" ? "فتح القائمة" : locale === "fr" ? "Ouvrir le menu" : "Open menu"}><Menu className="size-5" /></Button></SheetTrigger>
            <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground sm:flex">
              <Logo className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold uppercase leading-none sm:text-lg">{content?.brandName || "Coach Oussama"}</p>
              <p className="mt-1 truncate text-[10px] text-muted-foreground">{t(NAV.find(item => item.id === section)!.key)}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0 sm:gap-2">
            <Notifications onNavigate={openNotification} />
            <ThemeSwitcher />
            <LanguageSwitcher compact />
            <Avatar className="hidden h-8 w-8 border border-border sm:flex">
              <AvatarFallback className="bg-primary/15 text-xs text-primary">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">{me?.user?.name}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-e border-border/50 bg-card/30 lg:flex lg:flex-col">
          {NavContent}
        </aside>

        {/* Mobile sidebar */}
        <div className="lg:hidden">
            <SheetContent side={locale === "ar" ? "right" : "left"} showCloseButton={false} className="w-[min(19rem,88vw)] gap-0 p-0">
              <SheetTitle className="sr-only">{t("nav.dashboard")}</SheetTitle><SheetDescription className="sr-only">{t("nav.dashboard")}</SheetDescription>
              <div className="flex items-center justify-between border-b border-border/50 p-3">
                <span className="font-display font-bold uppercase">{t("nav.dashboard")}</span>
                <SheetClose asChild><Button variant="ghost" size="icon" className="size-11" aria-label={locale === "ar" ? "إغلاق القائمة" : locale === "fr" ? "Fermer le menu" : "Close menu"}><X className="h-4 w-4" /></Button></SheetClose>
              </div>
              {NavContent}
            </SheetContent>
        </div>

        {/* Main */}
        <main className="min-w-0 flex-1 p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:p-6 sm:pb-[calc(6rem+env(safe-area-inset-bottom))] lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              className="mx-auto max-w-6xl"
            >
              {section === "overview" && <ClientOverview me={me} onNavigate={switchSection} />}
              {section === "workouts" && <Workouts whatsapp={whatsapp} initialDayIndex={workoutDayIndex} />}
              {section === "nutrition" && <Nutrition plan={me?.nutritionPlan} />}
              {section === "progress" && <ProgressSection />}
              {section === "messages" && <Messages />}
              {section === "subscription" && <Subscription me={me} />}
              {section === "consultations" && <Consultations whatsapp={whatsapp} />}
              {section === "profile" && <Profile me={me} whatsapp={whatsapp} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <MobileNav section={section} unread={me.unreadMessages} onNavigate={switchSection} />
    </div>
    </Sheet>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

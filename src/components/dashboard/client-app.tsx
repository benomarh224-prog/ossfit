"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Dumbbell, Salad, TrendingUp, MessageSquare,
  CreditCard, Calendar, User, LogOut, Dumbbell as Logo, Menu, X,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { apiFetch } from "@/lib/client-utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Onboarding } from "@/components/auth/onboarding";
import {
  Overview, Workouts, Nutrition, ProgressSection, Messages, Subscription, Consultations, Profile,
} from "./sections";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { ThemeSwitcher } from "@/components/site/theme-switcher";

type Section = "overview" | "workouts" | "nutrition" | "progress" | "messages" | "subscription" | "consultations" | "profile";

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
  const { t } = useI18n();
  const router = useRouter();
  const { data: session } = useSession();
  const [section, setSection] = useState<Section>("overview");

  const meQ = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<any>("/api/me"),
    enabled: !!session,
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
  if (meQ.isLoading) return <DashboardSkeleton />;
  if (me && (!me.profile || me.profile.onboarded === false)) {
    return <Onboarding packages={packages} />;
  }

  const initials = (me?.user?.name || "C").split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase();

  const NavContent = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV.map((n) => (
        <button
          key={n.id}
          onClick={() => setSection(n.id)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            section === n.id
              ? "bg-primary text-primary-foreground"
              : "text-foreground/70 hover:bg-accent hover:text-foreground"
          }`}
        >
          <n.icon className="h-4 w-4" />
          {t(n.key)}
          {n.id === "messages" && me?.unreadMessages > 0 && (
            <Badge className="ml-auto bg-primary-foreground text-primary">{me.unreadMessages}</Badge>
          )}
        </button>
      ))}
      <div className="mt-auto pt-3">
        <Button variant="ghost" size="sm" className="w-full justify-start text-foreground/60" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("nav.logout")}
        </Button>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Logo className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold uppercase leading-none sm:text-lg">{content?.brandName || "Coach Oussama"}</p>
              <Badge variant="outline" className="mt-0.5 text-[10px] uppercase text-primary">{t("nav.dashboard")}</Badge>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeSwitcher />
            <LanguageSwitcher compact />
            <Avatar className="h-8 w-8 border border-border">
              <AvatarFallback className="bg-primary/15 text-xs text-primary">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">{me?.user?.name}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border/50 bg-card/30 lg:flex lg:flex-col">
          {NavContent}
        </aside>

        {/* Mobile sidebar */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="fixed bottom-4 right-4 z-40 rounded-full bg-primary text-primary-foreground shadow-lg lg:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex items-center justify-between border-b border-border/50 p-3">
                <span className="font-display font-bold uppercase">Menu</span>
                <SheetClose asChild><Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button></SheetClose>
              </div>
              {NavContent}
            </SheetContent>
          </Sheet>
        </div>

        {/* Main */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {section === "overview" && <Overview me={me} whatsapp={whatsapp} />}
              {section === "workouts" && <Workouts whatsapp={whatsapp} />}
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
    </div>
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

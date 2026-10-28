"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Salad,
  Package,
  Star,
  Sparkles,
  HelpCircle,
  FileText,
  CalendarCheck,
  CreditCard,
  BarChart3,
  LogOut,
  ExternalLink,
  Menu,
  Shield,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import type { AdminSection } from "./lib";
import { ThemeSwitcher } from "@/components/site/theme-switcher";
import { LanguageSwitcher } from "@/components/site/language-switcher";

import OverviewSection from "./sections/overview";
import ClientsSection from "./sections/clients";
import WorkoutsSection from "./sections/workouts";
import NutritionSection from "./sections/nutrition";
import PricingSection from "./sections/pricing";
import TestimonialsSection from "./sections/testimonials";
import TransformationsSection from "./sections/transformations";
import FaqSection from "./sections/faq";
import ContentSection from "./sections/content";
import ServicesSection from "./sections/services";
import ConsultationsSection from "./sections/consultations";
import PaymentsSection from "./sections/payments";
import AnalyticsSection from "./sections/analytics";
import AccountSection from "./sections/account";

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function useNav(): NavItem[] {
  const { t, locale } = useI18n();
  return [
    { id: "overview", label: t("admin.overview"), icon: LayoutDashboard },
    { id: "clients", label: t("admin.clients"), icon: Users },
    { id: "workouts", label: t("admin.workouts"), icon: Dumbbell },
    { id: "nutrition", label: t("admin.nutrition"), icon: Salad },
    { id: "pricing", label: t("admin.pricing"), icon: Package },
    { id: "testimonials", label: t("admin.testimonials"), icon: Star },
    { id: "transformations", label: t("admin.transformations"), icon: Sparkles },
    { id: "faq", label: t("admin.faq").length > 0 ? t("admin.faq") : "FAQ", icon: HelpCircle },
    { id: "content", label: t("admin.content"), icon: FileText },
    { id: "services", label: t("nav.services"), icon: Sparkles },
    { id: "consultations", label: t("admin.consultations"), icon: CalendarCheck },
    { id: "payments", label: t("admin.payments"), icon: CreditCard },
    { id: "analytics", label: t("admin.analytics"), icon: BarChart3 },
    { id: "account", label: locale === "ar" ? "إعدادات الحساب" : locale === "fr" ? "Paramètres du compte" : "Account settings", icon: Settings },
  ];
}

function BrandBlock() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
        <Dumbbell className="size-5" />
      </div>
      <div className="leading-tight">
        <p className="font-display text-base tracking-wider text-foreground">COACH OUSSAMA</p>
        <Badge
          variant="outline"
          className="border-primary/40 bg-primary/10 px-1.5 py-0 text-[10px] font-semibold text-primary"
        >
          <Shield className="size-2.5" />
          ADMIN
        </Badge>
      </div>
    </div>
  );
}

function NavLinks({
  active,
  onSelect,
}: {
  active: AdminSection;
  onSelect: (id: AdminSection) => void;
}) {
  const items = useNav();
  return (
    <nav className="flex flex-col gap-1" aria-label="Admin sections">
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            <span className="truncate">{item.label}</span>
            {isActive && (
              <motion.div
                layoutId="admin-nav-indicator"
                className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  const { t } = useI18n();
  return (
    <div className="mt-auto flex flex-col gap-2 border-t border-border/60 pt-4">
      <Button
        asChild
        variant="outline"
        size="sm"
        className="justify-start gap-2"
      >
        <a href="/?view=site" target="_blank" rel="noopener noreferrer">
          <ExternalLink className="size-4" />
          {t("admin.analytics") ? "View site" : "View site"}
        </a>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="justify-start gap-2 text-muted-foreground hover:text-destructive"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut className="size-4" />
        {t("nav.logout")}
      </Button>
    </div>
  );
}

function SidebarBody({
  active,
  onSelect,
}: {
  active: AdminSection;
  onSelect: (id: AdminSection) => void;
}) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <BrandBlock />
      <div className="flex-1 overflow-y-auto pr-1">
        <NavLinks active={active} onSelect={onSelect} />
      </div>
      <SidebarFooter />
    </div>
  );
}

export function AdminApp() {
  const { data: session, status } = useSession();
  const { t } = useI18n();
  const [section, setSection] = React.useState<AdminSection>("overview");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const nav = useNav();
  const activeItem = nav.find((n) => n.id === section);

  const userName = session?.user?.name ?? session?.user?.email ?? "Coach";

  function switchSection(id: AdminSection) {
    setSection(id);
    setMobileOpen(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-sidebar/50 backdrop-blur lg:flex lg:flex-col">
          <SidebarBody active={section} onSelect={switchSection} />
        </aside>

        {/* Mobile sidebar (Sheet) — trigger is a plain button in the topbar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 p-0 lg:hidden">
            <SheetTitle className="sr-only">Admin navigation</SheetTitle>
            <SheetDescription className="sr-only">
              Navigate between admin sections
            </SheetDescription>
            <SidebarBody active={section} onSelect={switchSection} />
          </SheetContent>
        </Sheet>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-lg tracking-wide text-foreground sm:text-xl">
                {activeItem?.label ?? t("admin.overview")}
              </h1>
            </div>
            <ThemeSwitcher />
            <LanguageSwitcher compact />
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="outline" size="sm">
                <a href="/?view=site" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  View site
                </a>
              </Button>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5">
              <div className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {userName.slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-xs font-medium leading-tight text-foreground">
                  {userName}
                </p>
                {session?.user?.email && (
                  <p className="truncate text-[10px] leading-tight text-muted-foreground">
                    {session.user.email}
                  </p>
                )}
              </div>
            </div>
          </header>

          {/* Section content */}
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {status === "loading" ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={section}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="mx-auto max-w-7xl"
                >
                  {renderSection(section)}
                </motion.div>
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function renderSection(section: AdminSection) {
  switch (section) {
    case "overview":
      return <OverviewSection />;
    case "clients":
      return <ClientsSection />;
    case "workouts":
      return <WorkoutsSection />;
    case "nutrition":
      return <NutritionSection />;
    case "pricing":
      return <PricingSection />;
    case "testimonials":
      return <TestimonialsSection />;
    case "transformations":
      return <TransformationsSection />;
    case "faq":
      return <FaqSection />;
    case "content":
      return <ContentSection />;
    case "services":
      return <ServicesSection />;
    case "consultations":
      return <ConsultationsSection />;
    case "payments":
      return <PaymentsSection />;
    case "analytics":
      return <AnalyticsSection />;
    case "account":
      return <AccountSection />;
    default:
      return null;
  }
}

export default AdminApp;

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Menu, X, Dumbbell, LogIn, UserPlus } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeSwitcher } from "./theme-switcher";
import { AuthModal } from "@/components/auth/auth-modal";
import { cn } from "@/lib/utils";
import { signedInDestination } from "@/lib/login-access";
import { AccountMenu, RememberedAccount } from "./remembered-account";
import { accountCopy } from "@/components/auth/account-copy";
import { Skeleton } from "@/components/ui/skeleton";

const NAV = [
  { href: "#about", key: "nav.about" },
  { href: "#services", key: "nav.services" },
  { href: "#how", key: "nav.howItWorks" },
  { href: "#packages", key: "nav.packages" },
  { href: "#results", key: "nav.results" },
  { href: "#testimonials", key: "nav.testimonials" },
  { href: "#faq", key: "nav.faq" },
];

export function SiteHeader({ brandName, showResults = false, showTestimonials = false }: { brandName: string; showResults?: boolean; showTestimonials?: boolean }) {
  const { t, locale } = useI18n();
  const { data: session, status } = useSession();
  const destination = signedInDestination(session?.user);
  const c = accountCopy[locale];
  const isRTL = locale === "ar";
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [active, setActive] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const navigation = NAV.filter((item) => (item.href !== "#results" || showResults) && (item.href !== "#testimonials" || showTestimonials));

  // Scroll-spy: highlight the section currently in view
  useEffect(() => {
    const sections = NAV.filter((n) => (n.href !== "#results" || showResults) && (n.href !== "#testimonials" || showTestimonials)).map((n) => document.querySelector(n.href)).filter(Boolean) as Element[];
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive("#" + visible.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [showResults, showTestimonials]);

  const openAuth = (tab: "login" | "register", switchAccount = false) => {
    setMobileOpen(false);
    setSwitching(switchAccount);
    setAuthTab(tab);
    setAuthOpen(true);
  };

  // Sheet opens from the start side (respects RTL)
  const sheetSide: "left" | "right" = isRTL ? "left" : "right";

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 bg-background"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="#top" className="flex min-w-0 items-center gap-2" aria-label={brandName || "Coach Oussama"}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Dumbbell className="h-5 w-5" />
          </span>
          <span className="truncate font-display text-sm font-bold uppercase tracking-tight sm:text-lg">
            {brandName || "Coach Oussama"}
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-0.5 xl:flex"
        >
          {navigation.map((n) => {
            const isActive = active === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-foreground/70 hover:text-primary"
                )}
              >
                {t(n.key)}
              </Link>
            );
          })}
        </nav>

        <div data-ui className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
          <ThemeSwitcher minimal />
          <LanguageSwitcher compact minimal />
          {status === "loading" ? <Skeleton className="hidden h-11 w-24 rounded-xl sm:block" /> : destination && session?.user ? <div className="hidden sm:block"><AccountMenu user={session.user} destination={destination} onSwitch={() => openAuth("login", true)} /></div> : <><Button
            variant="ghost"
            size="sm"
            onClick={() => openAuth("login")}
            className="hidden text-foreground/80 hover:text-primary sm:inline-flex"
          >
            <LogIn className="mr-1.5 h-4 w-4" />
            <span className="hidden md:inline">{t("nav.login")}</span>
          </Button>
          <Button
            size="sm"
            onClick={() => openAuth("register")}
            className="hidden bg-primary text-primary-foreground hover:bg-primary/90 sm:inline-flex"
          >
            <UserPlus className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">{t("nav.register")}</span>
          </Button></>}

          <div className="xl:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative size-11 sm:size-9" aria-label={c.menu}>
                  <Menu className="h-5 w-5" />
                  {destination && <span className="absolute end-1.5 top-1.5 size-1.5 rounded-full bg-primary" aria-hidden="true" />}
                </Button>
              </SheetTrigger>
              <SheetContent side={sheetSide} showCloseButton={false} onCloseAutoFocus={event => { if (authOpen) event.preventDefault(); }} className="w-[min(21rem,90vw)] gap-0 overflow-y-auto overscroll-contain bg-card p-0">
                <SheetTitle className="sr-only">{c.menu}</SheetTitle><SheetDescription className="sr-only">{brandName}</SheetDescription>
                <div className="flex items-center justify-between border-b border-border/50 p-4">
                  <span className="font-display text-lg font-bold uppercase">
                    {brandName || "Coach Oussama"}
                  </span>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="size-11 shrink-0" aria-label={c.close}>
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetClose>
                </div>
                <div className="p-3 pb-0">{status === "loading" ? <Skeleton className="h-36 w-full rounded-2xl" /> : destination && session?.user ? <RememberedAccount user={session.user} destination={destination} onSwitch={() => openAuth("login", true)} /> : null}</div>
                <nav aria-label="Mobile" className="flex flex-col gap-0.5 p-3">
                  {navigation.map((n) => (
                    <SheetClose asChild key={n.href}>
                      <Link
                        href={n.href}
                        className={cn(
                          "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                          active === n.href
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/80 hover:bg-accent hover:text-foreground"
                        )}
                      >
                        {t(n.key)}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="space-y-2 bg-secondary/50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                  {!destination && status !== "loading" && <>
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-border/60"
                      onClick={() => openAuth("login")}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      {t("nav.login")}
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => openAuth("register")}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      {t("nav.register")}
                    </Button>
                  </SheetClose>
                  </>}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium">
                      {t("nav.language")}
                    </span>
                    <LanguageSwitcher />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab={authTab} switchingAccount={switching} />
    </header>
  );
}

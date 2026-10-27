"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X, Dumbbell, LogIn, UserPlus } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { LanguageSwitcher } from "./language-switcher";
import { AuthModal } from "@/components/auth/auth-modal";
import { cn } from "@/lib/utils";

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
  const isRTL = locale === "ar";
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [active, setActive] = useState<string>("");
  const navigation = NAV.filter((item) => (item.href !== "#results" || showResults) && (item.href !== "#testimonials" || showTestimonials));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const openAuth = (tab: "login" | "register") => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  // Sheet opens from the start side (respects RTL)
  const sheetSide: "left" | "right" = isRTL ? "left" : "right";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-border/50 bg-background/85 backdrop-blur-xl"
          : "bg-gradient-to-b from-background/70 via-background/30 to-transparent backdrop-blur-[2px]"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="#top" className="flex shrink-0 items-center gap-2" aria-label={brandName || "Coach Oussama"}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Dumbbell className="h-5 w-5" />
          </span>
          <span className="font-display text-base font-bold uppercase tracking-tight sm:text-lg">
            {brandName || "Coach Oussama"}
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-0.5 lg:flex"
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

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher compact />
          <Button
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
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <UserPlus className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">{t("nav.register")}</span>
          </Button>

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={sheetSide} className="w-[300px] bg-card p-0">
                <div className="flex items-center justify-between border-b border-border/50 p-4">
                  <span className="font-display text-lg font-bold uppercase">
                    {brandName || "Coach Oussama"}
                  </span>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" aria-label="Close">
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetClose>
                </div>
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
                <div className="space-y-2 border-t border-border/50 p-3">
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
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
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

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab={authTab} />
    </header>
  );
}

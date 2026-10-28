"use client";

import { useState } from "react";
import Link from "next/link";
import { UserRound, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { ThemeSwitcher } from "@/components/site/theme-switcher";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { Button } from "@/components/ui/button";
import { AuthModal } from "./auth-modal";
import { accountCopy } from "./account-copy";

export function AccountLogin() {
  const { locale } = useI18n(); const c = accountCopy[locale];
  const [open, setOpen] = useState(false);
  return <main className="min-h-screen bg-grid px-4 py-6 sm:py-10">
    <div className="mx-auto flex max-w-5xl items-center justify-between gap-3"><Link href="/" className="text-sm text-muted-foreground hover:text-primary">{c.back}</Link><div className="flex shrink-0 gap-1"><ThemeSwitcher /><LanguageSwitcher compact /></div></div>
    <section className="mx-auto mt-8 max-w-md space-y-4 rounded-2xl border border-border bg-card p-5 sm:mt-14 sm:p-8"><span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><UserRound className="size-6" /></span><h1 className="font-display text-3xl">{c.loginTitle}</h1><p className="text-sm leading-relaxed text-muted-foreground">{c.loginIntro}</p><Button className="min-h-12 h-auto w-full whitespace-normal rounded-xl py-3" onClick={() => setOpen(true)}>{c.login}<ArrowRight className="size-4 rtl:rotate-180" /></Button><p className="text-xs leading-relaxed text-muted-foreground">{c.persistence}</p></section>
    <AuthModal open={open} onOpenChange={setOpen} />
  </main>;
}

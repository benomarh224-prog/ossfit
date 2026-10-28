"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { locales, type Locale } from "@/lib/i18n/dictionary";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Languages, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const HINT = { en: "Browse in the language you prefer.", fr: "Naviguez dans la langue de votre choix.", ar: "تصفح الموقع باللغة اللي كتفضّل." };
const DESCRIPTIONS = { en: "Continue in English", fr: "Continuer en français", ar: "المتابعة باللغة العربية" };

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const current = locales.find((l) => l.code === locale) ?? locales[0];
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "icon" : "sm"}
          className={`${compact ? "size-11 sm:size-9" : "min-h-11 px-3"} shrink-0 gap-2 rounded-full border border-border/60 bg-card/70 text-foreground/80 shadow-sm hover:border-primary/40 hover:bg-accent hover:text-primary`}
          aria-label={t("nav.language") || "Language"}
        >
          <Languages className="h-4 w-4" />
          {!compact && <span className="font-semibold">{current.flag}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} collisionPadding={12} dir={locale === "ar" ? "rtl" : "ltr"} aria-label={t("nav.language")} className="w-72 max-w-[calc(100vw_-_1.5rem)] rounded-2xl border-border/80 bg-popover p-4 shadow-xl shadow-black/10">
        <p className="text-sm font-semibold">{t("nav.language")}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{HINT[locale]}</p>
        <RadioGroup.Root value={locale} onValueChange={(value) => { setLocale(value as Locale); setOpen(false); }} aria-label={t("nav.language")} dir={locale === "ar" ? "rtl" : "ltr"} className="mt-3 grid gap-2">
          {locales.map((l) => <RadioGroup.Item key={l.code} value={l.code} className="group flex min-h-16 items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-start outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=checked]:border-primary/25 data-[state=checked]:bg-primary/5">
            <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-xs font-bold text-muted-foreground group-data-[state=checked]:bg-primary group-data-[state=checked]:text-primary-foreground">{l.code === "ar" ? "ع" : l.flag}</span>
            <span className="min-w-0"><span lang={l.code} dir={l.code === "ar" ? "rtl" : "ltr"} className="block text-sm font-semibold">{l.label}</span><span lang={l.code} dir={l.code === "ar" ? "rtl" : "ltr"} className="mt-0.5 block text-[11px] text-muted-foreground">{DESCRIPTIONS[l.code]}</span></span>
            <RadioGroup.Indicator className="ms-auto text-primary"><Check className="size-4" aria-hidden="true" /></RadioGroup.Indicator>
          </RadioGroup.Item>)}
        </RadioGroup.Root>
      </PopoverContent>
    </Popover>
  );
}

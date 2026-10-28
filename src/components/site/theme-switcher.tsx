"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Check, Monitor, Moon, Sun, SunMoon } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const COPY = {
  en: { title: "Appearance", hint: "Make yourself comfortable.", light: "Light", dark: "Dark", system: "Match your device", auto: "Switch automatically" },
  fr: { title: "Apparence", hint: "Choisissez votre ambiance.", light: "Clair", dark: "Sombre", system: "Selon l’appareil", auto: "Changement automatique" },
  ar: { title: "المظهر", hint: "اختار المظهر اللي يريحك.", light: "نهاري", dark: "ليلي", system: "حسب الجهاز", auto: "التبديل بشكل تلقائي" },
};

function ThemePreview({ dark }: { dark: boolean }) {
  return <span aria-hidden="true" className={`relative block h-16 overflow-hidden rounded-lg border p-2 ${dark ? "border-white/10 bg-[#17191d]" : "border-black/10 bg-[#f7f8f5]"}`}>
    <span className={`mb-2 flex h-2 items-center gap-1 border-b pb-2 ${dark ? "border-white/10" : "border-black/10"}`}>
      <span className={`size-1.5 rounded-full ${dark ? "bg-lime-400" : "bg-[#386a00]"}`} />
      <span className={`h-1 w-8 rounded-full ${dark ? "bg-white/35" : "bg-black/25"}`} />
    </span>
    <span className={`block h-1.5 w-12 rounded-full ${dark ? "bg-white/80" : "bg-black/70"}`} />
    <span className={`mt-1 block h-1 w-16 rounded-full ${dark ? "bg-white/20" : "bg-black/15"}`} />
    <span className={`mt-2 block h-2.5 w-9 rounded ${dark ? "bg-lime-400" : "bg-[#386a00]"}`} />
  </span>;
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { locale } = useI18n();
  const c = COPY[locale];
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="size-11 shrink-0 rounded-full border border-border/60 bg-card/70 text-foreground/80 shadow-sm hover:border-primary/40 hover:bg-accent hover:text-primary sm:size-9" aria-label={c.title} title={c.title} disabled={!mounted}>
          <SunMoon className="h-4 w-4" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} collisionPadding={12} dir={locale === "ar" ? "rtl" : "ltr"} aria-label={c.title} className="w-72 max-w-[calc(100vw_-_1.5rem)] rounded-2xl border-border/80 bg-popover p-4 shadow-xl shadow-black/10">
        <p className="text-sm font-semibold">{c.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{c.hint}</p>
        <RadioGroup.Root value={mounted ? theme : undefined} onValueChange={setTheme} aria-label={c.title} dir={locale === "ar" ? "rtl" : "ltr"} className="mt-3 grid grid-cols-2 gap-2">
          {(["light", "dark"] as const).map((value) => {
            const Icon = value === "light" ? Sun : Moon;
            return <RadioGroup.Item key={value} value={value} className="rounded-xl border border-border bg-background p-2 text-start outline-none transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=checked]:border-primary data-[state=checked]:bg-primary/5">
              <ThemePreview dark={value === "dark"} />
              <span className="mt-2 flex items-center gap-1.5 px-0.5 text-xs font-semibold">
                <Icon className="size-3.5" aria-hidden="true" />{c[value]}
                <RadioGroup.Indicator className="ms-auto text-primary"><Check className="size-3.5" aria-hidden="true" /></RadioGroup.Indicator>
              </span>
            </RadioGroup.Item>;
          })}
          <RadioGroup.Item value="system" className="col-span-2 flex min-h-14 items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 text-start outline-none transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=checked]:border-primary data-[state=checked]:bg-primary/5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary"><Monitor className="size-4" aria-hidden="true" /></span>
            <span className="min-w-0"><span className="block text-xs font-semibold">{c.system}</span><span className="mt-0.5 block text-[11px] text-muted-foreground">{c.auto}</span></span>
            <RadioGroup.Indicator className="ms-auto text-primary"><Check className="size-4" aria-hidden="true" /></RadioGroup.Indicator>
          </RadioGroup.Item>
        </RadioGroup.Root>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, SunMoon } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const COPY = {
  en: { title: "Appearance", light: "Light", dark: "Dark", system: "Use device setting" },
  fr: { title: "Apparence", light: "Clair", dark: "Sombre", system: "Selon l’appareil" },
  ar: { title: "المظهر", light: "الوضع النهاري", dark: "الوضع الليلي", system: "حسب إعدادات الجهاز" },
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { locale } = useI18n();
  const c = COPY[locale];
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <DropdownMenu dir={locale === "ar" ? "rtl" : "ltr"}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 text-foreground/80 hover:text-primary" aria-label={c.title} title={c.title} disabled={!mounted}>
          <SunMoon className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel>{c.title}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={mounted ? theme : ""} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light" className="rtl:pr-8 rtl:pl-2 [&>span]:rtl:left-auto [&>span]:rtl:right-2"><Sun className="h-4 w-4" aria-hidden="true" />{c.light}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="rtl:pr-8 rtl:pl-2 [&>span]:rtl:left-auto [&>span]:rtl:right-2"><Moon className="h-4 w-4" aria-hidden="true" />{c.dark}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" className="rtl:pr-8 rtl:pl-2 [&>span]:rtl:left-auto [&>span]:rtl:right-2"><Monitor className="h-4 w-4" aria-hidden="true" />{c.system}</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

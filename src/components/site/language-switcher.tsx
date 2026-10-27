"use client";

import { useI18n } from "@/lib/i18n/i18n-provider";
import { locales } from "@/lib/i18n/dictionary";
import { Languages, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const current = locales.find((l) => l.code === locale) ?? locales[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "icon" : "sm"}
          className="gap-2 text-foreground/80 hover:text-primary"
          aria-label={t("nav.language") || "Language"}
        >
          <Languages className="h-4 w-4" />
          {!compact && <span className="font-semibold">{current.flag}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLocale(l.code)}
            className="flex items-center justify-between gap-2"
          >
            <span>
              <span className="mr-2 font-bold text-xs">{l.flag}</span>
              {l.label}
            </span>
            {locale === l.code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

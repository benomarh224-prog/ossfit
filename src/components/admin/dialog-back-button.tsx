"use client";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n-provider";

export function DialogBackButton({ onBack }: { onBack: () => void }) {
  const { locale } = useI18n();
  return <Button type="button" variant="ghost" className="min-h-11 shrink-0 gap-1 px-2" onClick={onBack}><ArrowLeft className="size-4 rtl:rotate-180" />{locale === "ar" ? "رجوع" : locale === "fr" ? "Retour" : "Back"}</Button>;
}

"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n-provider";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { locale } = useI18n();
  return <main className="flex min-h-[80vh] items-center justify-center px-6"><div className="max-w-lg space-y-5 text-center">
    <p className="text-xs font-bold tracking-[.2em] text-primary">COACH OUSSAMA</p>
    <h1 className="font-display text-3xl">{locale === "ar" ? "تعذر تحميل هذه الصفحة" : locale === "fr" ? "La page n'a pas pu se charger" : "Let's get you back on track."}</h1>
    <p className="text-muted-foreground">{locale === "ar" ? "حاول مرة أخرى. إذا استمر المشكل، تواصل مع المدرب." : locale === "fr" ? "Réessayez. Si le problème persiste, contactez le coach." : "Please try again. If the issue continues, contact your coach."}</p>
    <div className="flex justify-center gap-3"><Button onClick={reset}>{locale === "ar" ? "حاول مجددا" : locale === "fr" ? "Réessayer" : "Try again"}</Button><Button asChild variant="outline"><Link href="/">{locale === "ar" ? "الرئيسية" : locale === "fr" ? "Accueil" : "Home"}</Link></Button></div>
  </div></main>;
}

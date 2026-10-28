"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { ThemeSwitcher } from "@/components/site/theme-switcher";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recoveryCopy } from "./recovery-copy";
import { accountCopy } from "./account-copy";

const COPY = {
  en: { title: "Your coaching workspace.", intro: "Sign in with the coach account created through your private owner setup link.", badge: "Coach administration", client: "A subscriber account is currently signed in. Enter your coach credentials below to switch accounts.", email: "Coach email", password: "Password", login: "Open administration", error: "Unable to sign in as coach. Check your coach email and password. Regular subscriber accounts cannot access administration.", back: "Back to website", logout: "Sign out of subscriber account" },
  fr: { title: "Votre espace coaching.", intro: "Connectez-vous avec le compte coach créé via votre lien privé de configuration.", badge: "Administration du coach", client: "Un compte abonné est connecté. Saisissez les identifiants du coach ci-dessous pour changer de compte.", email: "Email du coach", password: "Mot de passe", login: "Ouvrir l’administration", error: "Connexion coach impossible. Vérifiez l’email et le mot de passe du coach. Les comptes abonnés n’ont pas accès à l’administration.", back: "Retour au site", logout: "Déconnecter le compte abonné" },
  ar: { title: "مساحة التدريب ديالك.", intro: "دخل بالحساب ديال المدرب اللي تفعّل من رابط الإعداد الخاص.", badge: "إدارة المدرب", client: "دابا داخل بحساب مشترك. دخل معلومات حساب المدرب لتحت باش تبدل الحساب.", email: "إيميل المدرب", password: "كلمة السر", login: "الدخول للإدارة", error: "تعذر الدخول كمدرب. راجع إيميل وكلمة سر المدرب. حسابات المشتركين ما عندهاش صلاحية الإدارة.", back: "الرجوع للموقع", logout: "الخروج من حساب المشترك" },
};

export function AdminLogin({ clientSignedIn }: { clientSignedIn: boolean }) {
  const { locale } = useI18n();
  const c = COPY[locale];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const fields = new FormData(event.currentTarget);
    setLoading(true); setError(false);
    try {
      const result = await signIn("credentials", {
        email: String(fields.get("email") ?? "").trim(), password: String(fields.get("password") ?? ""),
        portal: "admin", redirect: false, callbackUrl: "/admin",
      });
      if (!result?.ok || result.error) { setError(true); return; }
      // A full navigation discards the previous account's router and query caches.
      window.location.replace("/admin");
    } catch { setError(true); }
    finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-grid px-4 py-6 sm:py-10">
    <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
      <Link href="/?view=site" className="text-sm font-medium text-muted-foreground hover:text-primary">{c.back}</Link>
      <div className="flex shrink-0 gap-1"><ThemeSwitcher /><LanguageSwitcher compact /></div>
    </div>
    <div className="mx-auto mt-8 max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl shadow-black/5 sm:mt-14 sm:p-8">
      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ShieldCheck className="size-6" aria-hidden="true" /></div>
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">Coach Oussama · {c.badge}</p>
      <h1 className="mt-3 font-display text-3xl uppercase">{c.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.intro}</p>
      {clientSignedIn && <p className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm leading-relaxed" role="status">{c.client}</p>}
      {clientSignedIn && <Button asChild variant="outline" className="mt-3 min-h-11 h-auto w-full whitespace-normal"><a href="/account">{accountCopy[locale].open}</a></Button>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <fieldset disabled={loading} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="admin-email">{c.email}</Label><Input id="admin-email" name="email" type="email" autoComplete="username" dir="ltr" required maxLength={254} /></div>
          <div className="space-y-2"><Label htmlFor="admin-password">{c.password}</Label><Input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={256} /></div>
          {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{c.error}</p>}
          <Button type="submit" className="min-h-12 w-full whitespace-normal py-3" disabled={loading}>{loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4 rtl:rotate-180" />}{c.login}</Button>
        </fieldset>
      </form>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{accountCopy[locale].persistence}</p>
      <Link href="/reset-password" className="mt-3 flex min-h-11 items-center justify-center text-sm font-medium text-primary hover:underline">{recoveryCopy[locale].forgot}</Link>
      {clientSignedIn && <Button variant="ghost" className="mt-3 min-h-11 w-full whitespace-normal text-muted-foreground" disabled={loading} onClick={() => signOut({ callbackUrl: "/admin" })}>{c.logout}</Button>}
    </div>
  </main>;
}

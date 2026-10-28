"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { KeyRound, Loader2, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { buildWhatsappLink } from "@/lib/client-utils";
import { ThemeSwitcher } from "@/components/site/theme-switcher";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recoveryCopy } from "./recovery-copy";

export function ResetPassword({ whatsapp }: { whatsapp: string }) {
  const { locale } = useI18n(); const c = recoveryCopy[locale];
  const keyInput = useRef<HTMLInputElement>(null); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(""); const [saved, setSaved] = useState(false);
  useEffect(() => {
    const value = new URLSearchParams(window.location.hash.slice(1)).get("token");
    if (value) {
      if (keyInput.current) keyInput.current.value = value;
      // Fragments are not sent to the server; remove after reading, before navigation.
      window.history.replaceState(window.history.state, "", window.location.pathname);
    }
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const form = event.currentTarget; const values = new FormData(form);
    const password = String(values.get("password") ?? ""); const token = String(values.get("token") ?? "").trim(); setError("");
    if (password !== values.get("confirm")) { setError(c.mismatch); return; }
    if (new TextEncoder().encode(password).length > 72) { setError(c.invalid); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/account/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: token.trim(), password }) });
      const data = await response.json();
      if (!response.ok) { setError(data.code === "EXPIRED" ? c.expired : data.code === "RATE_LIMIT" ? c.rate : data.code === "INVALID" ? c.invalid : c.error); return; }
      form.reset(); setSaved(true);
      // Clear a cookie for any account previously signed in in this browser.
      await signOut({ redirect: false });
    } catch { setError(c.error); } finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-grid px-4 py-6 sm:py-10">
    <div className="mx-auto flex max-w-4xl items-center justify-between gap-3"><Link href="/?view=site" className="text-sm text-muted-foreground hover:text-primary">{c.back}</Link><div className="flex shrink-0"><ThemeSwitcher /><LanguageSwitcher compact /></div></div>
    <div className="mx-auto mt-6 max-w-md space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-8">
      <KeyRound className="size-8 text-primary" /><h1 className="font-display text-3xl">{c.title}</h1>
      {saved ? <div className="space-y-4" role="status"><p>{c.success}</p><div className="flex flex-wrap gap-2"><Button asChild><a href="/">{c.back}</a></Button><Button asChild variant="outline"><a href="/admin">{c.admin}</a></Button></div></div> : <>
        <p className="text-sm leading-relaxed text-muted-foreground">{c.intro}</p>
        <form onSubmit={submit}><fieldset disabled={busy} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="reset-key">{c.token}</Label><Input ref={keyInput} id="reset-key" name="token" autoComplete="off" spellCheck={false} dir="ltr" required maxLength={43} className="font-mono" /></div>
          <div className="space-y-2"><Label htmlFor="reset-password">{c.password}</Label><Input id="reset-password" name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={72} aria-describedby="reset-hint" /><p id="reset-hint" className="text-xs text-muted-foreground">{c.hint}</p></div>
          <div className="space-y-2"><Label htmlFor="reset-confirm">{c.confirm}</Label><Input id="reset-confirm" name="confirm" type="password" autoComplete="new-password" required minLength={12} maxLength={72} /></div>
          <Button type="submit" disabled={busy} className="min-h-12 h-auto w-full whitespace-normal">{busy && <Loader2 className="size-4 animate-spin" />}{c.save}</Button>
        </fieldset></form>
      </>}
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
    {!saved && <section className="mx-auto mt-5 max-w-md rounded-2xl border border-border bg-card/60 p-5"><h2 className="font-semibold">{c.supportTitle}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.support}</p><Button asChild variant="outline" className="mt-4 min-h-11 h-auto whitespace-normal"><a href={buildWhatsappLink(whatsapp, c.message)} target="_blank" rel="noreferrer"><MessageCircle className="size-4 shrink-0" />{c.contact}</a></Button></section>}
  </main>;
}

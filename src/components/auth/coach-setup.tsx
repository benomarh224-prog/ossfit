"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CoachSetup() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setToken(window.location.hash.slice(1)); }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/setup", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name: form.get("name"), email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Setup failed");
      history.replaceState(null, "", "/setup");
      const login = await signIn("credentials", { email, password, redirect: false });
      if (login?.error) { window.location.href = "/"; return; }
      router.push("/"); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Please try again"); }
    finally { setLoading(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-grid px-4 py-12">
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-2xl">
      <ShieldCheck className="mb-5 h-10 w-10 text-primary" />
      <p className="text-xs font-semibold uppercase tracking-[.22em] text-primary">Coach Oussama · Owner setup</p>
      <h1 className="mt-3 font-display text-3xl uppercase">Your coaching space starts here.</h1>
      <p className="mt-3 text-sm text-muted-foreground">أنشئ حساب المدرب بإيميلك وكلمة مرور خاصة بك. رابط الإعداد يُستخدم مرة واحدة فقط.</p>
      {token ? <form className="mt-7 space-y-4" onSubmit={submit}>
        <div className="space-y-2"><Label htmlFor="setup-name">Name / الاسم</Label><Input id="setup-name" name="name" defaultValue="Oussama" autoComplete="name" required minLength={2} maxLength={80} /></div>
        <div className="space-y-2"><Label htmlFor="setup-email">Coach email / الإيميل</Label><Input id="setup-email" name="email" type="email" autoComplete="email" required maxLength={254} /></div>
        <div className="space-y-2"><Label htmlFor="setup-password">Password / كلمة المرور</Label><Input id="setup-password" name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={72} /><p className="text-xs text-muted-foreground">Use at least 12 characters. Never share your password.</p></div>
        {error && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <Button className="w-full" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} Create coach account</Button>
      </form> : <p className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">Open your private owner setup link to configure this account.</p>}
      <Link className="mt-6 inline-block text-sm text-primary hover:underline" href="/">← Back to website</Link>
    </div>
  </main>;
}

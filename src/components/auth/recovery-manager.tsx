"use client";

import { useState, type FormEvent } from "react";
import { Copy, KeyRound, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recoveryCopy } from "./recovery-copy";

export function RecoveryManager({ clientId }: { clientId?: string }) {
  const { locale } = useI18n(); const c = recoveryCopy[locale];
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [result, setResult] = useState<{ token: string; url: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const form = event.currentTarget;
    const currentPassword = String(new FormData(form).get("currentPassword") ?? "");
    setBusy(true); setError(""); setResult(null); setCopied(false);
    try {
      const response = await fetch("/api/admin/recovery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, ...(clientId ? { clientId } : {}) }) });
      const data = await response.json();
      if (!response.ok) { setError(data.code === "PASSWORD" ? c.wrong : data.code === "RATE_LIMIT" ? c.rate : c.error); return; }
      form.reset(); setResult(data);
    } catch { setError(c.error); } finally { setBusy(false); }
  }
  return <Card className="space-y-4 p-4 sm:p-6">
    <h2 className="flex items-center gap-2 text-lg font-semibold"><KeyRound className="size-5 shrink-0 text-primary" />{clientId ? c.clientTitle : c.backupTitle}</h2>
    <p className="text-sm leading-relaxed text-muted-foreground">{clientId ? c.verify : c.backup}</p>
    {result ? <div className="space-y-3" role="status">
      <p className="text-sm font-medium">{c.generated}</p>
      <Input aria-label={clientId ? c.clientTitle : c.token} readOnly dir="ltr" value={clientId ? result.url : result.token} className="font-mono text-xs" onFocus={e => e.target.select()} />
      <p className="text-xs text-muted-foreground">{c.expires}: {new Date(result.expiresAt).toLocaleString(locale)}</p>
      <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(clientId ? result.url : result.token); setCopied(true); } catch { setError(c.error); } }}><Copy className="size-4" />{copied ? c.copied : c.copy}</Button><Button variant="ghost" onClick={() => { setResult(null); setError(""); }}>{c.hide}</Button></div>
      {!clientId && <p className="text-xs text-muted-foreground">/reset-password</p>}
    </div> : <form onSubmit={submit} className="space-y-3"><fieldset disabled={busy} className="space-y-3">
      <Label htmlFor={clientId ? "client-recovery-password" : "coach-recovery-password"}>{c.current}</Label>
      <Input id={clientId ? "client-recovery-password" : "coach-recovery-password"} name="currentPassword" type="password" autoComplete="current-password" required maxLength={256} />
      <Button type="submit" disabled={busy} className="min-h-11 h-auto whitespace-normal">{busy && <Loader2 className="size-4 animate-spin" />}{clientId ? c.clientGenerate : c.generate}</Button>
    </fieldset></form>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </Card>;
}

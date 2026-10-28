"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { ArrowRight, Check, ChevronDown, LogOut, Repeat2, ShieldCheck, UserRound } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { accountCopy } from "@/components/auth/account-copy";

type AccountProps = { user: { name?: string | null; email?: string | null }; destination: "/account" | "/admin"; onSwitch: () => void };

export function RememberedAccount({ user, destination, onSwitch }: AccountProps) {
  const { locale } = useI18n(); const c = accountCopy[locale];
  const [busy, setBusy] = useState(false); const [error, setError] = useState(false);
  const coach = destination === "/admin";
  async function logout() {
    setBusy(true); setError(false);
    try { await signOut({ callbackUrl: "/" }); }
    catch { setBusy(false); setError(true); }
  }
  return <section className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4" aria-label={c.account}>
    <div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{coach ? <ShieldCheck className="size-5" /> : <UserRound className="size-5" />}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{user.name || user.email}</p><p className="mt-0.5 truncate text-[11px] text-muted-foreground" dir="ltr">{user.email}</p><p className="mt-1 text-[10px] font-medium text-primary">{coach ? c.coach : c.subscriber}</p></div></div>
    <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><Check className="size-3 shrink-0 text-primary" />{c.remembered}</p>
    <Button asChild className="h-auto min-h-11 w-full justify-between gap-2 whitespace-normal rounded-xl py-2.5 text-xs"><a href={destination} aria-disabled={busy} onClick={event => { if (busy) event.preventDefault(); }}>{coach ? c.coach : c.open}<ArrowRight className="size-3.5 shrink-0 rtl:rotate-180" /></a></Button>
    <div className="grid grid-cols-2 gap-1"><Button variant="ghost" className="h-auto min-h-11 gap-1.5 whitespace-normal px-1 py-2 text-[11px]" disabled={busy} onClick={onSwitch}><Repeat2 className="size-3.5 shrink-0" />{c.switchAccount}</Button><Button variant="ghost" className="h-auto min-h-11 gap-1.5 whitespace-normal px-1 py-2 text-[11px] text-muted-foreground" disabled={busy} onClick={logout}><LogOut className="size-3.5 shrink-0" />{c.logout}</Button></div>
    <p className="text-[10px] leading-relaxed text-muted-foreground">{c.single}</p>
    {error && <p role="alert" className="text-xs text-destructive">{c.failed}</p>}
  </section>;
}

export function AccountMenu(props: AccountProps) {
  const { locale } = useI18n(); const c = accountCopy[locale]; const [open, setOpen] = useState(false);
  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button variant="outline" className="min-h-11 gap-2 rounded-xl px-3 text-xs shadow-none"><UserRound className="size-4" />{c.account}<ChevronDown className="size-3.5" /></Button></PopoverTrigger><PopoverContent align="end" sideOffset={10} collisionPadding={12} dir={locale === "ar" ? "rtl" : "ltr"} className="w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl p-2"><RememberedAccount {...props} onSwitch={() => { setOpen(false); props.onSwitch(); }} /></PopoverContent></Popover>;
}

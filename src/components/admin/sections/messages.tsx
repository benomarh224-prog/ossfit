"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MessageSquare, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { Conversation } from "@/components/conversation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, type AdminClient } from "../lib";
import { ErrorState, SectionLoading, SectionShell } from "../ui-bits";

export default function MessagesSection() {
  const { t, locale } = useI18n(); const [selected, setSelected] = useState<AdminClient | null>(null); const [search, setSearch] = useState("");
  const clients = useQuery<{ clients: AdminClient[] }>({ queryKey: ["admin", "clients"], queryFn: () => apiFetch("/api/admin/clients") });
  const threads = useQuery<{ threads: { clientId: string; unread: number }[] }>({ queryKey: ["admin", "message-threads"], queryFn: () => apiFetch("/api/messages"), refetchInterval: 30_000 });
  const counts = new Map(threads.data?.threads.map(t => [t.clientId, t.unread]));
  const list = (clients.data?.clients ?? []).filter(c => `${c.name} ${c.email}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));
  const back = locale === "ar" ? "الرجوع للمشتركين" : locale === "fr" ? "Retour aux clients" : "Back to clients";
  const hint = locale === "ar" ? "اختار مشترك باش تقرا الرسائل وتجاوبو." : locale === "fr" ? "Choisissez un client pour lire et répondre." : "Choose a client to read and reply.";
  return <SectionShell title={t("dashboard.messages")} description={hint}>
    {selected ? <div className="space-y-3"><div className="flex flex-wrap items-center gap-3"><Button variant="outline" className="min-h-11" onClick={() => { setSelected(null); void threads.refetch(); }}><ArrowLeft className="size-4 rtl:rotate-180" />{back}</Button><div className="min-w-0"><h3 className="break-words font-semibold">{selected.name}</h3><p className="break-all text-xs text-muted-foreground">{selected.email}</p></div></div><Conversation key={selected.id} clientId={selected.id} /></div> : <>
      <div className="relative max-w-md"><Search className="pointer-events-none absolute start-3 top-3 size-4 text-muted-foreground" /><Input aria-label={t("admin.clients")} className="min-h-11 ps-10" value={search} onChange={e => setSearch(e.target.value)} placeholder={t("admin.clients")} /></div>
      {clients.isPending ? <SectionLoading rows={4} /> : clients.isError ? <ErrorState onRetry={() => clients.refetch()} /> : <div className="grid gap-2 sm:grid-cols-2">{list.map(c => <button key={c.id} type="button" onClick={() => setSelected(c)} className="flex min-h-20 min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-4 text-start hover:border-primary/40"><MessageSquare className="size-5 shrink-0 text-primary" /><span className="min-w-0 flex-1"><span className="block truncate font-medium">{c.name ?? c.email}</span><span className="block truncate text-xs text-muted-foreground">{c.email}</span></span>{!!counts.get(c.id) && <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">{counts.get(c.id)}</span>}</button>)}{!list.length && <p className="py-6 text-sm text-muted-foreground">{locale === "ar" ? "ما كاين حتى مشترك مطابق." : locale === "fr" ? "Aucun client trouvé." : "No matching clients."}</p>}</div>}
    </>}
  </SectionShell>;
}

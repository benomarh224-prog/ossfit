"use client";

import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Send, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { apiFetch } from "@/lib/client-utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Message = { id: string; body: string; sender: string; createdAt: string };
const COPY = {
  en: { older: "Load older messages", empty: "Start your conversation here.", send: "Send message", input: "Your message", failed: "Unable to load messages.", retry: "Try again", sending: "Sending…" },
  fr: { older: "Messages précédents", empty: "Commencez votre conversation ici.", send: "Envoyer", input: "Votre message", failed: "Impossible de charger les messages.", retry: "Réessayer", sending: "Envoi…" },
  ar: { older: "تحميل الرسائل القديمة", empty: "بدا المحادثة ديالك من هنا.", send: "إرسال الرسالة", input: "الرسالة ديالك", failed: "تعذر تحميل الرسائل.", retry: "عاود المحاولة", sending: "جاري الإرسال…" },
};
export function Conversation({ clientId }: { clientId?: string }) {
  const { data: session } = useSession(); const { locale } = useI18n(); const c = COPY[locale];
  const qc = useQueryClient(); const [text, setText] = useState(""); const scroller = useRef<HTMLDivElement>(null); const nearBottom = useRef(true);
  const key = ["conversation", session?.user.id, clientId ?? "self"];
  const query = useInfiniteQuery({ queryKey: key, initialPageParam: "", queryFn: ({ pageParam }) => {
    const params = new URLSearchParams(); if (clientId) params.set("clientId", clientId); if (pageParam) params.set("before", pageParam);
    return apiFetch<{ messages: Message[]; nextCursor: string | null }>(`/api/messages?${params}`);
  }, getNextPageParam: page => page.nextCursor ?? undefined, refetchInterval: 30_000, enabled: !!session?.user.id });
  const messages = [...(query.data?.pages ?? [])].reverse().flatMap(p => p.messages);
  // Refetches may overlap page boundaries after a new message; display each ID once.
  const unique = [...new Map(messages.map(m => [m.id, m])).values()];
  const latestId = unique.at(-1)?.id;
  useEffect(() => { if (nearBottom.current && scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [latestId]);
  const send = useMutation({ mutationFn: (body: string) => apiFetch("/api/messages", { json: { body, ...(clientId ? { clientId } : {}) } }), onSuccess: () => {
    setText(""); nearBottom.current = true;
    void qc.invalidateQueries({ queryKey: key }); void qc.invalidateQueries({ queryKey: ["admin", "message-threads"] }); void qc.invalidateQueries({ queryKey: ["notifications"] }); void qc.invalidateQueries({ queryKey: ["me"] });
  } });
  return <div className="flex h-[min(65dvh,38rem)] min-h-80 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
    <div ref={scroller} onScroll={e => { const el = e.currentTarget; nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100; }} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 sm:p-4" role="log" aria-label={c.input}>
      {query.hasNextPage && <Button variant="outline" className="mx-auto flex min-h-11" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>{query.isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}{c.older}</Button>}
      {query.isPending && <Loader2 className="mx-auto size-5 animate-spin" />}
      {query.isError && <p role="alert" className="text-sm text-destructive">{c.failed}<Button variant="ghost" onClick={() => query.refetch()}>{c.retry}</Button></p>}
      {!query.isPending && !query.isError && !unique.length && <p className="py-10 text-center text-sm text-muted-foreground">{c.empty}</p>}
      {unique.map(m => <div key={m.id} className={`flex ${m.sender === session?.user.role ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm sm:max-w-[80%] ${m.sender === session?.user.role ? "bg-primary text-primary-foreground" : "border border-border bg-secondary"}`}><p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{m.body}</p><time dateTime={m.createdAt} className="mt-1 block text-[10px] opacity-65">{new Date(m.createdAt).toLocaleString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time></div></div>)}
    </div>
    <form className="space-y-2 border-t border-border p-3" onSubmit={e => { e.preventDefault(); if (text.trim() && !send.isPending) send.mutate(text.trim()); }}>
      {send.isError && <p role="alert" className="text-xs text-destructive">{send.error instanceof Error ? send.error.message : c.failed}</p>}
      <div className="flex items-end gap-2"><Textarea aria-label={c.input} placeholder={c.input} rows={2} maxLength={4000} value={text} disabled={send.isPending} onChange={e => setText(e.target.value)} className="max-h-32 min-h-12 flex-1 resize-y" /><Button type="submit" size="icon" className="size-12 shrink-0" disabled={!text.trim() || send.isPending} aria-label={send.isPending ? c.sending : c.send}>{send.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 rtl:rotate-180" />}</Button></div>
    </form>
  </div>;
}

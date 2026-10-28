"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { apiFetch } from "@/lib/client-utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Notice = { id: string; title: string; body: string; type: string; read: boolean; createdAt: string };
const COPY = {
  en: { title: "Notifications", empty: "You're all caught up. New updates will appear here.", read: "Mark displayed as read", error: "Unable to load notifications.", retry: "Try again" },
  fr: { title: "Notifications", empty: "Tout est à jour. Les nouveautés apparaîtront ici.", read: "Marquer les notifications affichées comme lues", error: "Impossible de charger les notifications.", retry: "Réessayer" },
  ar: { title: "الإشعارات", empty: "ما كاين حتى إشعار دابا. التحديثات الجديدة غادي تبان هنا.", read: "تعليم الإشعارات الظاهرة كمقروءة", error: "تعذر تحميل الإشعارات.", retry: "عاود المحاولة" },
};
export function Notifications({ onNavigate }: { onNavigate: (type: string) => void }) {
  const { data: session } = useSession(); const qc = useQueryClient();
  const { locale } = useI18n(); const dir = locale === "ar" ? "rtl" : "ltr"; const c = COPY[locale]; const [open, setOpen] = useState(false);
  const key = ["notifications", session?.user.id];
  const query = useQuery<{ notifications: Notice[]; unread: number }>({ queryKey: key, queryFn: () => apiFetch("/api/notifications"), enabled: !!session?.user.id, staleTime: 30_000 });
  const mark = useMutation({ mutationFn: (ids: string[]) => apiFetch("/api/notifications", { method: "PATCH", json: { ids } }), onSuccess: () => qc.invalidateQueries({ queryKey: key }) });
  const unread = query.data?.unread ?? 0;
  return <Popover open={open} onOpenChange={value => { setOpen(value); if (value) void query.refetch(); }}>
    <PopoverTrigger asChild><Button variant="ghost" size="icon" className="relative size-11 shrink-0" aria-label={`${c.title}${unread ? ` (${unread})` : ""}`}><Bell className="size-5" />{unread > 0 && <span aria-hidden="true" className="absolute end-0 top-0 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{unread > 99 ? "99+" : unread}</span>}</Button></PopoverTrigger>
    <PopoverContent align="end" sideOffset={10} collisionPadding={12} dir={dir} className="w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl p-0 shadow-xl">
      <div className="space-y-2 border-b border-border p-4"><h2 className="font-semibold">{c.title}</h2>{query.data?.notifications.some(n => !n.read) && <Button variant="ghost" size="sm" className="h-auto min-h-11 max-w-full whitespace-normal text-start text-xs" disabled={mark.isPending} onClick={() => mark.mutate(query.data!.notifications.filter(n => !n.read).map(n => n.id))}><CheckCheck className="size-4 shrink-0" />{c.read}</Button>}</div>
      {(query.isError || mark.isError) && <p role="alert" className="p-4 text-sm text-destructive">{c.error}<Button variant="ghost" size="sm" onClick={() => { mark.reset(); void query.refetch(); }}>{c.retry}</Button></p>}
      {query.isPending ? <div className="flex justify-center p-6"><Loader2 className="size-5 animate-spin" /></div> : <div className="max-h-[min(60dvh,26rem)] overflow-y-auto overscroll-contain">
        {!query.data?.notifications.length && !query.isError && <p className="p-5 text-sm leading-relaxed text-muted-foreground">{c.empty}</p>}
        {query.data?.notifications.map(n => <button type="button" key={n.id} className={`flex w-full gap-3 border-b border-border/50 p-4 text-start last:border-0 hover:bg-accent ${!n.read ? "bg-primary/5" : ""}`} onClick={() => { if (!n.read) mark.mutate([n.id]); setOpen(false); onNavigate(n.type); }}>
          <span aria-hidden="true" className={`mt-1.5 size-2 shrink-0 rounded-full ${n.read ? "bg-muted" : "bg-primary"}`} /><span className="min-w-0 space-y-1"><span className="block break-words text-sm font-medium">{n.title}</span><span className="block break-words text-xs leading-relaxed text-muted-foreground">{n.body}</span><time className="block text-[10px] text-muted-foreground" dateTime={n.createdAt}>{new Date(n.createdAt).toLocaleString(locale)}</time></span>
        </button>)}
      </div>}
    </PopoverContent>
  </Popover>;
}

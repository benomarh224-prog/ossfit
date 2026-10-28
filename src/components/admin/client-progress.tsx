"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { apiFetch } from "@/lib/client-utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SectionLoading, ErrorState } from "./ui-bits";

type CheckIn = { id: string; weekLabel: string; weightKg: number | null; sleepHours: number | null; energyLevel: number | null; adherencePercent: number | null; notes: string | null; coachReply: string | null; updatedAt: string; createdAt: string };
type Photo = { id: string; url: string; type: string; note: string | null; takenAt: string };
const COPY = {
  en: { checkins: "Latest 20 check-ins", photos: "Latest 12 progress photos", empty: "No updates yet.", reply: "Coach feedback", save: "Save feedback", edit: "Write / edit feedback", cancel: "Cancel", refresh: "Refresh", private: "Private progress photos. Do not publish without client consent.", weight: "Weight", energy: "Energy", sleep: "Sleep", adherence: "Adherence" },
  fr: { checkins: "20 derniers bilans", photos: "12 dernières photos de suivi", empty: "Aucune mise à jour.", reply: "Retour du coach", save: "Enregistrer le retour", edit: "Écrire / modifier le retour", cancel: "Annuler", refresh: "Actualiser", private: "Photos de suivi privées. Ne pas publier sans l’accord du client.", weight: "Poids", energy: "Énergie", sleep: "Sommeil", adherence: "Assiduité" },
  ar: { checkins: "آخر 20 تتبع أسبوعي", photos: "آخر 12 صورة للتقدم", empty: "ما كاين حتى تحديث دابا.", reply: "ملاحظات الكوتش", save: "حفظ الملاحظات", edit: "كتابة أو تعديل الملاحظات", cancel: "إلغاء", refresh: "تحديث", private: "صور التقدم خاصة. ما تنشرهاش بلا موافقة المشترك.", weight: "الوزن", energy: "الطاقة", sleep: "النوم", adherence: "الالتزام" },
};
export function ClientProgress({ clientId }: { clientId: string }) {
  const { locale } = useI18n(); const c = COPY[locale];
  const query = useQuery<{ checkIns: CheckIn[]; photos: Photo[] }>({ queryKey: ["admin", "client-progress", clientId], queryFn: () => apiFetch(`/api/admin/clients/${clientId}`) });
  if (query.isPending) return <SectionLoading rows={3} />;
  if (query.isError) return <ErrorState onRetry={() => query.refetch()} />;
  return <div className="space-y-5 border-t border-border pt-5">
    <section className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{c.checkins}</h3><Button variant="ghost" size="sm" onClick={() => query.refetch()}>{c.refresh}</Button></div>
      {!query.data.checkIns.length && <p className="text-sm text-muted-foreground">{c.empty}</p>}
      {query.data.checkIns.map(checkin => <CheckInFeedback key={`${checkin.id}:${checkin.updatedAt}`} checkin={checkin} clientId={clientId} />)}
    </section>
    <section className="space-y-3"><h3 className="font-semibold">{c.photos}</h3><p className="text-xs text-muted-foreground">{c.private}</p>{!query.data.photos.length ? <p className="text-sm text-muted-foreground">{c.empty}</p> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{query.data.photos.map(photo => <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer" className="min-w-0 space-y-1"><img src={photo.url} alt={photo.type} loading="lazy" className="aspect-[3/4] w-full rounded-xl border border-border object-cover" /><p className="text-xs text-muted-foreground">{new Date(photo.takenAt).toLocaleDateString(locale)}</p>{photo.note && <p className="break-words text-xs">{photo.note}</p>}</a>)}</div>}</section>
  </div>;
}
function CheckInFeedback({ checkin, clientId }: { checkin: CheckIn; clientId: string }) {
  const { locale } = useI18n(); const c = COPY[locale]; const qc = useQueryClient();
  const [editing, setEditing] = useState(false); const [reply, setReply] = useState(checkin.coachReply ?? "");
  const save = useMutation({ mutationFn: () => apiFetch(`/api/admin/checkins/${checkin.id}`, { method: "PATCH", json: { coachReply: reply, expectedUpdatedAt: checkin.updatedAt } }), onSuccess: () => { setEditing(false); void qc.invalidateQueries({ queryKey: ["admin", "client-progress", clientId] }); } });
  return <article className="space-y-3 rounded-xl border border-border p-3"><div><h4 className="break-words text-sm font-semibold">{checkin.weekLabel}</h4><time className="text-xs text-muted-foreground">{new Date(checkin.createdAt).toLocaleDateString(locale)}</time></div><div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
    {checkin.weightKg != null && <p>{c.weight}: {checkin.weightKg} kg</p>}{checkin.adherencePercent != null && <p>{c.adherence}: {checkin.adherencePercent}%</p>}{checkin.energyLevel != null && <p>{c.energy}: {checkin.energyLevel}/10</p>}{checkin.sleepHours != null && <p>{c.sleep}: {checkin.sleepHours} h</p>}
    </div>{checkin.notes && <p className="whitespace-pre-wrap break-words text-sm">{checkin.notes}</p>}
    {!editing ? <>{checkin.coachReply && <p className="whitespace-pre-wrap break-words rounded-lg bg-primary/5 p-3 text-sm">{c.reply}: {checkin.coachReply}</p>}<Button variant="outline" size="sm" className="min-h-11 h-auto whitespace-normal" onClick={() => setEditing(true)}>{c.edit}</Button></> : <form className="space-y-2" onSubmit={event => { event.preventDefault(); if (!save.isPending && reply.trim()) save.mutate(); }}><Textarea aria-label={c.reply} rows={3} required maxLength={4000} value={reply} disabled={save.isPending} onChange={e => setReply(e.target.value)} /><div className="flex flex-wrap gap-2"><Button type="submit" disabled={save.isPending || !reply.trim()}>{c.save}</Button><Button variant="ghost" type="button" disabled={save.isPending} onClick={() => { setEditing(false); setReply(checkin.coachReply ?? ""); save.reset(); }}>{c.cancel}</Button></div></form>}
    {save.isError && <p role="alert" className="text-xs text-destructive">{save.error instanceof Error ? save.error.message : "Error"}</p>}
  </article>;
}

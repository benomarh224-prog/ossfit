"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { upload } from "@vercel/blob/client";
import { ImagePlus, Loader2, Trash2, ExternalLink } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { MEDIA_TYPES, mediaSizeLimit, type PlanKind } from "@/lib/media-policy";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Attachment = { id: string; name: string; contentType: string; size: number; url: string };
type Registration = { kind: PlanKind; planId: string; name: string; pathname: string; contentType: string };
const COPY = {
  en: { title: "Photos & videos", add: "Add photo or video", hint: "Private to the coach and assigned trainee. Images up to 10 MB; videos up to 100 MB. MP4 is recommended for playback across devices.", empty: "Add exercise demonstrations, meal examples or guidance for this plan.", remove: "Remove", confirm: "Permanently remove this attachment?", open: "Open original", error: "Unable to load or save this file. Please retry.", format: "Choose a JPG, PNG, WebP, MP4, WebM or MOV file within the size limit.", loading: "Uploading", retry: "Retry", saved: "Attached to the plan", wait: "Keep this page open until the upload finishes." },
  fr: { title: "Photos et vidéos", add: "Ajouter une photo ou vidéo", hint: "Privé pour le coach et l’abonné concerné. Images : 10 Mo max ; vidéos : 100 Mo max. MP4 recommandé pour la lecture sur différents appareils.", empty: "Ajoutez des démonstrations, exemples de repas ou conseils à ce programme.", remove: "Supprimer", confirm: "Supprimer définitivement cette pièce jointe ?", open: "Ouvrir l’original", error: "Impossible de charger ou enregistrer ce fichier. Réessayez.", format: "Choisissez un fichier JPG, PNG, WebP, MP4, WebM ou MOV dans la limite de taille.", loading: "Envoi", retry: "Réessayer", saved: "Ajouté au programme", wait: "Gardez cette page ouverte jusqu’à la fin de l’envoi." },
  ar: { title: "الصور والفيديوهات", add: "إضافة صورة أو فيديو", hint: "خاص بالمدرب والمتدرب المعيّن ليه البرنامج. الصور حتى 10 ميغا والفيديو حتى 100 ميغا. صيغة MP4 أفضل للتشغيل على مختلف الأجهزة.", empty: "زيد شرح التمارين، أمثلة الوجبات أو إرشادات لهاد البرنامج.", remove: "حذف", confirm: "واش تحذف هاد المرفق نهائياً؟", open: "فتح الملف الأصلي", error: "تعذر تحميل أو حفظ الملف. عاود المحاولة.", format: "اختار JPG أو PNG أو WebP أو MP4 أو WebM أو MOV بالحجم المسموح.", loading: "جاري الرفع", retry: "إعادة المحاولة", saved: "تضاف للبرنامج", wait: "خلي هاد الصفحة محلولة حتى يسالي الرفع." },
};

async function saveAttachment(body: Registration) {
  const response = await fetch("/api/admin/plan-media", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error("Unable to save attachment");
}

export function PlanMedia({ kind, planId, manage = false }: { kind: PlanKind; planId: string; manage?: boolean }) {
  const { locale } = useI18n();
  const c = COPY[locale];
  const { data: session } = useSession();
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<Registration | null>(null);
  const [saved, setSaved] = useState(false);
  const [caption, setCaption] = useState("");
  const key = ["plan-media", kind, planId];
  const query = useQuery<{ media: Attachment[] }>({ queryKey: key, queryFn: async () => {
    const response = await fetch(`/api/plan-media?kind=${kind}&planId=${encodeURIComponent(planId)}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load attachments");
    return response.json();
  } });

  async function finish(body: Registration) {
    await saveAttachment(body);
    setPending(null); setSaved(true); setCaption("");
    await qc.invalidateQueries({ queryKey: key });
  }

  async function choose(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !session?.user.id || busy) return;
    setError(""); setSaved(false);
    const contentType = file.type || (file.name.toLowerCase().endsWith(".mov") ? "video/quicktime" : "");
    if (!Object.hasOwn(MEDIA_TYPES, contentType) || !file.size || file.size > mediaSizeLimit(contentType)) { setError(c.format); return; }
    const pathname = `coaching/${kind}/${planId}/${session.user.id}/${crypto.randomUUID()}.${MEDIA_TYPES[contentType]}`;
    const body = { kind, planId, name: caption.trim() || file.name.slice(0, 160), contentType, pathname };
    setBusy(true); setProgress(0);
    try {
      await upload(pathname, file, { access: "private", contentType, handleUploadUrl: "/api/admin/plan-media/upload",
        clientPayload: JSON.stringify(body), multipart: file.size > 8 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });
      setPending(body);
      await finish(body);
    } catch { setError(c.error); }
    finally { setBusy(false); }
  }

  async function retry() {
    if (!pending) { await query.refetch(); return; }
    setBusy(true); setError("");
    try { await finish(pending); } catch { setError(c.error); } finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!window.confirm(c.confirm)) return;
    setBusy(true); setProgress(-1); setSaved(false); setError("");
    try {
      const response = await fetch("/api/admin/plan-media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (!response.ok) throw new Error("Unable to delete");
      await qc.invalidateQueries({ queryKey: key });
    } catch { setError(c.error); } finally { setBusy(false); }
  }

  if (!manage && query.isSuccess && !query.data.media.length) return null;
  return <section className="my-4 space-y-3 rounded-xl border border-border bg-card p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-sm font-semibold">{c.title}</h3>
      {manage && <><input ref={input} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.mov" className="hidden" aria-label={c.add} onChange={choose} disabled={busy || !!pending} /><Button type="button" variant="outline" className="min-h-11 whitespace-normal" disabled={busy || !!pending} onClick={() => input.current?.click()}><ImagePlus className="size-4" />{c.add}</Button></>}
    </div>
    {manage && <p className="text-xs leading-relaxed text-muted-foreground">{c.hint}</p>}
    {manage && <div className="space-y-1.5"><Label htmlFor={`media-caption-${kind}-${planId}`} className="text-xs">{locale === "ar" ? "اسم التمرين أو وصف الوجبة (اختياري)" : locale === "fr" ? "Exercice ou description du repas (facultatif)" : "Exercise or meal description (optional)"}</Label><Input id={`media-caption-${kind}-${planId}`} value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={160} disabled={busy || !!pending} /></div>}
    {busy && progress >= 0 && <div role="status" className="space-y-2"><p className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" />{c.loading} {progress > 0 ? `${progress}%` : ""}</p><Progress value={progress} /><p className="text-xs text-muted-foreground">{c.wait}</p></div>}
    {(error || query.isError) && <div role="alert" className="space-y-2"><p className="text-sm text-destructive">{error || c.error}</p><Button type="button" variant="outline" disabled={busy} onClick={retry}>{c.retry}</Button></div>}
    {saved && <p role="status" className="text-xs text-primary">{c.saved}</p>}
    {query.isLoading && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label={c.title} />}
    {manage && query.isSuccess && !query.data.media.length && <p className="text-sm text-muted-foreground">{c.empty}</p>}
    <div className="grid gap-3 sm:grid-cols-2">{query.data?.media.map((item) => <figure key={item.id} className="min-w-0 overflow-hidden rounded-lg border border-border bg-background">
      {item.contentType.startsWith("video/") ? <video controls playsInline preload="metadata" className="max-h-64 w-full bg-black"><source src={item.url} type={item.contentType} /></video> :
        <a href={item.url} target="_blank" rel="noopener noreferrer"><img src={item.url} alt={item.name} loading="lazy" className="max-h-64 w-full object-contain" /></a>}
      <figcaption className="space-y-2 p-3"><p className="break-words text-xs font-medium">{item.name}</p><div className="flex flex-wrap items-center justify-between gap-2"><a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-xs text-primary underline underline-offset-4"><ExternalLink className="size-3.5" />{c.open}</a>{manage && <Button type="button" variant="ghost" size="sm" className="min-h-11 text-destructive" disabled={busy} onClick={() => remove(item.id)}><Trash2 className="size-3.5" />{c.remove}</Button>}</div></figcaption>
    </figure>)}</div>
  </section>;
}

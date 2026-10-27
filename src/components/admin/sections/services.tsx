"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SectionShell, SectionLoading, ErrorState, EmptyState, ImageUpload } from "../ui-bits";
import { apiFetch } from "../lib";

type Service = { id: string; title: string; shortDesc: string; longDesc: string; icon: string; image?: string | null; features: string[]; order: number; published: boolean };
type Payload = Omit<Service, "id">;

export default function ServicesSection() {
  const { t } = useI18n();
  const client = useQueryClient();
  const [editing, setEditing] = useState<Service | "new" | null>(null);
  const query = useQuery<{ services: Service[] }>({ queryKey: ["admin", "services"], queryFn: () => apiFetch("/api/admin/services") });
  const save = useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: Partial<Payload> }) => apiFetch(id ? `/api/admin/services/${id}` : "/api/admin/services", { method: id ? "PATCH" : "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["admin", "services"] });
      client.invalidateQueries({ queryKey: ["site"] });
      setEditing(null); toast.success("Service saved");
    },
    onError: (error) => toast.error(error.message),
  });
  return <SectionShell title={t("nav.services")} description="Manage the services shown on your public website. Hide a service to keep it off the page." actions={<Button onClick={() => setEditing("new")}><Plus className="h-4 w-4" />Add service</Button>}>
    {query.isLoading ? <SectionLoading rows={4} /> : query.isError ? <ErrorState onRetry={() => query.refetch()} /> : !query.data?.services.length ? <EmptyState title="No services yet" description="Add a coaching service to your website." /> : <div className="grid gap-4 md:grid-cols-2">{query.data.services.map((service) => <Card key={service.id}><CardContent className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-xl">{service.title}</h2><p className="mt-2 text-sm text-muted-foreground">{service.shortDesc}</p></div><Badge variant={service.published ? "default" : "outline"}>{service.published ? "Published" : "Hidden"}</Badge></div>
      <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setEditing(service)}><Pencil className="h-4 w-4" />Edit</Button><Button variant="ghost" size="sm" disabled={save.isPending} onClick={() => save.mutate({ id: service.id, payload: { published: !service.published } })}>{service.published ? "Hide" : "Publish"}</Button></div>
    </CardContent></Card>)}</div>}
    <Dialog open={editing !== null} onOpenChange={(open) => { if (!open) setEditing(null); }}><DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
      <DialogHeader><DialogTitle>{editing === "new" ? "New service" : "Edit service"}</DialogTitle><DialogDescription>Custom content appears in the language you enter. Save your changes, then use View site to review them.</DialogDescription></DialogHeader>
      {editing && <ServiceEditor key={editing === "new" ? "new" : editing.id} service={editing === "new" ? undefined : editing} saving={save.isPending} onSave={(payload) => save.mutate({ id: editing === "new" ? undefined : editing.id, payload })} />}
    </DialogContent></Dialog>
  </SectionShell>;
}

function ServiceEditor({ service, saving, onSave }: { service?: Service; saving: boolean; onSave: (payload: Payload) => void }) {
  const [image, setImage] = useState(service?.image || "");
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({ title: String(form.get("title")), shortDesc: String(form.get("shortDesc")), longDesc: String(form.get("longDesc")), icon: String(form.get("icon")), image,
      features: String(form.get("features")).split("\n").map(value => value.trim()).filter(Boolean), order: Number(form.get("order")), published: form.get("published") === "on" });
  }
  return <form onSubmit={submit} className="space-y-4">
    <div className="space-y-2"><Label htmlFor="service-title">Title</Label><Input id="service-title" name="title" defaultValue={service?.title} required minLength={2} maxLength={120} /></div>
    <div className="space-y-2"><Label htmlFor="service-summary">Short description</Label><Textarea id="service-summary" name="shortDesc" defaultValue={service?.shortDesc} required minLength={2} maxLength={500} /></div>
    <div className="space-y-2"><Label htmlFor="service-details">Full description</Label><Textarea id="service-details" name="longDesc" defaultValue={service?.longDesc} required minLength={2} maxLength={3000} /></div>
    <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="service-icon">Icon</Label><select id="service-icon" name="icon" defaultValue={service?.icon || "dumbbell"} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="dumbbell">Training</option><option value="flame">Transformation</option><option value="salad">Nutrition</option><option value="video">Consultation</option></select></div><div className="space-y-2"><Label htmlFor="service-order">Order</Label><Input id="service-order" name="order" type="number" min={0} defaultValue={service?.order || 0} required /></div></div>
    <ImageUpload label="Service image (max 3 MB)" value={image} onChange={setImage} />
    <div className="space-y-2"><Label htmlFor="service-features">Features — one per line</Label><Textarea id="service-features" name="features" defaultValue={service?.features.join("\n")} rows={4} /></div>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={service?.published ?? true} className="accent-primary" />Show on the public website</label>
    <Button type="submit" disabled={saving} className="w-full">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save service</Button>
  </form>;
}

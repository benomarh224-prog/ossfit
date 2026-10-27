"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SectionShell, SectionLoading, ErrorState, EmptyState, ImageUpload } from "../ui-bits";
import { apiFetch, type AdminTransformation } from "../lib";

export default function TransformationsSection() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [edit, setEdit] = React.useState<AdminTransformation | "new" | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<{ transformations: AdminTransformation[] }>({
    queryKey: ["admin", "transformations"],
    queryFn: () => apiFetch("/api/admin/transformations"),
  });

  const saveMut = useMutation({
    mutationFn: (vars: { id?: string; payload: Partial<AdminTransformation> }) =>
      vars.id
        ? apiFetch(`/api/admin/transformations/${vars.id}`, {
            method: "PATCH",
            body: JSON.stringify(vars.payload),
          })
        : apiFetch("/api/admin/transformations", {
            method: "POST",
            body: JSON.stringify(vars.payload),
          }),
    onSuccess: (_d, vars) => {
      toast.success(vars.id ? "Transformation updated" : "Transformation added");
      qc.invalidateQueries({ queryKey: ["admin", "transformations"] });
      setEdit(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/admin/transformations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Transformation deleted");
      qc.invalidateQueries({ queryKey: ["admin", "transformations"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const items = data?.transformations ?? [];

  return (
    <SectionShell
      title={t("admin.transformations")}
      description={`${items.length} entries`}
      actions={
        <Button onClick={() => setEdit("new")}>
          <Plus className="size-4" />
          {t("admin.addTransformation")}
        </Button>
      }
    >
      {isLoading ? (
        <SectionLoading rows={3} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No transformations yet"
          description="Add before/after transformations to showcase client results."
          action={
            <Button onClick={() => setEdit("new")}>
              <Plus className="size-4" />
              {t("admin.addTransformation")}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const T = t; // i18n fn shorthand (don't shadow with `t` map param)
            return (
            <Card key={item.id} className="overflow-hidden p-0">
              <div className="grid grid-cols-2 gap-px bg-border/40">
                <ImageCell url={item.beforeImg} label="Before" />
                <ImageCell url={item.afterImg} label="After" />
              </div>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-lg text-foreground">{item.clientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.goal ?? "—"}
                      {item.duration ? ` · ${item.duration}` : ""}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      item.published
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground"
                    }
                  >
                    {item.published ? "Live" : "Draft"}
                  </Badge>
                </div>
                {item.story && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">{item.story}</p>
                )}
                {!item.consent && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-300">
                    <AlertTriangle className="size-3" />
                    No consent recorded
                  </span>
                )}
                <div className="flex items-center justify-end gap-1.5 border-t border-border/60 pt-3">
                  <Button variant="outline" size="sm" onClick={() => setEdit(item)}>
                    <Pencil className="size-4" />
                    {T("actions.edit")}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:bg-destructive/15 hover:text-destructive"
                        aria-label="Delete"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete transformation?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently removes the transformation from {item.clientName}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-white hover:bg-destructive/90"
                          onClick={() => deleteMut.mutate(item.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      <TransformationEditDialog
        open={edit !== null}
        onOpenChange={(v) => !v && setEdit(null)}
        item={edit === "new" ? null : edit}
        onSave={(payload, id) => saveMut.mutate({ id, payload })}
        saving={saveMut.isPending}
      />
    </SectionShell>
  );
}

function ImageCell({ url, label }: { url?: string | null; label: string }) {
  return (
    <div className="relative aspect-[3/4] bg-secondary">
      {url ? (
        <img src={url} alt={label} className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
          No image
        </div>
      )}
      <span className="absolute left-2 top-2 rounded-md bg-background/80 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-foreground backdrop-blur">
        {label}
      </span>
    </div>
  );
}

function TransformationEditDialog({
  open,
  onOpenChange,
  item,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: AdminTransformation | null;
  onSave: (payload: Partial<AdminTransformation>, id?: string) => void;
  saving: boolean;
}) {
  const { t } = useI18n();
  const [clientName, setClientName] = React.useState("");
  const [beforeImg, setBeforeImg] = React.useState("");
  const [afterImg, setAfterImg] = React.useState("");
  const [goal, setGoal] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [story, setStory] = React.useState("");
  const [published, setPublished] = React.useState(false);
  const [consent, setConsent] = React.useState(false);
  const [order, setOrder] = React.useState<number | "">(0);

  React.useEffect(() => {
    if (!open) return;
    if (item) {
      setClientName(item.clientName);
      setBeforeImg(item.beforeImg ?? "");
      setAfterImg(item.afterImg ?? "");
      setGoal(item.goal ?? "");
      setDuration(item.duration ?? "");
      setStory(item.story ?? "");
      setPublished(item.published);
      setConsent(item.consent);
      setOrder(item.order);
    } else {
      setClientName("");
      setBeforeImg("");
      setAfterImg("");
      setGoal("");
      setDuration("");
      setStory("");
      setPublished(false);
      setConsent(false);
      setOrder(0);
    }
  }, [item, open]);

  function submit() {
    const payload: Partial<AdminTransformation> = {
      clientName,
      beforeImg: beforeImg || undefined,
      afterImg: afterImg || undefined,
      goal: goal || undefined,
      duration: duration || undefined,
      story: story || undefined,
      published,
      consent,
      order: Number(order) || 0,
    };
    onSave(payload, item?.id);
  }

  const consentWarning = published && !consent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {item ? "Edit transformation" : "Add transformation"}
          </DialogTitle>
          <DialogDescription>
            Upload before/after photos and document the journey.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Client name</Label>
            <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Goal</Label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Fat loss" />
          </div>
          <div className="space-y-1.5">
            <Label>Duration</Label>
            <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 16 weeks" />
          </div>
          <div className="space-y-1.5">
            <Label>Display order</Label>
            <Input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUpload label="Before image" value={beforeImg} onChange={setBeforeImg} />
          <ImageUpload label="After image" value={afterImg} onChange={setAfterImg} />
        </div>

        {(beforeImg || afterImg) && (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-card/40 p-3">
            {beforeImg && (
              <img src={beforeImg} alt="before" className="size-20 rounded-md object-cover" />
            )}
            <ArrowRight className="size-5 text-primary" />
            {afterImg && (
              <img src={afterImg} alt="after" className="size-20 rounded-md object-cover" />
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Story</Label>
          <Textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="What changed, the journey, results..."
            rows={4}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-start gap-2 rounded-lg border border-border/60 bg-card/40 p-3">
            <Checkbox checked={published} onCheckedChange={(v) => setPublished(!!v)} />
            <span className="text-sm">
              <span className="font-medium text-foreground">Published</span>
              <span className="block text-xs text-muted-foreground">Show on the public site</span>
            </span>
          </label>
          <label className="flex items-start gap-2 rounded-lg border border-border/60 bg-card/40 p-3">
            <Checkbox checked={consent} onCheckedChange={(v) => setConsent(!!v)} />
            <span className="text-sm">
              <span className="font-medium text-foreground">Client consent</span>
              <span className="block text-xs text-muted-foreground">
                I confirm the client agreed to publication
              </span>
            </span>
          </label>
        </div>

        {consentWarning && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            <AlertTriangle className="size-4" />
            Publishing without recorded consent — please confirm.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("actions.cancel")}
          </Button>
          <Button onClick={submit} disabled={saving || !clientName.trim()}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {t("actions.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

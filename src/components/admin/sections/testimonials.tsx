"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Star, Check, AlertTriangle } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { SectionShell, SectionLoading, ErrorState, EmptyState, StarRating } from "../ui-bits";
import { apiFetch, type AdminTestimonial } from "../lib";

export default function TestimonialsSection() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [edit, setEdit] = React.useState<AdminTestimonial | "new" | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<{ testimonials: AdminTestimonial[] }>({
    queryKey: ["admin", "testimonials"],
    queryFn: () => apiFetch("/api/admin/testimonials"),
  });

  const saveMut = useMutation({
    mutationFn: (vars: { id?: string; payload: Partial<AdminTestimonial> }) =>
      vars.id
        ? apiFetch(`/api/admin/testimonials/${vars.id}`, {
            method: "PATCH",
            body: JSON.stringify(vars.payload),
          })
        : apiFetch("/api/admin/testimonials", {
            method: "POST",
            body: JSON.stringify(vars.payload),
          }),
    onSuccess: (_d, vars) => {
      toast.success(vars.id ? "Testimonial updated" : "Testimonial added");
      qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
      setEdit(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/admin/testimonials/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Testimonial deleted");
      qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const items = data?.testimonials ?? [];

  return (
    <SectionShell
      title={t("admin.testimonials")}
      description={`${items.length} entries`}
      actions={
        <Button onClick={() => setEdit("new")}>
          <Plus className="size-4" />
          {t("admin.addTestimonial")}
        </Button>
      }
    >
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <SectionLoading rows={5} />
            </div>
          ) : isError ? (
            <div className="p-4">
              <ErrorState onRetry={() => refetch()} />
            </div>
          ) : items.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No testimonials yet"
                description="Add a client testimonial to feature on your site."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Rating</TableHead>
                  <TableHead className="hidden lg:table-cell">Quote</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{item.clientName}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.clientCity ?? ""}
                          {item.goal ? ` · ${item.goal}` : ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Star className="size-3.5 fill-primary text-primary" />
                        <span className="text-sm">{item.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md hidden lg:table-cell">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        “{item.quote}”
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant="outline"
                          className={
                            item.published
                              ? "w-fit border-primary/30 bg-primary/10 text-primary"
                              : "w-fit border-border bg-secondary text-muted-foreground"
                          }
                        >
                          {item.published ? "Live" : "Draft"}
                        </Badge>
                        {!item.consent && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-800 dark:text-amber-300">
                            <AlertTriangle className="size-3" />
                            No consent
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => setEdit(item)}
                          aria-label={t("actions.edit")}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:bg-destructive/15 hover:text-destructive"
                              aria-label={t("actions.delete")}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete testimonial?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This permanently removes the testimonial from {item.clientName}.
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TestimonialEditDialog
        open={edit !== null}
        onOpenChange={(v) => !v && setEdit(null)}
        item={edit === "new" ? null : edit}
        onSave={(payload, id) => saveMut.mutate({ id, payload })}
        saving={saveMut.isPending}
      />
    </SectionShell>
  );
}

function TestimonialEditDialog({
  open,
  onOpenChange,
  item,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: AdminTestimonial | null;
  onSave: (payload: Partial<AdminTestimonial>, id?: string) => void;
  saving: boolean;
}) {
  const { t } = useI18n();
  const [clientName, setClientName] = React.useState("");
  const [clientCity, setClientCity] = React.useState("");
  const [avatar, setAvatar] = React.useState("");
  const [rating, setRating] = React.useState(5);
  const [quote, setQuote] = React.useState("");
  const [goal, setGoal] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [published, setPublished] = React.useState(false);
  const [consent, setConsent] = React.useState(false);
  const [order, setOrder] = React.useState<number | "">(0);

  React.useEffect(() => {
    if (!open) return;
    if (item) {
      setClientName(item.clientName);
      setClientCity(item.clientCity ?? "");
      setAvatar(item.avatar ?? "");
      setRating(item.rating);
      setQuote(item.quote);
      setGoal(item.goal ?? "");
      setDuration(item.duration ?? "");
      setPublished(item.published);
      setConsent(item.consent);
      setOrder(item.order);
    } else {
      setClientName("");
      setClientCity("");
      setAvatar("");
      setRating(5);
      setQuote("");
      setGoal("");
      setDuration("");
      setPublished(false);
      setConsent(false);
      setOrder(0);
    }
  }, [item, open]);

  function submit() {
    const payload: Partial<AdminTestimonial> = {
      clientName,
      clientCity: clientCity || undefined,
      avatar: avatar || undefined,
      rating,
      quote,
      goal: goal || undefined,
      duration: duration || undefined,
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
            {item ? "Edit testimonial" : "Add testimonial"}
          </DialogTitle>
          <DialogDescription>
            Only publish testimonials where you have written client consent.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Client name</Label>
            <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input value={clientCity} onChange={(e) => setClientCity(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Goal</Label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Fat loss" />
          </div>
          <div className="space-y-1.5">
            <Label>Duration</Label>
            <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 12 weeks" />
          </div>
          <div className="space-y-1.5">
            <Label>Avatar URL</Label>
            <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." />
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

        <div className="space-y-1.5">
          <Label>Rating</Label>
          <StarRating value={rating} onChange={setRating} size="md" />
        </div>

        <div className="space-y-1.5">
          <Label>Quote</Label>
          <Textarea
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="What the client said..."
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
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="size-4" />
            Publishing without recorded consent — please confirm.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving || !clientName.trim() || !quote.trim()}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {t("actions.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

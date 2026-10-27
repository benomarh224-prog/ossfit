"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Star, Check } from "lucide-react";
import { useI18n, formatMAD } from "@/lib/i18n/i18n-provider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { SectionShell, SectionLoading, ErrorState, EmptyState } from "../ui-bits";
import { apiFetch, type AdminPackage } from "../lib";

export default function PricingSection() {
  const { t, locale } = useI18n();
  const qc = useQueryClient();
  const [edit, setEdit] = React.useState<AdminPackage | "new" | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<{ packages: AdminPackage[] }>({
    queryKey: ["admin", "packages"],
    queryFn: () => apiFetch("/api/admin/packages"),
  });

  const saveMut = useMutation({
    mutationFn: (vars: { id?: string; payload: Partial<AdminPackage> }) =>
      vars.id
        ? apiFetch(`/api/admin/packages/${vars.id}`, {
            method: "PATCH",
            body: JSON.stringify(vars.payload),
          })
        : apiFetch("/api/admin/packages", {
            method: "POST",
            body: JSON.stringify(vars.payload),
          }),
    onSuccess: (_d, vars) => {
      toast.success(vars.id ? "Package updated" : "Package created");
      qc.invalidateQueries({ queryKey: ["admin", "packages"] });
      setEdit(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/admin/packages/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Package deleted");
      qc.invalidateQueries({ queryKey: ["admin", "packages"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const packages = data?.packages ?? [];

  return (
    <SectionShell
      title={t("admin.pricing")}
      description={`${packages.length} packages`}
      actions={
        <Button onClick={() => setEdit("new")}>
          <Plus className="size-4" />
          {t("admin.addPackage")}
        </Button>
      }
    >
      {isLoading ? (
        <SectionLoading rows={3} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : packages.length === 0 ? (
        <EmptyState
          title="No packages yet"
          description="Add your first pricing tier."
          action={
            <Button onClick={() => setEdit("new")}>
              <Plus className="size-4" />
              {t("admin.addPackage")}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="relative flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="font-display text-xl">{pkg.title}</CardTitle>
                    {pkg.tagline && (
                      <CardDescription className="mt-1">{pkg.tagline}</CardDescription>
                    )}
                  </div>
                  {pkg.featured && (
                    <Badge variant="default" className="gap-1 bg-primary text-primary-foreground">
                      <Star className="size-3" />
                      Featured
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div>
                  <p className="font-display text-3xl text-primary">
                    {formatMAD(pkg.priceMAD, locale)}
                  </p>
                  <p className="text-xs text-muted-foreground">{pkg.durationLabel}</p>
                </div>
                <p className="text-xs text-muted-foreground">{pkg.supportLevel}</p>
                <ul className="space-y-1 text-sm">
                  {pkg.features.slice(0, 6).map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                  {pkg.features.length > 6 && (
                    <li className="text-xs text-muted-foreground">
                      + {pkg.features.length - 6} more
                    </li>
                  )}
                </ul>
                <div className="flex items-center gap-2 text-xs">
                  <Badge
                    variant="outline"
                    className={
                      pkg.available
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground"
                    }
                  >
                    {pkg.available ? "Available" : "Hidden"}
                  </Badge>
                  <span className="text-muted-foreground">Order: {pkg.order}</span>
                </div>
              </CardContent>
              <div className="flex items-center justify-end gap-2 border-t border-border/60 p-4">
                <Button variant="outline" size="sm" onClick={() => setEdit(pkg)}>
                  <Pencil className="size-4" />
                  {t("actions.edit")}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:bg-destructive/15 hover:text-destructive"
                      aria-label="Delete package"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete package?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This permanently removes “{pkg.title}”.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-white hover:bg-destructive/90"
                        onClick={() => deleteMut.mutate(pkg.id)}
                      >
                        {deleteMut.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      )}

      <PackageEditDialog
        open={edit !== null}
        onOpenChange={(v) => !v && setEdit(null)}
        pkg={edit === "new" ? null : edit}
        onSave={(payload, id) => saveMut.mutate({ id, payload })}
        saving={saveMut.isPending}
      />
    </SectionShell>
  );
}

function PackageEditDialog({
  open,
  onOpenChange,
  pkg,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pkg: AdminPackage | null;
  onSave: (payload: Partial<AdminPackage>, id?: string) => void;
  saving: boolean;
}) {
  const [title, setTitle] = React.useState("");
  const [tagline, setTagline] = React.useState("");
  const [priceMAD, setPriceMAD] = React.useState<number | "">(0);
  const [durationLabel, setDurationLabel] = React.useState("Per month");
  const [features, setFeatures] = React.useState<string[]>([""]);
  const [supportLevel, setSupportLevel] = React.useState("Standard support");
  const [available, setAvailable] = React.useState(true);
  const [featured, setFeatured] = React.useState(false);
  const [order, setOrder] = React.useState<number | "">(0);

  React.useEffect(() => {
    if (!open) return;
    if (pkg) {
      setTitle(pkg.title);
      setTagline(pkg.tagline);
      setPriceMAD(pkg.priceMAD);
      setDurationLabel(pkg.durationLabel);
      setFeatures(pkg.features.length ? [...pkg.features] : [""]);
      setSupportLevel(pkg.supportLevel);
      setAvailable(pkg.available);
      setFeatured(pkg.featured);
      setOrder(pkg.order);
    } else {
      setTitle("");
      setTagline("");
      setPriceMAD(0);
      setDurationLabel("Per month");
      setFeatures([""]);
      setSupportLevel("Standard support");
      setAvailable(true);
      setFeatured(false);
      setOrder(0);
    }
  }, [pkg, open]);

  function submit() {
    const payload: Partial<AdminPackage> = {
      title,
      tagline,
      priceMAD: Number(priceMAD) || 0,
      durationLabel,
      features: features.filter((f) => f.trim() !== ""),
      supportLevel,
      available,
      featured,
      order: Number(order) || 0,
    };
    onSave(payload, pkg?.id);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {pkg ? "Edit package" : "Add package"}
          </DialogTitle>
          <DialogDescription>
            {pkg ? `Editing “${pkg.title}”` : "Create a new pricing tier."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Premium" />
          </div>
          <div className="space-y-1.5">
            <Label>Tagline</Label>
            <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Most popular" />
          </div>
          <div className="space-y-1.5">
            <Label>Price (MAD)</Label>
            <Input
              type="number"
              value={priceMAD}
              onChange={(e) => setPriceMAD(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Duration label</Label>
            <Input value={durationLabel} onChange={(e) => setDurationLabel(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Support level</Label>
            <Input value={supportLevel} onChange={(e) => setSupportLevel(e.target.value)} />
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

        <div className="space-y-2">
          <Label>Features</Label>
          {features.map((f, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={f}
                placeholder={`Feature ${i + 1}`}
                onChange={(e) => {
                  const v = e.target.value;
                  setFeatures((arr) => arr.map((x, j) => (j === i ? v : x)));
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/15 hover:text-destructive"
                onClick={() => setFeatures((arr) => arr.filter((_, j) => j !== i))}
                aria-label="Remove feature"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFeatures((arr) => [...arr, ""])}
          >
            <Plus className="size-4" />
            Add feature
          </Button>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2">
            <Switch checked={available} onCheckedChange={setAvailable} />
            <span className="text-sm">Available</span>
          </label>
          <label className="flex items-center gap-2">
            <Switch checked={featured} onCheckedChange={setFeatured} />
            <span className="text-sm">Featured</span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving || !title.trim()}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

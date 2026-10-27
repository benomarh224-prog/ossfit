"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, Salad } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { apiFetch, type AdminNutritionPlan } from "../lib";
import { CreateNutritionDialog } from "./assign-nutrition-dialog";

export default function NutritionSection() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  const { data, isLoading, isError, refetch } = useQuery<{ plans: AdminNutritionPlan[] }>({
    queryKey: ["admin", "nutrition"],
    queryFn: () => apiFetch("/api/admin/nutrition"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/admin/nutrition/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Plan deleted");
      qc.invalidateQueries({ queryKey: ["admin", "nutrition"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const plans = data?.plans ?? [];

  return (
    <SectionShell
      title={t("admin.nutrition")}
      description={`${plans.length} plans`}
      actions={
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Create plan
        </Button>
      }
    >
      {isLoading ? (
        <SectionLoading rows={4} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : plans.length === 0 ? (
        <EmptyState
          title="No nutrition plans yet"
          description="Create your first plan and assign it to a client."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Create plan
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {plans.map((p) => (
            <Card key={p.id} className="p-0">
              <CardHeader className="border-b border-border/60 pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Salad className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{p.title}</CardTitle>
                      <CardDescription className="mt-0.5">
                        {p.user?.name ?? p.user?.email ?? "Unassigned"}
                        {p.dailyCalories ? ` · ${p.dailyCalories} kcal` : ""}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.active && (
                      <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                        Active
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpanded((e) => ({ ...e, [p.id]: !e[p.id] }))}
                    >
                      {expanded[p.id] ? "Hide" : "View"}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:bg-destructive/15 hover:text-destructive"
                          aria-label="Delete plan"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete plan?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently removes the nutrition plan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={() => deleteMut.mutate(p.id)}
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
                </div>
              </CardHeader>
              {expanded[p.id] && (
                <CardContent className="pt-4">
                  <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Macro label="Calories" value={p.dailyCalories ?? null} suffix="kcal" />
                    <Macro label="Protein" value={p.proteinG ?? null} suffix="g" />
                    <Macro label="Carbs" value={p.carbsG ?? null} suffix="g" />
                    <Macro label="Fats" value={p.fatsG ?? null} suffix="g" />
                  </div>
                  {p.meals?.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Meal suggestions
                      </p>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {p.meals.map((m, i) => (
                          <li
                            key={i}
                            className="rounded-md border border-border/50 bg-background/40 px-3 py-2 text-sm"
                          >
                            <span className="font-medium text-foreground">{m.name}</span>
                            {m.suggestion && (
                              <span className="text-muted-foreground"> — {m.suggestion}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {p.notes && (
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Notes
                      </p>
                      <p className="text-sm text-foreground">{p.notes}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <CreateNutritionDialog open={createOpen} onOpenChange={setCreateOpen} />
    </SectionShell>
  );
}

function Macro({ label, value, suffix }: { label: string; value: number | null; suffix: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/50 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">
        {value ?? "—"} {value !== null ? suffix : ""}
      </p>
    </div>
  );
}

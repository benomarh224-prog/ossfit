"use client";

import { PlanMedia } from "@/components/plan-media";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, Pencil, Dumbbell } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
import { SectionShell, SectionLoading, ErrorState, EmptyState, StatusBadge } from "../ui-bits";
import { apiFetch, type AdminWorkoutPlan } from "../lib";
import { CreateWorkoutDialog } from "./assign-workout-dialog";

export default function WorkoutsSection() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<AdminWorkoutPlan | null>(null);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  const { data, isLoading, isError, refetch } = useQuery<{ plans: AdminWorkoutPlan[] }>({
    queryKey: ["admin", "workouts"],
    queryFn: () => apiFetch("/api/admin/workouts"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/admin/workouts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Plan deleted");
      qc.invalidateQueries({ queryKey: ["admin", "workouts"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const plans = data?.plans ?? [];

  return (
    <SectionShell
      title={t("admin.workouts")}
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
          title="No workout plans yet"
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
                      <Dumbbell className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{p.title}</CardTitle>
                      <CardDescription className="mt-0.5">
                        {p.user?.name ?? p.user?.email ?? "Unassigned"}
                        {p.goal ? ` · ${p.goal}` : ""}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {p.active && (
                      <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                        Active
                      </Badge>
                    )}
                    <Button variant="outline" size="sm" className="min-h-11" onClick={() => setEditingPlan(p)}><Pencil className="size-4" />{t("actions.edit")}</Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpanded((e) => ({ ...e, [p.id]: !e[p.id] }))}
                    >
                      {expanded[p.id] ? "Hide" : "View / add media"}
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
                            This permanently removes the plan. Workout logs are kept.
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
                  <PlanMedia kind="workout" planId={p.id} manage />
                  {p.summary && (
                    <p className="mb-4 text-sm text-muted-foreground">{p.summary}</p>
                  )}
                  <div className="space-y-3">
                    {p.days.map((d, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-border/60 bg-card/40 p-3"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="secondary">{d.name}</Badge>
                          {d.focus && (
                            <span className="text-xs text-muted-foreground">
                              Focus: {d.focus}
                            </span>
                          )}
                        </div>
                        {d.exercises?.length ? (
                          <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
                            {d.exercises.map((ex, j) => (
                              <li
                                key={j}
                                className="flex flex-wrap items-center gap-1.5 rounded-md border border-border/50 bg-background/40 px-2.5 py-1.5"
                              >
                                <span className="font-medium text-foreground">{ex.name}</span>
                                {ex.sets && (
                                  <Badge variant="outline" className="px-1 py-0 text-[10px]">
                                    {ex.sets} sets
                                  </Badge>
                                )}
                                {ex.reps && (
                                  <Badge variant="outline" className="px-1 py-0 text-[10px]">
                                    {ex.reps} reps
                                  </Badge>
                                )}
                                {ex.rest && (
                                  <Badge variant="outline" className="px-1 py-0 text-[10px]">
                                    {ex.rest} rest
                                  </Badge>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground">No exercises.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <CreateWorkoutDialog open={createOpen || !!editingPlan} plan={editingPlan} onOpenChange={(value) => { if (!value) { setCreateOpen(false); setEditingPlan(null); } }} />
    </SectionShell>
  );
}

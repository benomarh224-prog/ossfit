"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dumbbell, Plus } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { PlanMedia } from "@/components/plan-media";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionLoading, ErrorState, EmptyState } from "../ui-bits";
import { PlanCard, PlanListHeader, planCopy } from "../plan-card";
import { apiFetch, type AdminWorkoutPlan } from "../lib";
import { CreateWorkoutDialog } from "./assign-workout-dialog";

export default function WorkoutsSection() {
  const { t, locale } = useI18n(); const c = planCopy[locale];
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminWorkoutPlan | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { data, isLoading, isError, refetch } = useQuery<{ plans: AdminWorkoutPlan[] }>({ queryKey: ["admin", "workouts"], queryFn: () => apiFetch("/api/admin/workouts") });
  const deleteMut = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/admin/workouts/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast.success(c.deleted); void qc.invalidateQueries({ queryKey: ["admin", "workouts"] }); },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : t("common.error")),
  });
  const plans = data?.plans ?? [];
  return <div className="space-y-5 sm:space-y-6">
    <PlanListHeader title={t("admin.workouts")} count={plans.length} activeCount={plans.filter(plan => plan.active).length} onCreate={() => setCreateOpen(true)} />
    {isLoading ? <SectionLoading rows={4} /> : isError ? <ErrorState onRetry={() => refetch()} /> : !plans.length ? <EmptyState title={c.emptyWorkout} description={c.emptyHint} action={<Button onClick={() => setCreateOpen(true)} className="min-h-11 rounded-xl"><Plus className="size-4" />{c.create}</Button>} /> : <div className="grid items-start gap-3.5 md:grid-cols-2">
      {plans.map(plan => <PlanCard key={plan.id} id={plan.id} title={plan.title} client={plan.user?.name ?? plan.user?.email ?? c.unassigned} active={plan.active} kind="workout" icon={Dumbbell} summary={plan.goal} stats={[{ label: c.days, value: plan.days.length }, { label: c.exercises, value: plan.days.reduce((count, day) => count + (day.exercises?.length ?? 0), 0) }]} expanded={!!expanded[plan.id]} deleting={deleteMut.isPending} onEdit={() => setEditingPlan(plan)} onExpand={() => setExpanded(current => ({ ...current, [plan.id]: !current[plan.id] }))} onDelete={() => deleteMut.mutate(plan.id)}>
        {plan.summary && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{plan.summary}</p>}
        <div className="space-y-3">{plan.days.map((day, index) => <section key={index} className="rounded-xl border border-border/60 bg-card p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2"><h4 className="text-sm font-semibold">{day.name}</h4>{day.focus && <Badge variant="secondary" className="max-w-full whitespace-normal break-words text-[10px]">{c.focus}: {day.focus}</Badge>}</div>
          {day.exercises?.length ? <ul className="grid gap-2 sm:grid-cols-2">{day.exercises.map((exercise, i) => <li key={i} className="min-w-0 rounded-lg border border-border/60 bg-background/50 p-3"><p className="break-words text-xs font-medium sm:text-sm">{exercise.name}</p><div className="mt-2 flex flex-wrap gap-1.5">{[[c.sets, exercise.sets], [c.reps, exercise.reps], [c.rest, exercise.rest]].map(([label, value]) => value && <span key={label} className="rounded-md bg-secondary px-1.5 py-1 text-[10px] text-muted-foreground">{label}: <span className="font-medium text-foreground">{value}</span></span>)}</div></li>)}</ul> : <p className="text-xs text-muted-foreground">{c.noExercises}</p>}
        </section>)}</div>
        <PlanMedia kind="workout" planId={plan.id} manage />
      </PlanCard>)}
    </div>}
    <CreateWorkoutDialog open={createOpen || !!editingPlan} plan={editingPlan} onOpenChange={value => { if (!value) { setCreateOpen(false); setEditingPlan(null); } }} />
  </div>;
}

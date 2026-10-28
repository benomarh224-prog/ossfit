"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Salad } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { toast } from "sonner";
import { PlanMedia } from "@/components/plan-media";
import { Button } from "@/components/ui/button";
import { SectionLoading, ErrorState, EmptyState } from "../ui-bits";
import { PlanCard, PlanListHeader, planCopy } from "../plan-card";
import { apiFetch, type AdminNutritionPlan } from "../lib";
import { CreateNutritionDialog } from "./assign-nutrition-dialog";

export default function NutritionSection() {
  const { t, locale } = useI18n(); const c = planCopy[locale];
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminNutritionPlan | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { data, isLoading, isError, refetch } = useQuery<{ plans: AdminNutritionPlan[] }>({ queryKey: ["admin", "nutrition"], queryFn: () => apiFetch("/api/admin/nutrition") });
  const deleteMut = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/admin/nutrition/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast.success(c.deleted); void qc.invalidateQueries({ queryKey: ["admin", "nutrition"] }); },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : t("common.error")),
  });
  const plans = data?.plans ?? [];
  return <div className="space-y-5 sm:space-y-6">
    <PlanListHeader title={t("admin.nutrition")} count={plans.length} activeCount={plans.filter(plan => plan.active).length} onCreate={() => setCreateOpen(true)} />
    {isLoading ? <SectionLoading rows={4} /> : isError ? <ErrorState onRetry={() => refetch()} /> : !plans.length ? <EmptyState title={c.emptyNutrition} description={c.emptyHint} action={<Button onClick={() => setCreateOpen(true)} className="min-h-11 rounded-xl"><Plus className="size-4" />{c.create}</Button>} /> : <div className="grid items-start gap-3.5 md:grid-cols-2">
      {plans.map(plan => <PlanCard key={plan.id} id={plan.id} title={plan.title} client={plan.user?.name ?? plan.user?.email ?? c.unassigned} active={plan.active} kind="nutrition" icon={Salad} stats={[{ label: c.meals, value: plan.meals.length }, ...(plan.dailyCalories != null ? [{ label: c.calories, value: plan.dailyCalories }] : [])]} expanded={!!expanded[plan.id]} deleting={deleteMut.isPending} onEdit={() => setEditingPlan(plan)} onExpand={() => setExpanded(current => ({ ...current, [plan.id]: !current[plan.id] }))} onDelete={() => deleteMut.mutate(plan.id)}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Macro label={t("dashboard.calories")} value={plan.dailyCalories ?? null} suffix={c.calories} />
          <Macro label={t("dashboard.protein")} value={plan.proteinG ?? null} suffix="g" />
          <Macro label={t("dashboard.carbs")} value={plan.carbsG ?? null} suffix="g" />
          <Macro label={t("dashboard.fats")} value={plan.fatsG ?? null} suffix="g" />
        </div>
        {!!plan.meals.length && <section className="space-y-3"><h4 className="text-sm font-semibold">{c.suggestions}</h4><ul className="grid gap-2 sm:grid-cols-2">{plan.meals.map((meal, index) => <li key={index} className="min-w-0 rounded-xl border border-border/60 bg-card p-3"><p className="break-words text-sm font-medium">{meal.name}</p>{meal.suggestion && <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground">{meal.suggestion}</p>}</li>)}</ul></section>}
        {plan.notes && <section className="rounded-xl bg-primary/5 p-3"><h4 className="text-sm font-semibold">{c.notes}</h4><p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground">{plan.notes}</p></section>}
        <PlanMedia kind="nutrition" planId={plan.id} manage />
      </PlanCard>)}
    </div>}
    <CreateNutritionDialog open={createOpen || !!editingPlan} plan={editingPlan} onOpenChange={value => { if (!value) { setCreateOpen(false); setEditingPlan(null); } }} />
  </div>;
}

function Macro({ label, value, suffix }: { label: string; value: number | null; suffix: string }) {
  return <div className="min-w-0 rounded-xl border border-border/60 bg-card p-3"><p className="break-words text-[10px] font-medium text-muted-foreground">{label}</p><p className="mt-1 text-base font-semibold tabular-nums">{value ?? "—"}{value !== null && <span className="ms-1 text-[10px] font-normal text-muted-foreground">{suffix}</span>}</p></div>;
}

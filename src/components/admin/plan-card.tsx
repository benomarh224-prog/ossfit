"use client";

import type { ComponentType, ReactNode } from "react";
import { ChevronDown, Loader2, Pencil, Plus, Trash2, UserRound, Video } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const planCopy = {
  en: { create: "New plan", plans: "plans", active: "Active", inactive: "Inactive", unassigned: "Unassigned", details: "Details & media", hide: "Hide details", remove: "Delete plan", confirm: "Delete this plan?", workoutDelete: "This permanently removes the plan. Previous workout logs are kept.", nutritionDelete: "This permanently removes the nutrition plan.", emptyWorkout: "Your first training plan starts here", emptyNutrition: "Create your first nutrition plan", emptyHint: "Build a plan, assign a client and add photos or videos to guide them.", days: "Days", exercises: "Exercises", meals: "Meals", calories: "kcal", focus: "Focus", sets: "sets", reps: "reps", rest: "rest", noExercises: "No exercises added yet.", suggestions: "Meal suggestions", notes: "Coach notes", deleted: "Plan deleted" },
  fr: { create: "Nouveau plan", plans: "programmes", active: "Actif", inactive: "Inactif", unassigned: "Non attribué", details: "Détails et médias", hide: "Masquer les détails", remove: "Supprimer le programme", confirm: "Supprimer ce programme ?", workoutDelete: "Le programme sera supprimé définitivement. Les séances déjà enregistrées sont conservées.", nutritionDelete: "Le programme nutritionnel sera supprimé définitivement.", emptyWorkout: "Votre premier programme commence ici", emptyNutrition: "Créez votre premier programme nutritionnel", emptyHint: "Préparez un programme, choisissez un client et ajoutez des photos ou vidéos pour le guider.", days: "Jours", exercises: "Exercices", meals: "Repas", calories: "kcal", focus: "Objectif", sets: "séries", reps: "rép.", rest: "repos", noExercises: "Aucun exercice pour le moment.", suggestions: "Suggestions de repas", notes: "Notes du coach", deleted: "Programme supprimé" },
  ar: { create: "برنامج جديد", plans: "برامج", active: "مفعّل", inactive: "غير مفعّل", unassigned: "بدون مشترك", details: "التفاصيل والوسائط", hide: "إخفاء التفاصيل", remove: "حذف البرنامج", confirm: "واش تحذف هاد البرنامج؟", workoutDelete: "غادي يتحذف البرنامج نهائياً. سجل التمارين السابق كيبقى محفوظ.", nutritionDelete: "غادي يتحذف برنامج التغذية نهائياً.", emptyWorkout: "بدا بأول برنامج تدريب", emptyNutrition: "وجد أول برنامج تغذية", emptyHint: "وجد البرنامج، عيّن المشترك وزيد صور أو فيديوهات باش توضح ليه.", days: "الأيام", exercises: "التمارين", meals: "الوجبات", calories: "سعرة", focus: "الهدف", sets: "جولات", reps: "تكرارات", rest: "راحة", noExercises: "ما تزاد حتى تمرين دابا.", suggestions: "اقتراحات الوجبات", notes: "ملاحظات الكوتش", deleted: "تحذف البرنامج" },
};

export function PlanListHeader({ title, count, activeCount, onCreate }: { title: string; count: number; activeCount: number; onCreate: () => void }) {
  const { locale } = useI18n(); const c = planCopy[locale];
  return <header className="flex flex-wrap items-center justify-between gap-3">
    <div className="min-w-0"><h2 className="font-display text-[1.75rem] leading-tight text-foreground sm:text-3xl">{title}</h2><p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm"><span>{count} {c.plans}</span><span aria-hidden="true" className="size-1 rounded-full bg-border" /><span>{c.active}: {activeCount}</span></p></div>
    <Button onClick={onCreate} className="min-h-11 shrink-0 gap-1.5 rounded-xl px-3.5 text-sm shadow-none sm:px-4"><Plus className="size-4" aria-hidden="true" />{c.create}</Button>
  </header>;
}

type PlanCardProps = {
  id: string; title: string; client: string; active: boolean; kind: "workout" | "nutrition";
  icon: ComponentType<{ className?: string }>; summary?: string | null;
  stats: { label: string; value: string | number }[]; expanded: boolean; deleting: boolean;
  onEdit: () => void; onExpand: () => void; onDelete: () => void; children: ReactNode;
};

export function PlanCard({ id, title, client, active, kind, icon: Icon, summary, stats, expanded, deleting, onEdit, onExpand, onDelete, children }: PlanCardProps) {
  const { t, locale } = useI18n(); const c = planCopy[locale];
  const detailsId = `plan-details-${id}`;
  return <article className={cn("surface-card overflow-hidden transition-colors", expanded && "border-primary/30 md:col-span-2")} aria-label={title}>
    <div className="p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/8 text-primary"><Icon className="size-5" /></div>
        <div className="min-w-0 flex-1 pt-0.5"><h3 className="break-words text-[15px] font-semibold leading-snug tracking-tight sm:text-base">{title}</h3><p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground sm:text-[13px]"><UserRound className="size-3 shrink-0" aria-hidden="true" /><span className="truncate" title={client}>{client}</span></p></div>
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="-me-2 -mt-1 size-11 shrink-0 rounded-xl text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive" aria-label={`${c.remove}: ${title}`} title={c.remove} disabled={deleting}><Trash2 className="size-4" /></Button></AlertDialogTrigger>
          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{c.confirm}</AlertDialogTitle><AlertDialogDescription>{kind === "workout" ? c.workoutDelete : c.nutritionDelete}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel><AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={onDelete} disabled={deleting}>{deleting ? <Loader2 className="size-4 animate-spin" /> : t("actions.delete")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
        </AlertDialog>
      </div>
      {summary && <p className="mt-3 line-clamp-2 break-words text-xs leading-relaxed text-muted-foreground">{summary}</p>}
      <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2">
        {stats.map(stat => <p key={stat.label} className="flex items-center gap-1 text-[11px] text-muted-foreground sm:text-xs"><span>{stat.label}</span><span className="font-semibold tabular-nums text-foreground">{stat.value}</span></p>)}
        <span className={cn("ms-auto inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium leading-none sm:text-[11px]", active ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground")}><span className={cn("size-1.5 rounded-full", active ? "bg-primary" : "bg-muted-foreground/50")} aria-hidden="true" />{active ? c.active : c.inactive}</span>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_1.35fr] gap-2 border-t border-border/60 pt-3.5">
        <Button variant="outline" className="h-auto min-h-11 gap-1.5 whitespace-normal rounded-xl border-border/80 px-2 py-2.5 text-xs shadow-none sm:text-sm" onClick={onEdit} aria-label={`${t("actions.edit")}: ${title}`}><Pencil className="size-3.5 shrink-0" />{t("actions.edit")}</Button>
        <Button variant="ghost" className={cn("h-auto min-h-11 gap-1.5 whitespace-normal rounded-xl bg-primary/6 px-2 py-2.5 text-xs text-primary hover:bg-primary/12 hover:text-primary sm:text-sm", expanded && "bg-primary/12")} onClick={onExpand} aria-expanded={expanded} aria-controls={detailsId}><Video className="size-3.5 shrink-0" /><span>{expanded ? c.hide : c.details}</span><ChevronDown className={cn("ms-auto size-3.5 shrink-0 transition-transform", expanded && "rotate-180")} /></Button>
      </div>
    </div>
    <div id={detailsId} hidden={!expanded} className="space-y-5 border-t border-border/70 bg-background/40 p-4 sm:p-5">{expanded ? children : null}</div>
  </article>;
}

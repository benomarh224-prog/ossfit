"use client";

import type { ComponentType, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, ChevronRight, Dumbbell, Droplets, Flame, MessageSquare, Salad, Sparkles, TrendingUp } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { apiFetch } from "@/lib/client-utils";
import { coachingDayRange } from "@/lib/coaching-day";
import { nextOverviewStep, nextWorkout, workoutDayName, type ClientSection, type OverviewSnapshot, type WorkoutDayPreview } from "@/lib/dashboard-overview";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { overviewCopy } from "./overview-copy";

type Plan = { id: string; title: string; days: WorkoutDayPreview[] };
type Nutrition = { title: string; dailyCalories?: number | null; proteinG?: number | null; carbsG?: number | null; fatsG?: number | null; waterCupsGoal: number; meals: { name?: string; meal?: string; suggestion?: string }[] };
export type OverviewAccount = {
  user: { id: string; name?: string | null }; profile?: { status: string; createdAt?: string } | null;
  workoutPlan?: Plan | null; nutritionPlan?: Nutrition | null; unreadMessages?: number;
  activeSubscription?: { id: string; status: string; package?: { title: string } } | null;
  payments?: { status: string; subscriptionId?: string | null }[];
};

export function ClientOverview({ me, onNavigate }: { me: OverviewAccount; onNavigate: (section: ClientSection, dayIndex?: number) => void }) {
  const { t, locale } = useI18n(); const c = overviewCopy[locale];
  const snapshot = useQuery<OverviewSnapshot>({ queryKey: ["dashboard-overview", me.user.id], queryFn: () => apiFetch("/api/dashboard"), staleTime: 30_000, refetchOnWindowFocus: true,
    // Refresh at the next coaching day, without continuously polling a private dashboard.
    refetchInterval: () => Math.max(1000, coachingDayRange().end.getTime() - Date.now() + 1000),
  });
  const data = snapshot.data; const plan = me.workoutPlan; const nutrition = me.nutritionPlan;
  const session = nextWorkout(plan ?? null, data?.latestWorkout ?? null, data?.dateKey ?? "");
  const day = plan?.days[session.index]; const sub = me.activeSubscription;
  const firstName = me.user.name?.trim().split(/\s+/)[0] || c.athlete;
  const next = data ? nextOverviewStep({ profileStatus: me.profile?.status, profileCreatedAt: me.profile?.createdAt, subscriptionStatus: sub?.status,
    pendingPayment: !!me.payments?.some(payment => payment.status === "PENDING" && (!sub || payment.subscriptionId === sub.id)),
    unread: me.unreadMessages ?? 0, hasWorkout: !!plan?.days.length, hasNutrition: !!nutrition, completedToday: session.completedToday, checkinAt: data.latestCheckinAt, now: data.asOf,
  }) : null;
  const step = next ? c.steps[next.kind] : null;
  const waterGoal = nutrition?.waterCupsGoal ?? 8;
  const status = sub ? ({ ACTIVE: c.active, PENDING: c.pending, EXPIRED: c.expired, CANCELLED: c.cancelled }[sub.status] ?? sub.status) : c.pending;
  const quickLinks = [{ section: "workouts" as const, label: c.workouts, icon: Dumbbell }, { section: "nutrition" as const, label: c.nutrition, icon: Salad }, { section: "progress" as const, label: c.progress, icon: TrendingUp }, { section: "messages" as const, label: c.messages, icon: MessageSquare }];
  function navigate(section: ClientSection) { onNavigate(section, section === "workouts" && data ? session.index : undefined); }

  return <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">
    <header className="space-y-1.5">
      <p className="text-[11px] font-medium text-muted-foreground">{data ? new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: data.timeZone }).format(new Date(data.asOf)) : c.today}</p>
      <h2 className="break-words font-display text-[1.75rem] leading-tight sm:text-4xl">{t("dashboard.welcome", { name: firstName })}</h2>
      <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{c.subtitle}</p>
    </header>

    <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/7 p-4 sm:p-6" aria-labelledby="overview-next-title">
      <Sparkles className="pointer-events-none absolute -end-3 -top-3 size-28 text-primary/5" aria-hidden="true" />
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-primary">{c.nextStep}</p>
      {step && next ? <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0 max-w-xl"><h3 id="overview-next-title" className="text-lg font-semibold leading-snug sm:text-xl">{step[0]}</h3><p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">{step[1]}</p></div><Button className="min-h-11 h-auto w-full shrink-0 gap-2 whitespace-normal rounded-xl px-4 py-3 text-xs shadow-none sm:w-auto sm:text-sm" onClick={() => navigate(next.section)}>{step[2]}<ArrowRight className="size-4 shrink-0 rtl:rotate-180" /></Button></div> : snapshot.isError ? <div role="alert"><h3 id="overview-next-title" className="text-sm">{c.error}</h3><Button variant="outline" className="mt-3 min-h-11 rounded-xl" onClick={() => snapshot.refetch()}>{c.retry}</Button></div> : <div role="status" aria-label={c.loading} className="space-y-3"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-11 w-full sm:w-40" /></div>}
    </section>

    <nav aria-label={t("nav.dashboard")} className="grid grid-cols-4 gap-2">
      {quickLinks.map(link => <button key={link.section} type="button" onClick={() => navigate(link.section)} className="group relative flex min-h-20 min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-border/70 bg-card px-1.5 py-3 text-center transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <link.icon className="size-5 text-primary" aria-hidden="true" /><span className="break-words text-[11px] font-medium sm:text-xs">{link.label}</span>{link.section === "messages" && !!me.unreadMessages && <span aria-label={`${c.unread}: ${me.unreadMessages}`} className="absolute end-1.5 top-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">{me.unreadMessages > 99 ? "99+" : me.unreadMessages}</span>}
      </button>)}
    </nav>

    <div className="grid items-start gap-4 lg:grid-cols-2">
      <OverviewCard icon={Dumbbell} title={session.completedToday ? c.logged : c.nextSession} badge={session.completedToday ? <Check className="size-4 text-primary" aria-label={c.logged} /> : undefined}>
        {plan && day && !data ? <><p className="text-sm font-semibold">{plan.title}</p>{snapshot.isError ? <p className="text-xs text-muted-foreground">{c.error}</p> : <Skeleton className="h-24 w-full" aria-label={c.loading} />}<SectionButton onClick={() => onNavigate("workouts")}>{c.viewProgram}</SectionButton></> : plan && day ? <>
          <div><p className="text-[11px] text-muted-foreground">{plan.title}</p><h3 className="mt-1 break-words text-lg font-semibold">{session.completedToday ? `${c.nextUp}: ` : ""}{workoutDayName(day) || plan.title}</h3>{day.focus && <p className="mt-1 text-xs text-muted-foreground">{day.focus}</p>}</div>
          <ul className="space-y-2">{(day.exercises ?? []).slice(0, 3).map((exercise, index) => <li key={index} className="flex min-w-0 items-start gap-2.5 rounded-xl bg-secondary/55 p-2.5"><span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-semibold text-primary">{index + 1}</span><span className="min-w-0 flex-1 break-words text-xs font-medium">{exercise.name}</span>{exercise.sets && exercise.reps && <span className="max-w-24 shrink-0 break-words text-end text-[11px] tabular-nums text-muted-foreground [overflow-wrap:anywhere]">{exercise.sets} × {exercise.reps}</span>}</li>)}</ul>
          {(day.exercises?.length ?? 0) > 3 && <p className="text-[10px] text-muted-foreground">+{day.exercises!.length - 3} · {c.moreExercises}</p>}
          <p className="text-[11px] leading-relaxed text-muted-foreground">{c.rotation}</p>
          <SectionButton onClick={() => navigate("workouts")}>{session.completedToday ? c.viewProgram : c.openWorkout}</SectionButton>
        </> : <><p className="text-sm font-medium">{c.noWorkout}</p><p className="text-xs leading-relaxed text-muted-foreground">{c.noWorkoutHint}</p><SectionButton onClick={() => navigate("messages")}>{c.askCoach}</SectionButton></>}
      </OverviewCard>

      <OverviewCard icon={Salad} title={c.yourNutrition}>
        {nutrition ? <>
          <p className="break-words text-sm font-semibold">{nutrition.title}</p>
          <div className="grid grid-cols-3 gap-2">
            <DailyStat icon={Salad} label={c.meals} value={data ? data.meals.count : null} loading={!data && !snapshot.isError} />
            <DailyStat icon={Flame} label={c.calories} value={data ? data.meals.count ? data.meals.calories : 0 : null} hint={nutrition.dailyCalories != null ? `${c.target}: ${nutrition.dailyCalories} ${c.kcal}` : undefined} loading={!data && !snapshot.isError} />
            <DailyStat icon={Droplets} label={c.water} value={data ? `${data.waterCups}/${waterGoal}` : null} loading={!data && !snapshot.isError} />
          </div>
          {data && <Progress aria-label={c.water} value={Math.min(100, data.waterCups / Math.max(1, waterGoal) * 100)} className="h-1.5" />}
          {data && data.meals.count > 0 && data.meals.calories == null && <p className="text-[10px] text-muted-foreground">{c.noNumbers}</p>}
          <div><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{c.dailyTargets}</p><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">{[[c.protein, nutrition.proteinG], [c.carbs, nutrition.carbsG], [c.fats, nutrition.fatsG]].map(([label, value]) => <span key={String(label)} className="text-muted-foreground">{label} <span className="font-semibold text-foreground">{value != null ? `${value} ${c.g}` : "—"}</span></span>)}</div></div>
          {!!nutrition.meals.length && <div className="space-y-2"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{c.suggestions}</p>{nutrition.meals.slice(0, 2).map((meal, index) => <div key={index} className="rounded-xl border border-border/60 p-3"><p className="break-words text-xs font-semibold">{meal.name || meal.meal}</p>{meal.suggestion && <p className="mt-1 line-clamp-2 break-words text-[11px] leading-relaxed text-muted-foreground">{meal.suggestion}</p>}</div>)}</div>}
          <SectionButton onClick={() => navigate("nutrition")}>{c.openNutrition}</SectionButton>
        </> : <><p className="text-sm font-medium">{c.noNutrition}</p><p className="text-xs leading-relaxed text-muted-foreground">{c.noNutritionHint}</p><SectionButton onClick={() => navigate("messages")}>{c.askCoach}</SectionButton></>}
      </OverviewCard>
    </div>

    <OverviewCard icon={MessageSquare} title={c.coachUpdate}>
      {data?.coachUpdate ? <><div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground"><span className="rounded-full bg-primary/8 px-2 py-1 font-medium text-primary">{data.coachUpdate.kind === "message" ? c.message : c.checkin}{data.coachUpdate.weekLabel ? ` · ${data.coachUpdate.weekLabel}` : ""}</span><time dateTime={data.coachUpdate.at}>{new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: data.timeZone }).format(new Date(data.coachUpdate.at))}</time></div><p className="line-clamp-3 whitespace-pre-wrap break-words text-sm leading-relaxed">{data.coachUpdate.body}</p><SectionButton onClick={() => navigate(data.coachUpdate!.kind === "message" ? "messages" : "progress")}>{data.coachUpdate.kind === "message" ? c.readMessage : c.readFeedback}</SectionButton></> : !data && !snapshot.isError ? <Skeleton className="h-14 w-full" aria-label={c.loading} /> : <><p className="text-xs leading-relaxed text-muted-foreground">{snapshot.isError ? c.error : c.noUpdate}</p><SectionButton onClick={() => navigate("messages")}>{c.askCoach}</SectionButton></>}
    </OverviewCard>

    <button type="button" onClick={() => navigate("subscription")} className="flex min-h-16 w-full min-w-0 items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 text-start hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><div className="min-w-0 flex-1"><p className="text-[10px] text-muted-foreground">{c.package}</p><p className="mt-1 truncate text-xs font-medium">{sub?.package?.title ?? t("dashboard.noPackage")}</p></div>{sub && <span className={cn("shrink-0 rounded-full px-2 py-1 text-[10px] font-medium", sub.status === "ACTIVE" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground")}>{status}</span>}<ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden="true" /></button>
  </div>;
}

function OverviewCard({ title, icon: Icon, badge, children }: { title: string; icon: ComponentType<{ className?: string }>; badge?: ReactNode; children: ReactNode }) {
  return <section className="min-w-0 space-y-4 rounded-2xl border border-border/75 bg-card p-4 shadow-[0_2px_8px_rgb(0_0_0/0.02)] sm:p-5"><div className="flex items-center gap-2.5"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary"><Icon className="size-4" /></span><h3 className="min-w-0 flex-1 text-sm font-semibold">{title}</h3>{badge}</div>{children}</section>;
}
function SectionButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <Button type="button" variant="outline" className="h-auto min-h-11 w-full justify-between gap-2 whitespace-normal rounded-xl px-3 py-2.5 text-xs shadow-none" onClick={onClick}>{children}<ArrowRight className="size-3.5 shrink-0 rtl:rotate-180" /></Button>;
}
function DailyStat({ icon: Icon, label, value, hint, loading }: { icon: ComponentType<{ className?: string }>; label: string; value: ReactNode; hint?: string; loading: boolean }) {
  return <div className="min-w-0 rounded-xl bg-secondary/55 p-2.5"><Icon className="mb-2 size-3.5 text-primary" />{loading ? <Skeleton className="mb-1 h-5 w-10" /> : <p className="break-words text-base font-semibold tabular-nums leading-tight">{value ?? "—"}</p>}<p className="mt-1 break-words text-[10px] leading-relaxed text-muted-foreground sm:text-[11px]">{label}</p>{hint && <p className="mt-0.5 break-words text-[10px] leading-relaxed text-muted-foreground">{hint}</p>}</div>;
}

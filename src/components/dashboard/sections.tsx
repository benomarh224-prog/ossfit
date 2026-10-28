"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Package, CalendarCheck, MessageSquare, Activity, Dumbbell, Plus, Minus,
  Trash2, ImagePlus, Send, Upload, Banknote, ShieldCheck, Star, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n, formatMAD } from "@/lib/i18n/i18n-provider";
import { apiFetch, uploadFile, buildWhatsappLink } from "@/lib/client-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { KpiCard, StatusBadge, SectionLoading, EmptyState, MotionCard, formatDate, formatTime } from "./shared";
import { ScrollArea } from "@/components/ui/scroll-area";

/* ============== OVERVIEW ============== */
export function Overview({ me, whatsapp }: { me: any; whatsapp?: string }) {
  const { t, locale } = useI18n();
  const name = me?.user?.name?.split(" ")[0] ?? "athlete";
  const sub = me?.activeSubscription;
  const plan = me?.workoutPlan;
  const nutrition = me?.nutritionPlan;
  const unread = me?.unreadMessages ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase sm:text-3xl">
          {t("dashboard.welcome", { name })}
        </h2>
        <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t("dashboard.activePackage")}
          value={sub?.package?.title ?? t("dashboard.noPackage")}
          icon={Package}
          hint={sub ? <StatusBadge status={sub.status} /> : undefined as any}
        />
        <KpiCard label={t("nav.messages")} value={unread} icon={MessageSquare} />
        <KpiCard
          label={t("dashboard.currentPlan")}
          value={plan?.title ?? t("dashboard.noWorkouts")}
          icon={Dumbbell}
        />
        <KpiCard
          label={t("dashboard.nutritionTargets")}
          value={nutrition ? `${nutrition.dailyCalories ?? "—"} kcal` : t("dashboard.noNutrition")}
          icon={Activity}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-sm font-bold uppercase tracking-wider">
              {t("dashboard.currentPlan")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {plan ? (
              plan.days.map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 bg-card/40 p-3">
                  <div>
                    <p className="text-sm font-semibold">{d.day}</p>
                    <p className="text-xs text-muted-foreground">{d.focus} · {d.exercises?.length ?? 0} exercises</p>
                  </div>
                  <Badge variant="outline" className="text-primary">{d.exercises?.length ?? 0}</Badge>
                </div>
              ))
            ) : (
              <EmptyState title={t("dashboard.noWorkouts")} desc={t("dashboard.noWorkouts")} whatsapp={{ number: whatsapp, message: "Hello! When will my workout program be ready?" }} />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-sm font-bold uppercase tracking-wider">
              {t("dashboard.nutritionTargets")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nutrition ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <Macro label={t("dashboard.protein")} value={`${nutrition.proteinG}g`} color="text-primary" />
                  <Macro label={t("dashboard.carbs")} value={`${nutrition.carbsG}g`} color="text-amber-800 dark:text-amber-400" />
                  <Macro label={t("dashboard.fats")} value={`${nutrition.fatsG}g`} color="text-blue-700 dark:text-blue-400" />
                </div>
                {nutrition.meals?.length > 0 && (
                  <div className="space-y-1.5">
                    {nutrition.meals.map((m: any, i: number) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <span className="font-semibold text-primary">{m.meal}:</span>
                        <span className="text-muted-foreground">{m.suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">
                  {locale === "fr" ? "Conseils nutritionnels à but éducatif, non un avis médical." : locale === "ar" ? "إرشادات تغذوية تعليمية وليست بديلا عن المشورة الطبية." : "Nutrition guidance is educational and not a substitute for medical advice."}
                </p>
              </div>
            ) : (
              <EmptyState title={t("dashboard.noNutrition")} desc={t("dashboard.noNutrition")} whatsapp={{ number: whatsapp, message: "Hello! When will my nutrition plan be ready?" }} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Macro({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/40 p-2">
      <p className={`font-display text-lg font-bold ${color}`}>{value}</p>
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
    </div>
  );
}

/* ============== WORKOUTS ============== */
export function Workouts({ whatsapp }: { whatsapp?: string }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => apiFetch<any>("/api/workouts"),
  });

  const logMut = useMutation({
    mutationFn: (v: any) => apiFetch("/api/workouts", { json: v }),
    onSuccess: () => { toast.success("Workout logged"); qc.invalidateQueries({ queryKey: ["workouts"] }); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <SectionLoading />;
  const plan = data?.plan;
  const logs = data?.logs ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold uppercase sm:text-3xl">{t("dashboard.workouts")}</h2>
          <p className="text-sm text-muted-foreground">{plan ? plan.title : t("dashboard.noWorkouts")}</p>
        </div>
        {plan && <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="mr-1 h-4 w-4" />{t("dashboard.completeWorkout")}</Button>}
      </div>

      {!plan ? (
        <EmptyState title={t("dashboard.noWorkouts")} desc={t("dashboard.noWorkouts")} whatsapp={{ number: whatsapp, message: "Hello! When will my workout program be ready?" }} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {plan.days.map((d: any, i: number) => (
            <MotionCard key={i} delay={i * 0.05}>
              <Card className="border-border/50 bg-card/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-base font-bold uppercase">{d.day}</CardTitle>
                    <Badge variant="outline" className="text-primary">{d.focus}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {d.exercises?.map((ex: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg border border-border/50 bg-card/40 p-2.5 text-sm">
                      <span className="font-medium">{ex.name}</span>
                      <span className="text-xs text-muted-foreground">{ex.sets}×{ex.reps} · {ex.rest}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </MotionCard>
          ))}
        </div>
      )}

      {logs.length > 0 && (
        <div>
          <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider">{t("dashboard.completed")}</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {logs.map((l: any) => (
              <Card key={l.id} className="border-border/50 bg-card/40">
                <CardContent className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <p className="font-semibold">{l.planTitle ?? "Session"}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(l.completedAt)}</p>
                  </div>
                  <Badge variant="outline">{l.durationMin ?? 0} {t("common.minutes")}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <LogWorkoutDialog open={open} onOpenChange={setOpen} plan={plan} onSubmit={(v) => logMut.mutate(v)} loading={logMut.isPending} />
    </div>
  );
}

function LogWorkoutDialog({ open, onOpenChange, plan, onSubmit, loading }: any) {
  const { t } = useI18n();
  const [dayIdx, setDayIdx] = useState(0);
  const [duration, setDuration] = useState(45);
  const [notes, setNotes] = useState("");
  if (!plan) return null;
  const day = plan.days[dayIdx] ?? plan.days[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dashboard.completeWorkout")}</DialogTitle>
          <DialogDescription>{plan.title}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("dashboard.weeklySchedule")}</Label>
            <Select value={String(dayIdx)} onValueChange={(v) => setDayIdx(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {plan.days.map((d: any, i: number) => (
                  <SelectItem key={i} value={String(i)}>{d.day} · {d.focus}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("common.minutes")}: {duration}</Label>
            <Slider value={[duration]} onValueChange={(v) => setDuration(v[0])} min={10} max={180} step={5} />
          </div>
          <div className="space-y-2">
            <Label>{t("dashboard.energy")}</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did the session feel?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading}
            onClick={() => onSubmit({ planId: plan.id, planTitle: plan.title, dayJson: day, durationMin: duration, notes })}
          >
            {loading ? "..." : t("actions.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============== NUTRITION ============== */
export function Nutrition({ plan }: { plan: any }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: mealsData } = useQuery({
    queryKey: ["meals"],
    queryFn: () => apiFetch<any>("/api/nutrition/meals"),
    refetchInterval: 30000,
  });
  const { data: waterData } = useQuery({
    queryKey: ["water"],
    queryFn: () => apiFetch<any>("/api/nutrition/water"),
    refetchInterval: 30000,
  });

  const meals = mealsData?.meals ?? [];
  const cups = waterData?.cups ?? 0;
  const goal = plan?.waterCupsGoal ?? 8;
  const totCals = meals.reduce((s: number, m: any) => s + (m.calories ?? 0), 0);
  const totP = meals.reduce((s: number, m: any) => s + (m.proteinG ?? 0), 0);

  const mealMut = useMutation({
    mutationFn: (v: any) => apiFetch("/api/nutrition/meals", { json: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["meals"] }); setOpen(false); toast.success("Meal logged"); },
    onError: (e: any) => toast.error(e.message),
  });
  const waterMut = useMutation({
    mutationFn: (cups: number) => apiFetch("/api/nutrition/water", { json: { cups } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["water"] }),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/nutrition/meals?id=${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meals"] }),
  });

  if (!plan) return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold uppercase sm:text-3xl">{t("dashboard.nutrition")}</h2>
      <EmptyState title={t("dashboard.noNutrition")} desc={t("dashboard.noNutrition")} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold uppercase sm:text-3xl">{t("dashboard.nutrition")}</h2>
          <p className="text-sm text-muted-foreground">{plan.title}</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="mr-1 h-4 w-4" />{t("dashboard.addMeal")}</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t("dashboard.calories")} value={`${totCals}/${plan.dailyCalories ?? "—"}`} icon={Activity} />
        <KpiCard label={t("dashboard.protein")} value={`${totP}g`} />
        <KpiCard label={t("dashboard.water")} value={`${cups}/${goal}`} icon={Activity} />
        <KpiCard label={t("dashboard.carbs")} value={`${plan.carbsG ?? "—"}g`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-3"><CardTitle className="font-display text-sm font-bold uppercase">{t("dashboard.water")}</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={(cups / goal) * 100} className="h-2" />
              <p className="mt-1 text-xs text-muted-foreground">{cups} / {goal} cups</p>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={() => waterMut.mutate(1)}><Plus className="h-4 w-4" /></Button>
              <Button size="icon" variant="outline" onClick={() => waterMut.mutate(-1)} disabled={cups <= 0}><Minus className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-3"><CardTitle className="font-display text-sm font-bold uppercase">{t("dashboard.today")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {meals.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("dashboard.addMeal")}</p>
            ) : meals.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-card/40 p-2.5 text-sm">
                <div>
                  <p className="font-medium capitalize">{m.mealType}</p>
                  <p className="text-xs text-muted-foreground">{m.description}{m.calories ? ` · ${m.calories} kcal` : ""}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => delMut.mutate(m.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <MealDialog open={open} onOpenChange={setOpen} onSubmit={(v) => mealMut.mutate(v)} loading={mealMut.isPending} />
    </div>
  );
}

function MealDialog({ open, onOpenChange, onSubmit, loading }: any) {
  const { t } = useI18n();
  const [mealType, setMealType] = useState("breakfast");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{t("dashboard.addMeal")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("dashboard.today")}</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["breakfast", "lunch", "dinner", "snack"].map((m) => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Grilled chicken, rice, vegetables" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t("dashboard.calories")}</Label>
              <Input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("dashboard.protein")} (g)</Label>
              <Input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading || !description}
            onClick={() => onSubmit({ mealType, description, calories: Number(calories) || undefined, proteinG: Number(protein) || undefined })}
          >
            {t("actions.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============== PROGRESS ============== */
export function ProgressSection() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [photoOpen, setPhotoOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);

  const photosQ = useQuery({ queryKey: ["progress-photos"], queryFn: () => apiFetch<any>("/api/progress/photos") });
  const checkinsQ = useQuery({ queryKey: ["checkins"], queryFn: () => apiFetch<any>("/api/checkins") });

  const photoMut = useMutation({
    mutationFn: (v: any) => apiFetch("/api/progress/photos", { json: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["progress-photos"] }); setPhotoOpen(false); toast.success("Photo uploaded"); },
    onError: (e: any) => toast.error(e.message),
  });
  const checkinMut = useMutation({
    mutationFn: (v: any) => apiFetch("/api/checkins", { json: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["checkins"] }); setCheckinOpen(false); toast.success("Check-in submitted"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold uppercase sm:text-3xl">{t("dashboard.progress")}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCheckinOpen(true)}><CalendarCheck className="mr-1.5 h-4 w-4" />{t("dashboard.upcomingCheckins")}</Button>
          <Button onClick={() => setPhotoOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90"><ImagePlus className="mr-1.5 h-4 w-4" />{t("dashboard.progressPhotos")}</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-3"><CardTitle className="font-display text-sm font-bold uppercase">{t("dashboard.progressPhotos")}</CardTitle></CardHeader>
          <CardContent>
            {photosQ.isLoading ? <SectionLoading /> : photosQ.data?.photos?.length ? (
              <div className="grid grid-cols-3 gap-2">
                {photosQ.data.photos.map((p: any) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.id} src={p.url} alt={p.type} className="aspect-[3/4] w-full rounded-lg border border-border/50 object-cover" />
                ))}
              </div>
            ) : <EmptyState title={t("dashboard.progressPhotos")} desc={t("dashboard.progressPhotos")} />}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-3"><CardTitle className="font-display text-sm font-bold uppercase">{t("dashboard.upcomingCheckins")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {checkinsQ.isLoading ? <SectionLoading /> : checkinsQ.data?.checkIns?.length ? checkinsQ.data.checkIns.map((c: any) => (
              <div key={c.id} className="rounded-lg border border-border/50 bg-card/40 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{c.weekLabel}</p>
                  <StatusBadge status={c.status} />
                </div>
                <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  {c.weightKg && <span>{t("dashboard.weight")}: {c.weightKg}kg</span>}
                  {c.adherencePercent != null && <span>{t("dashboard.adherence")}: {c.adherencePercent}%</span>}
                  {c.energyLevel != null && <span>{t("dashboard.energy")}: {c.energyLevel}/10</span>}
                  {c.sleepHours != null && <span>{t("dashboard.sleep")}: {c.sleepHours}h</span>}
                </div>
                {c.coachReply && <p className="mt-2 rounded bg-primary/5 p-2 text-xs text-primary">Coach: {c.coachReply}</p>}
              </div>
            )) : <EmptyState title={t("dashboard.upcomingCheckins")} desc={t("dashboard.upcomingCheckins")} />}
          </CardContent>
        </Card>
      </div>

      <PhotoDialog open={photoOpen} onOpenChange={setPhotoOpen} onSubmit={(v) => photoMut.mutate(v)} loading={photoMut.isPending} />
      <CheckInDialog open={checkinOpen} onOpenChange={setCheckinOpen} onSubmit={(v) => checkinMut.mutate(v)} loading={checkinMut.isPending} />
    </div>
  );
}

function PhotoDialog({ open, onOpenChange, onSubmit, loading }: any) {
  const { t } = useI18n();
  const [type, setType] = useState("front");
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try { setUrl(await uploadFile(f)); toast.success("Image ready"); } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{t("dashboard.progressPhotos")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["front", "side", "back"].map((x) => <SelectItem key={x} value={x} className="capitalize">{x}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("actions.upload")}</Label>
            <div className="flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm hover:bg-accent">
                <Upload className="h-4 w-4" /> {uploading ? "..." : "Choose file"}
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>
              {url && <span className="text-xs text-primary">Ready</span>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Note</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading || uploading || !url} onClick={() => onSubmit({ url, type, note })}>
            {t("actions.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CheckInDialog({ open, onOpenChange, onSubmit, loading }: any) {
  const { t } = useI18n();
  const [weight, setWeight] = useState("");
  const [energy, setEnergy] = useState([7]);
  const [adherence, setAdherence] = useState([80]);
  const [sleep, setSleep] = useState("");
  const [notes, setNotes] = useState("");
  const week = `Week of ${new Date().toLocaleDateString("en-GB")}`;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{t("dashboard.upcomingCheckins")} — {week}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>{t("dashboard.weight")} (kg)</Label><Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t("dashboard.sleep")} (h)</Label><Input type="number" value={sleep} onChange={(e) => setSleep(e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>{t("dashboard.energy")}: {energy[0]}/10</Label><Slider value={energy} onValueChange={setEnergy} max={10} step={1} /></div>
          <div className="space-y-2"><Label>{t("dashboard.adherence")}: {adherence[0]}%</Label><Slider value={adherence} onValueChange={setAdherence} max={100} step={5} /></div>
          <div className="space-y-2"><Label>Notes</Label><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}
            onClick={() => onSubmit({ weekLabel: week, weightKg: Number(weight) || undefined, sleepHours: Number(sleep) || undefined, energyLevel: energy[0], adherencePercent: adherence[0], notes })}>
            {t("actions.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============== MESSAGES ============== */
export function Messages({ coachId }: { coachId?: string }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const { data } = useQuery({
    queryKey: ["messages"],
    queryFn: () => apiFetch<any>("/api/messages"),
    refetchInterval: 15000,
  });
  const messages = data?.messages ?? [];
  const sendMut = useMutation({
    mutationFn: (body: string) => apiFetch("/api/messages", { json: { body } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["messages"] }); setText(""); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase sm:text-3xl">{t("dashboard.messages")}</h2>
        <p className="text-sm text-muted-foreground">{t("coach.name")}</p>
      </div>
      <Card className="flex h-[60vh] flex-col border-border/50 bg-card/60">
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-2">
            {messages.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">{t("dashboard.noMessages")}</p> : messages.map((m: any) => (
              <div key={m.id} className={`flex ${m.sender === "CLIENT" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.sender === "CLIENT" ? "bg-primary text-primary-foreground" : "bg-card border border-border/50"}`}>
                  <p>{m.body}</p>
                  <p className="mt-0.5 text-[10px] opacity-60">{formatTime(m.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex items-center gap-2 border-t border-border/50 p-3">
          <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) sendMut.mutate(text.trim()); }} placeholder={t("dashboard.sendMessage")} />
          <Button onClick={() => text.trim() && sendMut.mutate(text.trim())} className="bg-primary text-primary-foreground hover:bg-primary/90"><Send className="h-4 w-4" /></Button>
        </div>
      </Card>
    </div>
  );
}

/* ============== SUBSCRIPTION ============== */
export function Subscription({ me }: { me: any }) {
  const { t, locale } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const sub = me?.activeSubscription;
  const payments = me?.payments ?? [];
  const packagesQ = useQuery({ queryKey: ["site"], queryFn: () => apiFetch<any>("/api/site") });
  const siteContent = packagesQ.data?.content;

  const payMut = useMutation({
    mutationFn: (v: any) => apiFetch("/api/payments", { json: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["me"] }); setOpen(false); toast.success("Payment submitted for verification"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase sm:text-3xl">{t("dashboard.subscription")}</h2>
        <p className="text-sm text-muted-foreground">{t("dashboard.subscriptionStatus")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-sm font-bold uppercase">{t("dashboard.activePackage")}</CardTitle>
              {sub && <StatusBadge status={sub.status} />}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {sub ? (
              <>
                <p><span className="text-muted-foreground">{t("dashboard.activePackage")}:</span> {sub.package?.title}</p>
                <p><span className="text-muted-foreground">{t("common.monthly")}:</span> {formatMAD(sub.amountMAD, locale)}</p>
                <p><span className="text-muted-foreground">Start:</span> {formatDate(sub.startDate, locale)}</p>
                <p><span className="text-muted-foreground">End:</span> {formatDate(sub.endDate, locale)}</p>
              </>
            ) : (
              <p className="text-muted-foreground">{t("dashboard.noPackage")}</p>
            )}
            <Button onClick={() => setOpen(true)} className="mt-2 w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Banknote className="mr-2 h-4 w-4" />{t("dashboard.uploadPayment")}
            </Button>
          </CardContent>
        </Card>

        {siteContent && (
          <Card className="border-border/50 bg-card/60">
            <CardHeader className="pb-3"><CardTitle className="font-display text-sm font-bold uppercase">{t("admin.bankDetails")}</CardTitle></CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <BankRow label="Bank" value={siteContent.bankName} />
              <BankRow label="Account holder" value={siteContent.bankAccountName} />
              <BankRow label="IBAN / RIB" value={siteContent.bankIban} />
              <BankRow label="RIB" value={siteContent.bankRIB} />
              <p className="mt-2 rounded-lg bg-primary/5 p-2 text-xs text-muted-foreground">{siteContent.paymentInstructions}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider">Payment history</h3>
        <div className="grid gap-2">
          {payments.length === 0 ? <p className="text-sm text-muted-foreground">No payments yet.</p> : payments.map((p: any) => (
            <Card key={p.id} className="border-border/50 bg-card/40">
              <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                <div>
                  <p className="font-semibold">{p.invoiceNo}</p>
                  <p className="text-xs text-muted-foreground">{p.packageTitle}</p>
                </div>
                <p className="font-display text-lg font-bold text-primary">{formatMAD(p.amountMAD, locale)}</p>
                <StatusBadge status={p.status} />
                <div className="text-xs text-muted-foreground">{formatDate(p.createdAt, locale)}</div>
                {p.proofUrl && <a href={p.proofUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline">View proof</a>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <PaymentDialog open={open} onOpenChange={setOpen} packages={packagesQ.data?.packages ?? []} sub={sub} onSubmit={(v) => payMut.mutate(v)} loading={payMut.isPending} />
    </div>
  );
}

function BankRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return <p><span className="text-muted-foreground">{label}:</span> <span className="font-mono text-foreground">{value}</span></p>;
}

function PaymentDialog({ open, onOpenChange, packages, sub, onSubmit, loading }: any) {
  const { t, locale } = useI18n();
  const [pkgId, setPkgId] = useState(sub?.package?.id ?? "");
  const [uploading, setUploading] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const pkg = packages.find((p: any) => p.id === pkgId);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try { setProofUrl(await uploadFile(f)); toast.success("Proof ready"); } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{t("dashboard.uploadPayment")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("onboarding.package")}</Label>
            <Select value={pkgId} onValueChange={setPkgId}>
              <SelectTrigger><SelectValue placeholder="Select package" /></SelectTrigger>
              <SelectContent>
                {packages.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.title} — {formatMAD(p.priceMAD, locale)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {pkg && <p className="rounded-lg bg-primary/5 p-2 text-sm">Amount to transfer: <span className="font-bold text-primary">{formatMAD(pkg.priceMAD, locale)}</span></p>}
          <div className="space-y-2">
            <Label>Payment proof</Label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm hover:bg-accent">
              <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Choose image"}
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
            {proofUrl && <span className="ml-2 text-xs text-primary">Ready</span>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading || uploading || !pkg || !proofUrl}
            onClick={() => onSubmit({ packageId: pkg?.id, subscriptionId: sub?.package?.id === pkgId ? sub?.id : undefined, proofUrl })}>
            {t("actions.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============== CONSULTATIONS ============== */
export function Consultations({ whatsapp }: { whatsapp?: string }) {
  const { t, locale } = useI18n();
  const qc = useQueryClient();
  const [slotId, setSlotId] = useState("");
  const [goals, setGoals] = useState("");
  const slotsQ = useQuery({ queryKey: ["slots"], queryFn: () => apiFetch<any>("/api/consultations/slots") });
  const bookingsQ = useQuery({ queryKey: ["my-bookings"], queryFn: () => apiFetch<any>("/api/consultations") });
  const bookMut = useMutation({
    mutationFn: () => apiFetch("/api/consultations/book", { json: { slotId, goals } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["slots"] }); qc.invalidateQueries({ queryKey: ["my-bookings"] }); setSlotId(""); setGoals(""); toast.success("Consultation requested"); },
    onError: (e: any) => toast.error(e.message),
  });

  const slots = (slotsQ.data?.slots ?? []).filter((s: any) => !s.booked);
  const bookings = bookingsQ.data?.bookings ?? [];

  // group slots by day
  const byDay = new Map<string, any[]>();
  for (const s of slots) {
    const d = new Date(s.start).toLocaleDateString(locale === "fr" ? "fr-MA" : "en-MA", { weekday: "long", day: "2-digit", month: "short" });
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d)!.push(s);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase sm:text-3xl">{t("dashboard.consultations")}</h2>
        <p className="text-sm text-muted-foreground">{t("cta.bookCall")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-3"><CardTitle className="font-display text-sm font-bold uppercase">Available slots</CardTitle></CardHeader>
          <CardContent>
            {slotsQ.isLoading ? <SectionLoading /> : slots.length === 0 ? (
              <EmptyState title="No slots available" desc="Your coach hasn't opened consultation slots yet." whatsapp={{ number: whatsapp, message: "Hello! When can I book a consultation?" }} />
            ) : (
              <div className="space-y-4">
                {Array.from(byDay.entries()).map(([day, ss]) => (
                  <div key={day}>
                    <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">{day}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {ss.map((s) => (
                        <button key={s.id} onClick={() => setSlotId(s.id)}
                          className={`rounded-lg border p-2 text-xs transition ${slotId === s.id ? "border-primary bg-primary/10 text-primary" : "border-border/50 hover:border-primary/40"}`}>
                          {formatTime(s.start, locale)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-3"><CardTitle className="font-display text-sm font-bold uppercase">Your goals</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Textarea rows={4} value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="Describe your goals for this consultation..." />
            <Button onClick={() => bookMut.mutate()} disabled={!slotId || goals.length < 10 || bookMut.isPending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {t("cta.bookCall")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {bookings.length > 0 && (
        <div>
          <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider">Your bookings</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {bookings.map((b: any) => (
              <Card key={b.id} className="border-border/50 bg-card/40">
                <CardContent className="p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{formatDate(b.slot?.start, locale)} · {formatTime(b.slot?.start, locale)}</p>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{b.goals}</p>
                  {b.meetingLink && <a href={b.meetingLink} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-primary underline">Join meeting</a>}
                  {b.coachNote && <p className="mt-1 text-xs text-primary">Coach: {b.coachNote}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============== PROFILE ============== */
export function Profile({ me, whatsapp }: { me: any; whatsapp?: string }) {
  const { t, locale } = useI18n();
  const p = me?.profile;
  const dataExportMsg = "Hello! I'd like to request a data export / account deletion as per the privacy policy.";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase sm:text-3xl">{t("dashboard.profile")}</h2>
        <p className="text-sm text-muted-foreground">{me?.user?.email}</p>
      </div>

      {p ? (
        <Card className="border-border/50 bg-card/60">
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <ProfileRow label={t("onboarding.fullName")} value={p.fullName} />
            <ProfileRow label={t("onboarding.age")} value={p.age} />
            <ProfileRow label={t("onboarding.height")} value={p.heightCm ? `${p.heightCm} cm` : "—"} />
            <ProfileRow label={t("onboarding.weight")} value={p.weightKg ? `${p.weightKg} kg` : "—"} />
            <ProfileRow label={t("onboarding.city")} value={p.city} />
            <ProfileRow label={t("auth.phone")} value={me?.user?.phone} />
            <ProfileRow label={t("onboarding.goal")} value={p.goal} />
            <ProfileRow label={t("onboarding.experience")} value={p.experience} />
            <ProfileRow label={t("onboarding.equipment")} value={p.equipment?.join(", ")} />
            <ProfileRow label={t("onboarding.availability")} value={p.weeklyAvailability} />
            <ProfileRow label={t("onboarding.limitations")} value={p.limitations || "—"} />
          </CardContent>
        </Card>
      ) : (
        <EmptyState title={t("dashboard.profile")} desc={t("dashboard.profile")} />
      )}

      <Card className="border-border/50 bg-card/40">
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 font-display text-sm font-bold uppercase"><ShieldCheck className="h-4 w-4 text-primary" />Privacy & data</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-xs text-muted-foreground">
          <p>
            {locale === "fr" ? "Vos données sont privées et ne sont jamais partagées publiquement. Vous pouvez demander l'export ou la suppression de vos données à tout moment en contactant votre coach." : locale === "ar" ? "بياناتك خاصة ولا تُشارك علنا. يمكنك طلب تصدير أو حذف بياناتك في أيtime بالتواصل مع مدربك." : "Your data is private and never shared publicly. You can request data export or deletion at any time by contacting your coach."}
          </p>
          <div className="flex flex-wrap gap-2">
            <a href={buildWhatsappLink(whatsapp, dataExportMsg)} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline"><ShieldCheck className="mr-1.5 h-4 w-4" />Request data export / deletion</Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value?: any }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}

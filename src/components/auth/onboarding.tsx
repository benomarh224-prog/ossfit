"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowLeft, Check, Loader2, Dumbbell, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useI18n, formatMAD } from "@/lib/i18n/i18n-provider";
import { apiFetch } from "@/lib/client-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

const schema = z.object({
  fullName: z.string().min(2),
  age: z.coerce.number().int().min(13).max(100),
  heightCm: z.coerce.number().min(120).max(230),
  weightKg: z.coerce.number().min(35).max(250),
  city: z.string().min(2),
  goal: z.enum(["muscle", "fat_loss", "recomp", "strength", "health"]),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  weeklyAvailability: z.enum(["avail2", "avail4", "avail6"]),
  equipment: z.array(z.string()).min(1, "Select at least one"),
  preferredPackageId: z.string().optional(),
  limitations: z.string().optional(),
  injuryConsent: z.boolean(),
});
type Values = z.infer<typeof schema>;

const EQUIPMENT = [
  "Full gym",
  "Dumbbells",
  "Barbell",
  "Resistance bands",
  "Kettlebells",
  "Pull-up bar",
  "Cardio machine",
  "Bodyweight only",
];

const GOALS = [
  { id: "muscle", icon: "💪" },
  { id: "fat_loss", icon: "🔥" },
  { id: "recomp", icon: "⚖️" },
  { id: "strength", icon: "🏋️" },
  { id: "health", icon: "❤️" },
] as const;

const EXP = [
  { id: "beginner" },
  { id: "intermediate" },
  { id: "advanced" },
] as const;

const AVAIL = [
  { id: "avail2", count: "2-3" },
  { id: "avail4", count: "4-5" },
  { id: "avail6", count: "6+" },
] as const;

export function Onboarding({ packages }: { packages: any[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      equipment: [],
      injuryConsent: false,
      goal: "muscle",
      experience: "beginner",
      weeklyAvailability: "avail4",
    },
    mode: "onChange",
  });

  const goal = form.watch("goal");
  const experience = form.watch("experience");
  const availability = form.watch("weeklyAvailability");
  const equipment = form.watch("equipment");
  const injuryConsent = form.watch("injuryConsent");

  const TOTAL = 4;
  const progressPct = ((step + 1) / TOTAL) * 100;

  const goalLabel = (g: string) =>
    t(`onboarding.goal${g.charAt(0).toUpperCase()}${g.slice(1)}`.replace("Fat_loss", "Fat"));
  const expLabel = (e: string) =>
    t(`onboarding.exp${e.charAt(0).toUpperCase()}${e.slice(1)}`);
  const availLabel = (a: string) => t(`onboarding.${a}`);

  async function next() {
    // basic validation per step before advancing
    if (step === 0) {
      const v = form.getValues();
      const ok =
        v.fullName?.length >= 2 &&
        v.age >= 13 && v.age <= 100 &&
        v.heightCm >= 120 && v.heightCm <= 230 &&
        v.weightKg >= 35 && v.weightKg <= 250 &&
        v.city?.length >= 2;
      if (!ok) {
        form.trigger(["fullName", "age", "heightCm", "weightKg", "city"]);
        return;
      }
    }
    if (step === 2 && equipment.length === 0) {
      toast.error(t("onboarding.equipment"));
      return;
    }
    if (step < TOTAL - 1) setStep(step + 1);
  }

  async function onFinish() {
    const valid = await form.trigger();
    if (!valid) {
      toast.error("Please complete the required fields");
      return;
    }
    if (!injuryConsent) {
      toast.error(t("onboarding.consent"));
      return;
    }
    const values = form.getValues();
    setSubmitting(true);
    try {
      await apiFetch("/api/onboarding", { json: values });
      toast.success(t("onboarding.success"));
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Dumbbell className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">
            {t("onboarding.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("onboarding.subtitle")}</p>
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("onboarding.step", { n: step + 1, total: TOTAL })}</span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>

        <Card className="border-border/50 bg-card">
          <CardContent className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
              >
                {step === 0 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label>{t("onboarding.fullName")}</Label>
                      <Input className="mt-1.5" {...form.register("fullName")} />
                      {form.formState.errors.fullName && (
                        <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label>{t("onboarding.age")}</Label>
                      <Input type="number" className="mt-1.5" {...form.register("age", { valueAsNumber: true })} />
                      {form.formState.errors.age && <p className="text-xs text-destructive">{form.formState.errors.age.message}</p>}
                    </div>
                    <div>
                      <Label>{t("onboarding.city")}</Label>
                      <Input className="mt-1.5" {...form.register("city")} />
                    </div>
                    <div>
                      <Label>{t("onboarding.height")}</Label>
                      <Input type="number" className="mt-1.5" {...form.register("heightCm", { valueAsNumber: true })} />
                    </div>
                    <div>
                      <Label>{t("onboarding.weight")}</Label>
                      <Input type="number" className="mt-1.5" {...form.register("weightKg", { valueAsNumber: true })} />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-semibold">{t("onboarding.goal")}</Label>
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {GOALS.map((g) => (
                          <button
                            type="button"
                            key={g.id}
                            onClick={() => form.setValue("goal", g.id, { shouldValidate: true })}
                            className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition ${
                              goal === g.id
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border/50 bg-card hover:border-primary/40"
                            }`}
                          >
                            <span className="text-2xl">{g.icon}</span>
                            <span className="text-xs font-medium">{goalLabel(g.id)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">{t("onboarding.experience")}</Label>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {EXP.map((e) => (
                          <button
                            type="button"
                            key={e.id}
                            onClick={() => form.setValue("experience", e.id, { shouldValidate: true })}
                            className={`rounded-xl border p-3 text-xs font-medium transition ${
                              experience === e.id
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border/50 bg-card hover:border-primary/40"
                            }`}
                          >
                            {expLabel(e.id)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">{t("onboarding.availability")}</Label>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {AVAIL.map((a) => (
                          <button
                            type="button"
                            key={a.id}
                            onClick={() => form.setValue("weeklyAvailability", a.id, { shouldValidate: true })}
                            className={`rounded-xl border p-3 text-xs font-medium transition ${
                              availability === a.id
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border/50 bg-card hover:border-primary/40"
                            }`}
                          >
                            {a.count} <span className="text-muted-foreground">{t("dashboard.days")}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-semibold">{t("onboarding.equipment")}</Label>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {EQUIPMENT.map((eq) => {
                          const selected = equipment.includes(eq);
                          return (
                            <button
                              type="button"
                              key={eq}
                              onClick={() => {
                                const next = selected
                                  ? equipment.filter((x) => x !== eq)
                                  : [...equipment, eq];
                                form.setValue("equipment", next, { shouldValidate: true });
                              }}
                              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                selected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border/50 bg-card hover:border-primary/40"
                              }`}
                            >
                              {selected && <Check className="mr-1 inline h-3 w-3" />}
                              {eq}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">{t("onboarding.package")}</Label>
                      <div className="mt-3 grid gap-2">
                        {packages.map((p) => (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => form.setValue("preferredPackageId", p.id, { shouldValidate: true })}
                            className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                              form.watch("preferredPackageId") === p.id
                                ? "border-primary bg-primary/10"
                                : "border-border/50 bg-card hover:border-primary/40"
                            }`}
                          >
                            <div>
                              <p className="text-sm font-semibold">{p.title}</p>
                              <p className="text-xs text-muted-foreground">{p.supportLevel}</p>
                            </div>
                            <span className="font-display text-lg font-bold text-primary">
                              {formatMAD(p.priceMAD, locale)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <Label>{t("onboarding.limitations")}</Label>
                      <Textarea
                        className="mt-1.5"
                        rows={4}
                        placeholder={t("onboarding.limitationsPlaceholder")}
                        {...form.register("limitations")}
                      />
                    </div>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-4">
                      <Checkbox
                        checked={injuryConsent}
                        onCheckedChange={(v) => form.setValue("injuryConsent", !!v, { shouldValidate: true })}
                      />
                      <span className="text-xs text-muted-foreground">{t("onboarding.consent")}</span>
                    </label>
                    <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        {locale === "fr"
                          ? "Vos données de santé sont optionnelles, protégées et utilisées uniquement pour votre coaching."
                          : locale === "ar"
                          ? "بياناتك الصحية اختيارية ومحمية وتُستخدم فقط لأغراض التدريب."
                          : "Your health-related data is optional, protected, and used only for coaching purposes."}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-7 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                {t("actions.back")}
              </Button>
              {step < TOTAL - 1 ? (
                <Button type="button" onClick={next} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {t("actions.next")}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={onFinish}
                  disabled={submitting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {submitting ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-1.5 h-4 w-4" />
                  )}
                  {t("onboarding.complete")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

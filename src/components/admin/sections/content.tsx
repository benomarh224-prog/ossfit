"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, Image as ImageIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SectionShell, SectionLoading, ErrorState, ImageUpload } from "../ui-bits";
import { apiFetch, type AdminSiteContent } from "../lib";
import { heroImageSource } from "@/lib/hero-media";

const schema = z.object({
  brandName: z.string().min(1),
  coachName: z.string().min(1),
  coachCity: z.string().min(1),
  whatsappNumber: z.string().min(1),
  whatsappEnabled: z.boolean(),
  heroImage: z.string(),
  coachPortrait: z.string(),
  heroTitle: z.string(),
  heroSubtitle: z.string(),
  aboutStory: z.string(),
  aboutPhilosophy: z.string(),
  bankName: z.string().optional().or(z.literal("")),
  bankAccountName: z.string().optional().or(z.literal("")),
  bankIban: z.string().optional().or(z.literal("")),
  bankRIB: z.string().optional().or(z.literal("")),
  paymentInstructions: z.string(),
  heroStatClients: z.coerce.number().int().min(0),
  heroStatPrograms: z.coerce.number().int().min(0),
  heroStatYears: z.coerce.number().int().min(0),
  heroStatSuccess: z.coerce.number().int().min(0).max(100),
  statsVerified: z.boolean(),
  instagramUrl: z.string().optional().or(z.literal("")),
  tiktokUrl: z.string().optional().or(z.literal("")),
  youtubeUrl: z.string().optional().or(z.literal("")),
  facebookUrl: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function ContentSection() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery<{ content: AdminSiteContent }>({
    queryKey: ["admin", "content"],
    queryFn: () => apiFetch("/api/admin/content"),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      brandName: "COACH OUSSAMA",
      coachName: "Oussama",
      coachCity: "Morocco",
      whatsappNumber: "+212610296995",
      whatsappEnabled: true,
      heroImage: "/images/hero.jpg",
      coachPortrait: "/images/service-coaching.jpg",
      heroTitle: "YOUR GOAL. YOUR PLAN. YOUR PROGRESS.",
      heroSubtitle: "",
      aboutStory: "",
      aboutPhilosophy: "",
      bankName: "",
      bankAccountName: "",
      bankIban: "",
      bankRIB: "",
      paymentInstructions: "",
      heroStatClients: 0,
      heroStatPrograms: 0,
      heroStatYears: 0,
      heroStatSuccess: 0,
      statsVerified: false,
      instagramUrl: "",
      tiktokUrl: "",
      youtubeUrl: "",
      facebookUrl: "",
    },
  });

  React.useEffect(() => {
    if (data?.content) {
      const c = data.content;
      form.reset({
        brandName: c.brandName,
        coachName: c.coachName,
        coachCity: c.coachCity,
        whatsappNumber: c.whatsappNumber,
        whatsappEnabled: c.whatsappEnabled,
        heroImage: c.heroImage,
        coachPortrait: c.coachPortrait,
        heroTitle: c.heroTitle,
        heroSubtitle: c.heroSubtitle,
        aboutStory: c.aboutStory,
        aboutPhilosophy: c.aboutPhilosophy,
        bankName: c.bankName ?? "",
        bankAccountName: c.bankAccountName ?? "",
        bankIban: c.bankIban ?? "",
        bankRIB: c.bankRIB ?? "",
        paymentInstructions: c.paymentInstructions,
        heroStatClients: c.heroStatClients,
        heroStatPrograms: c.heroStatPrograms,
        heroStatYears: c.heroStatYears,
        heroStatSuccess: c.heroStatSuccess,
        statsVerified: c.statsVerified,
        instagramUrl: c.instagramUrl ?? "",
        tiktokUrl: c.tiktokUrl ?? "",
        youtubeUrl: c.youtubeUrl ?? "",
        facebookUrl: c.facebookUrl ?? "",
      });
    }
  }, [data]);

  const saveMut = useMutation({
    mutationFn: (values: FormValues) =>
      apiFetch("/api/admin/content", {
        method: "PATCH",
        body: JSON.stringify({
          ...values,
        }),
      }),
    onSuccess: () => {
      toast.success("Site content saved");
      qc.invalidateQueries({ queryKey: ["admin", "content"] });
      qc.invalidateQueries({ queryKey: ["site"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const { register, handleSubmit, control, formState, watch, setValue } = form;
  const isDirty = formState.isDirty;

  if (isLoading) {
    return (
      <SectionShell title={t("admin.content")}>
        <SectionLoading rows={6} />
      </SectionShell>
    );
  }
  if (isError || !data) {
    return (
      <SectionShell title={t("admin.content")}>
        <ErrorState onRetry={() => refetch()} />
      </SectionShell>
    );
  }

  return (
    <SectionShell
      title={t("admin.content")}
      description={t("admin.editContent")}
      actions={
        <Button
          onClick={handleSubmit((v) => saveMut.mutate(v))}
          disabled={saveMut.isPending || !isDirty}
        >
          {saveMut.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {t("actions.save")}
        </Button>
      }
    >
      <form onSubmit={handleSubmit((v) => saveMut.mutate(v))} className="space-y-6">
        {/* Brand block */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Brand &amp; Coach identity</CardTitle>
            <CardDescription>
              Used in the site header, footer and contact links.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Brand name">
              <Input {...register("brandName")} />
            </Field>
            <Field label="Coach name">
              <Input {...register("coachName")} />
            </Field>
            <Field label="Coach city">
              <Input {...register("coachCity")} />
            </Field>
            <Field label="WhatsApp number">
              <Input {...register("whatsappNumber")} placeholder="+2126..." />
            </Field>
            <label className="col-span-full flex items-center gap-2 sm:col-span-1">
              <Switch
                checked={watch("whatsappEnabled")}
                onCheckedChange={(v) => setValue("whatsappEnabled", v, { shouldDirty: true })}
              />
              <span className="text-sm">Enable WhatsApp button</span>
            </label>
          </CardContent>
        </Card>

        {/* Hero */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Hero section</CardTitle>
            <CardDescription>
              The first thing visitors see.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageUpload
                label="Hero campaign image"
                value={heroImageSource(watch("heroImage"))}
                onChange={(url) => setValue("heroImage", url, { shouldDirty: true })}
              />
              <ImageUpload
                label="Coach portrait"
                value={watch("coachPortrait") || undefined}
                onChange={(url) => setValue("coachPortrait", url, { shouldDirty: true })}
              />
            </div>
            <Field label="Hero title">
              <Input {...register("heroTitle")} className="font-display text-lg" />
            </Field>
            <Field label="Hero subtitle">
              <Textarea {...register("heroSubtitle")} rows={3} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-4">
              <Field label="Stat: clients">
                <Input type="number" {...register("heroStatClients")} />
              </Field>
              <Field label="Stat: programs">
                <Input type="number" {...register("heroStatPrograms")} />
              </Field>
              <Field label="Stat: years">
                <Input type="number" {...register("heroStatYears")} />
              </Field>
              <Field label="Stat: success %">
                <Input type="number" {...register("heroStatSuccess")} />
              </Field>
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
              <Switch
                checked={watch("statsVerified")}
                onCheckedChange={(v) => setValue("statsVerified", v, { shouldDirty: true })}
              />
              <span>
                <span className="font-medium text-foreground">Show stats publicly</span>
                <span className="block text-xs text-muted-foreground">
                  Only displays stats when checked (truthful advertising).
                </span>
              </span>
            </label>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">About the coach</CardTitle>
            <CardDescription>Your story and your coaching philosophy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Story">
              <Textarea {...register("aboutStory")} rows={5} />
            </Field>
            <Field label="Philosophy">
              <Textarea {...register("aboutPhilosophy")} rows={5} />
            </Field>
          </CardContent>
        </Card>

        {/* Bank details */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">{t("admin.bankDetails")}</CardTitle>
            <CardDescription>
              Shown to clients before they upload a payment proof.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Bank name">
                <Input {...register("bankName")} placeholder="e.g. Attijariwafa Bank" />
              </Field>
              <Field label="Account holder">
                <Input {...register("bankAccountName")} />
              </Field>
              <Field label="IBAN">
                <Input {...register("bankIban")} placeholder="MA..." />
              </Field>
              <Field label="RIB">
                <Input {...register("bankRIB")} />
              </Field>
            </div>
            <Field label="Payment instructions">
              <Textarea {...register("paymentInstructions")} rows={3} />
            </Field>
          </CardContent>
        </Card>

        {/* Social */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Social links</CardTitle>
            <CardDescription>Leave blank to hide from the footer.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Instagram">
              <Input {...register("instagramUrl")} placeholder="https://instagram.com/..." />
            </Field>
            <Field label="TikTok">
              <Input {...register("tiktokUrl")} placeholder="https://tiktok.com/@..." />
            </Field>
            <Field label="YouTube">
              <Input {...register("youtubeUrl")} placeholder="https://youtube.com/@..." />
            </Field>
            <Field label="Facebook">
              <Input {...register("facebookUrl")} placeholder="https://facebook.com/..." />
            </Field>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button type="submit" disabled={saveMut.isPending || !isDirty}>
            {saveMut.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {t("actions.save")}
          </Button>
        </div>
      </form>
      <ImageIcon className="hidden" />
    </SectionShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

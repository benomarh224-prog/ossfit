"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Users, Activity, Banknote, Inbox, ListChecks, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n, formatMAD } from "@/lib/i18n/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KpiCard, SectionLoading, ErrorState, SectionShell } from "../ui-bits";
import { apiFetch, type AdminAnalytics } from "../lib";

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-popover/95 p-3 text-xs shadow-xl backdrop-blur">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground">
            {typeof p.value === "number" && p.dataKey === "revenue"
              ? formatMAD(p.value)
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function OverviewSection({ onLaunch }: { onLaunch: () => void }) {
  const { t, locale } = useI18n();
  const { data, isLoading, isError, refetch } = useQuery<AdminAnalytics>({
    queryKey: ["admin", "analytics"],
    queryFn: () => apiFetch<AdminAnalytics>("/api/admin/analytics"),
  });

  if (isLoading) {
    return (
      <SectionShell title={t("admin.overview")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <SectionLoading rows={1} />
            </Card>
          ))}
        </div>
        <SectionLoading rows={4} />
      </SectionShell>
    );
  }

  if (isError || !data) {
    return (
      <SectionShell title={t("admin.overview")}>
        <ErrorState message={t("common.error")} onRetry={() => refetch()} />
      </SectionShell>
    );
  }

  return (
    <SectionShell title={t("admin.overview")} description={t("dashboard.subtitle")}>
      <Card className="flex flex-wrap items-center justify-between gap-3 border-primary/20 bg-primary/5 p-4"><div className="flex items-center gap-3"><ListChecks className="size-5 shrink-0 text-primary" /><p className="text-sm font-medium">{locale === "ar" ? "كمل إعداداتك وراجع خطوات الانطلاق" : locale === "fr" ? "Complétez vos réglages et préparez le lancement" : "Complete your settings and prepare for launch"}</p></div><Button variant="outline" className="min-h-11 h-auto whitespace-normal" onClick={onLaunch}>{locale === "ar" ? "تجهيز الموقع" : locale === "fr" ? "Préparer le lancement" : "Launch checklist"}<ArrowRight className="size-4 rtl:rotate-180" /></Button></Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          index={0}
          label={t("admin.totalClients")}
          value={data.totalClients}
          icon={Users}
          hint={`${data.activeClients} active`}
        />
        <KpiCard
          index={1}
          label={t("admin.activeClients")}
          value={data.activeClients}
          icon={Activity}
        />
        <KpiCard
          index={2}
          label={t("admin.monthlyRevenue")}
          value={formatMAD(data.monthlyRevenue, locale)}
          icon={Banknote}
        />
        <KpiCard
          index={3}
          label={t("admin.newApplications")}
          value={data.pendingProfiles}
          icon={Inbox}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>6-month trend</CardTitle>
            <CardDescription>{t("admin.newApplications")} & {t("admin.monthlyRevenue").toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyTrend} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name={t("admin.monthlyRevenue")}
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#revGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    name={t("admin.newApplications")}
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    fill="url(#appGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.packageDistribution")}</CardTitle>
            <CardDescription>Active subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.packageDistribution.length ? data.packageDistribution : [{ name: "None", value: 1 }]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    stroke="var(--card)"
                  >
                    {data.packageDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

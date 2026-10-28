"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  Activity,
  Banknote,
  Inbox,
  TrendingUp,
  RefreshCw,
  Receipt,
  CreditCard,
} from "lucide-react";
import { useI18n, formatMAD } from "@/lib/i18n/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KpiCard, SectionLoading, ErrorState, SectionShell } from "../ui-bits";
import { apiFetch, type AdminAnalytics } from "../lib";

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

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

export default function AnalyticsSection() {
  const { t, locale } = useI18n();
  const { data, isLoading, isError, refetch } = useQuery<AdminAnalytics>({
    queryKey: ["admin", "analytics"],
    queryFn: () => apiFetch<AdminAnalytics>("/api/admin/analytics"),
  });

  if (isLoading) {
    return (
      <SectionShell title={t("admin.analytics")}>
        <SectionLoading rows={6} />
      </SectionShell>
    );
  }
  if (isError || !data) {
    return (
      <SectionShell title={t("admin.analytics")}>
        <ErrorState onRetry={() => refetch()} />
      </SectionShell>
    );
  }

  return (
    <SectionShell
      title={t("admin.analytics")}
      description="Premium performance dashboard"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard index={0} label={t("admin.totalClients")} value={data.totalClients} icon={Users} />
        <KpiCard index={1} label={t("admin.activeClients")} value={data.activeClients} icon={Activity} />
        <KpiCard
          index={2}
          label={t("admin.monthlyRevenue")}
          value={formatMAD(data.monthlyRevenue, locale)}
          icon={Banknote}
        />
        <KpiCard index={3} label={t("admin.newApplications")} value={data.pendingProfiles} icon={Inbox} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          index={0}
          label="Total revenue"
          value={formatMAD(data.totalRevenue, locale)}
          icon={TrendingUp}
        />
        <KpiCard index={1} label={t("admin.renewals")} value={data.renewals} icon={RefreshCw} />
        <KpiCard index={2} label="Pending payments" value={data.pendingPayments} icon={Receipt} />
        <KpiCard index={3} label="Total payments" value={data.totalPayments} icon={CreditCard} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">Monthly trend (stacked)</CardTitle>
            <CardDescription>
              {t("admin.newApplications")} &amp; {t("admin.monthlyRevenue").toLowerCase()} over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyTrend} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
                  <Bar
                    dataKey="applications"
                    name={t("admin.newApplications")}
                    stackId="a"
                    fill="var(--chart-2)"
                    radius={[0, 0, 4, 4]}
                  />
                  <Bar
                    dataKey="revenue"
                    name={t("admin.monthlyRevenue")}
                    stackId="a"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">{t("admin.packageDistribution")}</CardTitle>
            <CardDescription>Active subscription breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={
                      data.packageDistribution.length
                        ? data.packageDistribution
                        : [{ name: "None", value: 1 }]
                    }
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    stroke="var(--card)"
                  >
                    {data.packageDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Applications over time</CardTitle>
          <CardDescription>Monthly new applications (last 6 months)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrend} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="applications"
                  name={t("admin.newApplications")}
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--chart-1)" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </SectionShell>
  );
}

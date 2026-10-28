"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Inbox } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { buildWhatsappLink } from "@/lib/client-utils";
import { ReactNode } from "react";

export const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-primary/15 text-primary border-primary/30",
  APPROVED: "bg-primary/15 text-primary border-primary/30",
  PENDING: "bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/30",
  REQUESTED: "bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/30",
  EXPIRED: "bg-muted text-muted-foreground border-border",
  CANCELLED: "bg-muted text-muted-foreground border-border",
  REJECTED: "bg-destructive/15 text-destructive border-destructive/30",
  VERIFIED: "bg-primary/15 text-primary border-primary/30",
  SUBMITTED: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  COMPLETED: "bg-primary/15 text-primary border-primary/30",
  PAUSED: "bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/30",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] || "bg-muted text-muted-foreground border-border";
  return (
    <Badge variant="outline" className={cn("uppercase", cls)}>
      {status}
    </Badge>
  );
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: ReactNode;
  icon?: any;
  hint?: string;
}) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          {Icon && <Icon className="h-4 w-4 text-primary" />}
        </div>
        <p className="mt-2 break-words text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export function SectionLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-2xl" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  desc,
  whatsapp,
}: {
  title: string;
  desc: string;
  whatsapp?: { number?: string; message: string };
}) {
  const { t } = useI18n();
  return (
    <Card className="gap-0 border-dashed py-0">
      <CardContent className="flex flex-col items-center justify-center gap-3 px-5 py-7 text-center sm:p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Inbox className="h-6 w-6" />
        </span>
        <h3 className="font-display text-lg font-bold uppercase">{title}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{desc}</p>
        {whatsapp && (
          <a href={buildWhatsappLink(whatsapp.number, whatsapp.message)} target="_blank" rel="noreferrer">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <MessageCircle className="mr-2 h-4 w-4 text-[#25D366]" />
              {t("cta.contact")}
            </Button>
          </a>
        )}
      </CardContent>
    </Card>
  );
}

export function MotionCard({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      className="min-w-0"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  );
}

export function formatDate(d: string | Date | null | undefined, locale: string = "en") {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString(locale === "fr" ? "fr-MA" : locale === "ar" ? "ar-MA" : "en-MA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(d: string | Date | null | undefined, locale: string = "en") {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString(locale === "fr" ? "fr-MA" : locale === "ar" ? "ar-MA" : "en-MA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

"use client";

import * as React from "react";
import { Loader2, ImageIcon, Upload, Star } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { uploadImage, statusColor } from "./lib";

// ---- Animations ---------------------------------------------------------

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

// ---- KPI card -----------------------------------------------------------

export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  index = 0,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
  index?: number;
}) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="relative overflow-hidden border-border/60 bg-card/80 p-6 backdrop-blur">
        <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="font-display text-3xl leading-none text-foreground">{value}</p>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-2.5 text-primary">
            <Icon className="size-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ---- Status badge -------------------------------------------------------

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", statusColor(status))}>
      {status}
    </Badge>
  );
}

// ---- Empty / loading / error states -------------------------------------

export function SectionLoading({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-card/40 px-6 py-16 text-center">
      <div className="mb-3 rounded-full bg-secondary p-3 text-muted-foreground">
        <ImageIcon className="size-6" />
      </div>
      <p className="font-display text-lg text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/40 bg-destructive/10 px-6 py-10 text-center">
      <p className="text-sm text-destructive">{message ?? "Something went wrong"}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-3">
          Try again
        </Button>
      )}
    </div>
  );
}

// ---- Star rating --------------------------------------------------------

export function StarRating({
  value,
  onChange,
  size = "sm",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md";
}) {
  const sz = size === "sm" ? "size-4" : "size-5";
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= value;
        const Comp = onChange ? motion.button : motion.span;
        return (
          <Comp
            key={n}
            type={onChange ? "button" : undefined}
            onClick={onChange ? () => onChange(n) : undefined}
            whileHover={onChange ? { scale: 1.15 } : undefined}
            whileTap={onChange ? { scale: 0.9 } : undefined}
            className={cn(
              sz,
              active ? "text-primary" : "text-muted-foreground",
              onChange && "cursor-pointer"
            )}
          >
            <Star className={cn(sz, "fill-current")} />
          </Comp>
        );
      })}
    </div>
  );
}

// ---- Image upload widget ------------------------------------------------

export function ImageUpload({
  value,
  onChange,
  label,
  className,
}: {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}) {
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
      )}
      <div className="flex items-center gap-3">
        <div className="relative size-16 overflow-hidden rounded-lg border border-border bg-secondary">
          {value ? (
            <img src={value} alt="preview" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImageIcon className="size-5" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            Upload
          </Button>
          {value && (
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="h-8 max-w-[220px] text-xs"
              placeholder="or paste URL"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Section shell ------------------------------------------------------

export function SectionShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-foreground sm:text-3xl">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

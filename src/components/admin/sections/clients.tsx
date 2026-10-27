"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Eye, Dumbbell, Salad } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SectionShell, SectionLoading, ErrorState, EmptyState, StatusBadge } from "../ui-bits";
import { apiFetch, type AdminClient, type ClientStatus } from "../lib";
import { AssignWorkoutDialog } from "./assign-workout-dialog";
import { AssignNutritionDialog } from "./assign-nutrition-dialog";

export default function ClientsSection() {
  const { t, locale } = useI18n();
  const qc = useQueryClient();
  const { data: session } = useSession();
  const [selected, setSelected] = React.useState<AdminClient | null>(null);
  const [assignWorkoutFor, setAssignWorkoutFor] = React.useState<AdminClient | null>(null);
  const [assignNutritionFor, setAssignNutritionFor] = React.useState<AdminClient | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<{ clients: AdminClient[] }>({
    queryKey: ["admin", "clients"],
    queryFn: () => apiFetch("/api/admin/clients"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ClientStatus }) =>
      apiFetch(`/api/admin/clients/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_d, vars) => {
      toast.success(vars.status === "ACTIVE" ? "Client approved" : "Client rejected");
      qc.invalidateQueries({ queryKey: ["admin", "clients"] });
      qc.invalidateQueries({ queryKey: ["admin", "analytics"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const clients = data?.clients ?? [];

  function goalLabel(goal?: string | null) {
    if (!goal) return "—";
    const map: Record<string, string> = {
      muscle: t("onboarding.goalMuscle"),
      fat_loss: t("onboarding.goalFat"),
      recomp: t("onboarding.goalRecomp"),
      strength: t("onboarding.goalStrength"),
      health: t("onboarding.goalHealth"),
    };
    return map[goal] ?? goal;
  }

  return (
    <SectionShell
      title={t("admin.clients")}
      description={`${clients.length} ${t("admin.totalClients").toLowerCase()}`}
    >
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <SectionLoading rows={6} />
            </div>
          ) : isError ? (
            <div className="p-4">
              <ErrorState onRetry={() => refetch()} />
            </div>
          ) : clients.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No clients yet" description="New registrations will appear here." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Goal</TableHead>
                  <TableHead className="hidden xl:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c) => (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(c)}
                  >
                    <TableCell className="font-medium text-foreground">
                      {c.name ?? "—"}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {c.email}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {c.phone ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={c.profile?.status ?? "PENDING"} />
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {goalLabel(c.profile?.goal)}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground xl:table-cell">
                      {new Date(c.createdAt).toLocaleDateString(
                        locale === "fr" ? "fr-MA" : locale === "ar" ? "ar-MA" : "en-MA",
                        { year: "numeric", month: "short", day: "numeric" }
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex items-center justify-end gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c.profile?.status === "PENDING" && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-primary hover:bg-primary/15 hover:text-primary"
                              onClick={() =>
                                statusMutation.mutate({ id: c.id, status: "ACTIVE" })
                              }
                              disabled={statusMutation.isPending}
                              aria-label={t("admin.approveClient")}
                              title={t("admin.approveClient")}
                            >
                              <Check className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-destructive hover:bg-destructive/15 hover:text-destructive"
                              onClick={() =>
                                statusMutation.mutate({ id: c.id, status: "REJECTED" })
                              }
                              disabled={statusMutation.isPending}
                              aria-label={t("admin.rejectClient")}
                              title={t("admin.rejectClient")}
                            >
                              <X className="size-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          onClick={() => setSelected(c)}
                          aria-label="View profile"
                          title="View profile"
                        >
                          <Eye className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Profile dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {selected?.name ?? "Client profile"}
            </DialogTitle>
            <DialogDescription>
              {selected?.email}
              {selected?.phone ? ` · ${selected.phone}` : ""}
            </DialogDescription>
          </DialogHeader>
          {selected && <ProfileBody client={selected} goalLabel={goalLabel} />}
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAssignWorkoutFor(selected)}
              >
                <Dumbbell className="size-4" />
                {t("admin.assignWorkout")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAssignNutritionFor(selected)}
              >
                <Salad className="size-4" />
                {t("admin.assignNutrition")}
              </Button>
            </div>
            <div className="flex gap-2">
              {selected?.profile?.status === "PENDING" && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/15 hover:text-destructive"
                    onClick={() => {
                      statusMutation.mutate({ id: selected.id, status: "REJECTED" });
                      setSelected(null);
                    }}
                  >
                    {t("admin.rejectClient")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      statusMutation.mutate({ id: selected.id, status: "ACTIVE" });
                      setSelected(null);
                    }}
                  >
                    <Check className="size-4" />
                    {t("admin.approveClient")}
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign workout dialog */}
      <AssignWorkoutDialog
        client={assignWorkoutFor}
        onClose={() => setAssignWorkoutFor(null)}
        coachId={session?.user?.id}
      />

      {/* Assign nutrition dialog */}
      <AssignNutritionDialog
        client={assignNutritionFor}
        onClose={() => setAssignNutritionFor(null)}
      />
    </SectionShell>
  );
}

function ProfileBody({
  client,
  goalLabel,
}: {
  client: AdminClient;
  goalLabel: (g?: string | null) => string;
}) {
  const p = client.profile;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Age" value={p?.age?.toString() ?? "—"} />
        <Stat label="Height" value={p?.heightCm ? `${p.heightCm} cm` : "—"} />
        <Stat label="Weight" value={p?.weightKg ? `${p.weightKg} kg` : "—"} />
        <Stat label="City" value={p?.city ?? "—"} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Primary goal" value={goalLabel(p?.goal)} />
        <Stat
          label="Experience"
          value={
            p?.experience
              ? p.experience.charAt(0).toUpperCase() + p.experience.slice(1)
              : "—"
          }
        />
        <Stat label="Weekly availability" value={p?.weeklyAvailability ?? "—"} />
        <Stat
          label="Preferred package"
          value={p?.preferredPkg?.title ?? "—"}
        />
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Available equipment
        </p>
        <div className="flex flex-wrap gap-1.5">
          {p?.equipment?.length ? (
            p.equipment.map((e, i) => (
              <Badge key={i} variant="secondary" className="font-normal">
                {e}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">None listed</span>
          )}
        </div>
      </div>
      {p?.limitations && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Limitations
          </p>
          <p className="text-sm text-foreground">{p.limitations}</p>
        </div>
      )}
      {client.activeSubscription && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Active subscription
          </p>
          <p className="mt-0.5 text-sm text-foreground">
            {client.activeSubscription.package.title} ·{" "}
            {client.activeSubscription.status}
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/50 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

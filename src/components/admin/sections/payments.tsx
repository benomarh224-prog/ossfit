"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, ExternalLink, Loader2, Receipt } from "lucide-react";
import { useI18n, formatMAD } from "@/lib/i18n/i18n-provider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionShell, SectionLoading, ErrorState, EmptyState, StatusBadge } from "../ui-bits";
import { apiFetch, type AdminPayment, type PaymentStatus, formatDate } from "../lib";

export default function PaymentsSection() {
  const { t, locale } = useI18n();
  const qc = useQueryClient();
  const [rejectTarget, setRejectTarget] = React.useState<AdminPayment | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<{ payments: AdminPayment[] }>({
    queryKey: ["admin", "payments"],
    queryFn: () => apiFetch("/api/admin/payments"),
  });

  const updateMut = useMutation({
    mutationFn: (vars: { id: string; status: PaymentStatus; coachNote?: string }) => {
      const body: Record<string, unknown> = { status: vars.status };
      if (vars.coachNote !== undefined) body.coachNote = vars.coachNote;
      return apiFetch(`/api/admin/payments/${vars.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    },
    onSuccess: (_d, vars) => {
      toast.success(
        vars.status === "VERIFIED" ? "Payment verified — subscription activated" : "Payment rejected"
      );
      qc.invalidateQueries({ queryKey: ["admin", "payments"] });
      qc.invalidateQueries({ queryKey: ["admin", "analytics"] });
      qc.invalidateQueries({ queryKey: ["admin", "clients"] });
      setRejectTarget(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const payments = data?.payments ?? [];

  return (
    <SectionShell
      title={t("admin.payments")}
      description={`${payments.length} payments · ${t("admin.verifyPayment")}`}
    >
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4"><SectionLoading rows={6} /></div>
          ) : isError ? (
            <div className="p-4"><ErrorState onRetry={() => refetch()} /></div>
          ) : payments.length === 0 ? (
            <div className="p-4"><EmptyState title="No payments yet" description="When clients upload proofs, they show up here." /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Package</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden lg:table-cell">Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden xl:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Receipt className="size-4 text-muted-foreground" />
                        <span className="font-mono text-xs text-foreground">
                          {p.invoiceNo ?? p.id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {p.user.name ?? "—"}
                        </span>
                        <span className="text-xs text-muted-foreground">{p.user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {p.subscription?.package.title ?? p.packageTitle}
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      {formatMAD(p.amountMAD, locale)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      <span className="text-xs">{p.method.replace(/_/g, " ")}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                      {formatDate(p.createdAt, locale)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.proofUrl && (
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label="View proof"
                            title="View proof"
                          >
                            <a href={p.proofUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="size-4" />
                            </a>
                          </Button>
                        )}
                        {p.status === "PENDING" && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-primary hover:bg-primary/15 hover:text-primary"
                              onClick={() =>
                                updateMut.mutate({ id: p.id, status: "VERIFIED" })
                              }
                              disabled={updateMut.isPending}
                              aria-label={t("admin.verifyPayment")}
                              title={t("admin.verifyPayment")}
                            >
                              <Check className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-destructive hover:bg-destructive/15 hover:text-destructive"
                              onClick={() => setRejectTarget(p)}
                              disabled={updateMut.isPending}
                              aria-label={t("actions.reject")}
                              title={t("actions.reject")}
                            >
                              <X className="size-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reject dialog */}
      <RejectPaymentDialog
        payment={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onReject={(coachNote) =>
          rejectTarget &&
          updateMut.mutate({
            id: rejectTarget.id,
            status: "REJECTED",
            coachNote,
          })
        }
        pending={updateMut.isPending}
      />
    </SectionShell>
  );
}

function RejectPaymentDialog({
  payment,
  onClose,
  onReject,
  pending,
}: {
  payment: AdminPayment | null;
  onClose: () => void;
  onReject: (coachNote: string) => void;
  pending: boolean;
}) {
  const { t } = useI18n();
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (!payment) setNote("");
  }, [payment]);

  return (
    <Dialog open={!!payment} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Reject payment</DialogTitle>
          <DialogDescription>
            Add a note for the client. The slot stays booked until they re-submit.
          </DialogDescription>
        </DialogHeader>
        {payment && (
          <div className="text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">
                {payment.user.name ?? payment.user.email}
              </span>{" "}
              · {payment.invoiceNo ?? payment.id.slice(-8).toUpperCase()}
            </p>
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="reject-note">Note for the client</Label>
          <Textarea
            id="reject-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="e.g. The transfer amount didn't match. Please re-check the bank details..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("actions.cancel")}
          </Button>
          <Button
            variant="destructive"
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={() => onReject(note)}
            disabled={pending}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {t("actions.reject")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

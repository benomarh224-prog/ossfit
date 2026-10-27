"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Check, X, CalendarPlus, Video, Calendar } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionShell, SectionLoading, ErrorState, EmptyState, StatusBadge } from "../ui-bits";
import {
  apiFetch,
  type AdminConsultationSlot,
  type AdminBooking,
  type BookingStatus,
  formatDate,
} from "../lib";

export default function ConsultationsSection() {
  const { t, locale } = useI18n();
  const qc = useQueryClient();
  const [slotValue, setSlotValue] = React.useState<string>("");
  const [approveTarget, setApproveTarget] = React.useState<AdminBooking | null>(null);

  const slotsQ = useQuery<{ slots: AdminConsultationSlot[] }>({
    queryKey: ["admin", "consultations", "slots"],
    queryFn: () => apiFetch("/api/admin/consultations/slots"),
  });
  const bookingsQ = useQuery<{ bookings: AdminBooking[] }>({
    queryKey: ["admin", "consultations", "bookings"],
    queryFn: () => apiFetch("/api/consultations"),
  });

  const createSlotsMut = useMutation({
    mutationFn: (starts: string[]) =>
      apiFetch("/api/admin/consultations/slots", {
        method: "POST",
        body: JSON.stringify({ starts }),
      }),
    onSuccess: () => {
      toast.success("Slot created");
      qc.invalidateQueries({ queryKey: ["admin", "consultations", "slots"] });
      setSlotValue("");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const updateBookingMut = useMutation({
    mutationFn: (vars: {
      id: string;
      status: BookingStatus;
      meetingLink?: string;
      coachNote?: string;
    }) => {
      const body: Record<string, unknown> = { status: vars.status };
      if (vars.meetingLink !== undefined) body.meetingLink = vars.meetingLink;
      if (vars.coachNote !== undefined) body.coachNote = vars.coachNote;
      return apiFetch(`/api/admin/consultations/${vars.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    },
    onSuccess: (_d, vars) => {
      toast.success(`Booking ${vars.status.toLowerCase()}`);
      qc.invalidateQueries({ queryKey: ["admin", "consultations", "bookings"] });
      qc.invalidateQueries({ queryKey: ["admin", "consultations", "slots"] });
      setApproveTarget(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const slots = slotsQ.data?.slots ?? [];
  const bookings = bookingsQ.data?.bookings ?? [];
  const localeTag = locale === "fr" ? "fr-MA" : locale === "ar" ? "ar-MA" : "en-MA";

  function addSlot() {
    if (!slotValue) {
      toast.error("Pick a date and time first");
      return;
    }
    const d = new Date(slotValue);
    if (isNaN(d.getTime())) {
      toast.error("Invalid date");
      return;
    }
    createSlotsMut.mutate([d.toISOString()]);
  }

  return (
    <SectionShell
      title={t("admin.consultations")}
      description="Manage availability slots and consultation bookings."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Slot generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <CalendarPlus className="size-5 text-primary" />
              Generate slots
            </CardTitle>
            <CardDescription>
              Each slot is 30 minutes. Pick a date &amp; time to create one slot.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="slot-dt">Date &amp; time</Label>
              <Input
                id="slot-dt"
                type="datetime-local"
                value={slotValue}
                onChange={(e) => setSlotValue(e.target.value)}
              />
            </div>
            <Button onClick={addSlot} disabled={createSlotsMut.isPending}>
              {createSlotsMut.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CalendarPlus className="size-4" />
              )}
              Create slot
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming slots list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Calendar className="size-5 text-primary" />
              Availability ({slots.length})
            </CardTitle>
            <CardDescription>Upcoming slots and their booking status.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {slotsQ.isLoading ? (
              <div className="p-4"><SectionLoading rows={4} /></div>
            ) : slotsQ.isError ? (
              <div className="p-4"><ErrorState onRetry={() => slotsQ.refetch()} /></div>
            ) : slots.length === 0 ? (
              <div className="p-4"><EmptyState title="No slots" description="Generate your first consultation slot." /></div>
            ) : (
              <ul className="max-h-96 divide-y divide-border/60 overflow-y-auto">
                {slots.map((s) => {
                  const booking = s.bookings[0];
                  return (
                    <li
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {formatDate(s.start, locale)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(s.start).toLocaleTimeString(localeTag, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" → "}
                          {new Date(s.end).toLocaleTimeString(localeTag, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {booking ? (
                          <>
                            <Badge variant="outline">
                              Booked · {booking.user.name ?? booking.user.email}
                            </Badge>
                            <StatusBadge status={booking.status} />
                          </>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-primary/30 bg-primary/10 text-primary"
                          >
                            Free
                          </Badge>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bookings list */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Bookings ({bookings.length})
          </CardTitle>
          <CardDescription>Requests clients made for a consultation.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {bookingsQ.isLoading ? (
            <div className="p-4"><SectionLoading rows={4} /></div>
          ) : bookingsQ.isError ? (
            <div className="p-4"><ErrorState onRetry={() => bookingsQ.refetch()} /></div>
          ) : bookings.length === 0 ? (
            <div className="p-4"><EmptyState title="No bookings" description="When clients book a slot, it shows up here." /></div>
          ) : (
            <ul className="divide-y divide-border/60">
              {bookings.map((b) => (
                <li key={b.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {b.user.name ?? b.user.email}
                      </span>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(b.slot.start, locale)}
                      {b.user.phone ? ` · ${b.user.phone}` : ""}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      &ldquo;{b.goals}&rdquo;
                    </p>
                    {b.meetingLink && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-primary">
                        <Video className="size-3" />
                        <a
                          href={b.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          {b.meetingLink}
                        </a>
                      </p>
                    )}
                    {b.coachNote && (
                      <p className="mt-1 text-xs text-muted-foreground">Note: {b.coachNote}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {b.status === "REQUESTED" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => setApproveTarget(b)}
                          disabled={updateBookingMut.isPending}
                        >
                          <Check className="size-4" />
                          {t("actions.approve")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/15 hover:text-destructive"
                          onClick={() =>
                            updateBookingMut.mutate({ id: b.id, status: "REJECTED" })
                          }
                          disabled={updateBookingMut.isPending}
                        >
                          <X className="size-4" />
                          {t("actions.reject")}
                        </Button>
                      </>
                    )}
                    {b.status === "APPROVED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateBookingMut.mutate({ id: b.id, status: "COMPLETED" })
                        }
                        disabled={updateBookingMut.isPending}
                      >
                        <Check className="size-4" />
                        Mark completed
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Approve dialog with meeting link + coach note */}
      <ApproveBookingDialog
        booking={approveTarget}
        onClose={() => setApproveTarget(null)}
        onApprove={(meetingLink, coachNote) =>
          approveTarget &&
          updateBookingMut.mutate({
            id: approveTarget.id,
            status: "APPROVED",
            meetingLink,
            coachNote,
          })
        }
        pending={updateBookingMut.isPending}
      />
    </SectionShell>
  );
}

function ApproveBookingDialog({
  booking,
  onClose,
  onApprove,
  pending,
}: {
  booking: AdminBooking | null;
  onClose: () => void;
  onApprove: (meetingLink: string, coachNote: string) => void;
  pending: boolean;
}) {
  const { t } = useI18n();
  const [meetingLink, setMeetingLink] = React.useState("");
  const [coachNote, setCoachNote] = React.useState("");

  React.useEffect(() => {
    if (!booking) {
      setMeetingLink("");
      setCoachNote("");
    }
  }, [booking]);

  return (
    <Dialog open={!!booking} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Approve consultation</DialogTitle>
          <DialogDescription>
            Add a meeting link and an optional note. The client gets a notification.
          </DialogDescription>
        </DialogHeader>
        {booking && (
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">
                {booking.user.name ?? booking.user.email}
              </span>{" "}
              requested a consultation.
            </p>
            <p className="line-clamp-2">&ldquo;{booking.goals}&rdquo;</p>
          </div>
        )}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="meeting-link">Meeting link</Label>
            <Input
              id="meeting-link"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="coach-note">Coach note (optional)</Label>
            <Textarea
              id="coach-note"
              value={coachNote}
              onChange={(e) => setCoachNote(e.target.value)}
              rows={3}
              placeholder="What to prepare, what to expect..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("actions.cancel")}
          </Button>
          <Button
            onClick={() => onApprove(meetingLink, coachNote)}
            disabled={pending || !meetingLink.trim()}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {t("actions.approve")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

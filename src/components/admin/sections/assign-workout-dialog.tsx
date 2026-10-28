"use client";

import { PlanMedia } from "@/components/plan-media";
import { DialogBackButton } from "../dialog-back-button";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { apiFetch, type AdminClient, type WorkoutDay, type WorkoutExercise, type AdminExerciseLib } from "../lib";

interface DayDraft {
  id: string;
  name: string;
  focus: string;
  exercises: { id: string; name: string; sets: string; reps: string; rest: string }[];
}

function newDay(): DayDraft {
  return { id: crypto.randomUUID(), name: "Day 1", focus: "", exercises: [] };
}

export function CreateWorkoutDialog({
  open,
  onOpenChange,
  presetUserId,
  clients,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  presetUserId?: string | null;
  clients?: AdminClient[];
}) {
  const qc = useQueryClient();
  const [createdPlan, setCreatedPlan] = React.useState<string | null>(null);
  React.useEffect(() => { if (!open) setCreatedPlan(null); }, [open]);
  const [userId, setUserId] = React.useState<string>(presetUserId ?? "");
  const [title, setTitle] = React.useState("");
  const [goal, setGoal] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [active, setActive] = React.useState(true);
  const [days, setDays] = React.useState<DayDraft[]>([newDay()]);

  const clientsQ = useQuery<{ clients: AdminClient[] }>({
    queryKey: ["admin", "clients"],
    queryFn: () => apiFetch("/api/admin/clients"),
    enabled: !clients,
  });
  const libQ = useQuery<{ library: AdminExerciseLib[] }>({
    queryKey: ["admin", "workout-library"],
    queryFn: () => apiFetch("/api/admin/workouts"),
  });

  React.useEffect(() => {
    if (presetUserId) setUserId(presetUserId);
  }, [presetUserId]);

  const allClients = clients ?? clientsQ.data?.clients ?? [];
  const lib = libQ.data?.library ?? [];

  const createMut = useMutation({
    mutationFn: () => {
      const payload = {
        userId,
        title,
        goal: goal || undefined,
        summary: summary || undefined,
        active,
        days: days.map((d) => ({
          name: d.name,
          focus: d.focus || undefined,
          exercises: d.exercises.map(({ name, sets, reps, rest }) => ({
            name,
            sets: sets || undefined,
            reps: reps || undefined,
            rest: rest || undefined,
          })),
        })),
      };
      return apiFetch<{ plan: { id: string } }>("/api/admin/workouts", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data: { plan: { id: string } }) => {
      toast.success("Workout plan assigned");
      qc.invalidateQueries({ queryKey: ["admin", "workouts"] });
      setCreatedPlan(data.plan.id);
      reset();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  function reset() {
    setTitle("");
    setGoal("");
    setSummary("");
    setActive(true);
    setDays([newDay()]);
    if (!presetUserId) setUserId("");
  }

  function updateDay(id: string, patch: Partial<DayDraft>) {
    setDays((d) => d.map((day) => (day.id === id ? { ...day, ...patch } : day)));
  }
  function addExercise(dayId: string) {
    setDays((d) =>
      d.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: [
                ...day.exercises,
                { id: crypto.randomUUID(), name: "", sets: "", reps: "", rest: "" },
              ],
            }
          : day
      )
    );
  }
  function updateExercise(dayId: string, exId: string, patch: Partial<WorkoutExercise>) {
    setDays((d) =>
      d.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.map((e) =>
                e.id === exId ? { ...e, ...patch } : e
              ),
            }
          : day
      )
    );
  }
  function removeExercise(dayId: string, exId: string) {
    setDays((d) =>
      d.map((day) => ({
        ...day,
        exercises: day.exercises.filter((e) => e.id !== exId),
      }))
    );
  }

  const canSave = !!userId && !!title.trim() && !createMut.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[85dvh] sm:max-h-[90dvh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        {createdPlan ? <>
          <DialogHeader className="border-b border-border px-4 py-2 text-start"><div className="flex items-center gap-2"><DialogBackButton onBack={() => onOpenChange(false)} /><DialogTitle className="font-display text-lg">Photos &amp; videos</DialogTitle></div><DialogDescription className="pb-2">Plan saved. Add private guidance for the trainee.</DialogDescription></DialogHeader>
          <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain p-4"><PlanMedia kind="workout" planId={createdPlan} manage /></div>
          <DialogFooter className="border-t border-border bg-background p-3"><Button className="min-h-11" onClick={() => onOpenChange(false)}>Done</Button></DialogFooter>
        </> : <>
        <DialogHeader className="border-b border-border px-4 py-2 text-start">
          <div className="flex items-center gap-2"><DialogBackButton onBack={() => onOpenChange(false)} /><DialogTitle className="min-w-0 font-display text-lg">Create workout plan</DialogTitle></div>
          <DialogDescription>
            Build a personalized weekly plan with exercises from the library.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain p-4">

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Client</Label>
            <Select value={userId} onValueChange={setUserId} disabled={!!presetUserId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {allClients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name ?? c.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Plan title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 4-week hypertrophy" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Goal (optional)</Label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Build muscle" />
          </div>
          <div className="space-y-1.5">
            <Label>Summary (optional)</Label>
            <Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief overview" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={active} onCheckedChange={setActive} id="active-w" />
          <Label htmlFor="active-w">Set as active plan</Label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Weekly schedule</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDays((d) => [...d, { ...newDay(), name: `Day ${d.length + 1}` }])}
            >
              <Plus className="size-4" />
              Add day
            </Button>
          </div>

          {days.map((day, idx) => (
            <div
              key={day.id}
              className="space-y-3 rounded-xl border border-border/60 bg-card/40 p-4"
            >
              <div className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  value={day.name}
                  placeholder={`Day ${idx + 1}`}
                  onChange={(e) => updateDay(day.id, { name: e.target.value })}
                />
                <Input
                  className="flex-1"
                  value={day.focus}
                  placeholder="Focus (e.g. Push)"
                  onChange={(e) => updateDay(day.id, { focus: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/15 hover:text-destructive"
                  onClick={() => setDays((d) => d.filter((x) => x.id !== day.id))}
                  aria-label="Remove day"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {day.exercises.map((ex) => (
                  <div key={ex.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                    <Input
                      list="exercise-lib"
                      value={ex.name}
                      placeholder="Exercise name"
                      onChange={(e) => updateExercise(day.id, ex.id, { name: e.target.value })}
                    />
                    <Input
                      value={ex.sets}
                      placeholder="Sets"
                      onChange={(e) => updateExercise(day.id, ex.id, { sets: e.target.value })}
                    />
                    <Input
                      value={ex.reps}
                      placeholder="Reps"
                      onChange={(e) => updateExercise(day.id, ex.id, { reps: e.target.value })}
                    />
                    <Input
                      value={ex.rest}
                      placeholder="Rest"
                      onChange={(e) => updateExercise(day.id, ex.id, { rest: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/15 hover:text-destructive"
                      onClick={() => removeExercise(day.id, ex.id)}
                      aria-label="Remove exercise"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <datalist id="exercise-lib">
                  {lib.map((l) => (
                    <option key={l.id} value={l.name} />
                  ))}
                </datalist>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-primary/10 hover:text-primary"
                  onClick={() => addExercise(day.id)}
                >
                  <Plus className="size-4" />
                  Add exercise
                </Button>
              </div>
            </div>
          ))}
        </div>

        </div>
        <DialogFooter className="border-t border-border bg-background p-3 [&_button]:min-h-11">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => createMut.mutate()} disabled={!canSave}>
            {createMut.isPending && <Loader2 className="size-4 animate-spin" />}
            Save plan
          </Button>
        </DialogFooter>
        </>}
      </DialogContent>
    </Dialog>
  );
}

/** Lightweight wrapper used from the Clients section's "Assign Workout" action. */
export function AssignWorkoutDialog({
  client,
  onClose,
}: {
  client: AdminClient | null;
  onClose: () => void;
  coachId?: string;
}) {
  return (
    <CreateWorkoutDialog
      open={!!client}
      onOpenChange={(v) => !v && onClose()}
      presetUserId={client?.id}
    />
  );
}

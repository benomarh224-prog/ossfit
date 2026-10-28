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
import { apiFetch, type AdminClient } from "../lib";

export function CreateNutritionDialog({
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
  const [dailyCalories, setDailyCalories] = React.useState<number | "">("");
  const [proteinG, setProteinG] = React.useState<number | "">("");
  const [carbsG, setCarbsG] = React.useState<number | "">("");
  const [fatsG, setFatsG] = React.useState<number | "">("");
  const [waterCupsGoal, setWaterCupsGoal] = React.useState<number | "">(8);
  const [notes, setNotes] = React.useState("");
  const [active, setActive] = React.useState(true);
  const [meals, setMeals] = React.useState<{ name: string; suggestion: string }[]>([
    { name: "Breakfast", suggestion: "" },
  ]);

  const clientsQ = useQuery<{ clients: AdminClient[] }>({
    queryKey: ["admin", "clients"],
    queryFn: () => apiFetch("/api/admin/clients"),
    enabled: !clients,
  });

  React.useEffect(() => {
    if (presetUserId) setUserId(presetUserId);
  }, [presetUserId]);

  const allClients = clients ?? clientsQ.data?.clients ?? [];

  const createMut = useMutation({
    mutationFn: () => {
      const payload = {
        userId,
        title,
        dailyCalories: dailyCalories === "" ? undefined : Number(dailyCalories),
        proteinG: proteinG === "" ? undefined : Number(proteinG),
        carbsG: carbsG === "" ? undefined : Number(carbsG),
        fatsG: fatsG === "" ? undefined : Number(fatsG),
        waterCupsGoal: waterCupsGoal === "" ? undefined : Number(waterCupsGoal),
        notes: notes || undefined,
        active,
        meals: meals.map((m) => ({
          name: m.name,
          suggestion: m.suggestion || undefined,
        })),
      };
      return apiFetch<{ plan: { id: string } }>("/api/admin/nutrition", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data: { plan: { id: string } }) => {
      toast.success("Nutrition plan assigned");
      qc.invalidateQueries({ queryKey: ["admin", "nutrition"] });
      setCreatedPlan(data.plan.id);
      reset();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  function reset() {
    setTitle("");
    setDailyCalories("");
    setProteinG("");
    setCarbsG("");
    setFatsG("");
    setWaterCupsGoal(8);
    setNotes("");
    setActive(true);
    setMeals([{ name: "Breakfast", suggestion: "" }]);
    if (!presetUserId) setUserId("");
  }

  const canSave = !!userId && !!title.trim() && !createMut.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[85dvh] sm:max-h-[90dvh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        {createdPlan ? <>
          <DialogHeader className="border-b border-border px-4 py-2 text-start"><div className="flex items-center gap-2"><DialogBackButton onBack={() => onOpenChange(false)} /><DialogTitle className="font-display text-lg">Photos &amp; videos</DialogTitle></div><DialogDescription className="pb-2">Plan saved. Add private guidance for the trainee.</DialogDescription></DialogHeader>
          <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain p-4"><PlanMedia kind="nutrition" planId={createdPlan} manage /></div>
          <DialogFooter className="border-t border-border bg-background p-3"><Button className="min-h-11" onClick={() => onOpenChange(false)}>Done</Button></DialogFooter>
        </> : <>
        <DialogHeader className="border-b border-border px-4 py-2 text-start">
          <div className="flex items-center gap-2"><DialogBackButton onBack={() => onOpenChange(false)} /><DialogTitle className="min-w-0 font-display text-lg">Create nutrition plan</DialogTitle></div>
          <DialogDescription>
            Daily targets and meal suggestions for the client.
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
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lean bulk" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Daily calories</Label>
            <Input
              type="number"
              value={dailyCalories}
              onChange={(e) => setDailyCalories(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="2500"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Protein (g)</Label>
            <Input
              type="number"
              value={proteinG}
              onChange={(e) => setProteinG(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="180"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Carbs (g)</Label>
            <Input
              type="number"
              value={carbsG}
              onChange={(e) => setCarbsG(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="280"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Fats (g)</Label>
            <Input
              type="number"
              value={fatsG}
              onChange={(e) => setFatsG(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="70"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Water (cups/day)</Label>
            <Input
              type="number"
              value={waterCupsGoal}
              onChange={(e) => setWaterCupsGoal(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="8"
            />
          </div>
          <div className="flex items-end gap-2 pb-1.5">
            <Switch checked={active} onCheckedChange={setActive} id="active-n" />
            <Label htmlFor="active-n">Set as active plan</Label>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Meal suggestions</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMeals((m) => [...m, { name: "", suggestion: "" }])}
            >
              <Plus className="size-4" />
              Add meal
            </Button>
          </div>
          {meals.map((m, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr_auto]">
              <Input
                value={m.name}
                placeholder="Meal name"
                onChange={(e) => {
                  const v = e.target.value;
                  setMeals((arr) => arr.map((x, j) => (j === i ? { ...x, name: v } : x)));
                }}
              />
              <Input
                value={m.suggestion}
                placeholder="Suggested foods"
                onChange={(e) => {
                  const v = e.target.value;
                  setMeals((arr) => arr.map((x, j) => (j === i ? { ...x, suggestion: v } : x)));
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/15 hover:text-destructive"
                onClick={() => setMeals((arr) => arr.filter((_, j) => j !== i))}
                aria-label="Remove meal"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label>Notes (optional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Hydration, supplements, timing, etc."
          />
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

/** Wrapper used from the Clients section's "Assign Nutrition" action. */
export function AssignNutritionDialog({
  client,
  onClose,
}: {
  client: AdminClient | null;
  onClose: () => void;
}) {
  return (
    <CreateNutritionDialog
      open={!!client}
      onOpenChange={(v) => !v && onClose()}
      presetUserId={client?.id}
    />
  );
}

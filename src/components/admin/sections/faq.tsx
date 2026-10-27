"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SectionShell, SectionLoading, ErrorState, EmptyState } from "../ui-bits";
import { apiFetch, type AdminFAQ } from "../lib";

export default function FaqSection() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [edit, setEdit] = React.useState<AdminFAQ | "new" | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<{ faqs: AdminFAQ[] }>({
    queryKey: ["admin", "faq"],
    queryFn: () => apiFetch("/api/admin/faq"),
  });

  const saveMut = useMutation({
    mutationFn: (vars: { id?: string; payload: Partial<AdminFAQ> }) =>
      vars.id
        ? apiFetch(`/api/admin/faq/${vars.id}`, {
            method: "PATCH",
            body: JSON.stringify(vars.payload),
          })
        : apiFetch("/api/admin/faq", {
            method: "POST",
            body: JSON.stringify(vars.payload),
          }),
    onSuccess: (_d, vars) => {
      toast.success(vars.id ? "FAQ updated" : "FAQ added");
      qc.invalidateQueries({ queryKey: ["admin", "faq"] });
      setEdit(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/admin/faq/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("FAQ deleted");
      qc.invalidateQueries({ queryKey: ["admin", "faq"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const items = data?.faqs ?? [];

  return (
    <SectionShell
      title={t("admin.faq").length > 0 && t("admin.faq") !== "admin.faq" ? t("admin.faq") : "FAQ"}
      description={`${items.length} questions`}
      actions={
        <Button onClick={() => setEdit("new")}>
          <Plus className="size-4" />
          Add question
        </Button>
      }
    >
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <SectionLoading rows={5} />
            </div>
          ) : isError ? (
            <div className="p-4">
              <ErrorState onRetry={() => refetch()} />
            </div>
          ) : items.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No FAQs yet" description="Add common questions your clients ask." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[60px]">Order</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead className="hidden md:table-cell">Answer</TableHead>
                  <TableHead className="hidden lg:table-cell">Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{item.order}</TableCell>
                    <TableCell className="font-medium text-foreground">
                      {item.question}
                    </TableCell>
                    <TableCell className="max-w-md hidden md:table-cell">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {item.answer}
                      </p>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="secondary" className="font-normal">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          item.published
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border bg-secondary text-muted-foreground"
                        }
                      >
                        {item.published ? "Live" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => setEdit(item)}
                          aria-label={t("actions.edit")}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:bg-destructive/15 hover:text-destructive"
                              aria-label={t("actions.delete")}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This permanently removes the question.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-white hover:bg-destructive/90"
                                onClick={() => deleteMut.mutate(item.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <FaqEditDialog
        open={edit !== null}
        onOpenChange={(v) => !v && setEdit(null)}
        item={edit === "new" ? null : edit}
        onSave={(payload, id) => saveMut.mutate({ id, payload })}
        saving={saveMut.isPending}
      />
    </SectionShell>
  );
}

function FaqEditDialog({
  open,
  onOpenChange,
  item,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: AdminFAQ | null;
  onSave: (payload: Partial<AdminFAQ>, id?: string) => void;
  saving: boolean;
}) {
  const { t } = useI18n();
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [category, setCategory] = React.useState("General");
  const [published, setPublished] = React.useState(true);
  const [order, setOrder] = React.useState<number | "">(0);

  React.useEffect(() => {
    if (!open) return;
    if (item) {
      setQuestion(item.question);
      setAnswer(item.answer);
      setCategory(item.category);
      setPublished(item.published);
      setOrder(item.order);
    } else {
      setQuestion("");
      setAnswer("");
      setCategory("General");
      setPublished(true);
      setOrder(0);
    }
  }, [item, open]);

  function submit() {
    const payload: Partial<AdminFAQ> = {
      question,
      answer,
      category,
      published,
      order: Number(order) || 0,
    };
    onSave(payload, item?.id);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {item ? "Edit FAQ" : "Add FAQ"}
          </DialogTitle>
          <DialogDescription>
            Frequently asked questions appear on the public site.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label>Question</Label>
          <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. How long until I see results?" />
        </div>
        <div className="space-y-1.5">
          <Label>Answer</Label>
          <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={5} placeholder="Your answer..." />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Display order</Label>
            <Input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
          <div className="flex items-end gap-2 pb-1.5">
            <Switch checked={published} onCheckedChange={setPublished} id="faq-pub" />
            <Label htmlFor="faq-pub">Published</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("actions.cancel")}
          </Button>
          <Button onClick={submit} disabled={saving || !question.trim() || !answer.trim()}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {t("actions.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { apiFetch } from "@/lib/client-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
const registerSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().regex(/^(?:\+212|0)[5-7]\d{8}$/, "Use a valid Moroccan number (06/07/+212)"),
  });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function AuthModal({
  open,
  onOpenChange,
  defaultTab = "login",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultTab?: "login" | "register";
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  async function onLogin(values: LoginValues) {
    setLoading(true);
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid email or password");
      return;
    }
    toast.success(t("auth.loginTitle"));
    onOpenChange(false);
    router.refresh();
  }

  async function onRegister(values: RegisterValues) {
    setLoading(true);
    try {
      await apiFetch("/api/register", { json: values });
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (res?.error) throw new Error("Login failed");
      toast.success(t("auth.registerTitle"));
      onOpenChange(false);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border/60 bg-card p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{t("auth.loginTitle")}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <div className="bg-radial-lime flex flex-col items-center gap-3 border-b border-border/50 px-6 pb-6 pt-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl uppercase tracking-tight">Atlas Coach</h2>
              <p className="text-sm text-muted-foreground">{t("auth.loginSubtitle")}</p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t("nav.login")}</TabsTrigger>
                <TabsTrigger value="register">{t("nav.register")}</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-5">
                <form
                  onSubmit={loginForm.handleSubmit(onLogin)}
                  className="space-y-4"
                  noValidate
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t("auth.email")}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      {...loginForm.register("email")}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-pass">{t("auth.password")}</Label>
                    <Input
                      id="login-pass"
                      type="password"
                      autoComplete="current-password"
                      {...loginForm.register("password")}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("auth.login")}
                  </Button>
                  <p className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-2 text-center text-xs text-muted-foreground">
                    {t("auth.demoNote")}
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-5">
                <form
                  onSubmit={registerForm.handleSubmit(onRegister)}
                  className="space-y-4"
                  noValidate
                >
                  <div className="space-y-2">
                    <Label htmlFor="r-name">{t("auth.name")}</Label>
                    <Input id="r-name" {...registerForm.register("name")} />
                    {registerForm.formState.errors.name && (
                      <p className="text-xs text-destructive">{registerForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="r-email">{t("auth.email")}</Label>
                    <Input id="r-email" type="email" {...registerForm.register("email")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="r-phone">{t("auth.phone")}</Label>
                    <Input id="r-phone" placeholder="06XXXXXXXX or +2126..." {...registerForm.register("phone")} />
                    {registerForm.formState.errors.phone && (
                      <p className="text-xs text-destructive">{registerForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="r-pass">{t("auth.password")}</Label>
                    <Input id="r-pass" type="password" {...registerForm.register("password")} />
                    {registerForm.formState.errors.password && (
                      <p className="text-xs text-destructive">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("auth.register")}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { signOut, useSession } from "next-auth/react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const copy = {
  en: {
    title: "Account settings", description: "Change your sign-in email, password, or both. Confirm with your current password. All sessions will be signed out after saving; sign in again with your updated details.",
    email: "Sign-in email", current: "Current password", password: "New password (optional)", confirm: "Confirm new password", hint: "Leave both new-password fields empty to keep your password. Use at least 12 characters. Very long passwords may need to be shortened.", save: "Save and sign out", saving: "Saving…", mismatch: "The new passwords do not match.",
    saved: "Your details were updated. Sign in with your updated email and password.", signin: "Return to sign in",
    errors: { RATE_LIMIT: "Too many attempts. Try again in 15 minutes.", INVALID: "Check your email and password length.", PASSWORD: "Current password is incorrect.", UNCHANGED: "Enter a different email or a new password.", STALE: "Your account changed. Sign in again.", EMAIL: "This email is already in use.", FAILED: "Unable to save. Please try again." },
  },
  fr: {
    title: "Paramètres du compte", description: "Modifiez votre email de connexion, votre mot de passe ou les deux. Confirmez avec votre mot de passe actuel. Toutes les sessions seront déconnectées après l’enregistrement ; reconnectez-vous avec vos nouvelles informations.",
    email: "Email de connexion", current: "Mot de passe actuel", password: "Nouveau mot de passe (facultatif)", confirm: "Confirmez le nouveau mot de passe", hint: "Laissez les deux champs vides pour garder votre mot de passe. Utilisez au moins 12 caractères. Un mot de passe très long peut devoir être raccourci.", save: "Enregistrer et se déconnecter", saving: "Enregistrement…", mismatch: "Les nouveaux mots de passe ne correspondent pas.",
    saved: "Informations mises à jour. Reconnectez-vous avec votre email et votre mot de passe à jour.", signin: "Retour à la connexion",
    errors: { RATE_LIMIT: "Trop de tentatives. Réessayez dans 15 minutes.", INVALID: "Vérifiez votre email et la longueur du mot de passe.", PASSWORD: "Le mot de passe actuel est incorrect.", UNCHANGED: "Saisissez un autre email ou un nouveau mot de passe.", STALE: "Votre compte a changé. Reconnectez-vous.", EMAIL: "Cet email est déjà utilisé.", FAILED: "Impossible d’enregistrer. Réessayez." },
  },
  ar: {
    title: "إعدادات الحساب", description: "تقدر تبدل إيميل الدخول، كلمة السر أو بجوج. أكد التغيير بكلمة السر الحالية. من بعد الحفظ كتسد الجلسات كاملة وكتعاود تدخل بالمعلومات الجديدة.",
    email: "إيميل الدخول", current: "كلمة السر الحالية", password: "كلمة السر الجديدة (اختياري)", confirm: "تأكيد كلمة السر الجديدة", hint: "خلي خانتي كلمة السر الجديدة خاويين إلا بغيتي تحتافظ بالحالية. الجديدة خاصها 12 حرف على الأقل. إلا كانت طويلة بزاف، ممكن تحتاج تنقص من طولها.", save: "حفظ وتسجيل الخروج", saving: "جاري الحفظ…", mismatch: "كلمتا السر الجديدتان غير متطابقتين.",
    saved: "تبدلات معلومات الحساب. عاود دخل بالإيميل وكلمة السر المحدّثين.", signin: "الرجوع لتسجيل الدخول",
    errors: { RATE_LIMIT: "محاولات كثيرة. عاود من بعد 15 دقيقة.", INVALID: "راجع الإيميل وطول كلمة السر.", PASSWORD: "كلمة السر الحالية غير صحيحة.", UNCHANGED: "دخل إيميل مختلف أو كلمة سر جديدة.", STALE: "الحساب تبدّل. عاود سجل الدخول.", EMAIL: "هاد الإيميل مستعمل فحساب آخر.", FAILED: "تعذر الحفظ. عاود المحاولة." },
  },
};

export default function AccountSection() {
  const { data: session } = useSession();
  const { locale } = useI18n();
  const c = copy[locale];
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const newPassword = String(fields.get("newPassword") ?? "");
    setError("");
    if (newPassword !== String(fields.get("confirmPassword") ?? "")) {
      setError(c.mismatch);
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/admin/account", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fields.get("email"), currentPassword: fields.get("currentPassword"), ...(newPassword ? { newPassword } : {}) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(c.errors[data.code as keyof typeof c.errors] ?? c.errors.FAILED);
        return;
      }
      form.reset();
      setSaved(true);
      // Revoke the current browser cookie too; the server has revoked all sessions.
      await signOut({ callbackUrl: "/" });
    } catch {
      setError(c.errors.FAILED);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mx-auto max-w-xl space-y-5 p-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{c.title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{c.description}</p>
      </div>
      {saved ? (
        <div className="space-y-4" role="status">
          <p>{c.saved}</p>
          <Button onClick={() => signOut({ callbackUrl: "/" })}>{c.signin}</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <fieldset disabled={busy} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-email">{c.email}</Label>
              <Input id="account-email" name="email" type="email" autoComplete="username" dir="ltr" maxLength={254} required defaultValue={session?.user.email ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-current">{c.current}</Label>
              <Input id="account-current" name="currentPassword" type="password" autoComplete="current-password" required maxLength={256} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-new">{c.password}</Label>
              <Input id="account-new" name="newPassword" type="password" autoComplete="new-password" minLength={12} maxLength={72} aria-describedby="account-password-hint" />
              <p id="account-password-hint" className="text-xs text-muted-foreground">{c.hint}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-confirm">{c.confirm}</Label>
              <Input id="account-confirm" name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={72} />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy}>{busy ? c.saving : c.save}</Button>
          </fieldset>
        </form>
      )}
    </Card>
  );
}

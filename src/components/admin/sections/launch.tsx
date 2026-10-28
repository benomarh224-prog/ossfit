"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, ArrowRight, BookOpen } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiFetch, type AdminSection } from "../lib";
import { ErrorState, SectionLoading, SectionShell } from "../ui-bits";

const COPY = {
  en: {
    title: "Prepare your coaching site", intro: "These checks show which settings have been filled in. Review the actual details and complete the practical checks below before accepting clients.", configured: "Provided", pending: "To complete", refresh: "Refresh checks", edit: "Open settings", guide: "Coach's daily workflow", manual: "Practical checks before launch", note: "This is a configuration checklist, not confirmation that payments, backups or phone flows have been tested.",
    checks: { identity: "Coach and brand name", city: "Specific city", portrait: "Your own coach photo", contact: "WhatsApp contact enabled", bank: "Bank name, beneficiary and IBAN/RIB", packages: "At least one available package", recovery: "Current coach recovery key created", storage: "Media storage configured" },
    steps: ["Review new clients, their assessment and any limitations before approving them.", "Create or edit their workout and nutrition plans, then attach exercise or meal photos/videos.", "Confirm the package and banking information; verify each transfer proof in Payments before activating service.", "Read and answer client messages in the Messages section. Use the notification bell to see updates.", "Keep your recovery key private. Generate a client recovery link only after verifying their identity."],
    practical: ["Run the full flow on a real phone: register a test client, sign in as coach, assign a plan, play a video and exchange messages.", "Confirm the real prices, start dates, package scope, cancellation and refund conditions with the coach.", "Verify payment instructions using the real beneficiary details; test proof upload and one approval without using a real charge.", "Arrange database and media backups with the hosting owner, and test a restore. A Git repository only preserves code.", "Use a separate database for preview/testing. Confirm the domain and ownership of GitHub, Vercel, database and media storage before sale."],
  },
  fr: {
    title: "Préparer votre site de coaching", intro: "Ces contrôles indiquent les réglages renseignés. Vérifiez leur exactitude et effectuez les essais pratiques avant d'accueillir des clients.", configured: "Renseigné", pending: "À compléter", refresh: "Actualiser", edit: "Ouvrir les réglages", guide: "Le quotidien du coach", manual: "Vérifications pratiques avant lancement", note: "Cette liste vérifie la configuration. Elle ne confirme pas les essais de paiement, de sauvegarde ou sur téléphone.",
    checks: { identity: "Nom du coach et de la marque", city: "Ville précise", portrait: "Votre photo de coach", contact: "Contact WhatsApp activé", bank: "Banque, bénéficiaire et IBAN/RIB", packages: "Au moins une formule disponible", recovery: "Clé de secours coach actuelle créée", storage: "Stockage des médias configuré" },
    steps: ["Examinez les nouveaux clients, leur bilan et leurs limitations avant de les approuver.", "Créez ou modifiez leurs programmes et ajoutez les photos ou vidéos des exercices et repas.", "Confirmez la formule et les coordonnées bancaires. Vérifiez chaque justificatif dans Paiements avant d'activer le service.", "Lisez et répondez dans Messages. Consultez la cloche pour les nouvelles notifications.", "Gardez votre clé de secours privée. Vérifiez l'identité du client avant de créer son lien de récupération."],
    practical: ["Essayez le parcours complet sur téléphone : inscription client, connexion coach, programme, lecture vidéo et messages.", "Confirmez les tarifs, dates de début, prestations, conditions d'annulation et de remboursement.", "Vérifiez les informations du bénéficiaire et testez le dépôt d'un justificatif et son approbation sans paiement réel.", "Organisez les sauvegardes de la base et des médias, puis testez une restauration. Git ne sauvegarde que le code.", "Séparez la base de test de la production. Confirmez le domaine et la propriété de GitHub, Vercel, la base et les médias avant la vente."],
  },
  ar: {
    title: "تجهيز الموقع للخدمة", intro: "هاد اللائحة كتبين الإعدادات اللي تعمّرات. راجع صحتها وكمل التجارب العملية لتحت قبل ما تستقبل المشتركين.", configured: "موجود", pending: "باقي خاصو يتكمل", refresh: "تحديث الفحص", edit: "فتح الإعدادات", guide: "كيفاش تخدم ككوتش", manual: "تجارب ضرورية قبل الانطلاق", note: "هاد الفحص كيراجع الإعدادات فقط. ما كيعنيش أن الأداء أو النسخ الاحتياطي أو التجربة على الهاتف تختابرو.",
    checks: { identity: "اسم الكوتش والبراند", city: "المدينة بالتحديد", portrait: "الصورة الشخصية ديال الكوتش", contact: "التواصل بواتساب مفعّل", bank: "البنك والمستفيد وIBAN أو RIB", packages: "باقة وحدة على الأقل متاحة", recovery: "مفتاح احتياطي صالح للكوتش", storage: "تخزين الصور والفيديو مهيّأ" },
    steps: ["راجع طلبات المشتركين، التقييم ديالهم والقيود الصحية قبل الموافقة.", "وجد أو عدّل برنامج التمارين والتغذية، وزيد الصور والفيديوهات ديال الشرح.", "أكد الباقة والبيانات البنكية، وراجع إثبات التحويل فالأداءات قبل تفعيل الخدمة.", "جاوب المشتركين فقسم الرسائل، وشوف التحديثات من جرس الإشعارات.", "خزّن المفتاح الاحتياطي ديالك بسرّية. رابط استرجاع المشترك خرجو غير من بعد التأكد من هويتو."],
    practical: ["جرّب المسار كامل فهاتف حقيقي: تسجيل مشترك تجريبي، دخول الكوتش، تعيين برنامج، تشغيل فيديو وتبادل الرسائل.", "أكد الأثمان الحقيقية، تاريخ البداية، محتوى الباقات وشروط الإلغاء والاسترجاع مع الكوتش.", "راجع اسم المستفيد والبيانات البنكية، وجرّب رفع إثبات أداء والموافقة عليه بلا تحويل مالي حقيقي.", "اتفق مع صاحب الاستضافة على نسخ احتياطي للبيانات والصور والفيديو، وجرّب الاسترجاع. Git كيحفظ غير الكود.", "خصّص قاعدة بيانات مستقلة للتجارب. قبل البيع، أكد الدومين وملكية GitHub وVercel وقاعدة البيانات والتخزين."],
  },
};
type Check = keyof typeof COPY.en.checks;
export default function LaunchSection({ onNavigate }: { onNavigate: (section: AdminSection) => void }) {
  const { locale } = useI18n(); const c = COPY[locale];
  const query = useQuery<{ checks: Record<Check, boolean> }>({ queryKey: ["admin", "launch"], queryFn: () => apiFetch("/api/admin/launch"), staleTime: 0 });
  return <SectionShell title={c.title} description={c.intro}>
    <Button variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}>{c.refresh}</Button>
    {query.isPending ? <SectionLoading rows={4} /> : query.isError ? <ErrorState onRetry={() => query.refetch()} /> : <div className="grid gap-3 sm:grid-cols-2">{(Object.keys(c.checks) as Check[]).map(key => <Card key={key} className="flex min-w-0 items-start gap-3 p-4">
      {query.data.checks[key] ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" /> : <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />}
      <div className="min-w-0 flex-1"><h3 className="text-sm font-medium">{c.checks[key]}</h3><p className="mt-1 text-xs text-muted-foreground">{query.data.checks[key] ? c.configured : c.pending}</p>{key !== "storage" && <Button variant="ghost" size="sm" className="mt-1 h-auto min-h-11 max-w-full whitespace-normal px-0 text-primary" onClick={() => onNavigate(key === "packages" ? "pricing" : key === "recovery" ? "account" : "content")}>{c.edit}<ArrowRight className="size-3 shrink-0 rtl:rotate-180" /></Button>}</div>
    </Card>)}</div>}
    <p className="text-xs leading-relaxed text-muted-foreground">{c.note}</p>
    <Card className="space-y-4 p-5"><h2 className="flex items-center gap-2 text-lg font-semibold"><BookOpen className="size-5 text-primary" />{c.guide}</h2><ol className="list-decimal space-y-3 ps-5 text-sm leading-relaxed text-muted-foreground">{c.steps.map(step => <li key={step}>{step}</li>)}</ol></Card>
    <Card className="space-y-4 p-5"><h2 className="text-lg font-semibold">{c.manual}</h2><ul className="list-disc space-y-3 ps-5 text-sm leading-relaxed text-muted-foreground">{c.practical.map(step => <li key={step}>{step}</li>)}</ul></Card>
  </SectionShell>;
}

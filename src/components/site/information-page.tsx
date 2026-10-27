"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { LanguageSwitcher } from "./language-switcher";
import { buildWhatsappLink } from "@/lib/client-utils";
import { Button } from "@/components/ui/button";

const COPY = {
  en: {
    back: "Back to coaching", contact: "Contact the coach",
    privacy: { title: "Your privacy. Your progress.", intro: "How your information is used in your coaching space.", items: [
      ["What is collected", "Your account contains your name, email and phone number. Your assessment and dashboard can also contain your goals, training experience, physical measurements, limitations, messages, progress photos and payment proofs."],
      ["Who can see it", "Your private coaching information is available to you and the coach. Progress photos and payment proofs require an authenticated account. Testimonials and transformation photos are published only after the coach records client consent."],
      ["Storage and service providers", "The website runs on Vercel, account and coaching records are stored in PostgreSQL, and uploaded images use private Vercel Blob storage. Passwords are stored as hashes. Service providers process data needed to operate the website."],
      ["Preferences and cookies", "A session cookie keeps you signed in. Your selected language and theme are saved in your browser. Package selection is kept for the duration of your browser session to help complete your assessment."],
      ["Your requests", "Contact the coach to request a copy, correction or deletion of your information, or to withdraw permission to publish a testimonial or transformation. Avoid sending sensitive health or payment information in a public message."],
    ] },
    terms: { title: "Know your next step.", intro: "Clear information about coaching, subscriptions and payments.", items: [
      ["What coaching includes", "The package card lists the support included and the monthly price in Moroccan dirhams. The coach reviews your assessment and agrees the program scope and start date with you."],
      ["Before you transfer money", "Confirm the package, start date, bank beneficiary and payment details directly with the coach. Upload the transfer proof privately in your dashboard. A subscription becomes active after the coach verifies the payment; this site does not process card payments or automatic debits."],
      ["Renewals, changes and cancellations", "Contact the coach before payment to confirm the renewal, package changes, cancellation and refund conditions for your coaching. No automatic renewal charge is collected by this website."],
      ["Training and nutrition", "Share any relevant limitations with your coach and seek advice from a qualified healthcare professional when needed. Exercise and nutrition coaching does not replace medical diagnosis or treatment. Individual progress varies and fixed results are not guaranteed."],
      ["Consultations and support", "Consultation requests are confirmed in your dashboard. Check the meeting details and contact the coach if you need to reschedule. Use private dashboard messages for coaching questions and WhatsApp for initial enquiries."],
    ] },
  },
  fr: {
    back: "Retour au coaching", contact: "Contacter le coach",
    privacy: { title: "Votre vie privée. Vos progrès.", intro: "L'utilisation de vos informations dans votre espace de coaching.", items: [
      ["Informations collectées", "Votre compte contient votre nom, e-mail et téléphone. Le bilan et le tableau de bord peuvent aussi contenir vos objectifs, expérience, mensurations, limitations, messages, photos de suivi et justificatifs de paiement."],
      ["Accès aux informations", "Vos informations privées sont accessibles à vous et au coach. Les photos de suivi et justificatifs nécessitent une connexion. Les témoignages et transformations sont publiés après enregistrement du consentement du client par le coach."],
      ["Hébergement", "Le site utilise Vercel, PostgreSQL pour les données et un stockage privé Vercel Blob pour les images. Les mots de passe sont conservés sous forme de hash. Ces prestataires traitent les données nécessaires au fonctionnement du site."],
      ["Préférences et cookies", "Un cookie de session vous garde connecté. La langue et le thème sont enregistrés dans votre navigateur. La formule choisie est conservée pendant la session pour faciliter votre bilan."],
      ["Vos demandes", "Contactez le coach pour obtenir une copie, corriger ou supprimer vos informations, ou retirer votre accord de publication. Évitez les informations sensibles dans un message public."],
    ] },
    terms: { title: "Chaque étape, en clair.", intro: "Les informations sur le coaching, les formules et les paiements.", items: [
      ["Votre accompagnement", "Chaque formule indique le contenu et le tarif mensuel en dirhams marocains. Le coach étudie votre bilan et convient avec vous du programme et de la date de début."],
      ["Avant le virement", "Confirmez la formule, la date, le bénéficiaire et les coordonnées bancaires avec le coach. Déposez le justificatif dans votre espace privé. L'abonnement est activé après vérification. Le site ne traite ni carte bancaire ni prélèvement automatique."],
      ["Renouvellement et annulation", "Avant tout paiement, confirmez avec le coach les conditions de renouvellement, changement, annulation et remboursement. Le site ne prélève aucun renouvellement automatiquement."],
      ["Entraînement et nutrition", "Signalez vos limitations et demandez conseil à un professionnel de santé si nécessaire. Le coaching ne remplace pas un diagnostic ou un traitement médical. Les résultats varient selon chaque personne."],
      ["Consultations et échanges", "Les consultations sont confirmées dans votre tableau de bord. Vérifiez les informations du rendez-vous et prévenez le coach pour le déplacer. Utilisez la messagerie privée pour votre suivi et WhatsApp pour une première demande."],
    ] },
  },
  ar: {
    back: "العودة للموقع", contact: "تواصل مع المدرب",
    privacy: { title: "خصوصيتك. تقدمك.", intro: "كيف تُستخدم معلوماتك داخل فضاء التدريب الخاص بك.", items: [
      ["المعلومات التي نجمعها", "يتضمن حسابك الاسم والإيميل والهاتف. وقد يتضمن التقييم ولوحة التحكم أهدافك وخبرتك وقياساتك وحدودك البدنية ورسائلك وصور تقدمك وإثباتات الدفع."],
      ["من يمكنه الاطلاع عليها", "معلومات التدريب الخاصة متاحة لك وللمدرب. صور التقدم وإثباتات الدفع تتطلب تسجيل الدخول. لا تُنشر آراء العملاء وصور التحولات إلا بعد تسجيل المدرب لموافقة أصحابها."],
      ["التخزين ومقدمو الخدمة", "يعمل الموقع على Vercel، وتُخزن البيانات في PostgreSQL والصور في تخزين Vercel Blob خاص. تُخزن كلمات المرور بصيغة تجزئة. يعالج مقدمو الخدمة البيانات اللازمة لتشغيل الموقع."],
      ["التفضيلات وملفات الارتباط", "يُستخدم ملف جلسة للإبقاء على تسجيل دخولك. تُحفظ اللغة والمظهر في المتصفح، واختيار الباقة خلال جلسة المتصفح للمساعدة في إتمام التقييم."],
      ["طلباتك", "تواصل مع المدرب لطلب نسخة من بياناتك أو تصحيحها أو حذفها، أو لسحب موافقة نشر رأيك أو صورك. تجنب إرسال معلومات صحية أو مالية حساسة في رسائل عامة."],
    ] },
    terms: { title: "خطوتك القادمة، بوضوح.", intro: "معلومات عن التدريب والاشتراكات وطريقة الدفع.", items: [
      ["محتوى التدريب", "توضح بطاقة الباقة الدعم المشمول والثمن الشهري بالدرهم المغربي. يراجع المدرب تقييمك ويتفق معك على محتوى البرنامج وتاريخ البداية."],
      ["قبل تحويل المال", "أكد الباقة وتاريخ البداية واسم المستفيد والبيانات البنكية مباشرة مع المدرب. ارفع إثبات التحويل داخل حسابك الخاص. يتفعل الاشتراك بعد التحقق من الدفع. الموقع لا يعالج البطاقات البنكية ولا يقتطع المال تلقائيا."],
      ["التجديد والتغيير والإلغاء", "تواصل مع المدرب قبل الدفع لتأكيد شروط التجديد وتغيير الباقة والإلغاء والاسترداد المناسبة لتدريبك. لا يُحصّل الموقع تجديدا تلقائيا."],
      ["التدريب والتغذية", "أخبر المدرب بحدودك البدنية واستشر مختصا صحيا عند الحاجة. التدريب والتوجيه الغذائي لا يعوضان التشخيص أو العلاج الطبي. تختلف النتائج بين الأشخاص ولا توجد نتيجة ثابتة مضمونة."],
      ["الاستشارات والدعم", "تتأكد الاستشارات داخل لوحة تحكمك. راجع تفاصيل اللقاء وتواصل مع المدرب إذا احتجت تغيير الموعد. استعمل الرسائل الخاصة للمتابعة وواتساب للاستفسار الأولي."],
    ] },
  },
};

export function InformationPage({ kind, brandName, whatsapp }: { kind: "privacy" | "terms"; brandName: string; whatsapp: string }) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const page = copy[kind];
  return <main className="min-h-screen bg-grid">
    <div className="mx-auto max-w-4xl px-5 py-6 sm:px-8">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
        <Link href="/" className="font-display text-lg uppercase tracking-wide">{brandName}</Link><LanguageSwitcher />
      </div>
      <Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4 rtl:rotate-180" />{copy.back}</Link>
      <ShieldCheck className="mt-12 h-10 w-10 text-primary" />
      <h1 className="mt-5 font-display text-4xl uppercase sm:text-6xl">{page.title}</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">{page.intro}</p>
      <div className="my-10 space-y-5">{page.items.map(([title, body]) => <section key={title} className="rounded-xl border border-border bg-card/80 p-6 sm:p-8"><h2 className="font-display text-xl">{title}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{body}</p></section>)}</div>
      <Button asChild variant="outline" className="mb-12"><a href={buildWhatsappLink(whatsapp, copy.contact)} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" />{copy.contact}</a></Button>
    </div>
  </main>;
}

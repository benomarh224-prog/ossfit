import type { Locale } from "./i18n/dictionary";

const copy: Record<string, Record<string, { en: Record<string, unknown>; fr: Record<string, unknown>; ar: Record<string, unknown> }>> = {
  "services": {
    "online-personal-coaching": {
      "en": {
        "title": "Personal Training",
        "shortDesc": "A clear workout plan built around your goals, level and equipment.",
        "features": [
          "Your own training plan",
          "Home or gym workouts",
          "Progress check-ins"
        ]
      },
      "fr": {
        "title": "Entraînement personnel",
        "shortDesc": "Un programme clair adapté à vos objectifs, votre niveau et votre matériel.",
        "features": [
          "Votre programme personnel",
          "À la maison ou en salle",
          "Bilans de progression"
        ]
      },
      "ar": {
        "title": "تدريب شخصي",
        "shortDesc": "برنامج واضح مبني على أهدافك ومستواك والمعدات المتوفرة لديك.",
        "features": [
          "برنامج خاص بك",
          "في المنزل أو القاعة",
          "متابعة تقدمك"
        ]
      }
    },
    "body-transformation": {
      "en": {
        "title": "Body Recomposition",
        "shortDesc": "Build strength and consistency with a plan you can keep following.",
        "features": [
          "Realistic goals",
          "Regular program reviews",
          "Private progress tracking"
        ]
      },
      "fr": {
        "title": "Recomposition corporelle",
        "shortDesc": "Développez votre force et votre régularité avec un programme durable.",
        "features": [
          "Objectifs réalistes",
          "Révisions régulières",
          "Suivi privé des progrès"
        ]
      },
      "ar": {
        "title": "تحسين التكوين البدني",
        "shortDesc": "طوّر قوتك والتزامك ببرنامج يمكنك الاستمرار عليه.",
        "features": [
          "أهداف واقعية",
          "مراجعات منتظمة",
          "تتبع خاص للتقدم"
        ]
      }
    },
    "nutrition-guidance": {
      "en": {
        "title": "Nutrition Guidance",
        "shortDesc": "Make everyday food choices work for your training.",
        "features": [
          "Practical meal guidance",
          "Personal nutrition targets",
          "Daily habit tracking"
        ]
      },
      "fr": {
        "title": "Accompagnement nutritionnel",
        "shortDesc": "Des choix alimentaires du quotidien au service de votre entraînement.",
        "features": [
          "Repères alimentaires pratiques",
          "Objectifs nutritionnels personnels",
          "Suivi des habitudes"
        ]
      },
      "ar": {
        "title": "توجيه غذائي",
        "shortDesc": "اختيارات غذائية يومية تدعم برنامجك التدريبي.",
        "features": [
          "إرشادات عملية للوجبات",
          "أهداف غذائية شخصية",
          "تتبع العادات اليومية"
        ]
      }
    },
    "one-to-one-consultation": {
      "en": {
        "title": "One-to-One Coaching",
        "shortDesc": "Talk through your goals before choosing your next step.",
        "features": [
          "Online consultation",
          "Goal assessment",
          "Clear next steps"
        ]
      },
      "fr": {
        "title": "Consultation individuelle",
        "shortDesc": "Échangez sur vos objectifs avant de choisir votre prochaine étape.",
        "features": [
          "Consultation en ligne",
          "Évaluation des objectifs",
          "Prochaines étapes claires"
        ]
      },
      "ar": {
        "title": "استشارة فردية",
        "shortDesc": "ناقش أهدافك قبل اختيار خطوتك القادمة.",
        "features": [
          "استشارة عبر الإنترنت",
          "تقييم الأهداف",
          "خطوات تالية واضحة"
        ]
      }
    }
  },
  "packages": {
    "basic-coaching": {
      "en": {
        "title": "Basic Coaching",
        "tagline": "Start your journey with structured guidance",
        "features": [
          "Personalized monthly workout plan",
          "Basic nutrition targets",
          "Monthly program update",
          "Email support",
          "Progress tracking access"
        ],
        "supportLevel": "Email support"
      },
      "fr": {
        "title": "Coaching Essentiel",
        "tagline": "Démarrez avec un accompagnement structuré",
        "supportLevel": "Assistance par e-mail",
        "features": [
          "Programme mensuel personnalisé",
          "Objectifs nutritionnels de base",
          "Mise à jour mensuelle",
          "Assistance par e-mail",
          "Accès au suivi des progrès"
        ]
      },
      "ar": {
        "title": "التدريب الأساسي",
        "tagline": "ابدأ رحلتك بتوجيه واضح ومنظم",
        "supportLevel": "دعم عبر الإيميل",
        "features": [
          "برنامج شهري شخصي",
          "أهداف غذائية أساسية",
          "تحديث شهري للبرنامج",
          "دعم عبر الإيميل",
          "تتبع تقدمك"
        ]
      }
    },
    "premium-coaching": {
      "en": {
        "title": "Premium Coaching",
        "tagline": "Complete coaching with weekly monitoring",
        "features": [
          "Everything in Basic",
          "Weekly progress monitoring",
          "Personalized nutrition plan",
          "Exercise technique feedback",
          "WhatsApp support",
          "Program adjustments every 2 weeks"
        ],
        "supportLevel": "Weekly check-ins + WhatsApp"
      },
      "fr": {
        "title": "Coaching Premium",
        "tagline": "Un accompagnement complet avec suivi hebdomadaire",
        "supportLevel": "Bilans hebdomadaires + WhatsApp",
        "features": [
          "Tout le contenu Essentiel",
          "Bilans hebdomadaires",
          "Plan nutritionnel personnel",
          "Retours sur la technique",
          "Assistance WhatsApp",
          "Adaptations toutes les 2 semaines"
        ]
      },
      "ar": {
        "title": "التدريب المتكامل",
        "tagline": "تدريب شامل مع متابعة أسبوعية",
        "supportLevel": "متابعة أسبوعية وواتساب",
        "features": [
          "كل مزايا التدريب الأساسي",
          "متابعة التقدم أسبوعيا",
          "خطة غذائية شخصية",
          "ملاحظات على تقنية التمرين",
          "دعم واتساب",
          "تعديلات كل أسبوعين"
        ]
      }
    },
    "vip-transformation": {
      "en": {
        "title": "VIP Transformation",
        "tagline": "Maximum support for full transformation",
        "features": [
          "Everything in Premium",
          "Daily coach availability",
          "Bi-weekly video calls",
          "Custom nutrition adjustments",
          "Priority program updates",
          "Progress photo reviews"
        ],
        "supportLevel": "Daily support + calls"
      },
      "fr": {
        "title": "Accompagnement VIP",
        "tagline": "Le niveau de suivi le plus complet",
        "supportLevel": "Assistance quotidienne et appels",
        "features": [
          "Tout le contenu Premium",
          "Disponibilité quotidienne du coach",
          "Appels vidéo deux fois par mois",
          "Adaptations nutritionnelles",
          "Mises à jour prioritaires",
          "Analyse des photos de suivi"
        ]
      },
      "ar": {
        "title": "المتابعة المميزة",
        "tagline": "أعلى مستوى من الدعم والمتابعة",
        "supportLevel": "دعم يومي ومكالمات",
        "features": [
          "كل مزايا التدريب المتكامل",
          "تواصل يومي مع المدرب",
          "مكالمتا فيديو في الشهر",
          "تعديلات غذائية شخصية",
          "أولوية تحديث البرنامج",
          "مراجعة صور التقدم"
        ]
      }
    }
  },
  "faqs": {
    "faq-1": {
      "en": {
        "question": "How do I start?",
        "answer": "Choose a package, create your account and complete your fitness assessment. Coach Oussama reviews your goals and contacts you about the next steps."
      },
      "fr": {
        "question": "Comment démarrer ?",
        "answer": "Choisissez une formule, créez votre compte et complétez votre bilan. Coach Oussama étudie vos objectifs puis vous contacte pour la suite."
      },
      "ar": {
        "question": "كيف أبدأ؟",
        "answer": "اختر باقة، أنشئ حسابك وأكمل تقييمك. يراجع أسامة أهدافك ويتواصل معك لتوضيح الخطوات التالية."
      }
    },
    "faq-2": {
      "en": {
        "question": "Can I train at home?",
        "answer": "Yes. Your assessment asks about your equipment and experience so your program can suit home training or a gym."
      },
      "fr": {
        "question": "Puis-je m'entraîner à la maison ?",
        "answer": "Oui. Votre bilan précise votre matériel et votre expérience pour adapter le programme à la maison ou à la salle."
      },
      "ar": {
        "question": "هل يمكنني التدريب في المنزل؟",
        "answer": "نعم. يوضح تقييمك المعدات المتوفرة وخبرتك حتى يناسب البرنامج التدريب في المنزل أو القاعة."
      }
    },
    "faq-3": {
      "en": {
        "question": "How do payments work?",
        "answer": "Payments are made by bank transfer in Moroccan dirhams. Confirm the bank details with the coach, upload your proof privately and wait for verification. Uploading a proof does not automatically activate a subscription."
      },
      "fr": {
        "question": "Comment se passe le paiement ?",
        "answer": "Le paiement se fait par virement en dirhams. Confirmez les coordonnées avec le coach puis déposez votre justificatif dans votre espace privé. L'abonnement s'active après vérification."
      },
      "ar": {
        "question": "كيف يتم الدفع؟",
        "answer": "الدفع بالتحويل البنكي بالدرهم. أكد البيانات مع المدرب ثم ارفع الإثبات في حسابك الخاص. يتفعل الاشتراك بعد التحقق من الدفع."
      }
    },
    "faq-4": {
      "en": {
        "question": "When will I receive my program?",
        "answer": "The coach prepares your plan after reviewing your assessment and confirming your subscription. Agree on the start date directly before you pay."
      },
      "fr": {
        "question": "Quand recevrai-je mon programme ?",
        "answer": "Le coach prépare votre programme après étude du bilan et confirmation de l'abonnement. Convenez directement de la date de début avant de payer."
      },
      "ar": {
        "question": "متى أتلقى برنامجي؟",
        "answer": "يُعد المدرب برنامجك بعد مراجعة التقييم وتأكيد الاشتراك. اتفق معه على تاريخ البداية قبل الدفع."
      }
    },
    "faq-5": {
      "en": {
        "question": "Can I book a consultation?",
        "answer": "Yes. Registered clients can request an available consultation slot from their dashboard. You can also contact Coach Oussama on WhatsApp before joining."
      },
      "fr": {
        "question": "Puis-je réserver une consultation ?",
        "answer": "Les clients inscrits peuvent demander un créneau depuis leur tableau de bord. Vous pouvez aussi contacter Coach Oussama sur WhatsApp avant de vous inscrire."
      },
      "ar": {
        "question": "هل يمكنني حجز استشارة؟",
        "answer": "يمكن للمشتركين طلب موعد متاح من لوحة التحكم. ويمكنك التواصل مع أسامة على واتساب قبل الانضمام."
      }
    },
    "faq-6": {
      "en": {
        "question": "Can I change or cancel a package?",
        "answer": "Contact the coach before payment to confirm the package scope, renewal, cancellation and refund conditions that apply to your coaching."
      },
      "fr": {
        "question": "Puis-je changer ou annuler une formule ?",
        "answer": "Avant tout paiement, confirmez directement avec le coach le contenu, le renouvellement et les conditions de modification, annulation ou remboursement."
      },
      "ar": {
        "question": "هل يمكنني تغيير الباقة أو إلغاؤها؟",
        "answer": "أكد مع المدرب قبل الدفع محتوى الباقة والتجديد وشروط التغيير والإلغاء والاسترداد الخاصة بتدريبك."
      }
    },
    "faq-7": {
      "en": {
        "question": "Are results guaranteed?",
        "answer": "No fixed result can be promised. Progress depends on your starting point, consistency, recovery and other individual factors. Coaching focuses on a realistic plan and regular review."
      },
      "fr": {
        "question": "Les résultats sont-ils garantis ?",
        "answer": "Aucun résultat précis ne peut être promis. Les progrès dépendent notamment de votre point de départ, votre régularité et votre récupération. Le suivi privilégie un programme réaliste et des bilans réguliers."
      },
      "ar": {
        "question": "هل النتائج مضمونة؟",
        "answer": "لا يمكن ضمان نتيجة ثابتة. يتأثر تقدمك بنقطة البداية والالتزام والاستشفاء وعوامل أخرى. يركز التدريب على خطة واقعية ومراجعة منتظمة."
      }
    },
    "faq-8": {
      "en": {
        "question": "What if I have an injury or a medical condition?",
        "answer": "Tell the coach about any limitations during your assessment. Get advice from a qualified healthcare professional before starting or changing an exercise or nutrition routine."
      },
      "fr": {
        "question": "Et si j'ai une blessure ou un problème de santé ?",
        "answer": "Signalez vos limitations lors du bilan et demandez conseil à un professionnel de santé avant de commencer ou modifier votre entraînement ou votre alimentation."
      },
      "ar": {
        "question": "ماذا لو كانت لدي إصابة أو حالة صحية؟",
        "answer": "أخبر المدرب بحدودك خلال التقييم واستشر مختصا صحيا قبل بدء أو تغيير روتين التدريب أو التغذية."
      }
    }
  }
};

// Defaults have translations; custom text entered by the coach remains as entered.
export function localizeMarketing(kind: string, id: string, item: any, locale: Locale) {
  const entry = copy[kind]?.[id];
  if (locale === "en" || !entry || !Object.entries(entry.en).every(([key, value]) => JSON.stringify(item[key]) === JSON.stringify(value))) return item;
  return { ...item, ...entry[locale] };
}

const defaultContent = {
  en: {
    heroTitle: "YOUR GOAL. YOUR PLAN. YOUR PROGRESS.",
    heroSubtitle: "Build a stronger routine with Coach Oussama. Personal training, practical nutrition guidance and a private space to track every step — wherever you train.",
    aboutStory: "Your training should fit your life. We start with your goals, experience and available equipment, then build a practical plan around you. Your private dashboard keeps your workouts, check-ins and coach conversations together.",
    aboutPhilosophy: "Consistency beats extremes. Clear sessions, realistic habits and honest feedback make it easier to keep showing up. We review your progress and adapt your plan as your needs change.",
  },
  fr: {
    heroTitle: "VOTRE OBJECTIF. VOTRE PROGRAMME. VOS PROGRÈS.",
    heroSubtitle: "Construisez une routine plus solide avec Coach Oussama. Entraînement personnel, repères nutritionnels pratiques et un espace privé pour suivre chaque étape, où que vous vous entraîniez.",
    aboutStory: "Votre entraînement doit s'adapter à votre vie. Nous partons de vos objectifs, de votre expérience et du matériel disponible pour construire un programme concret. Votre espace privé réunit séances, bilans et échanges avec le coach.",
    aboutPhilosophy: "La régularité vaut mieux que les extrêmes. Des séances claires, des habitudes réalistes et des retours honnêtes vous aident à continuer. Nous révisons vos progrès et adaptons le programme à vos besoins.",
  },
  ar: {
    heroTitle: "هدفك. برنامجك. تقدمك.",
    heroSubtitle: "ابنِ روتينا أقوى مع المدرب أسامة. تدريب شخصي وتوجيه غذائي عملي وفضاء خاص لتتبع كل خطوة، أينما كنت تتدرب.",
    aboutStory: "تدريبك خاصو يناسب حياتك. ننطلق من أهدافك وخبرتك والمعدات المتوفرة لديك لنضع خطة عملية خاصة بك. يجمع حسابك الخاص حصصك وتقييماتك ورسائلك مع المدرب في مكان واحد.",
    aboutPhilosophy: "الاستمرارية أفضل من المبالغة. حصص واضحة وعادات واقعية وملاحظات صريحة تساعدك على المواصلة. نراجع تقدمك ونكيف البرنامج مع احتياجاتك المتغيرة.",
  },
};

export function localizeSiteContent(content: any, locale: Locale) {
  const result = { ...content };
  for (const key of Object.keys(defaultContent.en) as (keyof typeof defaultContent.en)[]) {
    if (content[key] === defaultContent.en[key]) result[key] = defaultContent[locale][key];
  }
  // Shorter presentation for the original defaults; the coach's own copy is preserved.
  if (content.heroTitle === defaultContent.en.heroTitle) result.heroTitle = {
    en: "Train with Oussama", fr: "Coach Oussama", ar: "تدرّب مع أسامة",
  }[locale];
  if (content.heroSubtitle === defaultContent.en.heroSubtitle) result.heroSubtitle = {
    en: "Personal training, practical nutrition and direct support from Coach Oussama. Your program, wherever you train.",
    fr: "Entraînement personnel, nutrition pratique et suivi avec Coach Oussama. Votre programme, où que vous soyez.",
    ar: "تدريب شخصي، توجيه غذائي ومواكبة مع المدرب أسامة. برنامجك معك، فين ما كنت كتتمرّن.",
  }[locale];
  if (content.coachName === "Oussama" && locale === "ar") result.coachName = "أسامة";
  if (content.coachCity === "Morocco") result.coachCity = locale === "ar" ? "المغرب" : locale === "fr" ? "Maroc" : "Morocco";
  return result;
}

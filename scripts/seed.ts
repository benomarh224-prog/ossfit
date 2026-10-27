/* eslint-disable */
import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";
import { toJSON } from "../src/lib/server-utils";

async function main() {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    throw new Error("Demo seeding is disabled in production. Use the private owner setup link and coach dashboard.");
  }
  // ---- Coach account (single trainer) ----
  const coachEmail = process.env.COACH_SEED_EMAIL;
  const coachPass = process.env.COACH_SEED_PASSWORD;
  const demoClientPass = process.env.DEMO_CLIENT_SEED_PASSWORD;
  if (!coachEmail || !coachPass || !demoClientPass) {
    throw new Error("Set COACH_SEED_EMAIL, COACH_SEED_PASSWORD and DEMO_CLIENT_SEED_PASSWORD for a development-only demo.");
  }
  const hashed = await bcrypt.hash(coachPass, 10);

  await db.user.upsert({
    where: { email: coachEmail },
    create: {
      email: coachEmail,
      name: "Youssef El Amrani",
      role: "COACH",
      password: hashed,
      phone: "+212600000000",
    },
    update: { role: "COACH", password: hashed, name: "Youssef El Amrani" },
  });

  // ---- Demo client account (clearly marked as demo) ----
  const clientEmail = "client@demo.ma";
  const clientHashed = await bcrypt.hash(demoClientPass, 10);
  await db.user.upsert({
    where: { email: clientEmail },
    create: {
      email: clientEmail,
      name: "Sara Benali",
      role: "CLIENT",
      password: clientHashed,
      phone: "+212661234567",
    },
    update: { role: "CLIENT", password: clientHashed },
  });

  // ---- Site content singleton ----
  await db.siteContent.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      brandName: "ATLAS COACH",
      coachName: "Youssef El Amrani",
      coachCity: "Tetouan, Morocco",
      whatsappNumber: "+212600000000",
      heroTitle: "TRANSFORM YOUR BODY. TRANSFORM YOUR LIFE.",
      heroSubtitle:
        "Professional online personal training from Tetouan, available across Morocco. Personalized workouts, nutrition guidance, and real coaching support.",
      aboutStory:
        "Born and raised in Tetouan, I have dedicated my life to understanding the science of physical transformation. My mission is to make professional, science-based coaching accessible to every Moroccan who is ready to commit to change.",
      aboutPhilosophy:
        "I believe in sustainable, evidence-based methods. No shortcuts, no gimmicks — only structured programming, disciplined nutrition, and honest coaching that respects your body and your time.",
      bankName: "Bank of Africa (BMCE)",
      bankAccountName: "Youssef El Amrani",
      bankIban: "MA64 011 780 0000123456789012 34",
      bankRIB: "011 780 0123456789012 34",
      paymentInstructions:
        "Transfer the monthly amount to the bank account below, then upload the payment proof in your dashboard. Your subscription is activated after the coach verifies the payment.",
      statsVerified: false,
      instagramUrl: "https://instagram.com",
      tiktokUrl: "https://tiktok.com",
    },
    update: {},
  });

  // ---- Services ----
  const services = [
    {
      slug: "online-personal-coaching",
      title: "Online Personal Coaching",
      shortDesc: "Fully personalized training, delivered online with real coach support.",
      longDesc:
        "A complete coaching experience: personalized workout programs designed around your body and goals, weekly progress monitoring, exercise guidance, program adjustments, and direct communication with your coach.",
      icon: "dumbbell",
      image: "/images/service-coaching.jpg",
      features: [
        "Personalized workout programs",
        "Weekly progress monitoring",
        "Exercise technique guidance",
        "Program adjustments",
        "Direct coach communication",
      ],
      order: 1,
    },
    {
      slug: "body-transformation",
      title: "Body Transformation",
      shortDesc: "Focused programs for muscle building, fat loss, and recomposition.",
      longDesc:
        "Whether you want to build muscle, lose fat, recompute your body composition or build strength, this program targets your specific transformation goal with structured progression.",
      icon: "flame",
      image: "/images/service-transformation.jpg",
      features: [
        "Muscle building programs",
        "Fat loss protocols",
        "Body recomposition strategy",
        "Strength development",
      ],
      order: 2,
    },
    {
      slug: "nutrition-guidance",
      title: "Nutrition Guidance",
      shortDesc: "Personalized targets and meal guidance to support your goals.",
      longDesc:
        "Receive personalized calorie and macronutrient targets, meal planning guidance, and nutrition tracking. Nutrition guidance is educational and not a substitute for medical advice.",
      icon: "salad",
      image: "/images/service-nutrition.jpg",
      features: [
        "Personalized calorie targets",
        "Macronutrient recommendations",
        "Meal planning guidance",
        "Nutrition tracking",
      ],
      order: 3,
    },
    {
      slug: "one-to-one-consultation",
      title: "One-to-One Consultation",
      shortDesc: "Book an online session to assess your goals and plan your path.",
      longDesc:
        "Request a one-to-one online consultation to assess your goals, review your current situation, and receive personalized coaching recommendations before you commit.",
      icon: "video",
      image: "/images/service-consultation.jpg",
      features: ["Online consultation requests", "Goal assessment", "Coaching recommendations"],
      order: 4,
    },
  ];

  for (const s of services) {
    await db.service.upsert({
      where: { slug: s.slug },
      create: { ...s, features: toJSON(s.features) },
      update: { ...s, features: toJSON(s.features) },
    });
  }

  // ---- Packages ----
  const packages = [
    {
      slug: "basic-coaching",
      title: "Basic Coaching",
      tagline: "Start your journey with structured guidance",
      priceMAD: 399,
      durationLabel: "Per month",
      supportLevel: "Email support",
      available: true,
      featured: false,
      order: 1,
      features: [
        "Personalized monthly workout plan",
        "Basic nutrition targets",
        "Monthly program update",
        "Email support",
        "Progress tracking access",
      ],
    },
    {
      slug: "premium-coaching",
      title: "Premium Coaching",
      tagline: "Complete coaching with weekly monitoring",
      priceMAD: 699,
      durationLabel: "Per month",
      supportLevel: "Weekly check-ins + WhatsApp",
      available: true,
      featured: true,
      order: 2,
      features: [
        "Everything in Basic",
        "Weekly progress monitoring",
        "Personalized nutrition plan",
        "Exercise technique feedback",
        "WhatsApp support",
        "Program adjustments every 2 weeks",
      ],
    },
    {
      slug: "vip-transformation",
      title: "VIP Transformation",
      tagline: "Maximum support for full transformation",
      priceMAD: 1199,
      durationLabel: "Per month",
      supportLevel: "Daily support + calls",
      available: true,
      featured: false,
      order: 3,
      features: [
        "Everything in Premium",
        "Daily coach availability",
        "Bi-weekly video calls",
        "Custom nutrition adjustments",
        "Priority program updates",
        "Progress photo reviews",
      ],
    },
  ];

  for (const p of packages) {
    await db.package.upsert({
      where: { slug: p.slug },
      create: { ...p, features: toJSON(p.features) },
      update: { ...p, features: toJSON(p.features) },
    });
  }

  // ---- FAQ ----
  const faqs = [
    { q: "Do I need a gym membership to follow your programs?", a: "No. I design programs based on the equipment you actually have access to — whether that is a full gym, dumbbells at home, or just bodyweight.", cat: "Training" },
    { q: "Is the coaching really online?", a: "Yes. All coaching is delivered online so I can work with clients across all of Morocco — from Tangier to Agadir — wherever you are.", cat: "General" },
    { q: "How do payments work?", a: "Payments are made via bank transfer in Moroccan dirhams. After transferring, you upload the proof in your dashboard and I verify it manually before activating your subscription.", cat: "Payments" },
    { q: "Can I get a refund if I am not satisfied?", a: "Because programs are personalized and delivered immediately, refunds are handled case by case. Contact me directly and we will find a fair solution.", cat: "Payments" },
    { q: "Do you provide nutrition plans?", a: "I provide personalized nutrition targets and meal guidance. Nutrition guidance is educational and not a substitute for advice from a registered dietitian or doctor.", cat: "Nutrition" },
    { q: "I have an injury — can I still train?", a: "Share your limitations during onboarding. I will adapt your program around them, and you should always consult a physician before starting any new training program.", cat: "Training" },
    { q: "How quickly will I see results?", a: "Real transformation takes consistency. Most clients notice strength and energy changes in 2-4 weeks and visible body changes in 8-12 weeks of disciplined adherence.", cat: "Results" },
    { q: "Which cities in Morocco do you serve?", a: "Everywhere. Because coaching is fully online, I work with clients in Casablanca, Rabat, Marrakech, Tetouan, Tangier, Fes, Agadir and all other Moroccan cities.", cat: "General" },
  ];

  for (let i = 0; i < faqs.length; i++) {
    const f = faqs[i];
    await db.fAQ.upsert({
      where: { id: `faq-${i + 1}` },
      create: { id: `faq-${i + 1}`, question: f.q, answer: f.a, category: f.cat, order: i + 1 },
      update: { question: f.q, answer: f.a, category: f.cat, order: i + 1 },
    });
  }

  // ---- Demo transformations & testimonials (clearly DEMO, not verified) ----
  const transformations = [
    {
      id: "demo-trans-1",
      clientName: "Demo Client A",
      beforeImg: "/images/transform-2.jpg",
      afterImg: "/images/transform-2.jpg",
      goal: "Body recomposition",
      duration: "16 weeks (DEMO)",
      story: "This is a demo transformation placeholder. Real transformations are added by the coach after receiving explicit client consent.",
    },
    {
      id: "demo-trans-2",
      clientName: "Demo Client B",
      beforeImg: "/images/transform-1.jpg",
      afterImg: "/images/transform-1.jpg",
      goal: "Fat loss",
      duration: "12 weeks (DEMO)",
      story: "Demo placeholder — replace with real, consented client transformations from the admin dashboard.",
    },
  ];
  for (let i = 0; i < transformations.length; i++) {
    const t = transformations[i];
    await db.transformation.upsert({
      where: { id: t.id },
      create: { ...t, published: true, consent: false, order: i + 1 },
      update: { ...t, order: i + 1 },
    });
  }

  const testimonials = [
    { id: "demo-test-1", clientName: "Demo Client — Casablanca", clientCity: "Casablanca", rating: 5, quote: "This is a demo testimonial placeholder. Real testimonials are added by the coach from the admin dashboard only after the client has given explicit consent.", goal: "Fat loss", duration: "12 weeks", published: true, consent: false },
    { id: "demo-test-2", clientName: "Demo Client — Rabat", clientCity: "Rabat", rating: 5, quote: "Demo placeholder testimonial. Verified client testimonials will replace this once the coach publishes them.", goal: "Muscle building", duration: "16 weeks", published: true, consent: false },
  ];
  for (let i = 0; i < testimonials.length; i++) {
    const t = testimonials[i];
    await db.testimonial.upsert({
      where: { id: t.id },
      create: { ...t, order: i + 1 },
      update: { ...t, order: i + 1 },
    });
  }

  // ---- Demo exercise library ----
  const exercises = [
    { name: "Barbell Back Squat", muscleGroup: "Legs", equipment: "Barbell", defaultSets: 4, defaultReps: "8-10", defaultRest: "120s", instructions: "Keep chest up, knees tracking over toes, descend to parallel." },
    { name: "Bench Press", muscleGroup: "Chest", equipment: "Barbell", defaultSets: 4, defaultReps: "6-8", defaultRest: "120s", instructions: "Retract shoulder blades, lower to mid-chest, drive up." },
    { name: "Deadlift", muscleGroup: "Back", equipment: "Barbell", defaultSets: 3, defaultReps: "5", defaultRest: "180s", instructions: "Flat back, drive through heels, hips and shoulders rise together." },
    { name: "Pull-ups", muscleGroup: "Back", equipment: "Bodyweight", defaultSets: 4, defaultReps: "AMRAP", defaultRest: "90s", instructions: "Full hang to chin over bar, control the descent." },
    { name: "Overhead Press", muscleGroup: "Shoulders", equipment: "Barbell", defaultSets: 4, defaultReps: "6-8", defaultRest: "120s", instructions: "Brace core, press straight up, lock out overhead." },
    { name: "Dumbbell Curl", muscleGroup: "Arms", equipment: "Dumbbell", defaultSets: 3, defaultReps: "10-12", defaultRest: "60s", instructions: "Elbows tucked, curl without swinging." },
    { name: "Plank", muscleGroup: "Core", equipment: "Bodyweight", defaultSets: 3, defaultReps: "45s", defaultRest: "45s", instructions: "Neutral spine, brace abs, hold position." },
    { name: "Romanian Deadlift", muscleGroup: "Hamstrings", equipment: "Barbell", defaultSets: 3, defaultReps: "8-10", defaultRest: "90s", instructions: "Soft knees, hinge at hips, feel stretch in hamstrings." },
  ];
  for (const e of exercises) {
    await db.exerciseLibrary.upsert({
      where: { id: `ex-${e.name.toLowerCase().replace(/\s+/g, "-")}` },
      create: { id: `ex-${e.name.toLowerCase().replace(/\s+/g, "-")}`, ...e },
      update: { ...e },
    });
  }

  // ---- Demo client profile + subscription + a sample workout + nutrition plan ----
  const demoUser = await db.user.findUnique({ where: { email: clientEmail } });
  if (demoUser) {
    const premiumPkg = await db.package.findUnique({ where: { slug: "premium-coaching" } });
    await db.clientProfile.upsert({
      where: { userId: demoUser.id },
      create: {
        userId: demoUser.id,
        fullName: "Sara Benali",
        age: 27,
        heightCm: 165,
        weightKg: 62,
        goal: "recomp",
        experience: "intermediate",
        equipment: toJSON(["Dumbbells", "Resistance bands"]),
        weeklyAvailability: "avail4",
        preferredPackageId: premiumPkg?.id,
        limitations: "Mild lower-back tightness",
        injuryConsent: true,
        onboarded: true,
        status: "ACTIVE",
        city: "Casablanca",
        phone: "+212661234567",
      },
      update: {},
    });

    if (premiumPkg) {
      await db.subscription.upsert({
        where: { id: "demo-sub-1" },
        create: {
          id: "demo-sub-1",
          userId: demoUser.id,
          packageId: premiumPkg.id,
          status: "ACTIVE",
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          amountMAD: premiumPkg.priceMAD,
        },
        update: {},
      });
    }

    await db.workoutPlan.upsert({
      where: { id: "demo-plan-1" },
      create: {
        id: "demo-plan-1",
        userId: demoUser.id,
        title: "Premium Recomposition — Push/Pull/Legs",
        goal: "recomp",
        summary: "4-day push/pull/legs split focused on recomposition. (DEMO program)",
        active: true,
        daysJson: toJSON([
          { day: "Monday", focus: "Push", exercises: [
            { name: "Bench Press", sets: 4, reps: "6-8", rest: "120s" },
            { name: "Overhead Press", sets: 4, reps: "6-8", rest: "120s" },
            { name: "Dumbbell Curl", sets: 3, reps: "10-12", rest: "60s" },
          ]},
          { day: "Tuesday", focus: "Pull", exercises: [
            { name: "Deadlift", sets: 3, reps: "5", rest: "180s" },
            { name: "Pull-ups", sets: 4, reps: "AMRAP", rest: "90s" },
            { name: "Romanian Deadlift", sets: 3, reps: "8-10", rest: "90s" },
          ]},
          { day: "Thursday", focus: "Legs", exercises: [
            { name: "Barbell Back Squat", sets: 4, reps: "8-10", rest: "120s" },
            { name: "Romanian Deadlift", sets: 3, reps: "8-10", rest: "90s" },
            { name: "Plank", sets: 3, reps: "45s", rest: "45s" },
          ]},
          { day: "Saturday", focus: "Upper Accessory", exercises: [
            { name: "Bench Press", sets: 3, reps: "10-12", rest: "90s" },
            { name: "Pull-ups", sets: 3, reps: "AMRAP", rest: "90s" },
            { name: "Dumbbell Curl", sets: 3, reps: "12-15", rest: "60s" },
          ]},
        ]),
      },
      update: {},
    });

    await db.nutritionPlan.upsert({
      where: { id: "demo-nutrition-1" },
      create: {
        id: "demo-nutrition-1",
        userId: demoUser.id,
        title: "Recomposition Nutrition (DEMO)",
        dailyCalories: 1800,
        proteinG: 135,
        carbsG: 180,
        fatsG: 60,
        waterCupsGoal: 8,
        active: true,
        mealsJson: toJSON([
          { meal: "Breakfast", suggestion: "Oats with whey protein and berries" },
          { meal: "Lunch", suggestion: "Grilled chicken, rice, vegetables" },
          { meal: "Dinner", suggestion: "Fish, salad, olive oil" },
          { meal: "Snack", suggestion: "Greek yogurt with almonds" },
        ]),
        notes: "Demo targets. Adjust based on weekly progress.",
      },
      update: {},
    });

    // welcome message from coach
    await db.message.upsert({
      where: { id: "demo-msg-1" },
      create: {
        id: "demo-msg-1",
        coachId: (await db.user.findUnique({ where: { email: coachEmail } }))!.id,
        clientId: demoUser.id,
        sender: "COACH",
        body: "Welcome to your coaching dashboard! Review your program, log your sessions, and message me anytime. Let's get to work.",
      },
      update: {},
    });
  }

  console.log("Seed complete.");
  console.log("Coach login:", coachEmail);
  console.log("Demo client login:", clientEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

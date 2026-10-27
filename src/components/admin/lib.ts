// Admin shared types and helpers (client-only).

export type AdminSection =
  | "overview"
  | "clients"
  | "workouts"
  | "nutrition"
  | "pricing"
  | "testimonials"
  | "transformations"
  | "faq"
  | "content"
  | "consultations"
  | "payments"
  | "analytics";

// ---- API payload types --------------------------------------------------

export type ClientStatus = "PENDING" | "APPROVED" | "ACTIVE" | "REJECTED" | "PAUSED";
export type PaymentStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type BookingStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED";

export interface AdminClient {
  id: string;
  name: string | null;
  email: string;
  phone?: string | null;
  createdAt: string;
  profile: {
    fullName: string;
    age?: number | null;
    heightCm?: number | null;
    weightKg?: number | null;
    goal?: string | null;
    experience?: string | null;
    equipment: string[];
    weeklyAvailability?: string | null;
    limitations?: string | null;
    city?: string | null;
    status: ClientStatus;
    preferredPkg?: { id: string; title: string } | null;
  } | null;
  activeSubscription: {
    id: string;
    status: string;
    startDate?: string | null;
    endDate?: string | null;
    package: { id: string; title: string; priceMAD: number };
  } | null;
  lastPayment: { id: string; amountMAD: number; status: PaymentStatus; createdAt: string } | null;
}

export interface AdminPackage {
  id: string;
  title: string;
  tagline: string;
  priceMAD: number;
  durationLabel: string;
  features: string[];
  supportLevel: string;
  available: boolean;
  featured: boolean;
  order: number;
}

export interface AdminTestimonial {
  id: string;
  clientName: string;
  clientCity?: string | null;
  avatar?: string | null;
  rating: number;
  quote: string;
  goal?: string | null;
  duration?: string | null;
  published: boolean;
  consent: boolean;
  order: number;
}

export interface AdminTransformation {
  id: string;
  clientName: string;
  beforeImg?: string | null;
  afterImg?: string | null;
  goal?: string | null;
  duration?: string | null;
  story?: string | null;
  published: boolean;
  consent: boolean;
  order: number;
}

export interface AdminFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  published: boolean;
  order: number;
}

export interface AdminWorkoutPlan {
  id: string;
  userId: string | null;
  title: string;
  goal?: string | null;
  summary?: string | null;
  active: boolean;
  days: WorkoutDay[];
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string | null; email: string } | null;
}

export interface WorkoutExercise {
  name: string;
  sets?: string;
  reps?: string;
  rest?: string;
}
export interface WorkoutDay {
  name: string;
  focus?: string;
  exercises: WorkoutExercise[];
}

export interface AdminNutritionPlan {
  id: string;
  userId: string | null;
  title: string;
  dailyCalories?: number | null;
  proteinG?: number | null;
  carbsG?: number | null;
  fatsG?: number | null;
  waterCupsGoal: number;
  meals: { name: string; suggestion?: string }[];
  notes?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string | null; email: string } | null;
}

export interface AdminExerciseLib {
  id: string;
  name: string;
  muscleGroup?: string | null;
  equipment?: string | null;
  defaultSets?: number | null;
  defaultReps?: string | null;
  defaultRest?: string | null;
}

export interface AdminSiteContent {
  id: string;
  brandName: string;
  coachName: string;
  coachCity: string;
  whatsappNumber: string;
  whatsappEnabled: boolean;
  heroImage: string;
  coachPortrait: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutStory: string;
  aboutPhilosophy: string;
  bankName?: string | null;
  bankAccountName?: string | null;
  bankIban?: string | null;
  bankRIB?: string | null;
  paymentInstructions: string;
  heroStatClients: number;
  heroStatPrograms: number;
  heroStatYears: number;
  heroStatSuccess: number;
  statsVerified: boolean;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
  facebookUrl?: string | null;
}

export interface AdminConsultationSlot {
  id: string;
  start: string;
  end: string;
  booked: boolean;
  createdAt: string;
  bookings: {
    id: string;
    goals: string;
    status: BookingStatus;
    meetingLink?: string | null;
    coachNote?: string | null;
    createdAt: string;
    user: { id: string; name: string | null; email: string };
  }[];
}

export interface AdminPayment {
  id: string;
  invoiceNo: string | null;
  userId: string;
  packageTitle: string;
  amountMAD: number;
  method: string;
  proofUrl: string | null;
  status: PaymentStatus;
  coachNote?: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string; phone: string | null };
  subscription: {
    id: string;
    status: string;
    package: { id: string; title: string; priceMAD: number };
  } | null;
}

export interface AdminBooking {
  id: string;
  userId: string;
  slotId: string;
  goals: string;
  status: BookingStatus;
  meetingLink?: string | null;
  coachNote?: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string; phone: string | null };
  slot: { id: string; start: string; end: string; booked: boolean };
}

export interface AdminAnalytics {
  totalClients: number;
  activeClients: number;
  pendingProfiles: number;
  monthlyRevenue: number;
  totalRevenue: number;
  newApplications: number;
  packageDistribution: { name: string; value: number }[];
  monthlyTrend: { name: string; applications: number; revenue: number }[];
  renewals: number;
  totalPayments: number;
  pendingPayments: number;
}

// ---- Helpers ------------------------------------------------------------

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {
      /* noop */
    }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) {
    let msg = "Upload failed";
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {
      /* noop */
    }
    throw new Error(msg);
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export function statusColor(status: string): string {
  switch (status) {
    case "ACTIVE":
    case "VERIFIED":
    case "APPROVED":
    case "COMPLETED":
      return "bg-primary/15 text-primary border-primary/30";
    case "PENDING":
    case "REQUESTED":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "REJECTED":
    case "CANCELLED":
    case "EXPIRED":
      return "bg-destructive/15 text-red-300 border-destructive/30";
    case "PAUSED":
      return "bg-secondary text-secondary-foreground border-border";
    default:
      return "bg-secondary text-muted-foreground border-border";
  }
}

export function formatDate(iso: string | null | undefined, locale: "en" | "fr" | "ar" = "en"): string {
  if (!iso) return "—";
  try {
    const tag = locale === "fr" ? "fr-MA" : locale === "ar" ? "ar-MA" : "en-MA";
    return new Intl.DateTimeFormat(tag, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return new Date(iso ?? Date.now()).toLocaleString();
  }
}

export function formatDateTimeInput(d: Date): string {
  // YYYY-MM-DDTHH:mm in local time, suitable for <input type="datetime-local">
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatMADLocale(amount: number, locale: "en" | "fr" | "ar" = "en"): string {
  const tag = locale === "fr" ? "fr-MA" : locale === "ar" ? "ar-MA" : "en-MA";
  try {
    return new Intl.NumberFormat(tag, {
      style: "currency",
      currency: "MAD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} MAD`;
  }
}

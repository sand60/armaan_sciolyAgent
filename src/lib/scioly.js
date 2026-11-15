export const PLANS = [
  {
    id: "single",
    name: "Single Team",
    price: 79,
    tagline: "One Division B or C team",
    features: ["23 event workspaces", "Unlimited students & mentors", "Socratic AI event coach", "Practice quizzes & mock exams", "Tournament day command center"],
    paymentLink: "",
  },
  {
    id: "varsity",
    name: "Varsity + JV",
    price: 129,
    tagline: "Two squads, one coaching staff",
    features: ["Everything in Single Team", "Two rosters with shared event bank", "Mentor verification queues", "Bulk test repository uploads", "Weekly email + WhatsApp automations"],
    paymentLink: "",
    featured: true,
  },
  {
    id: "district",
    name: "District Bundle",
    price: 249,
    tagline: "Every school in your district",
    features: ["Everything in Varsity + JV", "Up to 5 school workspaces", "District-wide readiness reporting", "Priority AI coaching credits", "Onboarding for new coaches"],
    paymentLink: "",
  },
];

export const ROLE_LABELS = {
  "Head Coach": "Head Coach",
  "Event Mentor": "Event Mentor",
  Student: "Student",
};

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" }).format(date);
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  }).format(date);
}

export function relativeDays(value) {
  if (!value) return null;
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86400000);
}

export function daysUntil(value) {
  if (!value) return null;
  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return null;
  return Math.ceil((target - Date.now()) / 86400000);
}

// Readiness signal for the 23-event matrix.
export function readinessOf({ xp = 0, lastActivity, requiresImpound, impoundVerified } = {}) {
  const days = relativeDays(lastActivity);
  if (days === null || days > 21) return { tone: "red", label: "Inactive" };
  if (requiresImpound && !impoundVerified && days > 7) return { tone: "yellow", label: "Needs attention" };
  if (days <= 7 && xp >= 120) return { tone: "green", label: "On track" };
  return { tone: "yellow", label: "Needs attention" };
}

export const READINESS_CLASS = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-rose-500",
};

export const READINESS_TEXT = {
  green: "text-emerald-700 bg-emerald-50 border-emerald-200",
  yellow: "text-amber-700 bg-amber-50 border-amber-200",
  red: "text-rose-700 bg-rose-50 border-rose-200",
};

export function slotsOf(partnership) {
  return [1, 2, 3]
    .map((slot) => ({
      slot,
      name: partnership?.[`student_${slot}_name`] || "",
      email: partnership?.[`student_${slot}_email`] || "",
    }))
    .filter((entry) => entry.name || entry.email);
}

export function emailsOf(partnership) {
  return [1, 2, 3]
    .map((slot) => partnership?.[`student_${slot}_email`])
    .filter(Boolean)
    .map((email) => email.toLowerCase());
}

export const CATEGORY_CLASS = {
  Study: "bg-sky-50 text-sky-700 border-sky-200",
  Build: "bg-orange-50 text-orange-700 border-orange-200",
  Lab: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Hybrid: "bg-violet-50 text-violet-700 border-violet-200",
};

export const AUTOMATIONS = [
  {
    id: "monday-blast",
    title: "Monday weekly practice & quiz blast",
    schedule: "Mondays · 7:30 AM",
    description: "Writes a fresh weekly goal for all 23 events and sends every partner and mentor the practice-quiz plan.",
  },
  {
    id: "thursday-nudge",
    title: "Thursday partner accountability nudge",
    schedule: "Thursdays · 4:00 PM",
    description: "Finds partnerships with no practice or build log in the past 6 days and sends a friendly reminder.",
  },
  {
    id: "friday-digest",
    title: "Friday head coach digest",
    schedule: "Fridays · 5:00 PM",
    description: "Emails a single summary sorting all 23 events into On Track, Needs Attention and Inactive.",
  },
  {
    id: "tournament-alerts",
    title: "Tournament & self-schedule alerts",
    schedule: "Feb 7 · 7:30 PM and Feb 17 impound check",
    description: "Reminds the head coach when Sylvania self-scheduling opens and which impound events are still unverified.",
  },
];
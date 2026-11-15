import { catalogForDivision } from "@/lib/event-catalog";
import { rulesFor } from "@/lib/scioly-rules";
import { STARTER_QUESTIONS } from "@/lib/starter-questions";

export const DEFAULT_COACH_EMAIL = "sukhdeol07@gmail.com";
export const SYLVANIA_TOURNAMENT = {
  tournament_name: "2027 Sylvania Southview Science Olympiad Invitational",
  tournament_date: "2027-02-20",
  division_note: "Division C ONLY — Sylvania Southview High School (OH)",
  portal_url: "https://scilympiad.com/southview",
  self_schedule_open: "2027-02-07T20:00:00",
  self_schedule_close: "2027-02-18T23:55:00",
  status: "Upcoming",
};

export function makeSchoolCode() {
  const letters = Math.random().toString(36).slice(2, 6).toUpperCase();
  const digits = String(Math.floor(Math.random() * 90) + 10);
  return `SCIO-${letters}${digits}`;
}

// Clones the 23 event workspaces for the school's division, the tournament and the starter question bank.
export async function cloneStarterWorkspace(admin, school) {
  const school_id = school.school_id;
  const catalog = catalogForDivision(school.division);
  const seededNames = new Set(catalog.map((event) => event.name));

  const events = catalog.map((event) => ({
    school_id,
    division: school.division,
    event_name: event.name,
    category: event.category,
    time_block: event.block,
    max_partners: event.partners,
    requires_impound: event.impound,
    key_topics: event.topics,
    rules_summary: rulesFor(event.name, school.division),
    event_mentor_email: "",
  }));
  await admin.entities.Event.bulkCreate(events);

  const bank = await admin.entities.TestRepository.create({
    school_id,
    event_name: "Starter bank — all 23 events",
    tournament_source: "SciOlyCoachAgent starter bank",
    season_year: "2026-2027",
    difficulty_level: "Starter",
    processing_status: "Ready",
    question_count: 0,
  });

  const questions = [];
  for (const [event_name, list] of Object.entries(STARTER_QUESTIONS)) {
    if (!seededNames.has(event_name)) continue;
    for (const item of list) {
      questions.push({
        school_id,
        test_id: bank.id,
        event_name,
        sub_topic: item.t,
        question_text: item.q,
        options: [],
        correct_answer: item.a,
        explanation: item.e,
        aligned_with_current_rules: true,
      });
    }
  }
  await admin.entities.ExtractedQuestion.bulkCreate(questions);
  await admin.entities.TestRepository.update(bank.id, { question_count: questions.length });

  await admin.entities.Tournament.create({ school_id, ...SYLVANIA_TOURNAMENT });

  return { events: events.length, questions: questions.length };
}

export async function provisionSchool(admin, input) {
  const school = await admin.entities.School.create({
    school_id: makeSchoolCode(),
    school_name: input.school_name,
    division: input.division,
    head_coach_email: input.head_coach_email.toLowerCase(),
    subscription_status: input.subscription_status || "Trial",
    plan: input.plan || "Single Team",
    stripe_customer_id: input.stripe_customer_id || "",
    team_whatsapp_group_id: "",
    whatsapp_webhook_url: "",
  });
  await cloneStarterWorkspace(admin, school);
  return school;
}

// Idempotent: creates the head coach's default workspace once, then leaves it alone.
export async function ensureDefaultSchool(admin) {
  const existing = await admin.entities.School.filter({ head_coach_email: DEFAULT_COACH_EMAIL });
  const rows = Array.isArray(existing) ? existing : existing?.items ?? [];
  if (rows.length) return { created: false, school: rows[0] };
  const school = await provisionSchool(admin, {
    school_name: "Science Olympiad Team",
    division: "Division B",
    head_coach_email: DEFAULT_COACH_EMAIL,
    subscription_status: "Active",
    plan: "Single Team",
  });
  return { created: true, school };
}
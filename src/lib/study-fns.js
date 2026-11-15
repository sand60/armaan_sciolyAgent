import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { resolveWorkspace } from "@/lib/workspace";
import { rulesFor } from "@/lib/scioly-rules";
import { catalogForDivision } from "@/lib/event-catalog";

const rows = (result) => (Array.isArray(result) ? result : result?.items ?? []);

const DIVISIONS = ["Division C", "Division B"];

// Keeps the study studio's tabs complete by adding any official event the
// workspace is still missing (e.g. a season list that changed after setup).
async function syncCatalog(admin, school, division) {
  const catalog = catalogForDivision(division);
  const existing = rows(await admin.entities.Event.filter({ school_id: school.school_id, division }));
  const have = new Set(existing.map((event) => event.event_name));
  const missing = catalog.filter((event) => !have.has(event.name));
  if (!missing.length) return;
  await Promise.all(
    missing.map((event) =>
      admin.entities.Event.create({
        school_id: school.school_id,
        division,
        event_name: event.name,
        category: event.category,
        time_block: event.block,
        max_partners: event.partners,
        requires_impound: event.impound,
        key_topics: event.topics,
        rules_summary: rulesFor(event.name, division),
        event_mentor_email: "",
      }),
    ),
  );
}

const asJson = (result) => {
  if (result && typeof result === "object") return result;
  if (typeof result === "string") return JSON.parse(result.trim().replace(/^```(?:json)?/i, "").replace(/```$/, ""));
  throw new Error("The AI returned an empty response. Please try again.");
};

async function loadEvent(admin, school, eventId) {
  const event = await admin.entities.Event.get(eventId);
  if (event.school_id !== school.school_id) throw new Error("That event is not in your workspace.");
  const division = event.division || school.division;
  let rules = event.rules_summary || "";
  if (!rules) {
    rules = rulesFor(event.event_name, division);
    if (rules) await admin.entities.Event.update(event.id, { rules_summary: rules });
  }
  return { event, division, rules };
}

async function manualUrls(admin, event) {
  if (!event.rule_manual_uri) return [];
  try {
    const signed = await admin.integrations.Core.CreateFileSignedUrl({ file_uri: event.rule_manual_uri, expires_in: 900 });
    return signed?.signed_url ? [signed.signed_url] : [];
  } catch {
    return [];
  }
}

async function ask(admin, { prompt, schema, event }) {
  const urls = await manualUrls(admin, event);
  const args = { prompt, response_json_schema: schema };
  if (urls.length) args.file_urls = urls;
  const parsed = asJson(await admin.integrations.Core.InvokeLLM(args));
  return { parsed, manualAttached: urls.length > 0 };
}

export const getStudyIndex = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const { admin, school } = await resolveWorkspace(context);
    await Promise.all(DIVISIONS.map((division) => syncCatalog(admin, school, division)));

    const [events, decks, quizzes, guides] = await Promise.all([
      admin.entities.Event.filter({ school_id: school.school_id }),
      admin.entities.FlashcardDeck.filter({ school_id: school.school_id }),
      admin.entities.QuizSet.filter({ school_id: school.school_id }),
      admin.entities.StudyGuide.filter({ school_id: school.school_id }),
    ]);

    // Backfill the rules digest for events cloned before the digest existed.
    const missing = rows(events).filter((event) => !event.rules_summary);
    if (missing.length) {
      await Promise.all(
        missing.map((event) =>
          admin.entities.Event.update(event.id, {
            rules_summary: rulesFor(event.event_name, event.division || school.division),
          }),
        ),
      );
    }

    const counts = {};
    const bump = (list, key) => {
      for (const row of rows(list)) {
        counts[row.event_name] = counts[row.event_name] || { cards: 0, quizzes: 0, guides: 0 };
        counts[row.event_name][key] += 1;
      }
    };
    bump(decks, "cards");
    bump(quizzes, "quizzes");
    bump(guides, "guides");

    const byDivision = {};
    for (const event of rows(events)) {
      const division = event.division || school.division;
      byDivision[division] = byDivision[division] || {};
      byDivision[division][event.event_name] = {
        id: event.id,
        event_name: event.event_name,
        category: event.category,
        time_block: event.time_block,
        division,
        has_manual: Boolean(event.rule_manual_uri),
        has_rules: Boolean(event.rules_summary),
        counts: counts[event.event_name] || { cards: 0, quizzes: 0, guides: 0 },
      };
    }

    const divisions = DIVISIONS.map((name) => ({
      name,
      events: catalogForDivision(name)
        .map((event) => byDivision[name]?.[event.name])
        .filter(Boolean),
    }));

    return {
      school: { school_name: school.school_name, division: school.division },
      divisions,
      defaultDivision: DIVISIONS.includes(school.division) ? school.division : "Division C",
      totals: { cards: rows(decks).length, quizzes: rows(quizzes).length, guides: rows(guides).length },
    };
  });

export const getStudyStudio = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ event_id: z.string().min(1).max(64) }))
  .handler(async ({ data, context }) => {
    const { admin, school } = await resolveWorkspace(context);
    const { event, division, rules } = await loadEvent(admin, school, data.event_id);
    const [decks, quizzes, guides] = await Promise.all([
      admin.entities.FlashcardDeck.filter({ school_id: school.school_id, event_name: event.event_name }),
      admin.entities.QuizSet.filter({ school_id: school.school_id, event_name: event.event_name }),
      admin.entities.StudyGuide.filter({ school_id: school.school_id, event_name: event.event_name }),
    ]);

    return {
      event: {
        id: event.id,
        event_name: event.event_name,
        category: event.category,
        division,
        time_block: event.time_block,
        key_topics: event.key_topics || "",
        requires_impound: event.requires_impound,
        rules_summary: rules,
        has_manual: Boolean(event.rule_manual_uri),
      },
      decks: rows(decks),
      quizzes: rows(quizzes),
      guides: rows(guides),
    };
  });

async function buildFlashcards(admin, school, user, { event, division, rules, count = 12 }) {
  const { FLASHCARD_SCHEMA, flashcardPrompt } = await import("@/lib/study-prompts.server");
  const { parsed, manualAttached } = await ask(admin, {
    event,
    schema: FLASHCARD_SCHEMA,
    prompt: flashcardPrompt({ event, division, rules, manualAttached: Boolean(event.rule_manual_uri), count }),
  });

  const cards = (parsed.cards || [])
    .filter((card) => card?.front && card?.back)
    .slice(0, count)
    .map((card) => ({ front: String(card.front).slice(0, 300), back: String(card.back).slice(0, 600) }));
  if (!cards.length) throw new Error("The AI did not return any cards. Please try again.");

  return admin.entities.FlashcardDeck.create({
    school_id: school.school_id,
    event_name: event.event_name,
    division,
    title: String(parsed.title || `${event.event_name} flashcards`).slice(0, 120),
    source: manualAttached ? "Rule manual" : "Rules digest",
    card_count: cards.length,
    cards,
    generated_by: user.email || "",
  });
}

async function buildQuiz(admin, school, user, { event, division, rules, count = 10, difficulty = "Practice" }) {
  const { quizSetPrompt } = await import("@/lib/study-prompts.server");
  const { QUIZ_SCHEMA } = await import("@/lib/scioly-prompts.server");
  const { parsed, manualAttached } = await ask(admin, {
    event,
    schema: QUIZ_SCHEMA,
    prompt: quizSetPrompt({ event, division, rules, manualAttached: Boolean(event.rule_manual_uri), count, difficulty }),
  });

  const questions = (parsed.questions || [])
    .filter((q) => q?.question_text && q?.correct_answer)
    .slice(0, count)
    .map((q) => ({
      sub_topic: String(q.sub_topic || event.event_name).slice(0, 160),
      question_text: String(q.question_text).slice(0, 1200),
      options: Array.isArray(q.options) ? q.options.slice(0, 6).map(String) : [],
      correct_answer: String(q.correct_answer).slice(0, 600),
      explanation: String(q.explanation || "").slice(0, 1600),
    }));
  if (!questions.length) throw new Error("The AI did not return any questions. Please try again.");

  return admin.entities.QuizSet.create({
    school_id: school.school_id,
    event_name: event.event_name,
    division,
    title: `${event.event_name} quiz — ${difficulty}`,
    source: manualAttached ? "Rule manual" : "Rules digest",
    difficulty,
    question_count: questions.length,
    questions,
    generated_by: user.email || "",
  });
}

async function buildGuide(admin, school, user, { event, division, rules }) {
  const { GUIDE_SCHEMA, guidePrompt } = await import("@/lib/study-prompts.server");
  const { parsed, manualAttached } = await ask(admin, {
    event,
    schema: GUIDE_SCHEMA,
    prompt: guidePrompt({ event, division, rules, manualAttached: Boolean(event.rule_manual_uri) }),
  });

  const sections = (parsed.sections || [])
    .filter((section) => section?.heading && section?.body)
    .slice(0, 10)
    .map((section) => ({ heading: String(section.heading).slice(0, 160), body: String(section.body).slice(0, 2400) }));
  if (!sections.length) throw new Error("The AI did not return a study guide. Please try again.");

  return admin.entities.StudyGuide.create({
    school_id: school.school_id,
    event_name: event.event_name,
    division,
    title: String(parsed.title || `${event.event_name} study guide`).slice(0, 120),
    source: manualAttached ? "Rule manual" : "Rules digest",
    sections,
    generated_by: user.email || "",
  });
}

export const generateFlashcards = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ event_id: z.string().min(1).max(64), count: z.number().int().min(5).max(20).default(12) }))
  .handler(async ({ data, context }) => {
    const { admin, school, user } = await resolveWorkspace(context);
    const { event, division, rules } = await loadEvent(admin, school, data.event_id);
    return buildFlashcards(admin, school, user, { event, division, rules, count: data.count });
  });

export const generateQuizSet = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      event_id: z.string().min(1).max(64),
      count: z.number().int().min(5).max(20).default(10),
      difficulty: z.enum(["Practice", "Regional", "State"]).default("Practice"),
    }),
  )
  .handler(async ({ data, context }) => {
    const { admin, school, user } = await resolveWorkspace(context);
    const { event, division, rules } = await loadEvent(admin, school, data.event_id);
    return buildQuiz(admin, school, user, { event, division, rules, count: data.count, difficulty: data.difficulty });
  });

export const generateStudyGuide = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ event_id: z.string().min(1).max(64) }))
  .handler(async ({ data, context }) => {
    const { admin, school, user } = await resolveWorkspace(context);
    const { event, division, rules } = await loadEvent(admin, school, data.event_id);
    return buildGuide(admin, school, user, { event, division, rules });
  });

// One event per call, so the browser can build a whole division without a
// single request timing out.
export const generateEventPack = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      event_id: z.string().min(1).max(64),
      kinds: z.array(z.enum(["flashcards", "quiz", "guide"])).min(1).max(3),
    }),
  )
  .handler(async ({ data, context }) => {
    const { admin, school, user } = await resolveWorkspace(context);
    const { event, division, rules } = await loadEvent(admin, school, data.event_id);

    const made = { event_name: event.event_name };
    if (data.kinds.includes("flashcards")) {
      made.cards = (await buildFlashcards(admin, school, user, { event, division, rules })).card_count;
    }
    if (data.kinds.includes("quiz")) {
      made.questions = (await buildQuiz(admin, school, user, { event, division, rules })).question_count;
    }
    if (data.kinds.includes("guide")) {
      made.sections = (await buildGuide(admin, school, user, { event, division, rules })).sections.length;
    }
    return made;
  });

export const deleteStudyMaterial = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ kind: z.enum(["flashcards", "quiz", "guide"]), id: z.string().min(1).max(64) }))
  .handler(async ({ data, context }) => {
    const { admin, school } = await resolveWorkspace(context);
    const entity = { flashcards: admin.entities.FlashcardDeck, quiz: admin.entities.QuizSet, guide: admin.entities.StudyGuide }[data.kind];
    const record = await entity.get(data.id);
    if (record.school_id !== school.school_id) throw new Error("That material is not in your workspace.");
    await entity.delete(data.id);
    return { ok: true };
  });
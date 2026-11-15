import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { resolveWorkspace } from "@/lib/workspace";
import { emailsOf } from "@/lib/scioly";

const rows = (result) => (Array.isArray(result) ? result : result?.items ?? []);
const lower = (value) => String(value || "").toLowerCase();

const asJson = (result) => {
  if (result && typeof result === "object") return result;
  if (typeof result === "string") return JSON.parse(result.trim().replace(/^```(?:json)?/i, "").replace(/```$/, ""));
  throw new Error("The AI returned an empty response. Please try again.");
};

function shuffle(list) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

async function eventFor(admin, schoolId, eventId) {
  const event = await admin.entities.Event.get(eventId);
  if (event.school_id !== schoolId) throw new Error("That event is not in your workspace.");
  return event;
}

export const buildQuiz = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      event_id: z.string().min(1).max(64),
      mode: z.enum(["practice", "mock"]),
    }),
  )
  .handler(async ({ data, context }) => {
    const { admin, school } = await resolveWorkspace(context);
    const { quizPrompt, QUIZ_SCHEMA } = await import("@/lib/scioly-prompts.server");
    const event = await eventFor(admin, school.school_id, data.event_id);
    const count = data.mode === "mock" ? 25 : 10;

    const pool = rows(await admin.entities.ExtractedQuestion.filter({ school_id: school.school_id, event_name: event.event_name }));
    const usable = shuffle(pool.filter((question) => question.question_text && question.correct_answer));
    const picked = usable.slice(0, count).map((question) => ({
      sub_topic: question.sub_topic || event.event_name,
      question_text: question.question_text,
      options: Array.isArray(question.options) ? question.options : [],
      correct_answer: question.correct_answer,
      explanation: question.explanation || "",
      source: "bank",
    }));

    let generated = [];
    if (picked.length < count) {
      const prompt = quizPrompt({
        event,
        division: event.division || school.division,
        count: count - picked.length,
        mode: data.mode,
        avoid: picked.map((question) => question.question_text).slice(0, 25),
      });
      const result = await admin.integrations.Core.InvokeLLM({ prompt, response_json_schema: QUIZ_SCHEMA });
      const parsed = asJson(result);
      generated = (parsed.questions || [])
        .filter((question) => question?.question_text && question?.correct_answer)
        .map((question) => ({
          sub_topic: String(question.sub_topic || event.event_name).slice(0, 160),
          question_text: String(question.question_text).slice(0, 1200),
          options: Array.isArray(question.options) ? question.options.slice(0, 6).map(String) : [],
          correct_answer: String(question.correct_answer).slice(0, 600),
          explanation: String(question.explanation || "").slice(0, 1600),
          source: "ai",
        }));
    }

    const questions = shuffle([...picked, ...generated]).slice(0, count).map((question, index) => ({ ...question, id: `q${index + 1}` }));
    return { event: { id: event.id, event_name: event.event_name, category: event.category, division: event.division || school.division }, mode: data.mode, questions };
  });

export const askCoach = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      event_id: z.string().min(1).max(64),
      question: z.string().min(1).max(2000),
      history: z
        .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
        .max(16),
    }),
  )
  .handler(async ({ data, context }) => {
    const { admin, school } = await resolveWorkspace(context);
    const { coachPrompt, COACH_SCHEMA } = await import("@/lib/scioly-prompts.server");
    const event = await eventFor(admin, school.school_id, data.event_id);

    const fileUrls = [];
    if (event.rule_manual_uri) {
      try {
        const signed = await admin.integrations.Core.CreateFileSignedUrl({ file_uri: event.rule_manual_uri, expires_in: 900 });
        if (signed?.signed_url) fileUrls.push(signed.signed_url);
      } catch {
        // A missing manual should not block coaching.
      }
    }

    const prompt = coachPrompt({
      event,
      division: event.division || school.division,
      history: data.history.slice(-8),
      question: data.question,
      manualAttached: fileUrls.length > 0,
    });
    const args = { prompt, response_json_schema: COACH_SCHEMA };
    if (fileUrls.length) args.file_urls = fileUrls;
    const parsed = asJson(await admin.integrations.Core.InvokeLLM(args));

    return {
      answer: String(parsed.answer || "Let's slow down and reason through it together. What does the rule say first?"),
      next_question: String(parsed.next_question || "What is the first step you would try?"),
    };
  });

export const submitBuildLog = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      event_name: z.string().min(1).max(120),
      activity_type: z.enum(["Build Test", "Lab Drill"]),
      device_dimensions_mass: z.string().max(400).optional(),
      test_result: z.string().max(800).optional(),
      photo_uri: z.string().max(2000).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { admin, school, user } = await resolveWorkspace(context);
    const { ruleCheckPrompt, RULE_CHECK_SCHEMA } = await import("@/lib/scioly-prompts.server");
    const eventRows = rows(await admin.entities.Event.filter({ school_id: school.school_id, event_name: data.event_name }));
    const event = eventRows[0];

    let verdict = "Review";
    let note = "";
    if (event) {
      try {
        const parsed = asJson(
          await admin.integrations.Core.InvokeLLM({
            prompt: ruleCheckPrompt({ event, dimensions: data.device_dimensions_mass || "", result: data.test_result || "" }),
            response_json_schema: RULE_CHECK_SCHEMA,
          }),
        );
        if (["Pass", "Review", "Fail"].includes(parsed.verdict)) verdict = parsed.verdict;
        note = String(parsed.note || "").slice(0, 400);
      } catch {
        verdict = "Review";
        note = "AI rule check unavailable — mentor review required.";
      }
    }

    const email = lower(user.email);
    const log = await admin.entities.PracticeLog.create({
      school_id: school.school_id,
      event_name: data.event_name,
      student_email: email,
      student_name: user.full_name || email,
      activity_type: data.activity_type,
      device_dimensions_mass: data.device_dimensions_mass || "",
      test_result: data.test_result || "",
      photo_uri: data.photo_uri || "",
      ai_rule_check: verdict,
      ai_rule_note: note,
      mentor_verified: false,
    });

    const partnerships = rows(await admin.entities.Partnership.filter({ school_id: school.school_id, event_name: data.event_name })).filter((partnership) =>
      emailsOf(partnership).includes(email),
    );
    if (partnerships.length) {
      await admin.entities.Partnership.update(partnerships[0].id, {
        readiness_xp: (partnerships[0].readiness_xp || 0) + 25,
        last_activity_date: new Date().toISOString(),
      });
    }

    return { log, verdict, note };
  });

export const extractTestQuestions = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ test_id: z.string().min(1).max(64) }))
  .handler(async ({ data, context }) => {
    const { admin, school } = await resolveWorkspace(context);
    const { EXTRACT_SCHEMA, EXPLANATION_SCHEMA, explanationPrompt } = await import("@/lib/scioly-prompts.server");
    const test = await admin.entities.TestRepository.get(data.test_id);
    if (test.school_id !== school.school_id) throw new Error("Not your test file.");
    if (!test.test_pdf) throw new Error("Attach the test PDF first.");

    await admin.entities.TestRepository.update(test.id, { processing_status: "Processing" });

    try {
      const signed = await admin.integrations.Core.CreateFileSignedUrl({ file_uri: test.test_pdf, expires_in: 900 });
      const extraction = await admin.integrations.Core.ExtractDataFromUploadedFile({
        file_url: signed.signed_url,
        json_schema: EXTRACT_SCHEMA,
      });
      if (extraction?.status !== "success") throw new Error(extraction?.details || "Could not read that PDF.");

      const output = extraction.output || {};
      const raw = Array.isArray(output) ? output : output.questions || [];
      const cleaned = raw
        .filter((question) => question?.question_text && question?.correct_answer)
        .slice(0, 60)
        .map((question) => ({
          sub_topic: String(question.sub_topic || test.event_name).slice(0, 160),
          question_text: String(question.question_text).slice(0, 1500),
          options: Array.isArray(question.options) ? question.options.slice(0, 6).map(String) : [],
          correct_answer: String(question.correct_answer).slice(0, 600),
        }));

      if (!cleaned.length) throw new Error("No questions were found in that PDF.");

      let explanations = [];
      try {
        const parsed = asJson(
          await admin.integrations.Core.InvokeLLM({
            prompt: explanationPrompt({ eventName: test.event_name, questions: cleaned.slice(0, 40) }),
            response_json_schema: EXPLANATION_SCHEMA,
          }),
        );
        explanations = parsed.explanations || [];
      } catch {
        explanations = [];
      }

      const records = cleaned.map((question, index) => ({
        school_id: school.school_id,
        test_id: test.id,
        event_name: test.event_name,
        sub_topic: question.sub_topic,
        question_text: question.question_text,
        options: question.options,
        correct_answer: question.correct_answer,
        explanation: String(explanations[index]?.explanation || "").slice(0, 1200),
        aligned_with_current_rules: explanations[index]?.aligned !== false,
      }));

      await admin.entities.ExtractedQuestion.bulkCreate(records);
      await admin.entities.TestRepository.update(test.id, {
        processing_status: "Ready",
        question_count: records.length,
        processing_note: `${records.length} questions extracted`,
      });

      return { count: records.length, outdated: records.filter((record) => !record.aligned_with_current_rules).length };
    } catch (error) {
      await admin.entities.TestRepository.update(test.id, {
        processing_status: "Failed",
        processing_note: String(error?.message || error).slice(0, 300),
      });
      throw error;
    }
  });
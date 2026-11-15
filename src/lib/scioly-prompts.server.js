import { CATEGORY_HINTS } from "@/lib/event-catalog";

export const GOALS_SCHEMA = {
  type: "object",
  properties: {
    goals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          event_name: { type: "string" },
          goal: { type: "string" },
        },
        required: ["event_name", "goal"],
      },
    },
  },
  required: ["goals"],
};

export const QUIZ_SCHEMA = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sub_topic: { type: "string" },
          question_text: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          correct_answer: { type: "string" },
          explanation: { type: "string" },
        },
        required: ["question_text", "correct_answer", "explanation"],
      },
    },
  },
  required: ["questions"],
};

export const COACH_SCHEMA = {
  type: "object",
  properties: {
    answer: { type: "string" },
    next_question: { type: "string" },
  },
  required: ["answer", "next_question"],
};

export const RULE_CHECK_SCHEMA = {
  type: "object",
  properties: {
    verdict: { type: "string" },
    note: { type: "string" },
  },
  required: ["verdict", "note"],
};

export const EXTRACT_SCHEMA = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sub_topic: { type: "string" },
          question_text: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          correct_answer: { type: "string" },
        },
        required: ["question_text", "correct_answer"],
      },
    },
  },
  required: ["questions"],
};

export function goalsPrompt(events) {
  return `You are a Science Olympiad head coach planning one week of practice for a middle school Division B team.
For each event below, write ONE specific, measurable practice goal for the coming week (max 140 characters).
Build events: goal must reference a test, dimension, mass or construction milestone.
Lab events: goal must reference a drill, procedure or data table.
Study events: goal must reference binder sections, flashcard runs or timed recall.

Events:
${events.map((event) => `- ${event.event_name} (${event.category}) — key topics: ${event.key_topics || "per the rules"}`).join("\n")}

Return every event listed, using the exact event names.`;
}

export function quizPrompt({ event, division, count, avoid, mode }) {
  const category = CATEGORY_HINTS[event.category] || "";
  return `Write ${count} Science Olympiad practice questions for the event "${event.event_name}" (${division}).
Category: ${event.category}. ${category}
Key topics: ${event.key_topics || "use the current official rules"}.
Difficulty: ${mode === "mock" ? "tournament level, mixed easy to hard" : "weekly practice, mid difficulty"}.

Rules:
- Every question must be answerable from the current Science Olympiad rules for this event.
- Give 4 answer options for recall questions, or an empty options array for a short-answer question that is answered in one or two words.
- "correct_answer" must exactly match one of the options when options are present.
- "explanation" teaches the reasoning in one or two sentences.
- Do not repeat any of these questions: ${avoid.length ? avoid.join(" | ") : "none"}.`;
}

export function coachPrompt({ event, division, history, question, manualAttached }) {
  const category = CATEGORY_HINTS[event.category] || "";
  return `You are a Socratic Science Olympiad event coach for a ${division} student working on "${event.event_name}".
Category: ${event.category}. Coaching focus: ${category}
Key topics: ${event.key_topics || "current official rules"}.
${manualAttached ? "The official rule manual is attached — cite section names when you reference a rule." : ""}

Hard rules:
1. Never state the direct answer first. Ask a guiding question, then build on the student's reasoning.
2. If the student asks for an answer outright, reply with the next step of thinking plus one concrete hint.
3. Build events: enforce safety (goggles, blade and propeller guards), measured dimensions and mass limits, and the impound checklist.
4. Lab events: push a claim-evidence-reasoning answer and correct variables or controls the student misuses.
5. Study events: coach binder organization, tabbing, and timed recall habits.
6. Keep answers under 130 words, plain text, and end with exactly one next question for the student.

Conversation so far:
${history.length ? history.map((item) => `${item.role === "user" ? "Student" : "Coach"}: ${item.content}`).join("\n") : "This is the first message."}

Student: ${question}

Return "answer" (your coaching response) and "next_question" (the single question you want answered next).`;
}

export function ruleCheckPrompt({ event, dimensions, result }) {
  return `You are a Science Olympiad rules official checking a build or lab submission for "${event.event_name}".
Category: ${event.category}. Key topics and limits: ${event.key_topics || "current official rules"}.
Device dimensions and mass reported: ${dimensions || "not reported"}.
Test result reported: ${result || "not reported"}.

Judge whether the submission as described raises a rules or safety problem for this event.
Answer "verdict" as exactly one of: Pass, Review, Fail.
- Pass: nothing in the description violates typical safety or dimension rules.
- Review: missing measurements or details the mentor must check by hand.
- Fail: described dimensions, mass or procedure breaks a clear safety or construction rule.
"note" is one short sentence telling the mentor what to verify.`;
}

export function extractPrompt(eventName) {
  return `Extract every question from this Science Olympiad ${eventName} test PDF.
For each question keep the sub-topic, the full question text, the answer choices if the question is multiple choice, and the correct answer.
Skip diagrams you cannot transcribe, but keep the question text.`;
}

export function explanationPrompt({ eventName, questions }) {
  return `You are a Science Olympiad coach building an answer key for "${eventName}".
For each question below, write a one or two sentence explanation of why the given answer is correct, and decide whether the question is still consistent with current Science Olympiad rules for this event (flag outdated rules).

Questions:
${questions.map((item, index) => `${index + 1}. ${item.question_text} => ${item.correct_answer}`).join("\n")}

Return an explanations array in the same order, each with "explanation" and "aligned" (true or false).`;
}

export const EXPLANATION_SCHEMA = {
  type: "object",
  properties: {
    explanations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          explanation: { type: "string" },
          aligned: { type: "boolean" },
        },
        required: ["explanation", "aligned"],
      },
    },
  },
  required: ["explanations"],
};
export const FLASHCARD_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    cards: {
      type: "array",
      items: {
        type: "object",
        properties: { front: { type: "string" }, back: { type: "string" } },
        required: ["front", "back"],
      },
    },
  },
  required: ["cards"],
};

export const GUIDE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: { heading: { type: "string" }, body: { type: "string" } },
        required: ["heading", "body"],
      },
    },
  },
  required: ["sections"],
};

const base = ({ event, division, rules, manualAttached }) => `Event: ${event.event_name} (${division})
Category: ${event.category}
Key topics: ${event.key_topics || "per the current official rules"}
Official rules digest for this event:
${rules || "Use the current Science Olympiad rules for this event."}
${manualAttached ? "The official rule manual PDF for this event is attached — follow it exactly and cite section names when a rule matters." : "No rule manual PDF is attached; stay strictly inside the rules digest and the key topics above and never invent a numeric limit."}`;

export function flashcardPrompt({ event, division, rules, manualAttached, count }) {
  return `You are a Science Olympiad coach building a flashcard deck that a student can drill before practice.

${base({ event, division, rules, manualAttached })}

Produce ${count} flashcards covering this event's rules, vocabulary, formulas, safety requirements and high-yield facts.
- "front": one short prompt, term or question (max 120 characters).
- "back": the answer a student must recall (max 240 characters), with units or the rule limit when relevant.
- Cover the whole event: at least 3 cards on the rules and scoring, and the rest on the key topics.
- No duplicate fronts, no trivia that the rules do not support.

Return "title" (a short deck name) and "cards".`;
}

export function quizSetPrompt({ event, division, rules, manualAttached, count, difficulty }) {
  return `You are a Science Olympiad coach writing a quiz set that follows the official rules of the event.

${base({ event, division, rules, manualAttached })}

Write ${count} questions at "${difficulty}" difficulty.
- Mix recall, rules-comprehension, calculation and applied/scenario questions.
- Give 4 answer options for recall or calculation questions; use an empty options array only for short-answer questions answered in one or two words.
- "correct_answer" must exactly match one of the options when options are present.
- "explanation" teaches why the answer is right in one or two sentences.
- No duplicates, and no question that the rules digest cannot support.`;
}

export function guidePrompt({ event, division, rules, manualAttached }) {
  return `You are a Science Olympiad coach writing a study guide a student can read start to finish.

${base({ event, division, rules, manualAttached })}

Write 5 to 7 sections, in this order:
1. How the event runs (format, time, number of students, what is allowed on the table)
2. What the rules reward and what loses points
3. Core content the student must own, taught clearly
4. Formulas, units and calculations to memorize
5. Safety, construction or lab-technique requirements (skip if not applicable)
6. A 4-step practice plan for the next two weeks
7. A short self-check list of questions the student should be able to answer

Each "body" is 90 to 160 words of plain teaching prose — specific, no filler, no markdown headings inside the body.
Return "title" and "sections".`;
}
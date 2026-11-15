import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, Timer, XCircle } from "lucide-react";
import { toast } from "sonner";
import { saveQuizResult } from "@/lib/workspace-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const normalize = (value) => String(value || "").trim().toLowerCase().replace(/[.,;:!?]$/, "");
const MOCK_SECONDS = 50 * 60;

export default function QuizRunner({ event, mode, questions }) {
  const save = useServerFn(saveQuizResult);
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(MOCK_SECONDS);

  const question = questions[index];
  const given = responses[index] ?? "";
  const isCorrect = question ? normalize(given) === normalize(question.correct_answer) : false;

  useEffect(() => {
    if (mode !== "mock" || result) return undefined;
    const timer = setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [mode, result]);

  useEffect(() => {
    if (mode === "mock" && secondsLeft === 0 && !result) finish(responses);
  }, [secondsLeft, mode, result]);

  async function finish(finalResponses) {
    const missed = questions
      .map((item, position) => ({ item, answer: finalResponses[position] ?? "" }))
      .filter(({ item, answer }) => normalize(answer) !== normalize(item.correct_answer))
      .map(({ item }) => ({
        question_text: item.question_text,
        sub_topic: item.sub_topic || event.event_name,
        options: item.options || [],
        correct_answer: item.correct_answer,
        explanation: item.explanation || "",
      }));
    const score = questions.length - missed.length;
    setResult({ score, total: questions.length, missed });
    setSaving(true);
    try {
      await save({
        data: {
          event_name: event.event_name,
          mode,
          score,
          total: questions.length,
          missed: missed.slice(0, 40),
        },
      });
      toast.success(`Logged ${score}/${questions.length} to your practice history`);
    } catch (error) {
      toast.error(error?.message || "Could not save this attempt");
    } finally {
      setSaving(false);
    }
  }

  function next() {
    if (index + 1 >= questions.length) {
      finish(responses);
      return;
    }
    setIndex(index + 1);
    setChecked(false);
  }

  if (result) {
    const percent = Math.round((result.score / Math.max(1, result.total)) * 100);
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{event.event_name} · {mode === "mock" ? "Mock exam" : "Practice quiz"}</p>
          <p className="mt-2 font-heading text-4xl font-extrabold tracking-tight">
            {result.score}/{result.total}
          </p>
          <p className="mt-1 text-sm font-semibold text-primary">{percent}%</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {result.missed.length ? `${result.missed.length} question${result.missed.length === 1 ? "" : "s"} saved to your Review Weak Spots deck.` : "Perfect run — nothing to review."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button variant="outline" asChild>
              <a href={`/practice/${event.id}?mode=${mode}`}>Take another quiz</a>
            </Button>
            {result.missed.length ? (
              <Button asChild>
                <a href="/review">Review weak spots</a>
              </Button>
            ) : null}
          </div>
        </div>

        {result.missed.length ? (
          <div className="space-y-2">
            {result.missed.map((item, position) => (
              <div key={`${position}-${item.question_text.slice(0, 12)}`} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                <p className="text-sm font-semibold">{item.question_text}</p>
                <p className="mt-1 text-xs font-semibold text-emerald-700">Answer: {item.correct_answer}</p>
                {item.explanation ? <p className="mt-1 text-xs text-muted-foreground">{item.explanation}</p> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (!question) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
        No questions came back for this event. Try again in a moment.
      </div>
    );
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
        <div>
          <p className="font-heading text-sm font-bold">{event.event_name}</p>
          <p className="text-[11px] text-muted-foreground">
            {mode === "mock" ? "50-minute timed mock exam" : "Weekly practice quiz · instant explanations"} · Question {index + 1} of {questions.length}
          </p>
        </div>
        {mode === "mock" ? (
          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold", secondsLeft < 300 ? "border-rose-200 bg-rose-50 text-rose-700" : "border-border bg-muted text-foreground")}>
            <Timer className="h-3.5 w-3.5" /> {minutes}:{seconds}
          </span>
        ) : null}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">{question.sub_topic || event.event_name}</p>
        <p className="mt-2 text-base font-semibold leading-relaxed">{question.question_text}</p>

        <div className="mt-4 space-y-2">
          {question.options?.length ? (
            question.options.map((option) => {
              const selected = normalize(given) === normalize(option);
              const showCorrect = checked && normalize(option) === normalize(question.correct_answer);
              const showWrong = checked && selected && !isCorrect;
              return (
                <button
                  key={option}
                  type="button"
                  disabled={checked}
                  onClick={() => setResponses((current) => ({ ...current, [index]: option }))}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                    selected ? "border-primary bg-primary/5 font-semibold" : "border-border hover:bg-muted",
                    showCorrect ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "",
                    showWrong ? "border-rose-300 bg-rose-50 text-rose-800" : "",
                  )}
                >
                  {showCorrect ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : null}
                  {showWrong ? <XCircle className="h-4 w-4 shrink-0 text-rose-600" /> : null}
                  {option}
                </button>
              );
            })
          ) : (
            <Input
              value={given}
              onChange={(event) => setResponses((current) => ({ ...current, [index]: event.target.value }))}
              disabled={checked}
              placeholder="Type your answer"
              className="max-w-md"
            />
          )}
        </div>

        {checked ? (
          <div className={cn("mt-4 rounded-xl border p-3 text-sm", isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900")}>
            <p className="font-semibold">{isCorrect ? "Correct" : `Not quite — answer: ${question.correct_answer}`}</p>
            {question.explanation ? <p className="mt-1 text-xs leading-relaxed">{question.explanation}</p> : null}
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-end gap-2">
          {mode === "practice" && !checked ? (
            <Button onClick={() => setChecked(true)} disabled={!given}>
              Check answer
            </Button>
          ) : (
            <Button onClick={next} disabled={!given}>
              {index + 1 >= questions.length ? "Finish" : "Next question"}
            </Button>
          )}
        </div>
      </div>

      {saving ? (
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving your attempt…
        </p>
      ) : null}
    </div>
  );
}
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function QuizSetPlayer({ quiz }) {
  const questions = quiz.questions || [];
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = (question, given) =>
    String(given || "").trim().toLowerCase() === String(question.correct_answer || "").trim().toLowerCase();

  const correctCount = questions.filter((question, index) => isCorrect(question, answers[index])).length;

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="space-y-4">
      {questions.map((question, index) => {
        const given = answers[index] || "";
        const options = Array.isArray(question.options) ? question.options : [];
        const right = isCorrect(question, given);
        return (
          <div key={index} className="rounded-xl border border-border bg-muted/30 p-3.5">
            <p className="text-[13px] font-semibold leading-relaxed">
              {index + 1}. {question.question_text}
            </p>
            {options.length ? (
              <div className="mt-2.5 grid gap-1.5">
                {options.map((option) => (
                  <button
                    key={option}
                    disabled={submitted}
                    onClick={() => setAnswers((current) => ({ ...current, [index]: option }))}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-[13px] transition-colors",
                      given === option ? "border-primary bg-primary/10 font-semibold text-primary" : "border-border bg-card hover:bg-muted",
                      submitted && option === question.correct_answer && "border-emerald-500 bg-emerald-50 text-emerald-800",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <Input
                className="mt-2.5 bg-card"
                placeholder="Your answer"
                value={given}
                disabled={submitted}
                onChange={(event) => setAnswers((current) => ({ ...current, [index]: event.target.value }))}
              />
            )}
            {submitted ? (
              <div className={cn("mt-2.5 rounded-lg px-3 py-2 text-[12px] leading-relaxed", right ? "bg-emerald-50 text-emerald-800" : "bg-destructive/10 text-destructive")}>
                <span className="inline-flex items-center gap-1 font-semibold">
                  {right ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                  {right ? "Correct" : `Answer: ${question.correct_answer}`}
                </span>
                {question.explanation ? <p className="mt-1">{question.explanation}</p> : null}
              </div>
            ) : null}
          </div>
        );
      })}

      <div className="flex items-center justify-between gap-3">
        {submitted ? (
          <p className="text-sm font-semibold">
            Score: {correctCount} / {questions.length}
          </p>
        ) : (
          <p className="text-[12px] text-muted-foreground">{Object.keys(answers).length} of {questions.length} answered</p>
        )}
        <Button size="sm" variant={submitted ? "outline" : "default"} onClick={submitted ? reset : () => setSubmitted(true)}>
          {submitted ? "Try again" : "Check answers"}
        </Button>
      </div>
    </div>
  );
}
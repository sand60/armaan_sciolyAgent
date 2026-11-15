import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { getPracticeData } from "@/lib/workspace-fns";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/review")({
  loader: () => getPracticeData(),
  head: () => ({ meta: [{ title: "Review weak spots — SciOlyCoachAgent" }] }),
  component: ReviewPage,
});

function ReviewPage() {
  const { logs, events } = Route.useLoaderData();
  const [revealed, setRevealed] = useState({});

  const weak = logs.flatMap((log) =>
    (log.missed_questions || []).map((question, index) => ({
      id: `${log.id}-${index}`,
      event_name: log.event_name,
      ...question,
    })),
  );
  const byEvent = weak.reduce((groups, item) => {
    groups[item.event_name] = [...(groups[item.event_name] || []), item];
    return groups;
  }, {});

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`${weak.length} saved question${weak.length === 1 ? "" : "s"}`}
        title="Review weak spots"
        description="Every question you missed in a practice quiz or mock exam lands here. Work through them before the next tournament."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/practice">Back to my practice</Link>
          </Button>
        }
      />

      {weak.length ? (
        <div className="space-y-6">
          {Object.entries(byEvent).map(([eventName, items]) => {
            const event = events.find((candidate) => candidate.event_name === eventName);
            return (
              <div key={eventName} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-sm font-bold">{eventName}</h2>
                  {event ? (
                    <Button size="sm" variant="ghost" asChild>
                      <Link to="/practice/$eventId" params={{ eventId: event.id }} search={{ mode: "practice" }}>
                        Practice again
                      </Link>
                    </Button>
                  ) : null}
                </div>
                {items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">{item.sub_topic || eventName}</p>
                    <p className="mt-1.5 text-sm font-semibold leading-relaxed">{item.question_text}</p>
                    {item.options?.length ? (
                      <ul className="mt-2 space-y-1 text-[12px] text-muted-foreground">
                        {item.options.map((option) => (
                          <li key={option}>{option}</li>
                        ))}
                      </ul>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setRevealed((current) => ({ ...current, [item.id]: !current[item.id] }))}
                      className={cn("mt-2 text-[11px] font-semibold text-primary hover:underline")}
                    >
                      {revealed[item.id] ? "Hide answer" : "Reveal answer"}
                    </button>
                    {revealed[item.id] ? (
                      <div className="mt-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-200">
                        <p className="font-semibold">Answer: {item.correct_answer}</p>
                        {item.explanation ? <p className="mt-1 leading-relaxed">{item.explanation}</p> : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No weak spots saved yet"
          description="Take a practice quiz or a mock exam. Anything you miss is saved here automatically with the correct answer and explanation."
          action={
            <Button asChild>
              <Link to="/practice">Open my events</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
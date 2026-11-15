import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Flame, Sparkles, Target } from "lucide-react";
import { getPracticeData } from "@/lib/workspace-fns";
import { emailsOf, formatDateTime } from "@/lib/scioly";
import PageHeader from "@/components/common/PageHeader";
import StatTile from "@/components/common/StatTile";
import EmptyState from "@/components/common/EmptyState";
import EventFocusCard from "@/components/practice/EventFocusCard";
import TournamentBanner from "@/components/dashboard/TournamentBanner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authed/practice/")({
  loader: () => getPracticeData(),
  head: () => ({ meta: [{ title: "My events & practice — SciOlyCoachAgent" }] }),
  component: PracticePage,
});

function PracticePage() {
  const { user, role, events, partnerships, logs, tournaments } = Route.useLoaderData();
  const email = String(user.email || "").toLowerCase();
  const mine = partnerships.filter((partnership) => emailsOf(partnership).includes(email));
  const myEvents = mine
    .map((partnership) => ({ partnership, event: events.find((event) => event.event_name === partnership.event_name) }))
    .filter((entry) => entry.event);
  const totalXp = mine.reduce((total, partnership) => total + (partnership.readiness_xp || 0), 0);
  const weakSpots = logs.flatMap((log) => log.missed_questions || []);
  const quizzes = logs.filter((log) => log.activity_type === "Quiz");
  const nextTournament = [...tournaments].sort((a, b) => new Date(a.tournament_date) - new Date(b.tournament_date))[0] || null;

  if (role === "Event Mentor") {
    return (
      <PageHeader
        title="Coach workspace"
        description="Practice workspaces belong to students. Open the coach queue to verify builds, or use the AI event coach."
        actions={
          <Button asChild>
            <Link to="/mentor">Open coach queue</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`${myEvents.length} assigned event${myEvents.length === 1 ? "" : "s"}`}
        title={`My events & practice`}
        description={`${user.full_name || email} · ${totalXp} readiness XP · ${quizzes.length} quiz${quizzes.length === 1 ? "" : "s"} logged this season.`}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/review">
              <Sparkles className="mr-1.5 h-4 w-4" /> Review weak spots ({weakSpots.length})
            </Link>
          </Button>
        }
      />

      <TournamentBanner tournament={nextTournament} />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Readiness XP" value={totalXp} hint="300 XP marks an event tournament-ready" tone="blue" icon={Flame} />
        <StatTile label="Quizzes logged" value={quizzes.length} hint="Practice and mock exams" tone="green" icon={Target} />
        <StatTile label="Weak-spot questions" value={weakSpots.length} hint="Saved from missed questions" tone="amber" icon={Sparkles} />
      </div>

      {myEvents.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {myEvents.map(({ event, partnership }) => (
            <EventFocusCard key={event.id} event={event} partnership={partnership} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="No events assigned yet"
          description="Your coach places you on events after tryouts. Once you're on a partnership your weekly goals, XP and quizzes appear here."
          action={
            <Button variant="outline" asChild>
              <Link to="/coach">Ask the AI event coach anything</Link>
            </Button>
          }
        />
      )}

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold">Recent practice</h2>
          <Button size="sm" variant="ghost" asChild>
            <Link to="/log">
              <ClipboardList className="mr-1.5 h-4 w-4" /> Log a build or lab
            </Link>
          </Button>
        </div>
        {logs.length ? (
          <div className="mt-3 divide-y divide-border/70">
            {logs.slice(0, 6).map((log) => (
              <div key={log.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div>
                  <p className="text-sm font-semibold">{log.event_name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {log.activity_type} · {formatDateTime(log.created_date)}
                  </p>
                </div>
                <p className="text-xs font-semibold text-primary">
                  {log.activity_type === "Quiz" ? `${log.quiz_score ?? 0}/${log.quiz_total ?? 0}` : log.ai_rule_check || "Logged"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
            No practice logged yet. Take a 10-question quiz or log a build test to start your XP streak.
          </p>
        )}
      </div>
    </div>
  );
}
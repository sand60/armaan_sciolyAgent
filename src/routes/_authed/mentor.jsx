import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";
import { getMentorData } from "@/lib/workspace-fns";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import VerificationCard from "@/components/mentor/VerificationCard";
import SeasonSchedule from "@/components/tournament/SeasonSchedule";
import { formatDateTime } from "@/lib/scioly";

export const Route = createFileRoute("/_authed/mentor")({
  loader: () => getMentorData(),
  head: () => ({ meta: [{ title: "Build verification queue — SciOlyCoachAgent" }] }),
  component: MentorPage,
});

function MentorPage() {
  const { role, user, events, logs, mentors, partnerships } = Route.useLoaderData();
  const myMentor = mentors.find((mentor) => String(mentor.mentor_email || "").toLowerCase() === String(user.email || "").toLowerCase());
  const ownedEvents = role === "Event Mentor" && myMentor?.assigned_event ? [myMentor.assigned_event] : null;

  const scoped = ownedEvents ? events.filter((event) => ownedEvents.includes(event.event_name)) : events;
  const eventNames = new Set(scoped.map((event) => event.event_name));

  const pending = logs
    .filter((log) => ["Build Test", "Lab Drill"].includes(log.activity_type) && !log.mentor_verified && eventNames.has(log.event_name))
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  const verified = logs
    .filter((log) => ["Build Test", "Lab Drill"].includes(log.activity_type) && log.mentor_verified && eventNames.has(log.event_name))
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={myMentor?.assigned_event ? `Coach for ${myMentor.assigned_event}` : "All events"}
        title="Build verification queue"
        description="Photo, AI rule badge and three safety checks, then approve in one tap. Approving also flips the impound checklist."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Waiting</p>
          <p className="mt-1 font-heading text-2xl font-extrabold">{pending.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Partnerships</p>
          <p className="mt-1 font-heading text-2xl font-extrabold">{partnerships.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Coach checks</p>
          <p className="mt-1 font-heading text-2xl font-extrabold">{myMentor?.background_check_status || "—"}</p>
        </div>
      </div>

      <SeasonSchedule />

      {pending.length ? (
        <div className="space-y-3">
          {pending.map((log) => (
            <VerificationCard key={log.id} log={log} event={events.find((event) => event.event_name === log.event_name)} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardCheck}
          title="Nothing waiting for verification"
          description="When a student logs a build test or lab drill with a photo, it lands here for a one-tap approval."
        />
      )}

      {verified.length ? (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <h2 className="font-heading text-sm font-bold">Recently verified</h2>
          <div className="mt-2 divide-y divide-border/70">
            {verified.map((log) => (
              <div key={log.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div>
                  <p className="text-sm font-semibold">{log.event_name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {log.student_name || log.student_email} · {formatDateTime(log.created_date)}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300">Verified</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
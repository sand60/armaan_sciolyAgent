import { AlertTriangle, Users } from "lucide-react";
import { emailsOf, formatDate, readinessOf, READINESS_CLASS, READINESS_TEXT, slotsOf } from "@/lib/scioly";
import { cn } from "@/lib/utils";

export default function ReadinessMatrix({ events, partnerships }) {
  const rows = events
    .map((event) => {
      const parts = partnerships.filter((partnership) => partnership.event_name === event.event_name);
      const students = parts.flatMap((partnership) => slotsOf(partnership));
      const dates = parts.map((partnership) => partnership.last_activity_date).filter(Boolean).sort();
      const lastActivity = dates.length ? dates[dates.length - 1] : null;
      const impoundVerified = parts.length > 0 && parts.every((partnership) => partnership.impound_checklist_verified);
      const readiness = parts.length
        ? readinessOf({
            xp: Math.max(...parts.map((partnership) => partnership.readiness_xp || 0)),
            lastActivity,
            requiresImpound: event.requires_impound,
            impoundVerified,
          })
        : { tone: "red", label: "No partners yet" };

      const conflicts = [];
      for (const student of students) {
        const others = partnerships.filter(
          (partnership) =>
            partnership.event_name !== event.event_name && emailsOf(partnership).includes(String(student.email || "").toLowerCase()),
        );
        for (const other of others) {
          const otherEvent = events.find((candidate) => candidate.event_name === other.event_name);
          if (otherEvent && otherEvent.time_block === event.time_block && event.time_block !== "Self-Scheduled") {
            conflicts.push(`${student.name} is also in ${other.event_name} (${event.time_block})`);
          }
        }
      }

      return { event, parts, students, lastActivity, readiness, conflicts };
    })
    .sort((a, b) => String(a.event.time_block).localeCompare(String(b.event.time_block)) || a.event.event_name.localeCompare(b.event.event_name));

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="font-heading text-sm font-bold">23-event readiness matrix</h2>
          <p className="text-[11px] text-muted-foreground">Partner assignment, time-block conflicts and the last logged practice for every event.</p>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">{events.length} events</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted/50 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-semibold">Event</th>
              <th className="px-4 py-2 font-semibold">Block</th>
              <th className="px-4 py-2 font-semibold">Partners</th>
              <th className="px-4 py-2 font-semibold">Last activity</th>
              <th className="px-4 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ event, students, lastActivity, readiness, conflicts }) => (
              <tr key={event.id} className="border-t border-border/70 align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold">{event.event_name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {event.category}
                    {event.requires_impound ? " · impound" : ""}
                    {event.event_mentor_email ? ` · ${event.event_mentor_email}` : ""}
                  </p>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{event.time_block}</td>
                <td className="px-4 py-3">
                  {students.length ? (
                    <div className="space-y-1">
                      {students.map((student) => (
                        <p key={`${event.id}-${student.email || student.name}`} className="text-xs">
                          {student.name || student.email}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> unassigned
                    </span>
                  )}
                  {conflicts.map((conflict) => (
                    <p key={conflict} className="mt-1 inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                      <AlertTriangle className="h-3 w-3" /> {conflict}
                    </p>
                  ))}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{lastActivity ? formatDate(lastActivity) : "—"}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold", READINESS_TEXT[readiness.tone])}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", READINESS_CLASS[readiness.tone])} />
                    {readiness.label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
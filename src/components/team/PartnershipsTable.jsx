import { READINESS_CLASS, formatDate, readinessOf, slotsOf } from "@/lib/scioly";
import { cn } from "@/lib/utils";

export default function PartnershipsTable({ partnerships, events }) {
  const rows = partnerships
    .map((partnership) => {
      const event = events.find((candidate) => candidate.event_name === partnership.event_name);
      const readiness = readinessOf({
        xp: partnership.readiness_xp,
        lastActivity: partnership.last_activity_date,
        requiresImpound: event?.requires_impound,
        impoundVerified: partnership.impound_checklist_verified,
      });
      return { partnership, event, readiness };
    })
    .sort((a, b) => a.partnership.event_name.localeCompare(b.partnership.event_name));

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
        No partnerships yet. Run the auto-populate builder to place your applications.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-heading text-sm font-bold">Partnerships & readiness</h2>
        <p className="text-[11px] text-muted-foreground">Readiness XP grows with every quiz, build test and coach approval.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted/50 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-semibold">Event</th>
              <th className="px-4 py-2 font-semibold">Students</th>
              <th className="px-4 py-2 font-semibold">Coach</th>
              <th className="px-4 py-2 font-semibold">XP</th>
              <th className="px-4 py-2 font-semibold">Last activity</th>
              <th className="px-4 py-2 font-semibold">Readiness</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ partnership, event, readiness }) => (
              <tr key={partnership.id} className="border-t border-border/70">
                <td className="px-4 py-2.5">
                  <p className="font-semibold">{partnership.event_name}</p>
                  {partnership.current_week_goal ? <p className="max-w-[240px] truncate text-[11px] text-muted-foreground">{partnership.current_week_goal}</p> : null}
                </td>
                <td className="px-4 py-2.5 text-xs">
                  {slotsOf(partnership).map((student) => (
                    <p key={`${partnership.id}-${student.slot}`}>{student.name || student.email}</p>
                  ))}
                </td>
                <td className="px-4 py-2.5 text-[11px] text-muted-foreground">{event?.event_mentor_email || "—"}</td>
                <td className="px-4 py-2.5 text-xs font-semibold">{partnership.readiness_xp || 0}</td>
                <td className="px-4 py-2.5 text-[11px] text-muted-foreground">{partnership.last_activity_date ? formatDate(partnership.last_activity_date) : "—"}</td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold">
                    <span className={cn("h-2 w-2 rounded-full", READINESS_CLASS[readiness.tone])} />
                    {readiness.label}
                  </span>
                  {event?.requires_impound ? (
                    <p className={partnership.impound_checklist_verified ? "text-[10px] text-emerald-400" : "text-[10px] text-amber-400"}>
                      {partnership.impound_checklist_verified ? "impound verified" : "impound pending"}
                    </p>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
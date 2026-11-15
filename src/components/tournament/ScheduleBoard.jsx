import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { toggleScheduleItem } from "@/lib/workspace-fns";
import { cn } from "@/lib/utils";

function Toggle({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase transition-colors",
        active ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

export default function ScheduleBoard({ rows }) {
  const toggle = useServerFn(toggleScheduleItem);
  const router = useRouter();
  const [busy, setBusy] = useState("");

  async function flip(row, field) {
    setBusy(`${row.id}-${field}`);
    try {
      await toggle({ data: { id: row.id, field, value: !row[field] } });
      router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Could not update the schedule");
    } finally {
      setBusy("");
    }
  }

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
        No room schedule yet. Upload the CSV from the tournament portal to start tracking impounds and check-ins.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-heading text-sm font-bold">Room schedule & live check-ins</h2>
        <p className="text-[11px] text-muted-foreground">Tap a pill to flip impound, check-in or completion status.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted/50 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-semibold">Event</th>
              <th className="px-4 py-2 font-semibold">Block / time</th>
              <th className="px-4 py-2 font-semibold">Room</th>
              <th className="px-4 py-2 font-semibold">Impound</th>
              <th className="px-4 py-2 font-semibold">Team status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border/70">
                <td className="px-4 py-2.5">
                  <p className="font-semibold">{row.event_name}</p>
                  {row.emergency_notes ? <p className="text-[11px] text-rose-400">{row.emergency_notes}</p> : null}
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{row.event_time_slot || "—"}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{row.room_location || "—"}</td>
                <td className="px-4 py-2.5 text-[11px] text-muted-foreground">
                  {row.impound_window || "—"}
                  <div className="mt-1">
                    <Toggle label={row.impound_complete ? "Done" : "Pending"} active={row.impound_complete} onClick={() => flip(row, "impound_complete")} />
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    <Toggle label={row.students_checked_in ? "Checked in" : "Not checked in"} active={row.students_checked_in} onClick={() => flip(row, "students_checked_in")} />
                    <Toggle label={row.event_completed ? "Completed" : "Running"} active={row.event_completed} onClick={() => flip(row, "event_completed")} />
                  </div>
                  {!row.students_checked_in && !row.event_completed ? <p className="mt-1 text-[10px] font-semibold text-rose-400">check-in overdue</p> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
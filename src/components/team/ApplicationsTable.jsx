import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { updateApplicationScore } from "@/lib/workspace-fns";
import EmptyState from "@/components/common/EmptyState";
import { Inbox } from "lucide-react";

const STATUS_CLASS = {
  New: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  Placed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Waitlist: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

export default function ApplicationsTable({ applications }) {
  const saveScore = useServerFn(updateApplicationScore);
  const router = useRouter();
  const [saving, setSaving] = useState("");

  async function commit(application, value) {
    const score = Number(value);
    if (Number.isNaN(score) || score === (application.tryout_score || 0)) return;
    setSaving(application.id);
    try {
      await saveScore({ data: { application_id: application.id, tryout_score: score } });
      router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Could not save the score");
    } finally {
      setSaving("");
    }
  }

  if (!applications.length) {
    return <EmptyState icon={Inbox} title="No tryout applications yet" description="Share the tryout form link — every submission lands here and feeds the auto-roster builder." />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-heading text-sm font-bold">Tryout applications</h2>
        <p className="text-[11px] text-muted-foreground">Enter tryout scores — the roster builder places the highest scores first.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-muted/50 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-semibold">Student</th>
              <th className="px-4 py-2 font-semibold">Grade</th>
              <th className="px-4 py-2 font-semibold">Event choices</th>
              <th className="px-4 py-2 font-semibold">Parent</th>
              <th className="px-4 py-2 font-semibold">Score</th>
              <th className="px-4 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id} className="border-t border-border/70">
                <td className="px-4 py-2.5">
                  <p className="font-semibold">{application.student_name}</p>
                  <p className="text-[11px] text-muted-foreground">{application.student_email}</p>
                  {application.division ? (
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">{application.division}</p>
                  ) : null}
                  {application.student_phone ? (
                    <p className="text-[10px] text-muted-foreground">{application.student_phone}</p>
                  ) : null}
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{application.grade}</td>
                <td className="px-4 py-2.5 text-[11px] text-muted-foreground">
                  {[...(application.event_choices || []), application.top_choice_1, application.top_choice_2, application.top_choice_3, application.backup_choice_4]
                    .filter(Boolean)
                    .filter((name, index, list) => list.indexOf(name) === index)
                    .join(" · ") || "—"}
                </td>
                <td className="px-4 py-2.5 text-[11px] text-muted-foreground">
                  <p>{application.parent_name}</p>
                  <p>{application.parent_volunteer_interest ? "Volunteer coach" : application.parent_email}</p>
                </td>
                <td className="px-4 py-2.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={application.tryout_score || 0}
                    onBlur={(event) => commit(application, event.target.value)}
                    disabled={saving === application.id}
                    className="h-8 w-16 rounded-md border border-input bg-transparent px-2 text-sm"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_CLASS[application.status] || STATUS_CLASS.New}`}>
                    {application.status || "New"}
                  </span>
                  {application.placed_event ? <p className="mt-1 text-[10px] text-muted-foreground">{application.placed_event}</p> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
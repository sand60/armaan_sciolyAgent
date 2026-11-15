import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { updateMentorCheck } from "@/lib/workspace-fns";
import { cn } from "@/lib/utils";

const CHECK_CLASS = {
  Cleared: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "Not Started": "bg-muted text-muted-foreground border-border",
};

export default function MentorsTable({ mentors }) {
  const save = useServerFn(updateMentorCheck);
  const router = useRouter();

  async function change(mentor, status) {
    try {
      await save({ data: { mentor_id: mentor.id, background_check_status: status } });
      toast.success(`${mentor.mentor_name}: ${status}`);
      router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Could not update the coach");
    }
  }

  if (!mentors.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
        No mentors yet. Parents who tick the volunteer box on the tryout form appear here automatically.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-heading text-sm font-bold">Event coaches</h2>
        <p className="text-[11px] text-muted-foreground">Track background checks and which event each coach owns.</p>
      </div>
      <div className="divide-y divide-border/70">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{mentor.mentor_name}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {mentor.mentor_email}
                {mentor.child_name ? ` · parent of ${mentor.child_name}` : ""}
                {mentor.assigned_event ? ` · ${mentor.assigned_event}` : ""}
              </p>
            </div>
            <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase", CHECK_CLASS[mentor.background_check_status] || CHECK_CLASS["Not Started"])}>
              {mentor.background_check_status || "Not Started"}
            </span>
            <select
              value={mentor.background_check_status || "Not Started"}
              onChange={(event) => change(mentor, event.target.value)}
              className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
              aria-label={`Background check for ${mentor.mentor_name}`}
            >
              <option value="Not Started">Not started</option>
              <option value="Pending">Pending</option>
              <option value="Cleared">Cleared</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
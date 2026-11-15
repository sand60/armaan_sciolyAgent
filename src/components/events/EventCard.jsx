import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Bot, FileUp, Loader2, Target } from "lucide-react";
import { toast } from "sonner";
import { attachRuleManual, updateEventMentor } from "@/lib/workspace-fns";
import { base44 } from "@/api/base44Client";
import { CATEGORY_CLASS, formatDate, slotsOf } from "@/lib/scioly";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function EventCard({ event, partnership, canManage, mentors = [], canPractice }) {
  const attach = useServerFn(attachRuleManual);
  const assignMentor = useServerFn(updateEventMentor);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const students = partnership ? slotsOf(partnership) : [];

  async function uploadManual(file) {
    if (!file) return;
    setBusy(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await attach({ data: { event_id: event.id, file_uri } });
      toast.success("Rule manual attached to this event");
      router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function changeMentor(email) {
    try {
      await assignMentor({ data: { event_id: event.id, mentor_email: email } });
      toast.success(email ? "Coach assigned" : "Coach cleared");
      router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Could not assign the coach");
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-heading text-sm font-bold leading-tight">{event.event_name}</h3>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {event.time_block} · up to {event.max_partners} partners
          </p>
        </div>
        <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", CATEGORY_CLASS[event.category])}>
          {event.category}
        </span>
      </div>

      <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{event.key_topics}</p>

      <div className="mt-3 space-y-1 text-[11px]">
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">Partners:</span>{" "}
          {students.length ? students.map((student) => student.name || student.email).join(", ") : "unassigned"}
        </p>
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">Mentor:</span> {event.event_mentor_email || "not assigned"}
        </p>
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">Last activity:</span>{" "}
          {partnership?.last_activity_date ? formatDate(partnership.last_activity_date) : "—"}
        </p>
        {event.requires_impound ? (
          <p className={partnership?.impound_checklist_verified ? "text-emerald-400" : "text-amber-400"}>
            {partnership?.impound_checklist_verified ? "Impound checklist verified" : "Impound checklist pending"}
          </p>
        ) : null}
      </div>

      {partnership?.current_week_goal ? (
        <p className="mt-3 rounded-lg bg-secondary/70 px-2.5 py-2 text-[11px] font-medium text-secondary-foreground">
          This week: {partnership.current_week_goal}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
        {canPractice ? (
          <Button size="sm" variant="outline" asChild>
            <Link to="/practice/$eventId" params={{ eventId: event.id }} search={{ mode: "practice" }}>
              <Target className="mr-1.5 h-3.5 w-3.5" /> Quiz
            </Link>
          </Button>
        ) : null}
        <Button size="sm" variant="outline" asChild>
          <Link to="/coach" search={{ event: event.id }}>
            <Bot className="mr-1.5 h-3.5 w-3.5" /> AI coach
          </Link>
        </Button>
        {canManage ? (
          <>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-input px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileUp className="h-3.5 w-3.5" />}
              {event.rule_manual_uri ? "Replace rules" : "Add rules PDF"}
              <input type="file" accept="application/pdf" className="hidden" onChange={(changeEvent) => uploadManual(changeEvent.target.files?.[0])} />
            </label>
            <select
              value={event.event_mentor_email || ""}
              onChange={(changeEvent) => changeMentor(changeEvent.target.value)}
              className="h-8 max-w-[150px] rounded-md border border-input bg-transparent px-2 text-xs"
              aria-label={`Assign coach for ${event.event_name}`}
            >
              <option value="">Assign coach…</option>
              {mentors.map((mentor) => (
                <option key={mentor.id} value={mentor.mentor_email}>
                  {mentor.mentor_name}
                </option>
              ))}
            </select>
          </>
        ) : null}
      </div>
    </div>
  );
}
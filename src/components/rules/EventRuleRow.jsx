import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, FileCheck2, GraduationCap, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EventRuleRow({ event, mentor, mine }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card shadow-soft transition-colors",
        mine ? "border-primary/40" : "border-border",
      )}
    >
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 font-heading text-sm font-bold">
            {event.event_name}
            {mine ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                Your event
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span>{event.category}</span>
            <span>{event.time_block}</span>
            <span className="inline-flex items-center gap-1">
              <UserRound className="h-3 w-3" />
              {mentor || "No coach assigned"}
            </span>
            {event.rule_manual_uri ? (
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <FileCheck2 className="h-3 w-3" /> Manual attached
              </span>
            ) : null}
          </p>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="border-t border-border/70 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Official rules digest</p>
          <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-muted-foreground">
            {event.rules_summary || "No rules digest loaded for this event yet."}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link
              to="/study/$eventId"
              params={{ eventId: event.id }}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
            >
              <GraduationCap className="h-3.5 w-3.5" /> Open study studio for this event
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
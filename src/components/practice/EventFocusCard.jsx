import { Link } from "@tanstack/react-router";
import { Bot, ClipboardList, Timer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function EventFocusCard({ event, partnership }) {
  const xp = partnership?.readiness_xp || 0;
  const progress = Math.min(100, Math.round((xp / 300) * 100));

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-heading text-sm font-bold">{event.event_name}</h3>
          <p className="text-[11px] text-muted-foreground">
            {event.category} · {event.time_block}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
          <Zap className="h-3 w-3" /> {xp} XP
        </span>
      </div>

      <div className="mt-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">{progress}% to tournament-ready (300 XP)</p>
      </div>

      <p className="mt-3 rounded-lg bg-secondary/70 px-2.5 py-2 text-[11px] font-medium text-secondary-foreground">
        {partnership?.current_week_goal || "No weekly goal yet — the Monday blast sets one for you."}
      </p>

      <div className="mt-auto flex flex-wrap gap-2 pt-3">
        <Button size="sm" asChild>
          <Link to="/practice/$eventId" params={{ eventId: event.id }} search={{ mode: "practice" }}>
            Practice quiz
          </Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link to="/practice/$eventId" params={{ eventId: event.id }} search={{ mode: "mock" }}>
            <Timer className="mr-1.5 h-3.5 w-3.5" /> Mock exam
          </Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link to="/coach" search={{ event: event.id }}>
            <Bot className="mr-1.5 h-3.5 w-3.5" /> Coach
          </Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link to="/log" search={{ event: event.event_name }}>
            <ClipboardList className="mr-1.5 h-3.5 w-3.5" /> Log
          </Link>
        </Button>
      </div>

      {event.requires_impound ? (
        <p className={cn("mt-2 text-[10px] font-semibold", partnership?.impound_checklist_verified ? "text-emerald-700" : "text-amber-700")}>
          {partnership?.impound_checklist_verified ? "Impound checklist verified by a coach" : "Impound checklist still needs a coach approval"}
        </p>
      ) : null}
    </div>
  );
}
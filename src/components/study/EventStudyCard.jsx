import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Layers, ListChecks, FileCheck2 } from "lucide-react";

export default function EventStudyCard({ event }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-float">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-[15px] font-bold leading-snug">{event.event_name}</h3>
          <Badge variant="secondary" className="shrink-0">{event.category}</Badge>
        </div>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {event.time_block || "Self-scheduled"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {event.counts.cards} decks</span>
          <span className="inline-flex items-center gap-1"><ListChecks className="h-3.5 w-3.5" /> {event.counts.quizzes} quizzes</span>
          <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {event.counts.guides} guides</span>
        </div>
        <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
          <FileCheck2 className="h-3.5 w-3.5" />
          {event.has_manual ? "Official manual attached" : event.has_rules ? "Rules document ready" : "Rules not loaded yet"}
        </p>
      </div>
      <Button asChild size="sm" className="mt-4 w-full">
        <Link to="/study/$eventId" params={{ eventId: event.id }}>Open study studio</Link>
      </Button>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { getPracticeData } from "@/lib/workspace-fns";
import PageHeader from "@/components/common/PageHeader";
import CoachChat from "@/components/coach/CoachChat";
import { CATEGORY_CLASS } from "@/lib/scioly";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/coach")({
  validateSearch: (search) => ({ event: typeof search.event === "string" ? search.event : undefined }),
  loader: () => getPracticeData(),
  head: () => ({ meta: [{ title: "AI event coach — SciOlyCoachAgent" }] }),
  component: CoachPage,
});

function CoachPage() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  const events = [...(data.events || [])].sort((a, b) => a.event_name.localeCompare(b.event_name));
  const active = events.find((event) => event.id === search.event) || events[0];

  if (!active) {
    return <PageHeader title="AI event coach" description="Your workspace has no events yet." />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Socratic coaching"
        title="AI event coach"
        description="Scoped to the event's key topics and rule manual. It never hands over the answer — it makes the student reason first."
      />

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {events.map((event) => (
          <a
            key={event.id}
            href={`/coach?event=${event.id}`}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              event.id === active.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {event.event_name}
          </a>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", CATEGORY_CLASS[active.category])}>{active.category}</span>
        <span className="text-[11px] text-muted-foreground">{active.time_block}</span>
        <span className="text-[11px] text-muted-foreground">· {active.key_topics}</span>
      </div>

      <CoachChat event={active} key={active.id} />
    </div>
  );
}
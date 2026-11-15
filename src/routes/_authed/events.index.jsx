import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getCoachData } from "@/lib/workspace-fns";
import { catalogForDivision } from "@/lib/event-catalog";
import PageHeader from "@/components/common/PageHeader";
import EventCard from "@/components/events/EventCard";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Study", "Build", "Lab", "Hybrid"];
const DIVISIONS = ["Division B", "Division C"];

export const Route = createFileRoute("/_authed/events/")({
  loader: () => getCoachData(),
  head: () => ({ meta: [{ title: "Event workspaces — SciOlyCoachAgent" }] }),
  component: EventsPage,
});

function EventsPage() {
  const { role, events, partnerships, mentors } = Route.useLoaderData();
  const [division, setDivision] = useState("Division B");
  const [filter, setFilter] = useState("All");

  const divisionEvents = useMemo(() => {
    const official = new Set(catalogForDivision(division).map((event) => event.name));
    return events.filter((event) => event.division === division && official.has(event.event_name));
  }, [events, division]);

  const visible = useMemo(
    () => divisionEvents.filter((event) => filter === "All" || event.category === filter).sort((a, b) => a.event_name.localeCompare(b.event_name)),
    [divisionEvents, filter],
  );

  const counts = useMemo(
    () =>
      DIVISIONS.reduce((acc, name) => {
        const official = new Set(catalogForDivision(name).map((event) => event.name));
        return { ...acc, [name]: events.filter((event) => event.division === name && official.has(event.event_name)).length };
      }, {}),
    [events],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`${division} · ${divisionEvents.length} official events`}
        title="Event workspaces"
        description="Every event carries its key topics, time block, partner limit, impound flag and coach. Attach the current rule manual so the AI coach can cite it."
      />

      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft">
        {DIVISIONS.map((name) => (
          <button
            key={name}
            onClick={() => {
              setDivision(name);
              setFilter("All");
            }}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-bold transition-colors",
              division === name ? "bg-brand-gradient text-white shadow-soft" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {name} events
            <span className={cn("ml-2 rounded-full px-1.5 py-0.5 text-[10px]", division === name ? "bg-white/20" : "bg-muted")}>
              {counts[name] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              filter === option ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((event) => {
          const partnership = partnerships.find((candidate) => candidate.event_name === event.event_name);
          return (
            <EventCard
              key={event.id}
              event={event}
              partnership={partnership}
              canManage={role === "Head Coach"}
              canPractice={role === "Student" || role === "Head Coach"}
              mentors={mentors}
            />
          );
        })}
      </div>
    </div>
  );
}
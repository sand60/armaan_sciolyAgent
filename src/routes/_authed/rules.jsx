import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ScrollText } from "lucide-react";
import { getMentorData } from "@/lib/workspace-fns";
import { rulesFor } from "@/lib/scioly-rules";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import EventRuleRow from "@/components/rules/EventRuleRow";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const DIVISIONS = ["Division C", "Division B"];

const TAB_LABELS = {
  "Division C": "Division C · High School",
  "Division B": "Division B · Middle School",
};

const lower = (value) => String(value || "").toLowerCase();

export const Route = createFileRoute("/_authed/rules")({
  ssr: false,
  loader: () => getMentorData(),
  head: () => ({ meta: [{ title: "Event rules — SciOlyCoachAgent" }] }),
  component: EventRulesPage,
});

function EventRulesPage() {
  const { events, mentors, partnerships, role, user, school } = Route.useLoaderData();
  const [tab, setTab] = useState(DIVISIONS.includes(school?.division) ? school.division : "Division C");

  const myMentor = mentors.find((mentor) => lower(mentor.mentor_email) === lower(user.email)) || null;
  const myEvents = new Set(
    [myMentor?.assigned_event, ...events.filter((event) => lower(event.event_mentor_email) === lower(user.email)).map((event) => event.event_name)].filter(Boolean),
  );

  const withRules = events.map((event) => ({
    ...event,
    rules_summary: event.rules_summary || rulesFor(event.event_name, event.division || school.division),
  }));

  const mentorFor = (event) =>
    event.event_mentor_email ||
    mentors.find((mentor) => mentor.assigned_event === event.event_name)?.mentor_name ||
    "";

  const byDivision = (division) =>
    withRules
      .filter((event) => (event.division || school.division) === division)
      .sort((a, b) => {
        const mineA = myEvents.has(a.event_name) ? 0 : 1;
        const mineB = myEvents.has(b.event_name) ? 0 : 1;
        return mineA - mineB || a.event_name.localeCompare(b.event_name);
      });

  const assignedEventNames = new Set(mentors.map((mentor) => mentor.assigned_event).filter(Boolean));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={myMentor?.assigned_event ? `Coach for ${myMentor.assigned_event}` : "Coaches section"}
        title="Event rules"
        description="Every event's official rules digest in one place, so coaches stay on the current season and point students at the right material."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Events with rules", value: withRules.filter((event) => event.rules_summary).length },
          { label: "Events with a coach", value: assignedEventNames.size },
          { label: "Partnerships", value: partnerships.length },
        ].map((tile) => (
          <div key={tile.label} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <p className="font-heading text-2xl font-extrabold">{tile.value}</p>
            <p className="text-xs text-muted-foreground">{tile.label}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-muted/60 p-1 sm:w-auto">
          {DIVISIONS.map((division) => (
            <TabsTrigger key={division} value={division} className="rounded-lg px-4 py-2 text-xs font-semibold sm:text-sm">
              {TAB_LABELS[division]}
              <span className="ml-2 rounded-full bg-background/80 px-1.5 text-[11px] text-muted-foreground">
                {byDivision(division).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {DIVISIONS.map((division) => {
          const list = byDivision(division);
          return (
            <TabsContent key={division} value={division} className="space-y-2.5">
              {list.length ? (
                list.map((event) => (
                  <EventRuleRow
                    key={event.id}
                    event={event}
                    mentor={mentorFor(event)}
                    mine={role === "Event Mentor" && myEvents.has(event.event_name)}
                  />
                ))
              ) : (
                <EmptyState
                  icon={ScrollText}
                  title={`No ${division} events yet`}
                  description="Events appear here as soon as they are added to your workspace."
                />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
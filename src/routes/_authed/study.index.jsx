import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { getStudyIndex } from "@/lib/study-fns";
import PageHeader from "@/components/common/PageHeader";
import EventStudyCard from "@/components/study/EventStudyCard";
import GenerateAllBar from "@/components/study/GenerateAllBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const TAB_LABELS = {
  "Division C": "Division C · High School",
  "Division B": "Division B · Middle School",
};

export const Route = createFileRoute("/_authed/study/")({
  ssr: false,
  loader: () => getStudyIndex(),
  head: () => ({ meta: [{ title: "Study studio — SciOlyCoachAgent" }] }),
  component: StudyIndexPage,
});

function StudyIndexPage() {
  const { divisions, defaultDivision, totals } = Route.useLoaderData();
  const [tab, setTab] = useState(defaultDivision);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Official 2027 event lists"
        title="Study studio"
        description="Every event in both divisions carries its official rules digest. Turn those rules into flashcards, quiz sets and study guides, then drill them with your team."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Flashcard decks", value: totals.cards },
          { label: "Quiz sets", value: totals.quizzes },
          { label: "Study guides", value: totals.guides },
        ].map((tile) => (
          <div key={tile.label} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <p className="font-heading text-2xl font-extrabold">{tile.value}</p>
            <p className="text-xs text-muted-foreground">{tile.label}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-muted/60 p-1 sm:w-auto">
          {divisions.map((division) => (
            <TabsTrigger key={division.name} value={division.name} className="rounded-lg px-4 py-2 text-xs font-semibold sm:text-sm">
              {TAB_LABELS[division.name] || division.name}
              <span className="ml-2 rounded-full bg-background/80 px-1.5 text-[11px] text-muted-foreground">
                {division.events.length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {divisions.map((division) => (
          <TabsContent key={division.name} value={division.name} className="space-y-4">
            <GenerateAllBar events={division.events} />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {division.events.map((event) => (
                <EventStudyCard key={event.id} event={event} />
              ))}
            </div>

            {!division.events.length ? (
              <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
                No events in this workspace yet. <Link to="/start" className="font-semibold text-primary">Create your workspace</Link> to clone the season.
              </p>
            ) : null}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
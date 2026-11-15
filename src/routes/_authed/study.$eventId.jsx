import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getStudyStudio } from "@/lib/study-fns";
import PageHeader from "@/components/common/PageHeader";
import RulesDigest from "@/components/study/RulesDigest";
import GenerateBar from "@/components/study/GenerateBar";
import MaterialBrowser from "@/components/study/MaterialBrowser";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authed/study/$eventId")({
  ssr: false,
  loader: ({ params }) => getStudyStudio({ data: { event_id: params.eventId } }),
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.event?.event_name || "Event"} study — SciOlyCoachAgent` }] }),
  component: StudyStudioPage,
});

function StudyStudioPage() {
  const { event, decks, quizzes, guides } = Route.useLoaderData();

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/study">
          <ArrowLeft className="h-4 w-4" /> Study studio
        </Link>
      </Button>

      <PageHeader
        eyebrow={`${event.division} · ${event.time_block || "Self-scheduled"}`}
        title={event.event_name}
        description={event.key_topics || "Key topics come from the official rules."}
        actions={
          <div className="flex gap-2">
            <Badge variant="secondary">{event.category}</Badge>
            {event.requires_impound ? <Badge>Impound</Badge> : null}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        <RulesDigest event={event} />
        <GenerateBar eventId={event.id} />
      </div>

      <MaterialBrowser decks={decks} quizzes={quizzes} guides={guides} />
    </div>
  );
}
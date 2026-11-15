import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { buildQuiz } from "@/lib/ai-fns";
import QuizRunner from "@/components/practice/QuizRunner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authed/practice/$eventId")({
  validateSearch: (search) => ({ mode: search.mode === "mock" ? "mock" : "practice" }),
  loaderDeps: ({ search }) => ({ mode: search.mode }),
  loader: ({ params, deps }) => buildQuiz({ data: { event_id: params.eventId, mode: deps.mode } }),
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.event?.event_name || "Practice"} quiz — SciOlyCoachAgent` }],
  }),
  component: QuizPage,
});

function QuizPage() {
  const { event, mode, questions } = Route.useLoaderData();

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/practice">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to my practice
        </Link>
      </Button>
      <QuizRunner event={event} mode={mode} questions={questions} />
    </div>
  );
}
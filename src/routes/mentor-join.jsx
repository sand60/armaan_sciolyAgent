import { createFileRoute } from "@tanstack/react-router";
import { getMentorJoinForm } from "@/lib/workspace-fns";
import MentorJoinForm from "@/components/mentor-intake/MentorJoinForm";

export const Route = createFileRoute("/mentor-join")({
  validateSearch: (search) => ({ school: typeof search.school === "string" ? search.school : undefined }),
  loaderDeps: ({ search }) => ({ school: search.school }),
  loader: ({ deps }) => getMentorJoinForm({ data: { code: deps.school } }),
  head: () => ({
    meta: [
      { title: "Coach sign-up — Science Olympiad" },
      { name: "description", content: "Volunteer as a Science Olympiad event coach and pick the events you can lead." },
    ],
  }),
  component: MentorJoinPage,
});

function MentorJoinPage() {
  const data = Route.useLoaderData();
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <div className="max-w-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{data?.school?.school_name || "Science Olympiad"}</p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight">Coach sign-up</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {data?.school?.division || "Division B"} team. Tell us which events you can coach — coaches run practices, verify builds and check in at
          tournaments with their event partners.
        </p>
      </div>

      <div className="mt-8">
        <MentorJoinForm school={data?.school} events={data?.events || []} />
      </div>
    </main>
  );
}
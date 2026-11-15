import { createFileRoute } from "@tanstack/react-router";
import { getPublicStudentSignup } from "@/lib/workspace-fns";
import StudentJoinForm from "@/components/intake/StudentJoinForm";

export const Route = createFileRoute("/signup")({
  validateSearch: (search) => ({ school: typeof search.school === "string" ? search.school : undefined }),
  loaderDeps: ({ search }) => ({ school: search.school }),
  loader: ({ deps }) => getPublicStudentSignup({ data: { code: deps.school } }),
  head: () => ({
    meta: [
      { title: "Science Olympiad student sign-up" },
      { name: "description", content: "Sign up for the Science Olympiad team: contacts, grade and the events you want to compete in." },
    ],
  }),
  component: PublicSignupPage,
});

function PublicSignupPage() {
  const data = Route.useLoaderData();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <StudentJoinForm school={data?.school} eventsByDivision={data?.eventsByDivision} code={data?.school?.school_id} />
      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        Questions? Ask your coach — this form goes straight to the team's coaching staff.
      </p>
    </main>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { getStudentSignupData } from "@/lib/workspace-fns";
import PageHeader from "@/components/common/PageHeader";
import StudentJoinForm from "@/components/intake/StudentJoinForm";
import ShareLink from "@/components/common/ShareLink";

export const Route = createFileRoute("/_authed/student-signup")({
  ssr: false,
  loader: () => getStudentSignupData(),
  head: () => ({ meta: [{ title: "Student sign-up — SciOlyCoachAgent" }] }),
  component: StudentSignupPage,
});

function StudentSignupPage() {
  const { school, eventsByDivision, role } = Route.useLoaderData();

  if (role !== "Head Coach") {
    return <PageHeader title="Head coach only" description="The student sign-up form is managed by the head coach." />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Intake"
        title="Student sign-up form"
        description="Add a student to the team: pick their division, then the events they want — only that division's events are shown. Everything here lands in your tryout applications list."
      />
      <div className="max-w-3xl space-y-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <h2 className="font-heading text-sm font-bold">Share this form</h2>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Anyone with this link can open the form and sign up — no account needed. Submissions land in your tryout applications list.
          </p>
          <div className="mt-3">
            <ShareLink path="/signup" query={school?.school_id ? `?school=${school.school_id}` : ""} label="form" />
          </div>
        </div>
        <StudentJoinForm school={school} eventsByDivision={eventsByDivision} />
      </div>
    </div>
  );
}
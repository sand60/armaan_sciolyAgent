import { createFileRoute } from "@tanstack/react-router";
import { getMentorSignupData } from "@/lib/workspace-fns";
import PageHeader from "@/components/common/PageHeader";
import ShareLink from "@/components/common/ShareLink";
import MentorJoinForm from "@/components/mentor-intake/MentorJoinForm";

export const Route = createFileRoute("/_authed/mentor-signup")({
  ssr: false,
  loader: () => getMentorSignupData(),
  head: () => ({ meta: [{ title: "Coach sign-up — SciOlyCoachAgent" }] }),
  component: MentorSignupPage,
});

function MentorSignupPage() {
  const { school, events, role } = Route.useLoaderData();

  if (role !== "Head Coach") {
    return <PageHeader title="Head coach only" description="The coach sign-up form is managed by the head coach." />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Intake"
        title="Coach sign-up form"
        description="Exactly what a mentor sees when they open your sign-up link — copy the link and send it to anyone who wants to mentor."
        actions={<ShareLink path="/mentor-join" query={school?.school_id ? `?school=${school.school_id}` : ""} label="form" />}
      />
      <div className="max-w-3xl">
        <MentorJoinForm school={school} events={events} />
      </div>
    </div>
  );
}
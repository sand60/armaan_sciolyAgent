import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { Loader2, Users, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { autoPopulateRoster, getTeamData } from "@/lib/workspace-fns";
import PageHeader from "@/components/common/PageHeader";
import StatTile from "@/components/common/StatTile";
import ApplicationsTable from "@/components/team/ApplicationsTable";
import PartnershipsTable from "@/components/team/PartnershipsTable";
import MentorsTable from "@/components/team/MentorsTable";
import JoinFormsCard from "@/components/team/JoinFormsCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authed/team")({
  loader: () => getTeamData(),
  head: () => ({ meta: [{ title: "Team & intake — SciOlyCoachAgent" }] }),
  component: TeamPage,
});

function TeamPage() {
  const { school, role, applications, partnerships, mentors, events } = Route.useLoaderData();
  const build = useServerFn(autoPopulateRoster);
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (role !== "Head Coach") {
    return <PageHeader title="Head coach only" description="Roster building and intake are managed by the head coach." />;
  }

  async function runBuilder() {
    setBusy(true);
    try {
      const result = await build();
      toast.success(`${result.placed} students placed · ${result.waitlisted} waitlisted`);
      router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Could not build the roster");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Intake & auto-roster"
        title="Team & tryouts"
        description="Share the form, collect event preferences, then let the builder place students by tryout score without breaking a time block or a partner limit."
        actions={
          <Button size="sm" onClick={runBuilder} disabled={busy}>
            {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Wand2 className="mr-1.5 h-4 w-4" />}
            Auto-populate roster
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Applications" value={applications.length} hint={`${applications.filter((application) => application.status === "New").length} new`} icon={Users} />
        <StatTile label="Placed" value={applications.filter((application) => application.status === "Placed").length} hint="Assigned to an event" tone="green" />
        <StatTile label="Partnerships" value={partnerships.length} hint={`${events.length} events available`} tone="blue" />
        <StatTile label="Coaches" value={mentors.length} hint={`${mentors.filter((mentor) => mentor.background_check_status === "Cleared").length} cleared`} tone="amber" />
      </div>

      <JoinFormsCard school={school} />

      <ApplicationsTable applications={applications} />
      <PartnershipsTable partnerships={partnerships} events={events} />
      <MentorsTable mentors={mentors} />
    </div>
  );
}
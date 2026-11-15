import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/common/PageHeader";
import SeasonSchedule from "@/components/tournament/SeasonSchedule";

export const Route = createFileRoute("/_authed/schedule")({
  ssr: false,
  head: () => ({ meta: [{ title: "Season schedule — SciOlyCoachAgent" }] }),
  component: SchedulePage,
});

function SchedulePage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="2026–2027 season"
        title="Season schedule"
        description="Every tournament the team attends this year — invitationals for practice, regionals mandatory, state if qualified."
      />
      <SeasonSchedule />
    </div>
  );
}
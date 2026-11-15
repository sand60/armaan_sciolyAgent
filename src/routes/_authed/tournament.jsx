import { createFileRoute } from "@tanstack/react-router";
import { getTournamentData } from "@/lib/workspace-fns";
import { formatDate } from "@/lib/scioly";
import PageHeader from "@/components/common/PageHeader";
import StatTile from "@/components/common/StatTile";
import SeasonSchedule from "@/components/tournament/SeasonSchedule";
import ScheduleBoard from "@/components/tournament/ScheduleBoard";
import ScheduleUpload from "@/components/tournament/ScheduleUpload";
import SwapDialog from "@/components/tournament/SwapDialog";

export const Route = createFileRoute("/_authed/tournament")({
  loader: () => getTournamentData(),
  head: () => ({ meta: [{ title: "Tournament day command center — SciOlyCoachAgent" }] }),
  component: TournamentPage,
});

function TournamentPage() {
  const { tournaments, schedule, partnerships } = Route.useLoaderData();
  const active = [...tournaments].sort((a, b) => new Date(a.tournament_date) - new Date(b.tournament_date))[0] || null;
  const rows = schedule.filter((row) => !active || row.tournament_name === active.tournament_name);
  const visible = rows.length ? rows : schedule;

  const impoundsDone = visible.filter((row) => row.impound_complete).length;
  const impoundTotal = visible.filter((row) => row.impound_window).length || visible.length;
  const checkedIn = visible.filter((row) => row.students_checked_in).length;
  const completed = visible.filter((row) => row.event_completed).length;
  const alerts = visible.filter((row) => !row.students_checked_in && !row.event_completed).length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={active ? `${active.division_note} · ${formatDate(active.tournament_date)}` : "No tournament on the calendar"}
        title="Tournament day command center"
        description="Live impound, check-in and completion counters with the room schedule your team is actually running."
        actions={
          <>
            <ScheduleUpload tournamentName={active?.tournament_name || "Tournament"} />
            <SwapDialog partnerships={partnerships} />
          </>
        }
      />

      <SeasonSchedule />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Impounds completed" value={`${impoundsDone}/${impoundTotal}`} hint="Build events checked in" tone="blue" />
        <StatTile label="Checked in" value={`${checkedIn}/${visible.length}`} hint="Current block check-ins" tone="green" />
        <StatTile label="Events completed" value={`${completed}/${visible.length}`} hint="Live results captured" tone="default" />
        <StatTile label="Red alerts" value={alerts} hint="Not checked in and still pending" tone="red" />
      </div>

      {alerts ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <span className="font-semibold">{alerts} event{alerts === 1 ? "" : "s"} still need a check-in:</span>{" "}
          {visible.filter((row) => !row.students_checked_in && !row.event_completed).map((row) => row.event_name).join(", ")}
        </div>
      ) : null}

      <ScheduleBoard rows={visible} />
    </div>
  );
}
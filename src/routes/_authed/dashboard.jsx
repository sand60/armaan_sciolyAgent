import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { CheckCircle2, ClipboardCheck, ClipboardList, Copy, FileWarning, Inbox, Timer } from "lucide-react";
import { toast } from "sonner";
import { getCoachData } from "@/lib/workspace-fns";
import { readinessOf } from "@/lib/scioly";
import PageHeader from "@/components/common/PageHeader";
import StatTile from "@/components/common/StatTile";
import ReadinessMatrix from "@/components/dashboard/ReadinessMatrix";
import TournamentBanner from "@/components/dashboard/TournamentBanner";
import AutomationPanel from "@/components/dashboard/AutomationPanel";
import AlertLog from "@/components/dashboard/AlertLog";
import SchoolSettingsDialog from "@/components/dashboard/SchoolSettingsDialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authed/dashboard")({
  loader: () => getCoachData(),
  head: () => ({ meta: [{ title: "Command dashboard — SciOlyCoachAgent" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const data = Route.useLoaderData();
  const { school, role, events, partnerships, logs, tournaments, applications, mentors, alerts } = data;

  const stats = useMemo(() => {
    let onTrack = 0;
    let needsAttention = 0;
    let inactive = 0;
    for (const event of events) {
      const parts = partnerships.filter((partnership) => partnership.event_name === event.event_name);
      if (!parts.length) {
        inactive += 1;
        continue;
      }
      const dates = parts.map((partnership) => partnership.last_activity_date).filter(Boolean).sort();
      const readiness = readinessOf({
        xp: Math.max(...parts.map((partnership) => partnership.readiness_xp || 0)),
        lastActivity: dates[dates.length - 1] || null,
        requiresImpound: event.requires_impound,
        impoundVerified: parts.every((partnership) => partnership.impound_checklist_verified),
      });
      if (readiness.tone === "green") onTrack += 1;
      else if (readiness.tone === "yellow") needsAttention += 1;
      else inactive += 1;
    }

    const impoundPending = events
      .filter((event) => event.requires_impound)
      .filter((event) => {
        const parts = partnerships.filter((partnership) => partnership.event_name === event.event_name);
        return !parts.length || parts.some((partnership) => !partnership.impound_checklist_verified);
      }).length;

    const awaitingVerification = logs.filter(
      (log) => ["Build Test", "Lab Drill"].includes(log.activity_type) && !log.mentor_verified,
    ).length;

    const nextTournament = [...tournaments].sort((a, b) => new Date(a.tournament_date) - new Date(b.tournament_date))[0] || null;

    return {
      onTrack,
      needsAttention,
      inactive,
      impoundPending,
      awaitingVerification,
      newApplications: applications.filter((application) => application.status === "New").length,
      nextTournament,
    };
  }, [events, partnerships, logs, applications, tournaments]);

  if (role !== "Head Coach") {
    return (
      <div className="space-y-4">
        <PageHeader title="Head coach only" description="This dashboard belongs to the team's head coach. Use the navigation to open your own workspace." />
        <Button asChild>
          <Link to={role === "Event Mentor" ? "/mentor" : "/practice"}>Go to my workspace</Link>
        </Button>
      </div>
    );
  }

  async function copyIntake() {
    await navigator.clipboard.writeText(`${window.location.origin}/apply?school=${school.school_id}`);
    toast.success("Tryout form link copied");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${school.division} · ${school.subscription_status} · ${school.plan || "Single Team"}`}
        title={school.school_name}
        description={`School code ${school.school_id}. ${mentors.length} coaches, ${applications.length} tryout applications, ${events.length} events on the board.`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={copyIntake}>
              <Copy className="mr-1.5 h-4 w-4" /> Share tryout form
            </Button>
            <SchoolSettingsDialog school={school} />
          </>
        }
      />

      <TournamentBanner tournament={stats.nextTournament} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile label="On track" value={stats.onTrack} hint="Practicing this week" tone="green" icon={CheckCircle2} />
        <StatTile label="Needs attention" value={stats.needsAttention} hint="Quiet for 1–3 weeks" tone="amber" icon={Timer} />
        <StatTile label="Inactive" value={stats.inactive} hint="No partners or 3+ weeks idle" tone="red" icon={FileWarning} />
        <StatTile label="Impound pending" value={stats.impoundPending} hint="Build events not verified" tone="blue" icon={ClipboardCheck} />
        <StatTile label="New applications" value={stats.newApplications} hint="Waiting on the roster" tone="default" icon={Inbox} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Build & lab submissions</p>
            <p className="mt-1 font-heading text-lg font-extrabold">{stats.awaitingVerification} awaiting a coach</p>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link to="/mentor">
              <ClipboardList className="mr-1.5 h-4 w-4" /> Queue
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Roster builder</p>
            <p className="mt-1 font-heading text-lg font-extrabold">{applications.filter((application) => application.status === "Placed").length} placements</p>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link to="/team">Open intake</Link>
          </Button>
        </div>
      </div>

      <ReadinessMatrix events={events} partnerships={partnerships} />

      <div className="grid gap-4 lg:grid-cols-2">
        <AutomationPanel />
        <AlertLog alerts={alerts} />
      </div>
    </div>
  );
}
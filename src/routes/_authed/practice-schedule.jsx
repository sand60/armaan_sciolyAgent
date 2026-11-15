import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import PracticeSessionForm from "@/components/practice-schedule/PracticeSessionForm";
import PracticeCalendar from "@/components/practice-schedule/PracticeCalendar";
import { getPracticeSchedule } from "@/lib/practice-schedule-fns";

export const Route = createFileRoute("/_authed/practice-schedule")({
  ssr: false,
  loader: () => getPracticeSchedule(),
  head: () => ({ meta: [{ title: "Team practice calendar — SciOlyCoachAgent" }] }),
  component: PracticeSchedulePage,
});

function PracticeSchedulePage() {
  const { sessions, events, canManage } = Route.useLoaderData();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={canManage ? "Coaches" : "Students — view only"}
        title="Team practice calendar"
        description={
          canManage
            ? "Weekly practices sit on the calendar — click any day to see the event, coach, time and place. New practices can repeat every week."
            : "Every team practice on the calendar — click a day to see the event, coach, time and place."
        }
        actions={canManage ? <PracticeSessionForm events={events} /> : null}
      />

      {sessions.length ? (
        <PracticeCalendar sessions={sessions} canManage={canManage} />
      ) : (
        <EmptyState
          title="No practices scheduled yet"
          description={canManage ? "Add the first practice with the New practice button." : "Your coaches will post practices here."}
        />
      )}
    </div>
  );
}
import PracticeSessionRow from "@/components/practice-schedule/PracticeSessionRow";

export default function PracticeDayPanel({ label, sessions, canManage }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/80">Day view</p>
      <h3 className="mt-0.5 font-heading text-base font-extrabold">{label}</h3>

      <div className="mt-3 space-y-2">
        {sessions.length ? (
          sessions.map((session) => <PracticeSessionRow key={session.id} session={session} canManage={canManage} />)
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center text-[12px] text-muted-foreground">
            No practice on this day.
          </p>
        )}
      </div>
    </div>
  );
}
const RULES = [
  "Each student pays $75 to cover the expense of entry fees and preparation materials.",
  "Student shall attend all practices or let the coach know in advance if they will miss practices.",
  "Practice sessions will be scheduled as per the coach's availability.",
  "Parents/guardians should be willing and/or able to volunteer to coach events or help the team on the day of competitions.",
  "For each participating student, at least one parent must coach one event.",
  "We may travel for invitationals in various parts of Michigan/Ohio. Parents must be willing to drive/carpool kids to the events.",
  "Events usually have a common snack table for the teams. Contributions to the snack table are highly appreciated.",
  "Must attend the informational meeting on September 20 at 5:00 p.m. at Pittsfield library.",
  "Each member must compete in at least 2 events.",
];

export default function StudentSignupIntro({ school }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="h-2.5 w-full bg-brand-gradient" />
      <div className="p-5">
        <h2 className="font-heading text-xl font-extrabold tracking-tight">
          {school?.school_name || "Science Olympiad"} Science Olympiad
        </h2>
        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">2026–2027 season sign-up</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Hey! Welcome to {school?.school_name || "our"} Science Olympiad Team! Sign up for a wide range of fun science experiences to build your
          knowledge and skills with your friends!!
        </p>

        <p className="mt-4 text-sm font-semibold">Rules / Expectations</p>
        <ol className="mt-1.5 space-y-1 text-[13px] leading-relaxed text-muted-foreground">
          {RULES.map((rule, index) => (
            <li key={rule} className="flex gap-2">
              <span className="font-semibold text-foreground">{index + 1}.</span>
              <span>{rule}</span>
            </li>
          ))}
        </ol>

        <p className="mt-4 border-t border-border pt-3 text-[11px] text-destructive">* Indicates required question</p>
      </div>
    </div>
  );
}
import { Atom, Bot, ClipboardCheck, FileStack, Radio, Users } from "lucide-react";

const FEATURES = [
  {
    icon: Atom,
    title: "23 event workspaces",
    body: "Division B and Division C events pre-built with key topics, time blocks, partner limits and impound flags — cloned for every school.",
  },
  {
    icon: Bot,
    title: "Socratic AI event coach",
    body: "Guides binder building, build-log safety and lab reasoning. It asks before it tells, and it never hands over the answer.",
  },
  {
    icon: ClipboardCheck,
    title: "1-tap build verification",
    body: "Coaches see the photo, the AI rule-check badge and three safety checks, then approve or flag in one tap.",
  },
  {
    icon: Users,
    title: "Intake & auto-roster",
    body: "A shareable tryout form feeds a one-click roster builder that respects every time block and partner limit.",
  },
  {
    icon: FileStack,
    title: "Test repository",
    body: "Bulk-upload past tests and answer keys. AI extracts the questions, writes explanations and flags outdated ones.",
  },
  {
    icon: Radio,
    title: "Tournament command center",
    body: "Live impound, check-in and completion counters, CSV room schedules, and one-click alternate swaps.",
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Everything in one place</p>
        <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">The season runs itself. You coach.</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Practices, builds, volunteers, tests and tournament day all live in one workspace — with nudges that go out even when you forget.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="lift rounded-2xl border border-border bg-card p-5 shadow-soft">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-heading text-base font-bold">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
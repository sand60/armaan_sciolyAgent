import { GraduationCap, HeartHandshake, UserRound } from "lucide-react";

const STEPS = [
  { step: "01", title: "Open a workspace", body: "Name your team, pick Division B or C, and all 23 event workspaces plus a starter question bank are cloned instantly." },
  { step: "02", title: "Invite the team", body: "Share the tryout form. Students rank their events, parents volunteer, and one click builds a conflict-free roster." },
  { step: "03", title: "Coach all season", body: "Practices log themselves, coaches verify builds, and Monday–Friday automations keep every partnership moving." },
];

const ROLES = [
  { icon: GraduationCap, title: "Head Coach", body: "Readiness matrix, roster builder, test repository, tournament command center and every automation." },
  { icon: HeartHandshake, title: "Event Coach", body: "A mobile verification queue for the events they own, with photo previews and one-tap approve or flag." },
  { icon: UserRound, title: "Student", body: "My events, weekly goals, XP streaks, the Socratic AI coach, quizzes and the build/lab logger." },
];

export default function HowItWorks() {
  return (
    <section id="how" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">From signup to tournament day</p>
          <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">Three steps, then the app does the chasing.</h2>
          <div className="mt-8 space-y-5">
            {STEPS.map((item) => (
              <div key={item.step} className="flex gap-4">
                <span className="font-heading text-sm font-extrabold text-primary/60">{item.step}</span>
                <div>
                  <p className="font-heading text-base font-bold">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-1">
          {ROLES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient">
                  <Icon className="h-4 w-4 text-white" />
                </span>
                <p className="font-heading text-sm font-bold">{title}</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
import { Atom, Bot, BookOpen, Layers, LineChart, ListChecks } from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    title: "AI Flashcard Generator",
    body: "Turn your event rules and notes into ready-to-drill flashcard decks in seconds.",
  },
  {
    icon: ListChecks,
    title: "AI Quiz Generator",
    body: "Practice and mock tests with answer explanations built from your own study materials.",
  },
  {
    icon: BookOpen,
    title: "Custom Study Guides",
    body: "Structured, event-by-event study guides you can read, print and share with your team.",
  },
  {
    icon: Atom,
    title: "Event-Specific Study Materials",
    body: "All 23 Division B and Division C events, each with its own workspace and topic coverage.",
  },
  {
    icon: LineChart,
    title: "Team Progress Tracking",
    body: "Quiz scores, practice activity and readiness for every partnership in one dashboard.",
  },
  {
    icon: Bot,
    title: "AI Study Assistant",
    body: "A Socratic coach that asks the right questions instead of handing over the answer.",
  },
];

export default function WelcomeFeatures() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">What you get</p>
        <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
          Everything your team studies, in one place
        </h2>
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
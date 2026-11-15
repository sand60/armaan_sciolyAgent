import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATS = [
  { value: "23", label: "Event workspaces pre-loaded" },
  { value: "115", label: "Starter practice questions" },
  { value: "4", label: "Automated weekly nudges" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 grid-lines opacity-60" aria-hidden />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div className="animate-fade-up space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Built for Division B & C coaches
          </span>
          <h1 className="font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Run your whole <span className="text-gradient">Science Olympiad season</span> from one hub.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Every event workspace, a Socratic AI event coach, coach-verified builds, and a tournament-day command center.
            It is the assistant a solo coach never had.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link to="/start" search={{ plan: "single" }}>
                Start your season <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Sign in with Google</Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" /> School-isolated data
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4 text-primary" /> Monday–Friday automations
            </span>
            <span>$79 / season · cancel any time</span>
          </div>
        </div>

        <div className="animate-fade-in relative">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-float">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Readiness matrix</p>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">Live</span>
            </div>
            <div className="mt-4 space-y-2.5">
              {[
                { name: "Boomilever", partners: "Maya & Dev", tone: "bg-emerald-500", state: "On track" },
                { name: "Codebusters", partners: "Riya, Sam & Cole", tone: "bg-amber-500", state: "Needs attention" },
                { name: "Disease Detectives", partners: "Amara & Luis", tone: "bg-emerald-500", state: "On track" },
                { name: "Mission Possible", partners: "Jonah & Ruth", tone: "bg-rose-500", state: "Inactive" },
                { name: "Water Quality", partners: "Iris & Theo", tone: "bg-amber-500", state: "Needs attention" },
              ].map((row) => (
                <div key={row.name} className="flex items-center gap-3 rounded-xl border border-border/80 bg-background/60 px-3 py-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${row.tone}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{row.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{row.partners}</p>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">{row.state}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-secondary/70 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary-foreground">Next tournament</p>
              <p className="mt-1 text-sm font-bold">Sylvania Southview Invitational · Feb 20</p>
              <p className="text-[11px] text-muted-foreground">Self-scheduling opens Feb 7 at 8:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 border-t border-border px-4 py-8 sm:grid-cols-3 sm:px-6">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center sm:text-left">
            <p className="font-heading text-2xl font-extrabold text-primary">{stat.value}</p>
            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
import { cn } from "@/lib/utils";

export default function StatCard({ label, value, hint, icon: Icon, tone = "primary", delay = 0 }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    violet: "bg-sky-500/10 text-sky-400",
    sky: "bg-sky-500/10 text-sky-400",
    amber: "bg-amber-500/10 text-amber-400",
  };

  return (
    <div
      className="animate-fade-up rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tones[tone])}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-3 font-heading text-[26px] font-extrabold leading-none tracking-tight">{value}</p>
      {hint ? <p className="mt-1.5 text-[12px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
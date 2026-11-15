import { cn } from "@/lib/utils";

export default function StatTile({ label, value, hint, tone = "default", icon: Icon }) {
  const toneClass = {
    default: "bg-card",
    green: "bg-emerald-500/10 border-emerald-500/30",
    amber: "bg-amber-500/10 border-amber-500/30",
    red: "bg-rose-500/10 border-rose-500/30",
    blue: "bg-primary/5 border-primary/20",
  }[tone];

  return (
    <div className={cn("rounded-2xl border border-border p-4 shadow-soft", toneClass)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
      </div>
      <p className="mt-2 font-heading text-2xl font-extrabold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
import { CalendarDays, Flag, ShieldCheck, Trophy, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { TEAM_SEASON, SEASON_NOTE } from "@/lib/season-schedule";

const KIND_STYLE = {
  Virtual: { badge: "border-sky-500/30 bg-sky-500/15 text-sky-300", icon: Video },
  Invitational: { badge: "border-primary/30 bg-primary/15 text-primary", icon: Flag },
  Regionals: { badge: "border-amber-500/30 bg-amber-500/15 text-amber-300", icon: ShieldCheck },
  State: { badge: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300", icon: Trophy },
};

const shortDate = (iso) => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
};

export default function SeasonSchedule() {
  const today = new Date().toISOString().slice(0, 10);
  const nextId = TEAM_SEASON.find((entry) => entry.date >= today)?.id || null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 font-heading text-sm font-bold">
            <CalendarDays className="h-4 w-4 text-primary" /> Team season schedule
          </h2>
          <p className="mt-1 text-[12px] text-muted-foreground">{SEASON_NOTE}</p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
          {TEAM_SEASON.length} tournaments
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {TEAM_SEASON.map((entry) => {
          const style = KIND_STYLE[entry.kind] || KIND_STYLE.Invitational;
          const Icon = style.icon;
          const isNext = entry.id === nextId;
          return (
            <div
              key={entry.id}
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2.5",
                entry.mandatory
                  ? "border-amber-300 bg-amber-50/70"
                  : entry.kind === "State"
                    ? "border-primary/40 bg-primary/10"
                    : "border-border bg-background",
                isNext && "ring-2 ring-primary/25",
              )}
            >
              <div className="w-16 shrink-0 text-center">
                <p className="font-heading text-[13px] font-extrabold leading-tight">{shortDate(entry.date)}</p>
                <p className="text-[10px] font-semibold text-muted-foreground">{entry.date.slice(0, 4)}</p>
              </div>

              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-[13px] font-bold">
                  {entry.name}
                  <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", style.badge)}>
                    <Icon className="h-3 w-3" /> {entry.kind}
                  </span>
                  {entry.mandatory ? (
                    <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Mandatory
                    </span>
                  ) : null}
                  {entry.qualified ? (
                    <span className="rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                      If qualified
                    </span>
                  ) : null}
                  {isNext ? (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                      Next up
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  {entry.host}
                  {entry.date_label ? ` · ${entry.date_label}` : ""}
                </p>
                {entry.note ? <p className="mt-0.5 text-[11px] text-muted-foreground/90">{entry.note}</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
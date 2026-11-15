import { CalendarClock, ExternalLink } from "lucide-react";
import { daysUntil, formatDate, formatDateTime } from "@/lib/scioly";
import { Button } from "@/components/ui/button";

export default function TournamentBanner({ tournament }) {
  if (!tournament) return null;

  const days = daysUntil(`${tournament.tournament_date}T12:00:00`);
  const opens = tournament.self_schedule_open ? daysUntil(tournament.self_schedule_open) : null;
  const closes = tournament.self_schedule_close ? daysUntil(tournament.self_schedule_close) : null;

  const windowState =
    opens === null
      ? "Self-scheduling window not posted yet"
      : opens > 0
        ? `Self-scheduling opens in ${opens} day${opens === 1 ? "" : "s"} — ${formatDateTime(tournament.self_schedule_open)}`
        : closes !== null && closes >= 0
          ? `Self-scheduling is OPEN — closes ${formatDateTime(tournament.self_schedule_close)}`
          : "Self-scheduling has closed";

  return (
    <div className="overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-black via-[#0d1a0b] to-[#123d0d] p-5 text-white glow-primary">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Next tournament</p>
          <h2 className="font-heading text-xl font-extrabold tracking-tight">{tournament.tournament_name}</h2>
          <p className="text-sm text-white/80">{tournament.division_note}</p>
          <p className="inline-flex items-center gap-1.5 pt-1 text-xs font-medium text-primary/80">
            <CalendarClock className="h-3.5 w-3.5" /> {formatDate(tournament.tournament_date)} · {days !== null ? `${days} days out` : "date TBD"}
          </p>
        </div>
        {tournament.portal_url ? (
          <Button asChild size="sm" variant="secondary" className="bg-white/15 text-white hover:bg-white/25">
            <a href={tournament.portal_url} target="_blank" rel="noreferrer">
              Tournament portal <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        ) : null}
      </div>
      <p className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-white">{windowState}</p>
    </div>
  );
}
import { ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney, MONTHLY_PRICE, SEASON_PRICE } from "@/lib/plan-catalog";

const selectClass = "h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-sm";

export default function StepTeamInfo({ form, onChange, onNext, error }) {
  const teams = Math.max(1, Math.round(Number(form.team_count) || 1));
  const valid = form.school_name.trim().length >= 2 && form.coach_name.trim().length >= 2;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="school_name">School name</Label>
        <Input
          id="school_name"
          value={form.school_name}
          onChange={(event) => onChange({ school_name: event.target.value })}
          placeholder="Sylvania Southview Middle School"
          maxLength={120}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="division">Science Olympiad division</Label>
          <select
            id="division"
            value={form.division}
            onChange={(event) => onChange({ division: event.target.value })}
            className={selectClass}
          >
            <option value="Division B">Division B (middle school)</option>
            <option value="Division C">Division C (high school)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="team_count">Number of teams</Label>
          <Input
            id="team_count"
            type="number"
            min={1}
            max={10}
            value={form.team_count}
            onChange={(event) => onChange({ team_count: event.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="team_name">Team name (optional)</Label>
        <Input
          id="team_name"
          value={form.team_name}
          onChange={(event) => onChange({ team_name: event.target.value })}
          placeholder="Southview Varsity"
          maxLength={120}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="coach_name">Coach or team administrator's name</Label>
        <Input
          id="coach_name"
          value={form.coach_name}
          onChange={(event) => onChange({ coach_name: event.target.value })}
          placeholder="Jordan Ellis"
          maxLength={120}
          required
        />
      </div>

      <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
          <Info className="h-3.5 w-3.5" /> Each plan covers one team
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Every Science Olympiad team needs its own license. For {teams} {teams === 1 ? "team" : "teams"} that's{" "}
          <span className="font-bold text-foreground">
            {formatMoney(MONTHLY_PRICE * teams)}/month
          </span>{" "}
          or{" "}
          <span className="font-bold text-foreground">{formatMoney(SEASON_PRICE * teams)} one-time</span> for the season.
          You'll choose which plan on the next step.
        </p>
      </div>

      {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      <Button type="button" className="w-full" disabled={!valid} onClick={onNext}>
        Continue <ArrowRight className="ml-1.5 h-4 w-4" />
      </Button>
    </div>
  );
}
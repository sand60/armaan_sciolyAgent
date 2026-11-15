import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlanCards from "@/components/billing/PlanCards";
import { formatMoney, totalsFor } from "@/lib/plan-catalog";

export default function StepPlan({ plan, teams, onSelect, onNext, onBack }) {
  const totals = totalsFor(plan, teams);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-lg font-extrabold tracking-tight">Choose a subscription plan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          One plan per team — monthly and seasonal billing can't be combined in the same order.
        </p>
      </div>

      <PlanCards selected={plan} onSelect={onSelect} teams={teams} />

      <div className="flex items-center justify-between rounded-2xl border border-border bg-background/60 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          {totals.teams} {totals.teams === 1 ? "team" : "teams"} × {formatMoney(totals.unit)}
        </p>
        <p className="font-heading text-base font-extrabold">
          {formatMoney(totals.total)} <span className="text-xs font-semibold text-muted-foreground">{totals.recurring ? "/ month" : "one-time"}</span>
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" className="sm:w-40" onClick={onBack}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
        </Button>
        <Button type="button" className="flex-1" onClick={onNext}>
          Continue <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
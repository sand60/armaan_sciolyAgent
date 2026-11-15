import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney, PLANS } from "@/lib/plan-catalog";
import { cn } from "@/lib/utils";

export default function PlanCards({ selected, onSelect, teams = 1 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {PLANS.map((plan) => {
        const active = selected === plan.id;
        return (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-3xl border bg-card p-6 shadow-soft transition-colors",
              active ? "border-primary ring-1 ring-primary/40" : "border-border",
            )}
          >
            {plan.ribbon ? (
              <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground">
                {plan.ribbon}
              </span>
            ) : null}

            <h3 className="font-heading text-lg font-extrabold">{plan.name}</h3>
            <p className="text-xs font-medium text-muted-foreground">{plan.tagline}</p>

            <p className="mt-4 flex items-baseline gap-1.5">
              <span className="font-heading text-4xl font-extrabold tracking-tight">{formatMoney(plan.price)}</span>
              <span className="text-xs font-medium text-muted-foreground">{plan.cadence}</span>
            </p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{plan.billing}</p>

            <ul className="mt-5 flex-1 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>

            {teams > 1 ? (
              <p className="mt-4 rounded-xl border border-border bg-background/60 px-3 py-2 text-xs text-muted-foreground">
                {teams} teams · <span className="font-bold text-foreground">{formatMoney(plan.price * teams)}</span>{" "}
                {plan.recurring ? "per month" : "one-time"}
              </p>
            ) : null}

            {onSelect ? (
              <Button
                type="button"
                variant={active ? "default" : "outline"}
                className="mt-5"
                onClick={() => onSelect(plan.id)}
              >
                {active ? "Plan selected" : `Choose ${plan.name}`}
              </Button>
            ) : (
              <Button asChild variant={plan.recurring ? "outline" : "default"} className="mt-5">
                <Link to="/get-started" search={{ plan: plan.id }}>
                  Start with {plan.name}
                </Link>
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
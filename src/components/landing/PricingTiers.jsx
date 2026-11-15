import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/scioly";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLAN_IDS = { "Single Team": "single", "Varsity + JV": "varsity", "District Bundle": "district" };

export default function PricingTiers() {
  return (
    <section id="pricing" className="border-y border-border bg-card/50">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Annual school pricing</p>
          <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">One price for the whole season</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            No per-seat fees, no per-event add-ons. Every plan includes all 23 event workspaces, AI coaching and tournament day tools.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-3xl border bg-card p-6 shadow-soft",
                plan.featured ? "border-primary shadow-float ring-1 ring-primary/20" : "border-border",
              )}
            >
              {plan.featured ? (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground">
                  Most popular
                </span>
              ) : null}
              <h3 className="font-heading text-lg font-extrabold">{plan.name}</h3>
              <p className="text-xs font-medium text-muted-foreground">{plan.tagline}</p>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="font-heading text-4xl font-extrabold tracking-tight">${plan.price}</span>
                <span className="text-xs font-medium text-muted-foreground">/ season</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-6" variant={plan.featured ? "default" : "outline"}>
                <Link to="/start" search={{ plan: PLAN_IDS[plan.name] }}>
                  Start with {plan.name}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Start on a trial workspace immediately — your 23 events are cloned before you sign in.
        </p>
      </div>
    </section>
  );
}
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/plan-catalog";

export default function StepConfirmation({ result, paid }) {
  const { school, totals } = result;
  const Icon = paid ? Check : Clock;

  return (
    <div className="space-y-5">
      <div>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Icon className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-heading text-2xl font-extrabold tracking-tight">
          {paid ? `You're all set, ${school.school_name}` : `Welcome aboard, ${school.school_name}`}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {paid
            ? "Your payment is confirmed and your team workspace is active. A receipt is on its way to your inbox."
            : "Your registration is saved. We're waiting for the payment to clear — this page updates on its own."}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-background/60 p-4 text-sm">
        <div className="flex items-start justify-between gap-4 py-1.5">
          <span className="text-muted-foreground">School</span>
          <span className="font-semibold">{school.school_name}</span>
        </div>
        <div className="flex items-start justify-between gap-4 py-1.5">
          <span className="text-muted-foreground">Division</span>
          <span className="font-semibold">{school.division}</span>
        </div>
        <div className="flex items-start justify-between gap-4 py-1.5">
          <span className="text-muted-foreground">Plan</span>
          <span className="font-semibold">{totals.plan_name}</span>
        </div>
        <div className="flex items-start justify-between gap-4 py-1.5">
          <span className="text-muted-foreground">Teams purchased</span>
          <span className="font-semibold">{totals.teams}</span>
        </div>
        <div className="flex items-start justify-between gap-4 border-t border-border pt-3">
          <span className="text-muted-foreground">Total</span>
          <span className="font-heading font-extrabold">
            {formatMoney(totals.total)} {totals.recurring ? "/ month" : "one-time"}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4 py-1.5">
          <span className="text-muted-foreground">Payment status</span>
          <span className={paid ? "font-semibold text-primary" : "font-semibold text-muted-foreground"}>
            {paid ? "Paid" : "Awaiting payment"}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {paid
            ? "Sign in any time with your coach email to reach your dashboard."
            : "Access unlocks the moment Stripe confirms the payment — we never activate a workspace on an unconfirmed payment."}{" "}
          Team code: <span className="font-bold text-foreground">{school.school_id}</span>
        </p>
      </div>

      <Button asChild className="w-full" disabled={!paid}>
        <Link to="/dashboard">
          Go to my dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
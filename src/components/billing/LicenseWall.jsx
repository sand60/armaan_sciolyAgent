import { Link } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlanCards from "@/components/billing/PlanCards";

export default function LicenseWall({ school }) {
  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-float sm:p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <LockKeyhole className="h-6 w-6" />
        </span>
        <h1 className="mt-4 font-heading text-2xl font-extrabold tracking-tight">Your workspace is awaiting payment</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {school.school_name} · {school.division} · status: {school.subscription_status}. Study materials, AI generation
          and the team dashboard unlock as soon as the payment is confirmed for this team license.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/get-started">Finish secure checkout</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Back to the welcome page</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <PlanCards />
      </div>
    </div>
  );
}
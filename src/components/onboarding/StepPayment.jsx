import { ArrowLeft, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { startCheckout } from "@/lib/billing-fns";
import { formatMoney, totalsFor } from "@/lib/plan-catalog";

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

export default function StepPayment({ form, onBack, canceled }) {
  const startCheckoutFn = useServerFn(startCheckout);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const totals = totalsFor(form.plan, form.team_count);

  async function pay() {
    setError("");
    setBusy(true);

    // Stripe Checkout must be a top-level page: in a framed preview a tab is
    // opened synchronously inside the click so popup blockers keep it.
    const isFramed = window.self !== window.top;
    const tab = isFramed ? window.open("", "_blank") : null;
    if (isFramed && !tab) {
      setError("Allow popups to continue to secure checkout.");
      setBusy(false);
      return;
    }
    if (tab) tab.opener = null;

    try {
      const { url } = await startCheckoutFn({
        data: {
          school_name: form.school_name.trim(),
          division: form.division,
          team_count: Math.round(Number(form.team_count)),
          team_name: form.team_name.trim(),
          coach_name: form.coach_name.trim(),
          coach_email: form.coach_email.trim().toLowerCase(),
          coach_phone: form.coach_phone.trim(),
          plan: form.plan,
        },
      });
      if (tab) tab.location.replace(url);
      else window.location.assign(url);
    } catch (err) {
      tab?.close();
      setError(err?.message || "Could not start secure checkout. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-lg font-extrabold tracking-tight">Review &amp; payment</h2>
        <p className="mt-1 text-sm text-muted-foreground">The final amount is confirmed before you pay.</p>
      </div>

      <div className="rounded-2xl border border-border bg-background/60 p-4">
        <Row label="School" value={form.school_name.trim()} />
        <Row label="Division" value={form.division} />
        <Row label="Teams" value={`${totals.teams}`} />
        <Row label="Plan" value={totals.plan.name} />
        <Row label="Billing" value={totals.plan.billing} />
        <Row label="Price per team" value={`${formatMoney(totals.unit)} ${totals.recurring ? "/ month" : "/ season"}`} />
        <div className="mt-2 flex items-end justify-between border-t border-border pt-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {totals.recurring ? "Charged monthly" : "One-time total"}
          </span>
          <span className="font-heading text-2xl font-extrabold tracking-tight">{formatMoney(totals.total)}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
          <ShieldCheck className="h-3.5 w-3.5" /> Secure Stripe checkout
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          You'll enter payment details on Stripe's secure page. This app never sees or stores card numbers or security
          codes, and your workspace only unlocks once Stripe confirms the payment.
        </p>
      </div>

      {canceled ? (
        <p className="rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">
          Checkout was cancelled — nothing was charged. Your details are saved, so you can pick up right here.
        </p>
      ) : null}
      {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" className="sm:w-40" onClick={onBack} disabled={busy}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
        </Button>
        <Button type="button" className="flex-1" onClick={pay} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
          {busy ? "Opening secure checkout..." : `Pay ${formatMoney(totals.total)} securely`}
        </Button>
      </div>
    </div>
  );
}
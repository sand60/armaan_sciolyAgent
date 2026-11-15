import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import MarketingNav from "@/components/landing/MarketingNav";
import SiteFooter from "@/components/landing/SiteFooter";
import WizardProgress from "@/components/onboarding/WizardProgress";
import StepTeamInfo from "@/components/onboarding/StepTeamInfo";
import StepPlan from "@/components/onboarding/StepPlan";
import StepContact from "@/components/onboarding/StepContact";
import StepVerify from "@/components/onboarding/StepVerify";
import StepPayment from "@/components/onboarding/StepPayment";

export const Route = createFileRoute("/get-started")({
  ssr: false,
  validateSearch: (search) => ({
    plan: ["monthly", "season"].includes(search.plan) ? search.plan : undefined,
    canceled: search.canceled === "1" ? "1" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Create your account — SciOlyCoachAgent" },
      {
        name: "description",
        content: "Register your Science Olympiad team, choose a plan and pay securely for your AI study workspace.",
      },
    ],
  }),
  component: GetStartedPage,
});

const EMPTY_FORM = {
  school_name: "",
  division: "Division B",
  team_count: 1,
  team_name: "",
  coach_name: "",
  plan: "monthly",
  coach_email: "",
  coach_phone: "",
  password: "",
  confirm: "",
};

function GetStartedPage() {
  const search = Route.useSearch();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ ...EMPTY_FORM, plan: search.plan || "monthly" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (patch) => setForm((current) => ({ ...current, ...patch }));
  const stepNumber = step === "verify" ? 3 : step;

  async function createAccount() {
    setError("");
    setBusy(true);
    try {
      if (form.password.length < 8) throw new Error("Choose a password with at least 8 characters.");
      if (form.password !== form.confirm) throw new Error("The two passwords don't match.");
      await base44.auth.register({
        email: form.coach_email.trim().toLowerCase(),
        password: form.password,
      });
      setStep("verify");
    } catch (err) {
      const message = err?.message || "Could not create the account.";
      setError(
        /already|exists|registered/i.test(message)
          ? "That email already has an account. Sign in instead, then finish your team registration."
          : message,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Registration</p>
            <h1 className="mt-1 font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
              Create your team account
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-float sm:p-7">
          <WizardProgress step={stepNumber} />

          <div className="mt-6">
            {step === 1 ? (
              <StepTeamInfo
                form={form}
                onChange={update}
                error=""
                onNext={() => {
                  setError("");
                  setStep(2);
                }}
              />
            ) : null}

            {step === 2 ? (
              <StepPlan
                plan={form.plan}
                teams={Math.round(Number(form.team_count) || 1)}
                onSelect={(plan) => update({ plan })}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            ) : null}

            {step === 3 ? (
              <StepContact
                form={form}
                onChange={update}
                error={error}
                busy={busy}
                onBack={() => setStep(2)}
                onSubmit={createAccount}
              />
            ) : null}

            {step === "verify" ? (
              <StepVerify
                email={form.coach_email.trim().toLowerCase()}
                onBack={() => setStep(3)}
                onVerified={() => {
                  setError("");
                  setStep(4);
                }}
              />
            ) : null}

            {step === 4 ? (
              <StepPayment form={form} canceled={search.canceled === "1"} onBack={() => setStep(3)} />
            ) : null}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          One plan covers one team · card details are handled entirely by Stripe Checkout
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import MarketingNav from "@/components/landing/MarketingNav";
import SiteFooter from "@/components/landing/SiteFooter";
import StepConfirmation from "@/components/onboarding/StepConfirmation";
import { getCheckoutStatus } from "@/lib/billing-fns";

export const Route = createFileRoute("/billing/success")({
  ssr: false,
  validateSearch: (search) => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({ meta: [{ title: "Payment confirmation — SciOlyCoachAgent" }] }),
  loader: () => getCheckoutStatus(),
  component: SuccessPage,
});

function planNameFor(plan) {
  return plan === "Monthly" ? "Monthly" : "Full Science Olympiad Season";
}

function SuccessPage() {
  const initial = Route.useLoaderData();
  const refresh = useServerFn(getCheckoutStatus);
  const { data } = useQuery({
    queryKey: ["checkout-status"],
    queryFn: () => refresh(),
    initialData: initial,
    refetchInterval: (query) => (query.state.data?.paid ? false : 3000),
  });

  const licenses = data?.licenses ?? [];
  const school = data?.school;

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        {!school || !licenses.length ? (
          <div className="rounded-3xl border border-border bg-card p-7 text-center shadow-float">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight">We couldn't find that registration</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with the coach email you registered with and finish the team setup.
            </p>
            <Link to="/get-started" className="mt-5 inline-block font-semibold text-primary hover:underline">
              Back to registration
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-6 shadow-float sm:p-8">
            <StepConfirmation
              paid={Boolean(data.paid)}
              result={{
                school,
                totals: {
                  plan_name: planNameFor(licenses[0]?.plan),
                  teams: licenses.length,
                  total: licenses.reduce((sum, license) => sum + (license.amount || 0), 0),
                  recurring: licenses[0]?.plan === "Monthly",
                },
              }}
            />
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import MarketingNav from "@/components/landing/MarketingNav";
import WelcomeHero from "@/components/landing/WelcomeHero";
import WelcomeFeatures from "@/components/landing/WelcomeFeatures";
import PlanCards from "@/components/billing/PlanCards";
import SiteFooter from "@/components/landing/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SciOlyCoachAgent — AI-powered Science Olympiad study assistant" },
      {
        name: "description",
        content:
          "Sign in to your team's AI-powered Science Olympiad study assistant: AI flashcards, quizzes, custom study guides, event-specific materials and team progress tracking.",
      },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <main>
        <WelcomeHero />
        <WelcomeFeatures />

        <section id="pricing" className="border-y border-border bg-card/40">
          <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Pricing</p>
              <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
                One license per team. Pick your billing.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Coaching more than one team? Add a license for each team — the total is calculated for you before
                checkout.
              </p>
            </div>

            <div className="mt-10">
              <PlanCards />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
import { Link } from "@tanstack/react-router";
import { LogIn, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOGO_URL } from "@/lib/brand";
import { useAuth } from "@/lib/AuthContext";

export default function WelcomeHero() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-4xl px-4 py-16 text-center sm:px-6 lg:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          <Sparkles className="h-3.5 w-3.5" /> AI-powered Science Olympiad study
        </span>

        <img src={LOGO_URL} alt="" className="mx-auto mt-7 h-16 w-16 rounded-2xl border border-primary/30 bg-black object-contain p-1 shadow-float" />

        <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          Welcome to <span className="text-gradient">SciOlyCoachAgent</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Your team's AI-powered Science Olympiad study assistant.
        </p>

        <div className="mx-auto mt-9 grid max-w-2xl gap-3 sm:grid-cols-2">
          <Button asChild size="lg" className="h-16 rounded-2xl text-base font-bold glow-primary">
            <Link to="/login">
              <LogIn className="mr-2 h-5 w-5" /> Sign In
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-16 rounded-2xl border-primary/40 text-base font-bold hover:bg-primary/10"
          >
            <Link to="/get-started">
              <UserPlus className="mr-2 h-5 w-5" /> Create an Account
            </Link>
          </Button>
        </div>

        {isAuthenticated ? (
          <p className="mt-5 text-sm text-muted-foreground">
            You're signed in —{" "}
            <Link to="/dashboard" className="font-semibold text-primary hover:underline">
              open your team dashboard
            </Link>
          </p>
        ) : (
          <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> One plan covers one team · secure checkout · cancel monthly
            renewals any time
          </p>
        )}
      </div>
    </section>
  );
}
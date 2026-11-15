import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Copy, Loader2, Sparkles } from "lucide-react";
import { startSchoolTrial } from "@/lib/workspace-fns";
import { PLANS } from "@/lib/scioly";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MarketingNav from "@/components/landing/MarketingNav";
import SiteFooter from "@/components/landing/SiteFooter";

const PLAN_NAMES = { single: "Single Team", varsity: "Varsity + JV", district: "District Bundle" };

export const Route = createFileRoute("/start")({
  validateSearch: (search) => ({
    plan: ["single", "varsity", "district"].includes(search.plan) ? search.plan : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Open your SciOlyCoachAgent workspace" },
      { name: "description", content: "Create your school workspace and clone all 23 Science Olympiad event workspaces in seconds." },
    ],
  }),
  component: StartPage,
});

function StartPage() {
  const search = Route.useSearch();
  const createWorkspace = useServerFn(startSchoolTrial);
  const [form, setForm] = useState({
    school_name: "",
    division: "Division B",
    head_coach_email: "",
    plan: search.plan || "single",
  });
  const [state, setState] = useState({ status: "idle", error: "", school: null, copied: false });

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setState({ status: "loading", error: "", school: null, copied: false });
    try {
      const result = await createWorkspace({
        data: {
          school_name: form.school_name.trim(),
          division: form.division,
          head_coach_email: form.head_coach_email.trim(),
          plan: PLAN_NAMES[form.plan] || "Single Team",
        },
      });
      setState({ status: "done", error: "", school: result.school, copied: false });
    } catch (error) {
      setState({ status: "error", error: error?.message || "Could not create the workspace.", school: null, copied: false });
    }
  }

  async function copyLink() {
    if (!state.school) return;
    await navigator.clipboard.writeText(`${window.location.origin}/apply?school=${state.school.school_id}`);
    setState((current) => ({ ...current, copied: true }));
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <main className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
        {state.status === "done" && state.school ? (
          <div className="rounded-3xl border border-border bg-card p-7 shadow-float">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Check className="h-5 w-5" />
            </span>
            <h1 className="mt-4 font-heading text-2xl font-extrabold tracking-tight">Your workspace is ready</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {state.school.school_name} — all 23 event workspaces, the Sylvania tournament and 115 starter questions are cloned.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">School code</p>
                <p className="mt-1 font-heading text-lg font-extrabold">{state.school.school_id}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Head coach</p>
                <p className="mt-1 truncate text-sm font-semibold">{state.school.head_coach_email}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Share the tryout form</p>
              <p className="mt-1 break-all text-sm text-muted-foreground">{`${typeof window !== "undefined" ? window.location.origin : ""}/apply?school=${state.school.school_id}`}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={copyLink}>
                {state.copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
                {state.copied ? "Copied" : "Copy link"}
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/login">
                  Sign in with Google <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/apply" search={{ school: state.school.school_id }}>
                  Preview the form
                </Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Sign in with {state.school.head_coach_email} — that email is the head coach account for this workspace.
            </p>
          </div>
        ) : (
          <>
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Season setup
              </span>
              <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight">Open your school workspace</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We clone all 23 event workspaces for your division, the Sylvania invitational and a starter question bank before you sign in.
              </p>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="space-y-1.5">
                <Label htmlFor="school_name">School / team name</Label>
                <Input id="school_name" value={form.school_name} onChange={update("school_name")} placeholder="Sylvania Southview Science Olympiad" required minLength={2} maxLength={120} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="division">Division</Label>
                  <select id="division" value={form.division} onChange={update("division")} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm">
                    <option value="Division B">Division B (middle school)</option>
                    <option value="Division C">Division C (high school)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="plan">Plan</Label>
                  <select id="plan" value={form.plan} onChange={update("plan")} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm">
                    {PLANS.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} — ${plan.price}/season
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="coach">Head coach email (Google account)</Label>
                <Input id="coach" type="email" value={form.head_coach_email} onChange={update("head_coach_email")} placeholder="coach@school.org" required />
              </div>

              {state.error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p> : null}

              <Button type="submit" className="w-full" disabled={state.status === "loading"}>
                {state.status === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create workspace
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Trial workspace — you only pay when you subscribe. Already have one? <Link to="/login" className="font-semibold text-primary">Sign in</Link>
              </p>
            </form>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
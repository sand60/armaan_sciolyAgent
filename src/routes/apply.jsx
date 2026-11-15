import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { getApplyForm, submitApplication } from "@/lib/workspace-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/apply")({
  validateSearch: (search) => ({ school: typeof search.school === "string" ? search.school : undefined }),
  loaderDeps: ({ search }) => ({ school: search.school }),
  loader: ({ deps }) => getApplyForm({ data: { code: deps.school } }),
  head: () => ({
    meta: [
      { title: "Science Olympiad tryout & event preference form" },
      { name: "description", content: "Rank your Science Olympiad events and volunteer as a parent coach." },
    ],
  }),
  component: ApplyPage,
});

const EMPTY = {
  student_name: "",
  grade: "7",
  student_email: "",
  parent_name: "",
  parent_email: "",
  parent_whatsapp_phone: "",
  parent_volunteer_interest: false,
  top_choice_1: "",
  top_choice_2: "",
  top_choice_3: "",
  backup_choice_4: "",
  preferred_partner: "",
};

function ApplyPage() {
  const data = Route.useLoaderData();
  const submit = useServerFn(submitApplication);
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState({ status: "idle", error: "" });
  const events = data?.events || [];

  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));

  async function onSubmit(event) {
    event.preventDefault();
    setState({ status: "loading", error: "" });
    try {
      await submit({
        data: {
          ...form,
          code: data?.school?.school_id,
          student_name: form.student_name.trim(),
          parent_name: form.parent_name.trim(),
        },
      });
      setState({ status: "done", error: "" });
    } catch (error) {
      setState({ status: "error", error: error?.message || "Could not submit the form." });
    }
  }

  if (state.status === "done") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4 py-16">
        <div className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-float">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-heading text-2xl font-extrabold tracking-tight">Application received</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {data?.school?.school_name || "Your coach"} will place you on events after tryouts. Check your email for the practice quiz link.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <div className="max-w-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{data?.school?.school_name || "Science Olympiad"}</p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight">Tryout & event preference form</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {data?.school?.division || "Division B"} team. Rank the events you want most — the roster builder uses your tryout score first, then these choices,
          and never double-books you in the same time block.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="student_name">Student name</Label>
            <Input id="student_name" value={form.student_name} onChange={update("student_name")} required minLength={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="grade">Grade</Label>
            <select id="grade" value={form.grade} onChange={update("grade")} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm">
              {["6", "7", "8", "9"].map((grade) => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="student_email">Student email</Label>
          <Input id="student_email" type="email" value={form.student_email} onChange={update("student_email")} required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="parent_name">Parent name</Label>
            <Input id="parent_name" value={form.parent_name} onChange={update("parent_name")} required minLength={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="parent_email">Parent email</Label>
            <Input id="parent_email" type="email" value={form.parent_email} onChange={update("parent_email")} required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="parent_phone">Parent WhatsApp phone</Label>
          <Input id="parent_phone" value={form.parent_whatsapp_phone} onChange={update("parent_whatsapp_phone")} placeholder="+1 419 555 0100" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["top_choice_1", "1st choice"],
            ["top_choice_2", "2nd choice"],
            ["top_choice_3", "3rd choice"],
            ["backup_choice_4", "Backup choice"],
          ].map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={key}>{label}</Label>
              <select
                id={key}
                value={form[key]}
                onChange={update(key)}
                required={key === "top_choice_1"}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
              >
                <option value="">Select an event</option>
                {events.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="preferred_partner">Preferred partner (optional)</Label>
          <Input id="preferred_partner" value={form.preferred_partner} onChange={update("preferred_partner")} placeholder="Classmate name" />
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-border bg-background/60 p-3">
          <input type="checkbox" checked={form.parent_volunteer_interest} onChange={update("parent_volunteer_interest")} className="mt-0.5 h-4 w-4 rounded border-input" />
          <span className="text-sm">
            <span className="font-semibold">My parent can volunteer as an event coach</span>
            <span className="block text-xs text-muted-foreground">They will get the 1-tap build verification queue for their event.</span>
          </span>
        </label>

        {state.error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p> : null}

        <Button type="submit" className="w-full" disabled={state.status === "loading"}>
          {state.status === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Submit application
        </Button>
      </form>
    </main>
  );
}
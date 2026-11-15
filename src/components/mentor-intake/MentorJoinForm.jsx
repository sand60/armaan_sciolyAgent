import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitMentorJoin } from "@/lib/workspace-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const EMPTY = {
  mentor_name: "",
  mentor_email: "",
  whatsapp_phone: "",
  child_name: "",
  volunteer_type: "Parent volunteer",
  availability_window: "",
};

export default function MentorJoinForm({ school, events = [] }) {
  const submit = useServerFn(submitMentorJoin);
  const [form, setForm] = useState(EMPTY);
  const [picked, setPicked] = useState([]);
  const [state, setState] = useState({ status: "idle", error: "" });

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  function toggleEvent(name) {
    setPicked((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : current.length >= 4 ? current : [...current, name],
    );
  }

  async function onSubmit(event) {
    event.preventDefault();
    setState({ status: "loading", error: "" });
    try {
      await submit({
        data: { ...form, mentor_name: form.mentor_name.trim(), code: school?.school_id, preferred_events: picked },
      });
      setState({ status: "done", error: "" });
    } catch (error) {
      setState({ status: "error", error: error?.message || "Could not submit the form." });
    }
  }

  if (state.status === "done") {
    return (
      <div className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-float">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-heading text-xl font-extrabold tracking-tight">Thanks for volunteering</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {school?.school_name || "The head coach"} will review your events, confirm your background check and add you to the practice schedule.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="mentor_name">Your name</Label>
          <Input id="mentor_name" value={form.mentor_name} onChange={update("mentor_name")} required minLength={2} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mentor_email">Email</Label>
          <Input id="mentor_email" type="email" value={form.mentor_email} onChange={update("mentor_email")} required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="mentor_phone">WhatsApp phone (optional)</Label>
          <Input id="mentor_phone" value={form.whatsapp_phone} onChange={update("whatsapp_phone")} placeholder="+1 419 555 0100" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="child_name">Student's name (optional)</Label>
          <Input id="child_name" value={form.child_name} onChange={update("child_name")} placeholder="If you are a parent" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="volunteer_type">How you help</Label>
          <select
            id="volunteer_type"
            value={form.volunteer_type}
            onChange={update("volunteer_type")}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
          >
            {["Parent volunteer", "Community coach", "Alumni coach", "Teacher"].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="availability">Availability (optional)</Label>
          <Input id="availability" value={form.availability_window} onChange={update("availability_window")} placeholder="Weeknights after 6pm" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Events you can coach (up to 4)</Label>
        {events.length ? (
          <div className="flex flex-wrap gap-2">
            {events.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => toggleEvent(name)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                  picked.includes(name)
                    ? "border-primary bg-secondary text-primary"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No event list is available yet — the coach will assign events to you.</p>
        )}
        <p className="text-[11px] text-muted-foreground">{picked.length}/4 selected</p>
      </div>

      {state.error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p> : null}

      <Button type="submit" className="w-full" disabled={state.status === "loading"}>
        {state.status === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Sign up as a coach
      </Button>
    </form>
  );
}
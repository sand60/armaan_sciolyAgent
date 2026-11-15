import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitStudentSignup, submitPublicStudentSignup } from "@/lib/workspace-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import FormQuestion from "@/components/intake/FormQuestion";
import StudentSignupIntro from "@/components/intake/StudentSignupIntro";
import StudentEventGroups from "@/components/intake/StudentEventGroups";

const DIVISIONS = [
  { value: "Division B", hint: "Middle school", grades: ["6th", "7th", "8th"] },
  { value: "Division C", hint: "High school", grades: ["9th", "10th", "11th", "12th"] },
];

const EMPTY = {
  student_name: "",
  grade: "",
  student_email: "",
  student_phone: "",
  parent_name: "",
  parent_email: "",
  parent_whatsapp_phone: "",
  parent_2_name: "",
  parent_2_email: "",
  parent_2_phone: "",
  parent_coach_events: "",
};

export default function StudentJoinForm({ school, eventsByDivision, code }) {
  const submitCoach = useServerFn(submitStudentSignup);
  const submitPublic = useServerFn(submitPublicStudentSignup);
  const isPublic = Boolean(code);
  const [division, setDivision] = useState("Division B");
  const [form, setForm] = useState(EMPTY);
  const [picked, setPicked] = useState([]);
  const [agreed, setAgreed] = useState(false);
  const [state, setState] = useState({ status: "idle", error: "" });

  const events = eventsByDivision?.[division] || [];
  const grades = DIVISIONS.find((item) => item.value === division)?.grades || [];
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  function chooseDivision(value) {
    setDivision(value);
    setForm((current) => ({ ...current, grade: "" }));
    setPicked([]);
  }

  function toggleEvent(name) {
    setPicked((current) => (current.includes(name) ? current.filter((item) => item !== name) : [...current, name]));
  }

  function clearEvents(names) {
    setPicked((current) => current.filter((name) => !names.includes(name)));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setState({ status: "loading", error: "" });
    try {
      const submit = isPublic ? submitPublic : submitCoach;
      await submit({
        data: {
          ...(isPublic ? { code } : {}),
          student_name: form.student_name.trim(),
          grade: form.grade,
          student_email: form.student_email.trim(),
          student_phone: form.student_phone.trim(),
          parent_name: form.parent_name.trim(),
          parent_email: form.parent_email.trim(),
          parent_whatsapp_phone: form.parent_whatsapp_phone.trim(),
          parent_2_name: form.parent_2_name.trim(),
          parent_2_email: form.parent_2_email.trim(),
          parent_2_phone: form.parent_2_phone.trim(),
          parent_coach_events: form.parent_coach_events.trim(),
          rules_acknowledged: agreed,
          division,
          event_choices: picked,
        },
      });
      setState({ status: "done", error: "" });
    } catch (error) {
      setState({ status: "error", error: error?.message || "Could not submit the form." });
    }
  }

  if (state.status === "done") {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-float">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-heading text-xl font-extrabold tracking-tight">Sign-up received</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {form.student_name} is registered for {division} with {picked.length} event{picked.length === 1 ? "" : "s"}.{" "}
          {isPublic ? "Your coach will see the sign-up and follow up by email." : "They now appear in your tryout applications list."}
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setForm(EMPTY);
            setPicked([]);
            setAgreed(false);
            setState({ status: "idle", error: "" });
          }}
        >
          Sign up another student
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <StudentSignupIntro school={school} />

      <FormQuestion label="Division" required hint="This decides which events you can pick from.">
        <div className="grid gap-2 sm:grid-cols-2">
          {DIVISIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
                division === option.value ? "border-primary bg-secondary text-primary" : "border-border bg-background hover:bg-muted",
              )}
            >
              <input
                type="radio"
                name="division"
                checked={division === option.value}
                onChange={() => chooseDivision(option.value)}
                className="h-4 w-4 accent-primary"
              />
              <span className="font-semibold">{option.value}</span>
              <span className="text-[11px] text-muted-foreground">{option.hint}</span>
            </label>
          ))}
        </div>
      </FormQuestion>

      <FormQuestion label="Student full name" required>
        <Input value={form.student_name} onChange={update("student_name")} placeholder="Your answer" required minLength={2} />
      </FormQuestion>

      <FormQuestion label="Grade in Fall 2026" required>
        <div className="flex flex-wrap gap-2">
          {grades.map((grade) => (
            <label
              key={grade}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                form.grade === grade ? "border-primary bg-secondary text-primary" : "border-border bg-background hover:bg-muted",
              )}
            >
              <input type="radio" name="grade" checked={form.grade === grade} onChange={() => setForm((c) => ({ ...c, grade }))} className="h-4 w-4 accent-primary" required />
              {grade}
            </label>
          ))}
        </div>
      </FormQuestion>

      <FormQuestion label="Student email" required>
        <Input type="email" value={form.student_email} onChange={update("student_email")} placeholder="Your answer" required />
      </FormQuestion>

      <FormQuestion label="Student phone number" hint="Optional — only if they have one.">
        <Input value={form.student_phone} onChange={update("student_phone")} placeholder="+1 734 555 0100" />
      </FormQuestion>

      <FormQuestion label="Parent 1 name" required>
        <Input value={form.parent_name} onChange={update("parent_name")} placeholder="Your answer" required minLength={2} />
      </FormQuestion>
      <FormQuestion label="Parent 1 email" required>
        <Input type="email" value={form.parent_email} onChange={update("parent_email")} placeholder="Your answer" required />
      </FormQuestion>
      <FormQuestion label="Parent 1 phone number" required>
        <Input value={form.parent_whatsapp_phone} onChange={update("parent_whatsapp_phone")} placeholder="+1 734 555 0100" required minLength={7} />
      </FormQuestion>

      <FormQuestion label="Parent 2 name" hint="Optional">
        <Input value={form.parent_2_name} onChange={update("parent_2_name")} placeholder="Your answer" />
      </FormQuestion>
      <FormQuestion label="Parent 2 email" hint="Optional">
        <Input type="email" value={form.parent_2_email} onChange={update("parent_2_email")} placeholder="Your answer" />
      </FormQuestion>
      <FormQuestion label="Parent 2 phone number" hint="Optional">
        <Input value={form.parent_2_phone} onChange={update("parent_2_phone")} placeholder="Your answer" />
      </FormQuestion>

      <div>
        <p className="mb-2 text-sm font-semibold">
          Events interested in — {division}
          <span className="ml-0.5 text-destructive">*</span>
        </p>
        <StudentEventGroups events={events} picked={picked} onToggle={toggleEvent} onClear={clearEvents} />
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {picked.length} selected — pick as many as you like; at least 2 events are required to compete.
        </p>
      </div>

      <FormQuestion label="Event(s) a parent can coach / co-coach" required>
        <Input value={form.parent_coach_events} onChange={update("parent_coach_events")} placeholder="Your answer" required minLength={2} />
      </FormQuestion>

      <FormQuestion label="I have read the rules and agree to them" required>
        <div className="flex flex-wrap gap-2">
          {[true, false].map((value) => (
            <label
              key={String(value)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                agreed === value ? "border-primary bg-secondary text-primary" : "border-border bg-background hover:bg-muted",
              )}
            >
              <input type="radio" name="agreed" checked={agreed === value} onChange={() => setAgreed(value)} className="h-4 w-4 accent-primary" required />
              {value ? "Yes" : "No"}
            </label>
          ))}
        </div>
      </FormQuestion>

      {state.error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p> : null}

      <Button type="submit" className="w-full" disabled={state.status === "loading" || !picked.length || !agreed}>
        {state.status === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Submit
      </Button>
      {!picked.length ? <p className="text-center text-[11px] text-muted-foreground">Pick at least one event to submit.</p> : null}
      {picked.length && !agreed ? <p className="text-center text-[11px] text-muted-foreground">The family must agree to the rules to submit.</p> : null}
    </form>
  );
}
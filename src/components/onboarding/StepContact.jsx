import { ArrowLeft, ArrowRight, Lock, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Field({ id, label, icon: Icon, ...props }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input id={id} className="h-11 pl-10" {...props} />
      </div>
    </div>
  );
}

export default function StepContact({ form, onChange, onSubmit, onBack, error, busy }) {
  const valid =
    form.coach_name.trim().length >= 2 &&
    EMAIL_RE.test(form.coach_email.trim()) &&
    form.coach_phone.replace(/\D/g, "").length >= 7 &&
    form.password.length >= 8 &&
    form.password === form.confirm;

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (valid) onSubmit();
      }}
    >
      <div>
        <h2 className="font-heading text-lg font-extrabold tracking-tight">Contact information</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This email becomes the coach account for your team — you'll sign in with it.
        </p>
      </div>

      <Field
        id="coach_name_full"
        label="Coach or administrator's full name"
        icon={User}
        value={form.coach_name}
        onChange={(event) => onChange({ coach_name: event.target.value })}
        placeholder="Jordan Ellis"
        maxLength={120}
        autoComplete="name"
        required
      />
      <Field
        id="coach_email"
        label="Email address"
        icon={Mail}
        type="email"
        value={form.coach_email}
        onChange={(event) => onChange({ coach_email: event.target.value })}
        placeholder="coach@school.org"
        autoComplete="email"
        maxLength={160}
        required
      />
      <Field
        id="coach_phone"
        label="Phone number"
        icon={Phone}
        type="tel"
        value={form.coach_phone}
        onChange={(event) => onChange({ coach_phone: event.target.value })}
        placeholder="(419) 555-0134"
        autoComplete="tel"
        maxLength={40}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="password"
          label="Password"
          icon={Lock}
          type="password"
          value={form.password}
          onChange={(event) => onChange({ password: event.target.value })}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
        />
        <Field
          id="confirm"
          label="Confirm password"
          icon={Lock}
          type="password"
          value={form.confirm}
          onChange={(event) => onChange({ confirm: event.target.value })}
          placeholder="Repeat password"
          autoComplete="new-password"
          required
        />
      </div>

      {form.password && form.password !== form.confirm ? (
        <p className="text-xs text-destructive">Passwords do not match yet.</p>
      ) : null}
      {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" className="sm:w-40" onClick={onBack} disabled={busy}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
        </Button>
        <Button type="submit" className="flex-1" disabled={!valid || busy}>
          {busy ? "Creating your account..." : "Create account"}
          {busy ? null : <ArrowRight className="ml-1.5 h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
}
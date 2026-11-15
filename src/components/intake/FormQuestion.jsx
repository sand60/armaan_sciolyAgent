export default function FormQuestion({ label, required, hint, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <p className="text-sm font-semibold">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p> : null}
      <div className="mt-2.5">{children}</div>
    </div>
  );
}
import { cn } from "@/lib/utils";

const STEPS = ["Team", "Plan", "Contact", "Payment", "Done"];

export default function WizardProgress({ step }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3 text-[11px] font-bold uppercase tracking-[0.14em]">
      {STEPS.map((label, index) => {
        const number = index + 1;
        const done = number < step;
        const current = number === step;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border text-[10px]",
                done && "border-primary bg-primary text-primary-foreground",
                current && "border-primary bg-primary/15 text-primary",
                !done && !current && "border-border text-muted-foreground",
              )}
            >
              {number}
            </span>
            <span className={cn(current || done ? "text-foreground" : "text-muted-foreground")}>{label}</span>
            {index < STEPS.length - 1 ? <span className="mx-1 h-px w-4 bg-border" aria-hidden /> : null}
          </li>
        );
      })}
    </ol>
  );
}
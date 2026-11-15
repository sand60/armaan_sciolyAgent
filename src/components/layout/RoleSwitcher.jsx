import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { setAppRole } from "@/lib/workspace-fns";
import { cn } from "@/lib/utils";

const ROLES = [
  { value: "Head Coach", label: "Head coach", home: "/dashboard" },
  { value: "Event Mentor", label: "Coach", home: "/rules" },
  { value: "Student", label: "Student", home: "/study" },
];

export default function RoleSwitcher({ currentRole, onDone }) {
  const save = useServerFn(setAppRole);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const chosen = ROLES.find((role) => role.value === selected);

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await save({ data: { role: chosen.value, code } });
      await queryClient.invalidateQueries({ queryKey: ["workspace"] });
      toast.success(`You're now in the ${chosen.label} view`);
      onDone?.();
      navigate({ to: chosen.home });
    } catch (err) {
      setError(err?.message || "That code didn't work.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">View as</p>
      <div className="grid grid-cols-3 gap-1.5">
        {ROLES.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => {
              setSelected(role.value);
              setCode("");
              setError("");
            }}
            className={cn(
              "rounded-lg border px-2 py-1.5 text-[11.5px] font-semibold transition-colors",
              role.value === currentRole
                ? "border-primary/40 bg-secondary text-primary"
                : "border-border text-muted-foreground hover:bg-muted",
              role.value === selected && "ring-2 ring-primary/30",
            )}
          >
            {role.label}
          </button>
        ))}
      </div>

      {chosen ? (
        <div className="space-y-1.5 rounded-lg bg-muted/60 p-2">
          <label className="block text-[11px] font-semibold text-muted-foreground">
            Enter the {chosen.label} code
          </label>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Access code"
            className="h-8 w-full rounded-md border border-input bg-card px-2 text-[12.5px] outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {error ? <p className="text-[11px] font-medium text-destructive">{error}</p> : null}
          <button
            type="button"
            onClick={submit}
            disabled={busy || !code.trim()}
            className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-[12.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Switch to {chosen.label}
          </button>
        </div>
      ) : null}
    </div>
  );
}
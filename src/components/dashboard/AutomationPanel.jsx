import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { Loader2, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { runCoachAutomation } from "@/lib/workspace-fns";
import { AUTOMATIONS } from "@/lib/scioly";
import { Button } from "@/components/ui/button";

export default function AutomationPanel() {
  const run = useServerFn(runCoachAutomation);
  const router = useRouter();
  const [busy, setBusy] = useState("");

  async function trigger(job) {
    setBusy(job);
    try {
      const result = await run({ data: { job, base_url: window.location.origin } });
      const parts = Object.entries(result || {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.length : value}`);
      toast.success(parts.length ? parts.join(" · ") : "Automation finished");
      router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Automation failed");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <h2 className="font-heading text-sm font-bold">Automated email & WhatsApp workflows</h2>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        Every job emails the recipients and posts to your team WhatsApp group when a Whapi token and group are configured.
      </p>
      <div className="mt-3 space-y-2">
        {AUTOMATIONS.map((automation) => (
          <div key={automation.id} className="rounded-xl border border-border/80 bg-background/60 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold">{automation.title}</p>
                <p className="text-[11px] font-medium text-primary">{automation.schedule}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{automation.description}</p>
              </div>
              <Button size="sm" variant="outline" disabled={busy === automation.id} onClick={() => trigger(automation.id)}>
                {busy === automation.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
                <span className="ml-1.5">Run now</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
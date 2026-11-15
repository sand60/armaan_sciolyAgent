import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { CheckCircle2, Flag, ImageIcon, Loader2, Ruler } from "lucide-react";
import { toast } from "sonner";
import { flagBuildLog, verifyBuildLog } from "@/lib/workspace-fns";
import { base44 } from "@/api/base44Client";
import { formatDateTime } from "@/lib/scioly";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const CHECKS = [
  { id: "safety", label: "Goggles / guards in place, no exposed hazard" },
  { id: "measure", label: "Ruler check: dimensions and mass are legal" },
  { id: "photo", label: "Photo matches the reported build or lab setup" },
];

const BADGE = {
  Pass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Review: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Fail: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  "Not checked": "bg-muted text-muted-foreground border-border",
};

export default function VerificationCard({ log, event }) {
  const approve = useServerFn(verifyBuildLog);
  const flag = useServerFn(flagBuildLog);
  const router = useRouter();
  const [checked, setChecked] = useState({});
  const [reason, setReason] = useState("");
  const [showFlag, setShowFlag] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [busy, setBusy] = useState("");

  const allChecked = CHECKS.every((check) => checked[check.id]);

  async function openPhoto() {
    if (!log.photo_uri) return;
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: log.photo_uri, expires_in: 600 });
      setPhotoUrl(signed_url);
    } catch (error) {
      toast.error(error?.message || "Could not open the photo");
    }
  }

  async function onApprove() {
    setBusy("approve");
    try {
      await approve({ data: { log_id: log.id, mentor_notes: `Verified: ${CHECKS.filter((check) => checked[check.id]).map((check) => check.label).join("; ")}` } });
      toast.success(`${log.event_name} build verified — impound checklist flipped to complete`);
      router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Could not approve");
    } finally {
      setBusy("");
    }
  }

  async function onFlag() {
    if (reason.trim().length < 4) {
      toast.error("Add a short reason so the students know what to fix");
      return;
    }
    setBusy("flag");
    try {
      await flag({ data: { log_id: log.id, reason: reason.trim(), base_url: window.location.origin } });
      toast.success("Flagged — the students were emailed");
      setShowFlag(false);
      setReason("");
      router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Could not flag");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-heading text-sm font-bold">{log.event_name}</p>
          <p className="text-[11px] text-muted-foreground">
            {log.student_name || log.student_email} · {log.activity_type} · {formatDateTime(log.created_date)}
          </p>
        </div>
        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase", BADGE[log.ai_rule_check] || BADGE["Not checked"])}>
          AI rule check: {log.ai_rule_check || "Not checked"}
        </span>
      </div>

      <div className="mt-3 grid gap-2 text-[12px] sm:grid-cols-2">
        <p className="rounded-lg bg-muted/60 px-2.5 py-1.5">
          <span className="font-semibold">Dimensions / mass:</span> {log.device_dimensions_mass || "—"}
        </p>
        <p className="rounded-lg bg-muted/60 px-2.5 py-1.5">
          <span className="font-semibold">Test result:</span> {log.test_result || "—"}
        </p>
      </div>

      {log.ai_rule_note ? <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">AI note: {log.ai_rule_note}</p> : null}
      {event?.requires_impound ? <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400"><Ruler className="h-3 w-3" /> Impound event</p> : null}

      {log.photo_uri ? (
        <div className="mt-3">
          {photoUrl ? (
            <img src={photoUrl} alt={`${log.event_name} submission`} className="max-h-64 w-full rounded-xl border border-border object-cover" />
          ) : (
            <Button size="sm" variant="outline" onClick={openPhoto}>
              <ImageIcon className="mr-1.5 h-3.5 w-3.5" /> View photo
            </Button>
          )}
        </div>
      ) : null}

      <div className="mt-3 space-y-1.5">
        {CHECKS.map((check) => (
          <label key={check.id} className="flex items-start gap-2 text-[12px]">
            <input
              type="checkbox"
              checked={Boolean(checked[check.id])}
              onChange={(changeEvent) => setChecked((current) => ({ ...current, [check.id]: changeEvent.target.checked }))}
              className="mt-0.5 h-4 w-4 rounded border-input"
            />
            {check.label}
          </label>
        ))}
      </div>

      {showFlag ? (
        <div className="mt-3 space-y-2">
          <Textarea value={reason} onChange={(changeEvent) => setReason(changeEvent.target.value)} rows={2} placeholder="What needs fixing before the next test?" />
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={onFlag} disabled={busy === "flag"}>
              {busy === "flag" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null} Send flag
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowFlag(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={onApprove} disabled={!allChecked || busy === "approve"}>
            {busy === "approve" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-4 w-4" />}
            1-tap approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowFlag(true)}>
            <Flag className="mr-1.5 h-3.5 w-3.5" /> Flag for fix
          </Button>
        </div>
      )}
    </div>
  );
}
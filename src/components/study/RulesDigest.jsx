import { FileCheck2, ShieldAlert } from "lucide-react";

export default function RulesDigest({ event }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-bold">Official rules digest</h2>
        {event.has_manual ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <FileCheck2 className="h-3.5 w-3.5" /> Manual attached
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
            <ShieldAlert className="h-3.5 w-3.5" /> Digest only
          </span>
        )}
      </div>
      <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-muted-foreground">
        {event.rules_summary || "No rules digest is available for this event yet."}
      </p>
      <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        Every flashcard, quiz and study guide below is generated from these rules. Attach the season's official rule manual on the
        Events page and the AI will read that PDF directly instead.
      </p>
    </div>
  );
}
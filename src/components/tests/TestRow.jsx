import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { extractTestQuestions } from "@/lib/ai-fns";
import { formatDate } from "@/lib/scioly";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_CLASS = {
  Ready: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Failed: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  Processing: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Pending: "bg-muted text-muted-foreground border-border",
};

export default function TestRow({ test }) {
  const extract = useServerFn(extractTestQuestions);
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function reprocess() {
    setBusy(true);
    try {
      const result = await extract({ data: { test_id: test.id } });
      toast.success(`${result.count} questions extracted`);
      router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Could not extract questions");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-4 py-3 first:border-t-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{test.event_name}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {test.tournament_source || "Coach upload"} · {test.season_year} · {formatDate(test.created_date)}
        </p>
        {test.processing_note ? <p className="truncate text-[11px] text-muted-foreground">{test.processing_note}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">{test.difficulty_level}</span>
        {test.question_count ? (
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{test.question_count} questions</span>
        ) : null}
        {test.test_pdf || test.question_count ? (
          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase", STATUS_CLASS[test.processing_status] || STATUS_CLASS.Pending)}>
            {test.processing_status || "Pending"}
          </span>
        ) : null}
        {test.test_url ? (
          <>
            <a href={test.test_url} target="_blank" rel="noreferrer" className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase text-primary-foreground hover:opacity-90">
              Test
            </a>
            {test.answer_key_url ? (
              <a href={test.answer_key_url} target="_blank" rel="noreferrer" className="rounded-full border border-border px-2.5 py-1 text-[10px] font-bold uppercase text-muted-foreground hover:text-foreground">
                Key
              </a>
            ) : null}
          </>
        ) : null}
        {test.test_pdf ? (
          <Button size="sm" variant="ghost" onClick={reprocess} disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
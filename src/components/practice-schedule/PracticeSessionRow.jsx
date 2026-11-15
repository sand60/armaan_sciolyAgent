import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { MapPin, UserRound, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cancelPracticeSession } from "@/lib/practice-schedule-fns";

function formatWhen(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time to be announced";
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PracticeSessionRow({ session, canManage }) {
  const cancel = useServerFn(cancelPracticeSession);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const cancelled = session.status === "Cancelled";

  async function handleCancel() {
    setBusy(true);
    try {
      await cancel({ data: { id: session.id } });
      toast.success("Practice cancelled — the team will still see it marked cancelled");
      router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Could not cancel this practice");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-start gap-3 rounded-2xl border p-3.5",
        cancelled ? "border-dashed border-border bg-muted/40" : "border-border bg-card shadow-soft",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("font-heading text-[14px] font-bold", cancelled && "text-muted-foreground line-through")}>
            {session.event_name}
          </p>
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              session.session_type === "Virtual"
                ? "border-violet-200 bg-violet-50 text-violet-700"
                : "border-primary/20 bg-primary/10 text-primary",
            )}
          >
            {session.session_type}
          </span>
          {cancelled ? (
            <span className="rounded-full border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-300">
              Cancelled
            </span>
          ) : null}
        </div>

        <p className="mt-1 text-[12.5px] font-semibold text-foreground">{formatWhen(session.start_time)}</p>

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <UserRound className="h-3.5 w-3.5" /> {session.mentor_name}
          </span>
          <span className="inline-flex items-center gap-1">
            {session.session_type === "Virtual" ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
            {session.session_type === "Virtual" ? "Online" : session.location || "Location pending"}
          </span>
        </div>

        {session.notes ? <p className="mt-1.5 text-[11.5px] text-muted-foreground">{session.notes}</p> : null}
      </div>

      {canManage && !cancelled ? (
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={busy}>
          <X className="h-3.5 w-3.5" /> {busy ? "Cancelling…" : "Cancel"}
        </Button>
      ) : null}
    </div>
  );
}
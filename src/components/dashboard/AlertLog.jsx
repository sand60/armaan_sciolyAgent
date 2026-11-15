import { formatDateTime } from "@/lib/scioly";
import { cn } from "@/lib/utils";
import { Mail, MessageCircle } from "lucide-react";

const STATUS_CLASS = {
  Sent: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Logged: "bg-muted text-muted-foreground border-border",
  Failed: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export default function AlertLog({ alerts }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <h2 className="font-heading text-sm font-bold">Notification log</h2>
      <p className="mt-0.5 text-[11px] text-muted-foreground">Every email and WhatsApp post is logged here, including failures.</p>

      {alerts.length ? (
        <div className="mt-3 space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className="rounded-xl border border-border/80 bg-background/60 p-3">
              <div className="flex items-center gap-2">
                {alert.channel === "WhatsApp" ? <MessageCircle className="h-3.5 w-3.5 text-emerald-600" /> : <Mail className="h-3.5 w-3.5 text-primary" />}
                <p className="min-w-0 flex-1 truncate text-[13px] font-semibold">{alert.subject}</p>
                <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-bold uppercase", STATUS_CLASS[alert.status] || STATUS_CLASS.Logged)}>
                  {alert.status}
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] text-muted-foreground">
                {alert.recipient_label || alert.recipient_email || "team group"} · {formatDateTime(alert.created_date)}
                {alert.detail ? ` · ${alert.detail}` : ""}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
          No notifications yet. Run an automation above to send the first blast.
        </p>
      )}
    </div>
  );
}
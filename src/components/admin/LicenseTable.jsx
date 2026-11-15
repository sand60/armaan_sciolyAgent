import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_STYLE = {
  Active: "bg-primary/15 text-primary",
  "Awaiting payment": "bg-secondary text-muted-foreground",
  Disabled: "bg-muted text-muted-foreground",
  Cancelled: "bg-destructive/15 text-destructive",
};

const PAYMENT_STYLE = {
  Paid: "bg-primary/15 text-primary",
  Pending: "bg-secondary text-muted-foreground",
  Failed: "bg-destructive/15 text-destructive",
  Refunded: "bg-muted text-muted-foreground",
};

function Chip({ label, style }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold", style || "bg-secondary text-muted-foreground")}>
      {label}
    </span>
  );
}

export default function LicenseTable({ licenses, busyId, onToggle }) {
  if (!licenses.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No team licenses yet. New registrations appear here the moment a coach starts checkout.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[880px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <th className="px-4 py-3 font-semibold">School / team</th>
            <th className="px-4 py-3 font-semibold">Division</th>
            <th className="px-4 py-3 font-semibold">Plan</th>
            <th className="px-4 py-3 font-semibold">Payment</th>
            <th className="px-4 py-3 font-semibold">Renewal / season end</th>
            <th className="px-4 py-3 font-semibold">Access</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {licenses.map((license) => {
            const busy = busyId === license.id;
            return (
              <tr key={license.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-semibold">{license.school_name}</p>
                  <p className="text-xs text-muted-foreground">{license.team_name || "—"}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{license.division}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{license.plan}</p>
                  <p className="text-xs text-muted-foreground">{license.amount ? `$${license.amount} per team` : "—"}</p>
                </td>
                <td className="px-4 py-3">
                  <Chip label={license.payment_status || "Pending"} style={PAYMENT_STYLE[license.payment_status]} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{license.renewal_date || "—"}</td>
                <td className="px-4 py-3">
                  <Chip label={license.status} style={STATUS_STYLE[license.status]} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant={license.status === "Disabled" ? "default" : "outline"}
                    disabled={busy}
                    onClick={() => onToggle(license, license.status === "Disabled" ? "restore" : "disable")}
                  >
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    {license.status === "Disabled" ? "Restore" : "Disable"}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
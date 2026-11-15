import { formatMoney } from "@/lib/plan-catalog";

const TILES = [
  { key: "schools", label: "Registered schools" },
  { key: "active", label: "Active team subscriptions" },
  { key: "awaiting", label: "Awaiting payment" },
  { key: "disabled", label: "Disabled" },
  { key: "divisionB", label: "Active Division B" },
  { key: "divisionC", label: "Active Division C" },
];

export default function AdminStats({ counts }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {TILES.map((tile) => (
        <div key={tile.key} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{tile.label}</p>
          <p className="mt-1.5 font-heading text-2xl font-extrabold tracking-tight">{counts?.[tile.key] ?? 0}</p>
        </div>
      ))}
      <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 shadow-soft">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Annualized license value</p>
        <p className="mt-1.5 font-heading text-2xl font-extrabold tracking-tight">{formatMoney(counts?.revenue ?? 0)}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {counts?.monthly ?? 0} monthly · {counts?.season ?? 0} seasonal
        </p>
      </div>
    </div>
  );
}
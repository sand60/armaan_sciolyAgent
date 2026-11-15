import { cn } from "@/lib/utils";

export default function TestBankTabs({ division, onDivision, events, eventName, onEvent, counts }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft">
        {["Division B", "Division C"].map((name) => (
          <button
            key={name}
            onClick={() => onDivision(name)}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-bold transition-colors",
              division === name ? "bg-brand-gradient text-white shadow-soft" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {name} tests
          </button>
        ))}
      </div>

      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {events.map((event) => {
          const active = event.name === eventName;
          const count = counts[event.name] || 0;
          return (
            <button
              key={event.name}
              onClick={() => onEvent(event.name)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors",
                active ? "border-primary bg-secondary text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {event.name}
              <span className="ml-1.5 text-[10px] opacity-70">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
const BLOCK_ORDER = ["Block 1", "Block 2", "Block 3", "Block 4", "Block 5", "Block 6", "Self-Scheduled"];

export default function StudentEventGroups({ events = [], picked, onToggle, onClear }) {
  const groups = BLOCK_ORDER.map((block) => ({
    block,
    items: events.filter((event) => (event.block || "Self-Scheduled") === block),
  })).filter((group) => group.items.length);

  if (!groups.length) return <p className="text-xs text-muted-foreground">No events are set up for this division yet.</p>;

  return (
    <div className="space-y-3">
      {groups.map(({ block, items }) => (
        <div key={block} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold">
              Events interested in {block === "Self-Scheduled" ? "(build events, self-scheduled)" : `(${block})`}
            </p>
            <button
              type="button"
              onClick={() => onClear(items.map((item) => item.name))}
              className="shrink-0 text-[11px] font-semibold text-primary hover:underline"
            >
              Clear selection
            </button>
          </div>
          <div className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
            {items.map((item) => {
              const active = picked.includes(item.name);
              return (
                <label key={item.name} className="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-[13px] hover:bg-muted">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => onToggle(item.name)}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <span className={active ? "font-semibold text-primary" : "text-foreground"}>{item.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
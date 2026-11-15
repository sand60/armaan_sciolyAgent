import { cn } from "@/lib/utils";

const timeOf = (value) =>
  new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export default function PracticeCalendarDay({ date, sessions, colors, isToday, isCurrentMonth, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex min-h-[108px] flex-col gap-1 border-b border-r border-border p-1.5 text-left align-top transition-colors hover:bg-muted/50",
        !isCurrentMonth && "bg-muted/40 text-muted-foreground",
        isSelected && "bg-primary/5 ring-2 ring-inset ring-primary/40",
      )}
    >
      <span
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11.5px] font-bold",
          isToday ? "bg-primary text-primary-foreground" : "text-foreground",
        )}
      >
        {date.getDate()}
      </span>

      {sessions.slice(0, 3).map((session) => (
        <span
          key={session.id}
          style={session.status === "Cancelled" ? undefined : colors[session.event_name]}
          className={cn(
            "truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-tight",
            session.status === "Cancelled" && "bg-muted text-muted-foreground line-through",
          )}
        >
          {timeOf(session.start_time)} · {session.event_name}
        </span>
      ))}

      {sessions.length > 3 ? (
        <span className="px-1 text-[10px] font-bold text-muted-foreground">+{sessions.length - 3} more</span>
      ) : null}
    </button>
  );
}
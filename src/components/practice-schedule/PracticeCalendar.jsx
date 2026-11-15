import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PracticeCalendarDay from "@/components/practice-schedule/PracticeCalendarDay";
import PracticeDayPanel from "@/components/practice-schedule/PracticeDayPanel";
import { eventColorMap } from "@/lib/event-colors";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dateKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

function buildMonth(cursor) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = new Date(first.getFullYear(), first.getMonth(), first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
}

export default function PracticeCalendar({ sessions, canManage }) {
  const now = new Date();
  const [cursor, setCursor] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [selected, setSelected] = useState(() => dateKey(now));

  const byDay = useMemo(() => {
    const map = {};
    sessions.forEach((session) => {
      const key = dateKey(new Date(session.start_time));
      (map[key] = map[key] || []).push(session);
    });
    Object.values(map).forEach((list) => list.sort((a, b) => new Date(a.start_time) - new Date(b.start_time)));
    return map;
  }, [sessions]);

  const colors = useMemo(() => eventColorMap(sessions), [sessions]);
  const days = useMemo(() => buildMonth(cursor), [cursor]);
  const todayKey = dateKey(now);
  const [year, month, day] = selected.split("-").map(Number);
  const selectedSessions = byDay[selected] || [];
  const shift = (delta) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-3">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => shift(-1)} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const current = new Date();
                setCursor(new Date(current.getFullYear(), current.getMonth(), 1));
                setSelected(dateKey(current));
              }}
            >
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={() => shift(1)} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="font-heading text-base font-extrabold">
            {cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Weekly team calendar
          </p>
        </div>

        <div className="grid grid-cols-7 border-b border-border bg-muted/40">
          {WEEKDAYS.map((label) => (
            <div key={label} className="px-2 py-1.5 text-center text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((date) => {
            const key = dateKey(date);
            return (
              <PracticeCalendarDay
                key={key}
                date={date}
                sessions={byDay[key] || []}
                colors={colors}
                isToday={key === todayKey}
                isCurrentMonth={date.getMonth() === cursor.getMonth()}
                isSelected={key === selected}
                onSelect={() => setSelected(key)}
              />
            );
          })}
        </div>
      </div>

      <PracticeDayPanel
        label={new Date(year, month, day).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
        sessions={selectedSessions}
        canManage={canManage}
      />
    </div>
  );
}
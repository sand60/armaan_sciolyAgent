import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { generateEventPack } from "@/lib/study-fns";

const KINDS = [
  { kind: "flashcards", countKey: "cards", label: "flashcards" },
  { kind: "quiz", countKey: "quizzes", label: "quiz" },
  { kind: "guide", countKey: "guides", label: "study guide" },
];

export default function GenerateAllBar({ events }) {
  const router = useRouter();
  const pack = useServerFn(generateEventPack);
  const stop = useRef(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [current, setCurrent] = useState("");

  const queue = useMemo(
    () =>
      events
        .map((event) => ({
          ...event,
          kinds: KINDS.filter(({ countKey }) => !event.counts?.[countKey]).map(({ kind }) => kind),
        }))
        .filter((event) => event.kinds.length),
    [events],
  );

  const total = queue.length;

  const run = async () => {
    stop.current = false;
    setRunning(true);
    setDone(0);
    let failures = 0;

    for (const [index, event] of queue.entries()) {
      if (stop.current) break;
      setCurrent(event.event_name);
      try {
        await pack({ data: { event_id: event.id, kinds: event.kinds } });
      } catch (error) {
        failures += 1;
        toast.error(`${event.event_name}: ${error?.message || "generation failed"}`);
      }
      setDone(index + 1);
    }

    setRunning(false);
    setCurrent("");
    stop.current = false;
    router.invalidate();
    if (failures) toast.warning(`${total - failures} events ready, ${failures} need another run`);
    else toast.success("All study materials are ready");
  };

  if (!total) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-[13px] font-semibold text-emerald-700">
        Every event in this division already has flashcards, a quiz and a study guide.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading text-sm font-bold">Build the whole division from the rules</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {running
              ? `${done} of ${total} events done${current ? ` · ${current}` : ""}`
              : `${total} events still need a flashcard deck, quiz or study guide. Leave the tab open while it runs.`}
          </p>
        </div>
        {running ? (
          <Button variant="outline" onClick={() => { stop.current = true; }}>
            <Square className="h-4 w-4" /> Stop
          </Button>
        ) : (
          <Button onClick={run}>
            <Sparkles className="h-4 w-4" /> Build all materials
          </Button>
        )}
      </div>
      {running || done ? <Progress value={total ? (done / total) * 100 : 0} className="mt-3 h-2" /> : null}
      {running ? (
        <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Generating from each event's rules document
        </p>
      ) : null}
    </div>
  );
}
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { importSchedule } from "@/lib/workspace-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function splitLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (const character of line) {
    if (character === '"') {
      quoted = !quoted;
      continue;
    }
    if (character === "," && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += character;
  }
  cells.push(current.trim());
  return cells;
}

export function parseScheduleCsv(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [];
  const hasHeader = /event/i.test(lines[0]);
  return (hasHeader ? lines.slice(1) : lines)
    .map(splitLine)
    .filter((cells) => cells[0])
    .map((cells) => ({
      event_name: cells[0],
      room_location: cells[1] || "",
      impound_window: cells[2] || "",
      event_time_slot: cells[3] || "",
    }));
}

export default function ScheduleUpload({ tournamentName }) {
  const upload = useServerFn(importSchedule);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const rows = parseScheduleCsv(text);

  async function submit() {
    if (!rows.length) {
      toast.error("Add at least one schedule row");
      return;
    }
    setBusy(true);
    try {
      const result = await upload({ data: { tournament_name: tournamentName, rows } });
      toast.success(`${result.imported} schedule rows imported`);
      setOpen(false);
      setText("");
      router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Could not import the schedule");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="mr-1.5 h-4 w-4" /> Upload room CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Room schedule CSV</DialogTitle>
          <DialogDescription>Columns: Event, Room, Impound, Time. A header row is optional.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            className="block w-full text-sm"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (file) setText(await file.text());
            }}
          />
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={7}
            placeholder={"Event,Room,Impound,Time\nBoomilever,Room 104,7:30-8:15,Block 1 8:30\nCodebusters,Room 210,,Block 1 8:30"}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs"
          />
          <p className="text-[11px] text-muted-foreground">{rows.length} row{rows.length === 1 ? "" : "s"} ready to import.</p>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={busy || !rows.length}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Import schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
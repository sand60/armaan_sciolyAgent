import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPracticeSession } from "@/lib/practice-schedule-fns";

const EMPTY = {
  event_name: "",
  mentor_name: "",
  start_time: "",
  session_type: "In person",
  location: "",
  notes: "",
  repeat_weeks: "1",
};

export default function PracticeSessionForm({ events = [] }) {
  const create = useServerFn(createPracticeSession);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    if (!form.event_name || !form.mentor_name || !form.start_time) {
      toast.error("Event, coach name and practice time are required");
      return;
    }
    if (form.session_type === "In person" && !form.location.trim()) {
      toast.error("Add the location for an in-person practice");
      return;
    }
    setBusy(true);
    try {
      await create({ data: { ...form, repeat_weeks: Number(form.repeat_weeks) || 1 } });
      toast.success(
        Number(form.repeat_weeks) > 1
          ? `Weekly practices added for the next ${form.repeat_weeks} weeks`
          : "Practice added to the calendar",
      );
      setOpen(false);
      setForm(EMPTY);
      router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Could not save this practice");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> New practice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule a practice</DialogTitle>
          <DialogDescription>Pick the event, who runs it, when it starts, where the team meets, and whether it repeats weekly.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="practice-event">Event</Label>
            {events.length ? (
              <Select value={form.event_name} onValueChange={(value) => set("event_name", value)}>
                <SelectTrigger id="practice-event">
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="practice-event"
                value={form.event_name}
                onChange={(event) => set("event_name", event.target.value)}
                placeholder="Event name"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="practice-mentor">Coach</Label>
            <Input
              id="practice-mentor"
              value={form.mentor_name}
              onChange={(event) => set("mentor_name", event.target.value)}
              placeholder="Name of the coach running practice"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="practice-time">Practice start</Label>
              <Input
                id="practice-time"
                type="datetime-local"
                value={form.start_time}
                onChange={(event) => set("start_time", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="practice-type">Format</Label>
              <Select value={form.session_type} onValueChange={(value) => set("session_type", value)}>
                <SelectTrigger id="practice-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In person">In person</SelectItem>
                  <SelectItem value="Virtual">Virtual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="practice-repeat">Repeats</Label>
            <Select value={form.repeat_weeks} onValueChange={(value) => set("repeat_weeks", value)}>
              <SelectTrigger id="practice-repeat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Just once</SelectItem>
                {[4, 6, 8, 10, 12].map((weeks) => (
                  <SelectItem key={weeks} value={String(weeks)}>
                    Every week for {weeks} weeks
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Weekly practices land on the calendar on the same day and time each week.
            </p>
          </div>

          {form.session_type === "In person" ? (
            <div className="space-y-1.5">
              <Label htmlFor="practice-location">Location</Label>
              <Input
                id="practice-location"
                value={form.location}
                onChange={(event) => set("location", event.target.value)}
                placeholder="Room, lab or address"
              />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="practice-notes">Notes (optional)</Label>
            <Textarea
              id="practice-notes"
              value={form.notes}
              onChange={(event) => set("notes", event.target.value)}
              placeholder="What the team should bring or prepare"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Add practice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
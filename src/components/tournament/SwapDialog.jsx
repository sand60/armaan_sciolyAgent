import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { Loader2, UserRoundCog } from "lucide-react";
import { toast } from "sonner";
import { swapStudent } from "@/lib/workspace-fns";
import { slotsOf } from "@/lib/scioly";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SwapDialog({ partnerships }) {
  const swap = useServerFn(swapStudent);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ partnership_id: "", slot: "1", name: "", email: "", note: "" });

  const selected = partnerships.find((partnership) => partnership.id === form.partnership_id);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit() {
    if (!form.partnership_id || form.name.trim().length < 2) {
      toast.error("Pick the partnership and the alternate's name");
      return;
    }
    setBusy(true);
    try {
      await swap({ data: { partnership_id: form.partnership_id, slot: Number(form.slot), name: form.name.trim(), email: form.email.trim(), note: form.note.trim(), base_url: window.location.origin } });
      toast.success("Alternate swapped in and the team was notified");
      setOpen(false);
      setForm({ partnership_id: "", slot: "1", name: "", email: "", note: "" });
      router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Could not swap the student");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserRoundCog className="mr-1.5 h-4 w-4" /> Alternate swap
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Swap in an alternate</DialogTitle>
          <DialogDescription>Replaces one partner slot and alerts the team on email and WhatsApp.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="partnership">Partnership</Label>
            <select id="partnership" value={form.partnership_id} onChange={update("partnership_id")} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="">Select an event partnership</option>
              {partnerships.map((partnership) => (
                <option key={partnership.id} value={partnership.id}>
                  {partnership.event_name} — {slotsOf(partnership).map((student) => student.name).join(" & ") || "open"}
                </option>
              ))}
            </select>
          </div>

          {selected ? (
            <p className="rounded-lg bg-muted/60 px-2.5 py-2 text-[11px] text-muted-foreground">
              Current: {slotsOf(selected).map((student) => `slot ${student.slot}: ${student.name || student.email}`).join(" · ") || "empty"}
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="slot">Slot</Label>
              <select id="slot" value={form.slot} onChange={update("slot")} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="1">Slot 1</option>
                <option value="2">Slot 2</option>
                <option value="3">Slot 3</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Alternate name</Label>
              <Input id="name" value={form.name} onChange={update("name")} placeholder="Student name" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="swap_email">Alternate email</Label>
            <Input id="swap_email" type="email" value={form.email} onChange={update("email")} placeholder="student@school.org" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note">Reason (optional)</Label>
            <Input id="note" value={form.note} onChange={update("note")} placeholder="Sick day, schedule conflict…" />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Swap student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
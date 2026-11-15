import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { Loader2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { updateSchoolInfo } from "@/lib/workspace-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SchoolSettingsDialog({ school }) {
  const save = useServerFn(updateSchoolInfo);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    school_name: school?.school_name || "",
    division: school?.division || "Division B",
    head_coach_email: school?.head_coach_email || "",
    team_whatsapp_group_id: school?.team_whatsapp_group_id || "",
    whatsapp_webhook_url: school?.whatsapp_webhook_url || "",
  });

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await save({ data: form });
      toast.success("Workspace settings saved");
      setOpen(false);
      router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Could not save settings");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="mr-1.5 h-4 w-4" /> Workspace settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Workspace & WhatsApp</DialogTitle>
          <DialogDescription>School code {school?.school_id} · this code never changes.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="school_name">School / team name</Label>
            <Input id="school_name" value={form.school_name} onChange={update("school_name")} required />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="division">Division</Label>
              <select id="division" value={form.division} onChange={update("division")} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm">
                <option value="Division B">Division B</option>
                <option value="Division C">Division C</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coach_email">Head coach email</Label>
              <Input id="coach_email" type="email" value={form.head_coach_email} onChange={update("head_coach_email")} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="group">WhatsApp group ID</Label>
            <Input id="group" value={form.team_whatsapp_group_id} onChange={update("team_whatsapp_group_id")} placeholder="1203630xxxxxx@g.us" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="webhook">Whapi webhook URL</Label>
            <Input id="webhook" value={form.whatsapp_webhook_url} onChange={update("whatsapp_webhook_url")} placeholder="https://gate.whapi.cloud/messages/text" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save settings
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
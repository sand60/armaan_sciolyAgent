import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { Camera, ClipboardList, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getPracticeData } from "@/lib/workspace-fns";
import { submitBuildLog } from "@/lib/ai-fns";
import { base44 } from "@/api/base44Client";
import { formatDateTime } from "@/lib/scioly";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authed/log")({
  validateSearch: (search) => ({ event: typeof search.event === "string" ? search.event : undefined }),
  loader: () => getPracticeData(),
  head: () => ({ meta: [{ title: "Build & lab log — SciOlyCoachAgent" }] }),
  component: LogPage,
});

function LogPage() {
  const { events, logs } = Route.useLoaderData();
  const search = Route.useSearch();
  const submit = useServerFn(submitBuildLog);
  const router = useRouter();
  const [form, setForm] = useState({
    event_name: search.event || events[0]?.event_name || "",
    activity_type: "Build Test",
    device_dimensions_mass: "",
    test_result: "",
  });
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [verdict, setVerdict] = useState(null);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setVerdict(null);
    try {
      let photo_uri = "";
      if (photo) {
        const uploaded = await base44.integrations.Core.UploadPrivateFile({ file: photo });
        photo_uri = uploaded.file_uri;
      }
      const result = await submit({ data: { ...form, photo_uri } });
      setVerdict({ verdict: result.verdict, note: result.note });
      toast.success("Logged — your coach will verify it");
      setForm((current) => ({ ...current, device_dimensions_mass: "", test_result: "" }));
      setPhoto(null);
      router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Could not save the log");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Mobile-first logger"
        title="Build & lab log"
        description="Log the test result, device mass and dimensions, and a photo. AI checks the rules, then your coach approves in one tap."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/mentor">
              <ClipboardList className="mr-1.5 h-4 w-4" /> Coach queue
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <form onSubmit={save} className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="space-y-1.5">
            <Label htmlFor="event_name">Event</Label>
            <select id="event_name" value={form.event_name} onChange={update("event_name")} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
              {events.map((event) => (
                <option key={event.id} value={event.event_name}>
                  {event.event_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Activity</Label>
            <div className="flex gap-2">
              {["Build Test", "Lab Drill"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, activity_type: type }))}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold ${
                    form.activity_type === type ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dimensions">Device mass & dimensions</Label>
            <Input id="dimensions" value={form.device_dimensions_mass} onChange={update("device_dimensions_mass")} placeholder="14.2 g · 42 x 12 x 9 cm" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="result">Test result</Label>
            <Textarea id="result" value={form.test_result} onChange={update("test_result")} rows={3} placeholder="Held 8 kg before the lower chord bowed; 3 trials." />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="photo">Photo of the build / setup</Label>
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2">
              <Camera className="h-4 w-4 text-muted-foreground" />
              <input id="photo" type="file" accept="image/*" className="w-full text-xs" onChange={(event) => setPhoto(event.target.files?.[0] || null)} />
            </div>
            <p className="text-[11px] text-muted-foreground">Stored privately — only your team can open it.</p>
          </div>

          {verdict ? (
            <div className="rounded-xl border border-border bg-muted/60 p-3 text-xs">
              <p className="font-semibold">AI rule check: {verdict.verdict}</p>
              {verdict.note ? <p className="mt-1 text-muted-foreground">{verdict.note}</p> : null}
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit for coach verification
          </Button>
        </form>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <h2 className="font-heading text-sm font-bold">My recent submissions</h2>
          {logs.filter((log) => log.activity_type !== "Quiz").length ? (
            <div className="mt-2 divide-y divide-border/70">
              {logs
                .filter((log) => log.activity_type !== "Quiz")
                .slice(0, 8)
                .map((log) => (
                  <div key={log.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <div>
                      <p className="text-sm font-semibold">{log.event_name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {log.activity_type} · {formatDateTime(log.created_date)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        log.mentor_verified ? "bg-emerald-500/15 text-emerald-300" : log.flag_reason ? "bg-rose-500/15 text-rose-300" : "bg-amber-500/15 text-amber-300"
                      }`}
                    >
                      {log.mentor_verified ? "Verified" : log.flag_reason ? "Needs fix" : "Pending"}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="mt-2 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
              Nothing logged yet. Submit a build test or lab drill to start the verification chain.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
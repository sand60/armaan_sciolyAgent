import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { FileUp, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { extractTestQuestions } from "@/lib/ai-fns";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TestUploadForm({ schoolId, division, divisionEvents }) {
  const extract = useServerFn(extractTestQuestions);
  const router = useRouter();
  const [form, setForm] = useState({
    division,
    event_name: divisionEvents[0]?.name || "",
    tournament_source: "",
    season_year: "2026-2027",
    difficulty_level: "Regional",
  });
  const [testFile, setTestFile] = useState(null);
  const [keyFile, setKeyFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    if (!testFile) {
      toast.error("Attach the test PDF");
      return;
    }
    setBusy(true);
    try {
      const test = await base44.integrations.Core.UploadPrivateFile({ file: testFile });
      const answerKey = keyFile ? await base44.integrations.Core.UploadPrivateFile({ file: keyFile }) : null;

      const record = await base44.entities.TestRepository.create({
        school_id: schoolId,
        division: form.division,
        event_name: form.event_name,
        tournament_source: form.tournament_source || "Coach upload",
        season_year: form.season_year,
        difficulty_level: form.difficulty_level,
        test_pdf: test.file_uri,
        answer_key_pdf: answerKey?.file_uri || "",
        processing_status: "Pending",
        question_count: 0,
      });

      const result = await extract({ data: { test_id: record.id } });
      toast.success(`${result.count} questions extracted${result.outdated ? ` · ${result.outdated} flagged as outdated` : ""}`);
      setTestFile(null);
      setKeyFile(null);
      router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Could not process that PDF");
      router.invalidate();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary">
          <FileUp className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-heading text-sm font-bold">Bulk test uploader</h2>
          <p className="text-[11px] text-muted-foreground">AI extracts the questions, writes explanations and flags anything outdated.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="event">Event</Label>
          <select id="event" value={form.event_name} onChange={update("event_name")} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm">
            {divisionEvents.map((event) => (
              <option key={event.name} value={event.name}>
                {event.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="division">Division</Label>
          <select id="division" value={form.division} onChange={update("division")} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm">
            {["Division B", "Division C"].map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="difficulty">Difficulty</Label>
          <select id="difficulty" value={form.difficulty_level} onChange={update("difficulty_level")} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm">
            {["Starter", "Regional", "State", "National"].map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="source">Tournament source</Label>
          <Input id="source" value={form.tournament_source} onChange={update("tournament_source")} placeholder="Sylvania Southview Invitational" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="season">Season</Label>
          <Input id="season" value={form.season_year} onChange={update("season_year")} />
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="test_pdf">Test PDF</Label>
          <Input id="test_pdf" type="file" accept="application/pdf" onChange={(event) => setTestFile(event.target.files?.[0] || null)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="key_pdf">Answer key PDF (optional)</Label>
          <Input id="key_pdf" type="file" accept="application/pdf" onChange={(event) => setKeyFile(event.target.files?.[0] || null)} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {busy ? "Extracting questions…" : "Upload & extract"}
        </Button>
        <p className="text-[11px] text-muted-foreground">PDFs are stored privately for your team.</p>
      </div>
    </form>
  );
}
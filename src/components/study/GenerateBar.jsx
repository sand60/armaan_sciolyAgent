import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { BookOpen, Layers, ListChecks, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateFlashcards, generateQuizSet, generateStudyGuide } from "@/lib/study-fns";

const ACTIONS = [
  { key: "cards", label: "Flashcards", icon: Layers },
  { key: "quiz", label: "Quiz", icon: ListChecks },
  { key: "guide", label: "Study guide", icon: BookOpen },
];

export default function GenerateBar({ eventId }) {
  const router = useRouter();
  const cards = useServerFn(generateFlashcards);
  const quiz = useServerFn(generateQuizSet);
  const guide = useServerFn(generateStudyGuide);
  const [busy, setBusy] = useState("");

  const run = async (key) => {
    setBusy(key);
    try {
      if (key === "cards") await cards({ data: { event_id: eventId, count: 12 } });
      if (key === "quiz") await quiz({ data: { event_id: eventId, count: 10, difficulty: "Practice" } });
      if (key === "guide") await guide({ data: { event_id: eventId } });
      toast.success(`New ${key === "cards" ? "flashcard deck" : key === "quiz" ? "quiz set" : "study guide"} ready`);
      router.invalidate();
    } catch (error) {
      toast.error(String(error?.message || "Generation failed. Please try again."));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="font-heading text-base font-bold">Generate from these rules</h2>
      <p className="mt-1 text-[13px] text-muted-foreground">Each run takes a few seconds and is saved to this event.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {ACTIONS.map(({ key, label, icon: Icon }) => (
          <Button key={key} variant="outline" disabled={Boolean(busy)} onClick={() => run(key)}>
            {busy === key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
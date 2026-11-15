import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { BookOpen, Layers, ListChecks, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteStudyMaterial } from "@/lib/study-fns";
import FlashcardPlayer from "@/components/study/FlashcardPlayer";
import QuizSetPlayer from "@/components/study/QuizSetPlayer";
import GuideReader from "@/components/study/GuideReader";

const GROUPS = [
  { kind: "flashcards", label: "Flashcard decks", icon: Layers, list: "decks" },
  { kind: "quiz", label: "Quiz sets", icon: ListChecks, list: "quizzes" },
  { kind: "guide", label: "Study guides", icon: BookOpen, list: "guides" },
];

export default function MaterialBrowser({ decks, quizzes, guides }) {
  const router = useRouter();
  const remove = useServerFn(deleteStudyMaterial);
  const [active, setActive] = useState(null);
  const source = { decks, quizzes, guides };

  const open = (kind, record) => setActive({ kind, record });

  const destroy = async (kind, record) => {
    if (!window.confirm(`Delete "${record.title}"?`)) return;
    try {
      await remove({ data: { kind, id: record.id } });
      setActive(null);
      toast.success("Material deleted");
      router.invalidate();
    } catch (error) {
      toast.error(String(error?.message || "Could not delete that material."));
    }
  };

  const current =
    active?.kind === "flashcards" ? <FlashcardPlayer deck={active.record} />
    : active?.kind === "quiz" ? <QuizSetPlayer quiz={active.record} />
    : active?.kind === "guide" ? <GuideReader guide={active.record} />
    : null;

  return (
    <div className="space-y-4">
      {active ? (
        <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-base font-bold">{active.record.title}</h2>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {active.record.source} · {active.record.division}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setActive(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4">{current}</div>
        </div>
      ) : null}

      {GROUPS.map(({ kind, label, icon: Icon, list }) => {
        const items = source[list] || [];
        return (
          <div key={kind} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              <h2 className="font-heading text-base font-bold">{label}</h2>
              <span className="text-xs text-muted-foreground">{items.length}</span>
            </div>
            {items.length ? (
              <div className="mt-3 space-y-2">
                {items.map((record) => (
                  <div key={record.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
                    <button onClick={() => open(kind, record)} className="min-w-0 flex-1 text-left">
                      <p className="truncate text-[13px] font-semibold">{record.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {record.source}
                        {record.card_count ? ` · ${record.card_count} cards` : ""}
                        {record.question_count ? ` · ${record.question_count} questions` : ""}
                        {record.sections ? ` · ${record.sections.length} sections` : ""}
                      </p>
                    </button>
                    <Badge variant="secondary" className="hidden sm:inline-flex">{record.division}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => destroy(kind, record)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-muted-foreground">Nothing yet — generate one above.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
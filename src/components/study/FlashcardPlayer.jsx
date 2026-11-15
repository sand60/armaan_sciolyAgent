import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FlashcardPlayer({ deck }) {
  const cards = deck.cards || [];
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[index];

  const go = (delta) => {
    setFlipped(false);
    setIndex((current) => (current + delta + cards.length) % cards.length);
  };

  if (!card) return <p className="text-sm text-muted-foreground">This deck has no cards.</p>;

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Card {index + 1} of {cards.length}
      </p>
      <button
        onClick={() => setFlipped((value) => !value)}
        className="mt-3 flex min-h-[190px] w-full items-center justify-center rounded-2xl border border-primary/15 bg-secondary/60 p-6 text-center transition-colors hover:bg-secondary"
      >
        <span className={flipped ? "text-[15px] leading-relaxed" : "font-heading text-lg font-bold leading-snug"}>
          {flipped ? card.back : card.front}
        </span>
      </button>
      <div className="mt-3 flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" onClick={() => go(-1)}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setFlipped((value) => !value)}>
          <RotateCcw className="h-4 w-4" /> {flipped ? "Show prompt" : "Flip card"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => go(1)}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Loader2, Send, User } from "lucide-react";
import { askCoach } from "@/lib/ai-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function CoachChat({ event }) {
  const ask = useServerFn(askCoach);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  async function send() {
    const question = draft.trim();
    if (!question || busy) return;
    const nextMessages = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setDraft("");
    setBusy(true);
    try {
      const reply = await ask({
        data: {
          event_id: event.id,
          question,
          history: nextMessages.slice(-10),
        },
      });
      setMessages([
        ...nextMessages,
        { role: "assistant", content: reply.answer },
        { role: "assistant", content: reply.next_question, isQuestion: true },
      ]);
    } catch (error) {
      setMessages([...nextMessages, { role: "assistant", content: error?.message || "I could not answer that. Try again." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-260px)] min-h-[420px] flex-col rounded-2xl border border-border bg-card shadow-soft">
      <div className="border-b border-border px-4 py-3">
        <p className="font-heading text-sm font-bold">{event.event_name} — Socratic coach</p>
        <p className="text-[11px] text-muted-foreground">
          {event.category} event · it asks questions before it gives answers{event.rule_manual_uri ? " · rule manual loaded" : " · add the rule manual on the events page for rule citations"}
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {!messages.length ? (
          <div className="rounded-2xl border border-dashed border-border bg-background/60 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Start with what you already know.</p>
            <p className="mt-1 text-[13px] leading-relaxed">
              {event.category === "Build"
                ? "“My boomilever bent at 8 kg. I measured 42 cm and 14 g — what should I check first?”"
                : event.category === "Lab"
                  ? "“Our circuit lab voltage stayed the same but current halved. What variable did we miss?”"
                  : "“I have three binder tabs for heredity and I keep missing pedigrees. How should I reorganize?”"}
            </p>
          </div>
        ) : null}

        {messages.map((message, index) => (
          <div key={`${index}-${message.content.slice(0, 8)}`} className={cn("flex gap-2.5", message.role === "user" ? "justify-end" : "justify-start")}>
            {message.role === "assistant" ? (
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gradient">
                <Bot className="h-3.5 w-3.5 text-white" />
              </span>
            ) : null}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : message.isQuestion
                    ? "border border-primary/20 bg-primary/5 font-medium text-foreground"
                    : "bg-muted text-foreground",
              )}
            >
              {message.isQuestion ? <span className="mr-1.5 text-[11px] font-bold uppercase tracking-wide text-primary">Your turn</span> : null}
              {message.content}
            </div>
            {message.role === "user" ? (
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <User className="h-3.5 w-3.5" />
              </span>
            ) : null}
          </div>
        ))}

        {busy ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> The coach is reading your answer…
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(keyEvent) => {
              if (keyEvent.key === "Enter" && !keyEvent.shiftKey) {
                keyEvent.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder="What did you try, and what did you observe?"
            className="min-h-[52px] resize-none"
          />
          <Button onClick={send} disabled={busy || !draft.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
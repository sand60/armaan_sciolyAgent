import { FileStack } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import TestRow from "@/components/tests/TestRow";

export default function TestBankList({ title, tests }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="font-heading text-sm font-bold">{title}</h2>
          <p className="text-[11px] text-muted-foreground">{tests.length} past tests · every upload feeds the practice quizzes for this event.</p>
        </div>
        <a
          href="https://scioly.org/tests"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-[11px] font-semibold text-primary hover:underline"
        >
          SciOly Test Exchange
        </a>
      </div>
      {tests.length ? (
        tests.map((test) => <TestRow key={test.id} test={test} />)
      ) : (
        <div className="p-4">
          <EmptyState
            icon={FileStack}
            title="No tests for this event yet"
            description="Upload a PDF with the form on the right, or pull one from the SciOly Test Exchange."
          />
        </div>
      )}
    </div>
  );
}
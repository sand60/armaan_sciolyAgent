import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getTestsData } from "@/lib/workspace-fns";
import { catalogForDivision } from "@/lib/event-catalog";
import PageHeader from "@/components/common/PageHeader";
import TestBankTabs from "@/components/tests/TestBankTabs";
import TestBankList from "@/components/tests/TestBankList";
import TestUploadForm from "@/components/tests/TestUploadForm";

const DIVISIONS = ["Division B", "Division C"];

export const Route = createFileRoute("/_authed/tests")({
  loader: () => getTestsData(),
  head: () => ({ meta: [{ title: "Test bank — SciOlyCoachAgent" }] }),
  component: TestsPage,
});

function TestsPage() {
  const { school, role, tests } = Route.useLoaderData();
  const [division, setDivision] = useState("Division B");
  const [eventName, setEventName] = useState(catalogForDivision("Division B")[0].name);

  const catalog = useMemo(() => catalogForDivision(division), [division]);

  const divisionTests = useMemo(() => tests.filter((test) => test.division === division), [tests, division]);

  const counts = useMemo(
    () => divisionTests.reduce((acc, test) => ({ ...acc, [test.event_name]: (acc[test.event_name] || 0) + 1 }), {}),
    [divisionTests],
  );

  const eventTests = useMemo(
    () =>
      divisionTests
        .filter((test) => test.event_name === eventName)
        .sort((a, b) => String(b.season_year || "").localeCompare(String(a.season_year || ""))),
    [divisionTests, eventName],
  );

  if (role !== "Head Coach") {
    return <PageHeader title="Head coach only" description="The test bank is managed by the head coach." />;
  }

  function changeDivision(next) {
    setDivision(next);
    setEventName(catalogForDivision(next)[0].name);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`${tests.length} past tests · Division B and Division C`}
        title="Test bank"
        description="Past tests pulled from the SciOly Test Exchange, organised by division and event. Upload your own PDFs and AI turns them into practice questions."
      />

      <TestBankTabs
        division={division}
        onDivision={changeDivision}
        events={catalog}
        eventName={eventName}
        onEvent={setEventName}
        counts={counts}
      />

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <TestBankList title={`${eventName} · ${division}`} tests={eventTests} />
        <TestUploadForm key={division} schoolId={school.school_id} division={division} divisionEvents={catalog} />
      </div>
    </div>
  );
}
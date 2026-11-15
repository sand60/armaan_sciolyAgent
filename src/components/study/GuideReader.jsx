export default function GuideReader({ guide }) {
  const sections = guide.sections || [];
  if (!sections.length) return <p className="text-sm text-muted-foreground">This guide has no sections.</p>;

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div key={index}>
          <h4 className="font-heading text-[13px] font-bold uppercase tracking-[0.1em] text-primary">{section.heading}</h4>
          <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-muted-foreground">{section.body}</p>
        </div>
      ))}
    </div>
  );
}
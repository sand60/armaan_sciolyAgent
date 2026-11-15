import { Copy, ExternalLink, HeartHandshake, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const FORMS = [
  {
    id: "students",
    title: "Student sign-up form",
    path: "/signup",
    description: "Tryouts, parent contacts and event preferences for students who want to join the team.",
    icon: UserPlus,
  },
  {
    id: "mentors",
    title: "Coach sign-up form",
    path: "/mentor-join",
    description: "Parents and community coaches pick the events they can coach and their availability.",
    icon: HeartHandshake,
  },
];

export default function JoinFormsCard({ school }) {
  const query = school?.school_id ? `?school=${school.school_id}` : "";

  async function copy(form) {
    const url = `${window.location.origin}${form.path}${query}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`${form.title} link copied`);
    } catch {
      toast.error("Could not copy the link — open it and copy from the address bar");
    }
  }

  function open(form) {
    window.open(`${form.path}${query}`, "_blank", "noopener");
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <h2 className="font-heading text-sm font-bold">Join forms</h2>
      <p className="mt-1 text-[12px] text-muted-foreground">
        Share these links with students and coaches — submissions land in the tables below for you to review.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {FORMS.map((form) => {
          const Icon = form.icon;
          return (
            <div key={form.id} className="rounded-xl border border-border bg-background p-3">
              <p className="flex items-center gap-2 text-[13px] font-bold">
                <Icon className="h-4 w-4 text-primary" /> {form.title}
              </p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">{form.description}</p>
              <p className="mt-2 truncate rounded-lg bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
                {form.path}
                {query}
              </p>
              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copy(form)}>
                  <Copy className="h-3.5 w-3.5" /> Copy link
                </Button>
                <Button variant="ghost" size="sm" onClick={() => open(form)}>
                  <ExternalLink className="h-3.5 w-3.5" /> Preview
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
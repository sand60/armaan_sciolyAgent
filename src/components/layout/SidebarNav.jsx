import { Link, useRouterState } from "@tanstack/react-router";
import {
  Atom,
  Bot,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FileStack,
  HeartHandshake,
  Layers,
  LayoutDashboard,
  LogOut,
  Radio,
  ScrollText,
  Sparkles,
  Target,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import BrandMark from "@/components/common/BrandMark";
import { useWorkspace } from "@/lib/useWorkspace";

const NAV = {
  "Head Coach": {
    label: "Head coach",
    home: "/dashboard",
    items: [
      { label: "Command dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "Event workspaces", to: "/events", icon: Atom },
      { label: "Season schedule", to: "/schedule", icon: CalendarDays },
      { label: "Practice schedule", to: "/practice-schedule", icon: CalendarClock },
      { label: "Team & intake", to: "/team", icon: Users },
      { label: "Student sign-up", to: "/student-signup", icon: UserPlus },
      { label: "Coach sign-up", to: "/mentor-signup", icon: HeartHandshake },
      { label: "Test bank", to: "/tests", icon: FileStack },
      { label: "Tournament day", to: "/tournament", icon: Radio },
    ],
  },
  "Event Mentor": {
    label: "Coach",
    home: "/rules",
    items: [
      { label: "Event rules", to: "/rules", icon: ScrollText },
      { label: "Season schedule", to: "/schedule", icon: CalendarDays },
      { label: "Practice schedule", to: "/practice-schedule", icon: CalendarClock },
      { label: "Build verification", to: "/mentor", icon: ClipboardCheck },
      { label: "Event workspaces", to: "/events", icon: Atom },
      { label: "AI event coach", to: "/coach", icon: Bot },
    ],
  },
  Student: {
    label: "Student",
    home: "/study",
    items: [
      { label: "Study studio", to: "/study", icon: Layers },
      { label: "Event workspaces", to: "/events", icon: Atom },
      { label: "My practice", to: "/practice", icon: Target },
      { label: "Practice schedule", to: "/practice-schedule", icon: CalendarClock },
      { label: "Build & lab log", to: "/log", icon: ClipboardList },
      { label: "Weak spots", to: "/review", icon: Sparkles },
      { label: "AI event coach", to: "/coach", icon: Bot },
    ],
  },
};

export default function SidebarNav({ onNavigate }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { user, logout } = useAuth();
  const { data } = useWorkspace();
  const role = data?.role;
  const nav = NAV[role] || NAV["Head Coach"];

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="px-2 py-1">
        <BrandMark to={nav.home} onNavigate={onNavigate} subtitle={data?.school?.school_name || "Science Olympiad"} />
      </div>

      <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {nav.label} workspace
      </p>

      <nav className="no-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto">
        {nav.items.map(({ label, to, icon: Icon }) => {
          const isActive = path === to || path.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200",
                isActive ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(57,255,20,0.25)]" : "hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className={cn("h-[18px] w-[18px] transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-border bg-muted/60 p-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
            {(user?.full_name || user?.email || "C").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{user?.full_name || "Coach"}</p>
            <p className="truncate text-[11px] text-muted-foreground">{role || user?.email}</p>
          </div>
          <button
            onClick={() => logout()}
            title="Sign out"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Camera, LayoutDashboard, Loader2, LogOut, User } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Image } from "@/components/ui/image";
import { useAuth } from "@/lib/AuthContext";
import { useWorkspace } from "@/lib/useWorkspace";
import { useAvatarUrl } from "@/components/layout/useAvatarUrl";
import RoleSwitcher from "@/components/layout/RoleSwitcher";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";

export default function UserMenu({ className }) {
  const { user, refresh, logout } = useAuth();
  const { data } = useWorkspace();
  const avatarUrl = useAvatarUrl(user?.avatar_uri);
  const fileRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const school = data?.school;
  const role = data?.role;
  const initial = (user?.full_name || user?.email || "?").slice(0, 1).toUpperCase();

  const changePhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.auth.updateMe({ avatar_uri: file_uri });
      await refresh();
    } catch (err) {
      setError(err?.message || "Could not save that photo.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Your profile"
          className={cn(
            "flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-[12px] font-bold text-primary shadow-soft transition-colors hover:border-primary/40",
            className,
          )}
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Your profile photo" className="h-full w-full object-cover" />
          ) : user ? (
            initial
          ) : (
            <User className="h-4 w-4" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[330px] overflow-hidden p-0">
        <div className="flex items-center gap-3 bg-muted/50 p-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-card">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Your profile photo" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">{initial}</span>
            )}
            {busy ? (
              <span className="absolute inset-0 flex items-center justify-center bg-card/70">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </span>
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-bold leading-tight">{user?.full_name || "Member"}</p>
            <p className="truncate text-[11.5px] text-muted-foreground">{user?.email}</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-semibold text-primary hover:underline"
            >
              <Camera className="h-3 w-3" /> {avatarUrl ? "Change photo" : "Add photo"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={changePhoto} className="hidden" />
          </div>
        </div>

        <div className="space-y-1.5 border-b border-border px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">School</span>
            <span className="truncate text-[12.5px] font-semibold">{school?.school_name || "—"}</span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Team</span>
            <span className="truncate text-[12.5px] font-semibold">{school?.division ? `${school.division} team` : "—"}</span>
          </div>
        </div>

        {error ? <p className="px-3 pt-2 text-[11.5px] font-medium text-destructive">{error}</p> : null}

        <div className="p-3">
          <RoleSwitcher currentRole={role} onDone={() => setOpen(false)} />
        </div>

        {user?.role === "admin" ? (
          <Link
            to="/admin"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-[12.5px] font-semibold text-primary transition-colors hover:bg-muted"
          >
            <LayoutDashboard className="h-3.5 w-3.5" /> Admin dashboard
          </Link>
        ) : null}

        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </PopoverContent>
    </Popover>
  );
}
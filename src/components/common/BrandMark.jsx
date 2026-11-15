import { Link } from "@tanstack/react-router";
import { LOGO_URL } from "@/lib/brand";
import { cn } from "@/lib/utils";

export default function BrandMark({ to = "/", size = "md", subtitle, onNavigate, showName = true, className }) {
  const box = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <Link to={to} onClick={onNavigate} className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/30 bg-black shadow-[0_0_20px_-8px_rgba(57,255,20,0.7)]",
          box,
        )}
      >
        <img src={LOGO_URL} alt="" className="h-full w-full object-contain" />
      </span>
      {showName ? (
        <span className="leading-tight">
          <span className="block font-heading text-[15px] font-extrabold tracking-tight">
            SciOly<span className="text-primary">CoachAgent</span>
          </span>
          {subtitle ? <span className="block text-[11px] font-semibold text-muted-foreground">{subtitle}</span> : null}
        </span>
      ) : null}
    </Link>
  );
}
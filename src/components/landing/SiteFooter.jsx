import { Link } from "@tanstack/react-router";
import BrandMark from "@/components/common/BrandMark";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <BrandMark to="/" subtitle="Coaching, practice and tournament management." />

        <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <Link to="/apply" className="hover:text-foreground">Tryout form</Link>
          <Link to="/login" className="hover:text-foreground">Sign in</Link>
        </div>

        <p className="text-[11px] text-muted-foreground">© {new Date().getFullYear()} SciOlyCoachAgent</p>
      </div>
    </footer>
  );
}
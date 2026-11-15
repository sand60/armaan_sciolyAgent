import { useState } from "react";
import { Outlet } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import BrandMark from "@/components/common/BrandMark";
import LicenseGate from "@/components/billing/LicenseGate";
import SidebarNav from "@/components/layout/SidebarNav";
import UserMenu from "@/components/layout/UserMenu";

export default function AppShell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r border-border bg-card lg:block">
        <SidebarNav />
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-xl lg:hidden">
        <BrandMark to="/dashboard" size="sm" />
        <div className="flex items-center gap-2">
          <UserMenu />
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl border border-border p-2 text-foreground transition-colors hover:bg-muted"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="lg:pl-[264px]">
        <div className="sticky top-0 z-20 hidden justify-end bg-background/85 px-4 py-2.5 backdrop-blur-xl lg:flex lg:px-10">
          <UserMenu />
        </div>
        <div className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-4 sm:px-6 lg:px-10 lg:pt-5">
          <LicenseGate>
            <Outlet />
          </LicenseGate>
        </div>
      </main>
    </div>
  );
}
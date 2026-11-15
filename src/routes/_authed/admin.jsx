import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import AdminStats from "@/components/admin/AdminStats";
import LicenseTable from "@/components/admin/LicenseTable";
import { getAdminOverview, setLicenseAccess } from "@/lib/billing-fns";

export const Route = createFileRoute("/_authed/admin")({
  loader: () => getAdminOverview(),
  head: () => ({ meta: [{ title: "Admin — schools & subscriptions" }] }),
  component: AdminPage,
});

function AdminPage() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const toggleAccess = useServerFn(setLicenseAccess);
  const [busyId, setBusyId] = useState("");

  if (data.forbidden) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Administrators only"
        description="This dashboard is limited to platform administrators. Ask the app owner if you need access."
      />
    );
  }

  async function change(license, action) {
    setBusyId(license.id);
    try {
      await toggleAccess({ data: { license_id: license.id, action } });
      await router.invalidate();
      toast(action === "disable" ? "Access disabled" : "Access restored", {
        description: license.school_name,
      });
    } catch (error) {
      toast("Could not update access", { description: error?.message || "Try again." });
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform admin"
        title="Schools & subscriptions"
        description="Every registered school, the licenses each team purchased, payment status, renewals and access controls."
      />

      <AdminStats counts={data.counts} />

      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-heading text-lg font-extrabold tracking-tight">Team licenses</h2>
          <p className="text-xs text-muted-foreground">Disable or restore access per team — the school follows its licenses.</p>
        </div>
        <LicenseTable licenses={data.licenses} busyId={busyId} onToggle={change} />
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-extrabold tracking-tight">Registered schools</h2>
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-4 py-3 font-semibold">School</th>
                <th className="px-4 py-3 font-semibold">Division</th>
                <th className="px-4 py-3 font-semibold">Head coach</th>
                <th className="px-4 py-3 font-semibold">Subscription</th>
                <th className="px-4 py-3 font-semibold">Team code</th>
              </tr>
            </thead>
            <tbody>
              {data.schools.length ? (
                data.schools.map((school) => (
                  <tr key={school.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 font-semibold">{school.school_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{school.division}</td>
                    <td className="px-4 py-3 text-muted-foreground">{school.head_coach_email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{school.subscription_status}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{school.school_id}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No schools have registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
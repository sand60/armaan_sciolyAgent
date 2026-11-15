import { useAuth } from "@/lib/AuthContext";
import { useWorkspace } from "@/lib/useWorkspace";
import LicenseWall from "./LicenseWall";

// Only an unconfirmed or expired license blocks the workspace, and platform
// admins are never blocked. A missing school keeps the page's own behaviour.
const LOCKED_STATUSES = ["Awaiting payment", "Expired"];

export default function LicenseGate({ children }) {
  const { user } = useAuth();
  const { data } = useWorkspace();
  const school = data?.school;
  const locked = Boolean(school) && LOCKED_STATUSES.includes(school.subscription_status) && user?.role !== "admin";

  if (locked) return <LicenseWall school={school} />;
  return children;
}
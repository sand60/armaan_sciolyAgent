import { createFileRoute } from "@tanstack/react-router";
import { ensureDefaultSchool } from "@/lib/provision.server";

async function bootstrap(context) {
  const admin = context.getBase44().asServiceRole;
  const result = await ensureDefaultSchool(admin);
  return Response.json({ created: result.created, school_id: result.school?.school_id ?? null });
}

export const Route = createFileRoute("/api/bootstrap")({
  server: {
    handlers: {
      GET: ({ context }) => bootstrap(context),
      POST: ({ context }) => bootstrap(context),
    },
  },
});
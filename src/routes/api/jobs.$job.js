import { createFileRoute } from "@tanstack/react-router";
import { secrets } from "base44:runtime";
import { runAutomation } from "@/lib/jobs.server";

const rows = (result) => (Array.isArray(result) ? result : result?.items ?? []);

export const Route = createFileRoute("/api/jobs/$job")({
  server: {
    handlers: {
      POST: async ({ request, params, context }) => {
        const expected = secrets.get("JOBS_SECRET");
        if (!expected) return Response.json({ error: "JOBS_SECRET is not configured" }, { status: 503 });

        const url = new URL(request.url);
        const provided = request.headers.get("x-job-key") || url.searchParams.get("key");
        if (provided !== expected) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const admin = context.getBase44().asServiceRole;
        const code = url.searchParams.get("school");
        const schoolRows = code
          ? rows(await admin.entities.School.filter({ school_id: code }))
          : rows(await admin.entities.School.list("-created_date", 1));
        const school = schoolRows[0];
        if (!school) return Response.json({ error: "No school workspace found" }, { status: 404 });

        try {
          const result = await runAutomation(admin, school, params.job, url.origin);
          return Response.json({ job: params.job, school_id: school.school_id, result });
        } catch (error) {
          return Response.json({ job: params.job, error: String(error?.message || error) }, { status: 400 });
        }
      },
    },
  },
});
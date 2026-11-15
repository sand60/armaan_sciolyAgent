import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { resolveWorkspace } from "@/lib/workspace";

const rows = (result) => (Array.isArray(result) ? result : result?.items ?? []);
const STAFF = ["Head Coach", "Event Mentor"];
const text = (value, max = 200) => String(value ?? "").trim().slice(0, max);

function assertStaff(role) {
  if (!STAFF.includes(role)) {
    throw Object.assign(new Error("Only coaches and mentors can manage the practice schedule"), { status: 403 });
  }
}

export const getPracticeSchedule = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const { admin, school, role } = await resolveWorkspace(context);
    const school_id = school.school_id;
    const [sessions, events] = await Promise.all([
      admin.entities.PracticeSession.filter({ school_id }, { sort: "start_time", limit: 300 }),
      admin.entities.Event.filter({ school_id }),
    ]);
    return {
      role,
      canManage: STAFF.includes(role),
      sessions: rows(sessions),
      events: rows(events)
        .map((event) => event.event_name)
        .filter(Boolean)
        .sort(),
    };
  });

const CreateInput = z
  .object({
    event_name: z.string().min(1).max(120),
    mentor_name: z.string().min(1).max(120),
    start_time: z.string().min(1).max(40),
    session_type: z.enum(["Virtual", "In person"]),
    location: z.string().max(200).optional(),
    notes: z.string().max(600).optional(),
    repeat_weeks: z.coerce.number().int().min(1).max(20).optional(),
  })
  .refine((data) => data.session_type !== "In person" || String(data.location || "").trim().length > 0, {
    message: "A location is required for an in-person practice",
    path: ["location"],
  });

export const createPracticeSession = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(CreateInput)
  .handler(async ({ data, context }) => {
    const { admin, school, role, user } = await resolveWorkspace(context);
    assertStaff(role);
    const start = new Date(data.start_time);
    if (Number.isNaN(start.getTime())) {
      throw Object.assign(new Error("Pick a valid practice date and time"), { status: 400 });
    }
    const base = {
      school_id: school.school_id,
      event_name: text(data.event_name, 120),
      mentor_name: text(data.mentor_name, 120),
      session_type: data.session_type,
      location: data.session_type === "In person" ? text(data.location, 200) : "",
      notes: text(data.notes, 600),
      status: "Scheduled",
      created_by_name: user.full_name || user.email,
    };
    const weeks = Math.round(data.repeat_weeks || 1);
    const payloads = Array.from({ length: weeks }, (_, index) => ({
      ...base,
      start_time: new Date(start.getTime() + index * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));
    if (payloads.length === 1) return admin.entities.PracticeSession.create(payloads[0]);
    return admin.entities.PracticeSession.bulkCreate(payloads);
  });

export const cancelPracticeSession = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const { admin, school, role } = await resolveWorkspace(context);
    assertStaff(role);
    const session = await admin.entities.PracticeSession.get(data.id).catch(() => null);
    if (!session || session.school_id !== school.school_id) {
      throw Object.assign(new Error("Practice not found"), { status: 404 });
    }
    return admin.entities.PracticeSession.update(session.id, { status: "Cancelled" });
  });
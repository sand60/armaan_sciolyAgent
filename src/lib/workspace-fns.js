import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { resolveWorkspace, requireHeadCoach } from "@/lib/workspace";
import { emailsOf, slotsOf } from "@/lib/scioly";
import { catalogForDivision } from "@/lib/event-catalog";

const rows = (result) => (Array.isArray(result) ? result : result?.items ?? []);
const lower = (value) => String(value || "").toLowerCase();
const text = (value, max = 300) => String(value ?? "").trim().slice(0, max);

const StudentSignupInput = z.object({
  student_name: z.string().min(2).max(120),
  grade: z.string().max(20).optional(),
  student_email: z.string().email().max(160),
  student_phone: z.string().max(40).optional(),
  parent_name: z.string().min(2).max(120),
  parent_email: z.string().email().max(160),
  parent_whatsapp_phone: z.string().min(7).max(40),
  parent_2_name: z.string().max(120).optional(),
  parent_2_email: z.string().max(160).optional(),
  parent_2_phone: z.string().max(40).optional(),
  parent_coach_events: z.string().min(2).max(300),
  rules_acknowledged: z.boolean(),
  division: z.enum(["Division B", "Division C"]),
  event_choices: z.array(z.string().max(120)).min(1).max(12),
});

function studentSignupPayload(data, schoolId) {
  const choices = data.event_choices.map((name) => text(name, 120));
  return {
    school_id: schoolId,
    student_name: text(data.student_name, 120),
    grade: text(data.grade, 20),
    student_email: lower(data.student_email),
    student_phone: text(data.student_phone, 40),
    parent_name: text(data.parent_name, 120),
    parent_email: lower(data.parent_email),
    parent_whatsapp_phone: text(data.parent_whatsapp_phone, 40),
    parent_2_name: text(data.parent_2_name, 120),
    parent_2_email: lower(data.parent_2_email),
    parent_2_phone: text(data.parent_2_phone, 40),
    parent_coach_events: text(data.parent_coach_events, 300),
    rules_acknowledged: data.rules_acknowledged,
    division: data.division,
    event_choices: choices,
    top_choice_1: choices[0],
    top_choice_2: choices[1] || "",
    top_choice_3: choices[2] || "",
    backup_choice_4: choices[3] || "",
    status: "New",
  };
}

async function buildEventsByDivision(admin, schoolId) {
  const events = rows(await admin.entities.Event.filter({ school_id: schoolId }));
  const eventsByDivision = {};
  for (const division of ["Division B", "Division C"]) {
    const owned = events
      .filter((event) => event.division === division && event.event_name)
      .map((event) => ({ name: event.event_name, block: event.time_block || "Self-Scheduled" }));
    const list = owned.length
      ? owned
      : catalogForDivision(division).map((event) => ({ name: event.name, block: event.block || "Self-Scheduled" }));
    const seen = new Set();
    eventsByDivision[division] = list
      .filter((event) => {
        if (seen.has(event.name)) return false;
        seen.add(event.name);
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  return eventsByDivision;
}

export const getWorkspace = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const { school, role, user } = await resolveWorkspace(context);
    return {
      school,
      role,
      user: { id: user.id, email: user.email, full_name: user.full_name || user.email },
    };
  });

export const getCoachData = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const { admin, school, role } = await resolveWorkspace(context);
    const school_id = school.school_id;
    const [events, partnerships, logs, tournaments, schedule, applications, mentors, alerts] = await Promise.all([
      admin.entities.Event.filter({ school_id }),
      admin.entities.Partnership.filter({ school_id }),
      admin.entities.PracticeLog.filter({ school_id }),
      admin.entities.Tournament.filter({ school_id }),
      admin.entities.TournamentSchedule.filter({ school_id }),
      admin.entities.StudentApplication.filter({ school_id }),
      admin.entities.Mentor.filter({ school_id }),
      admin.entities.TeamAlert.filter({ school_id }),
    ]);
    return {
      school,
      role,
      events: rows(events),
      partnerships: rows(partnerships),
      logs: rows(logs),
      tournaments: rows(tournaments),
      schedule: rows(schedule),
      applications: rows(applications),
      mentors: rows(mentors),
      alerts: rows(alerts).slice(0, 8),
    };
  });

export const getPracticeData = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const { admin, school, role, user } = await resolveWorkspace(context);
    const school_id = school.school_id;
    const email = lower(user.email);
    const [events, partnerships, logs, tournaments] = await Promise.all([
      admin.entities.Event.filter({ school_id }),
      admin.entities.Partnership.filter({ school_id }),
      admin.entities.PracticeLog.filter({ school_id }),
      admin.entities.Tournament.filter({ school_id }),
    ]);
    return {
      school,
      role,
      user: { id: user.id, email: user.email, full_name: user.full_name || user.email },
      events: rows(events),
      partnerships: rows(partnerships),
      logs: rows(logs).filter((log) => lower(log.student_email) === email),
      tournaments: rows(tournaments),
    };
  });

export const getMentorData = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const { admin, school, role, user } = await resolveWorkspace(context);
    const school_id = school.school_id;
    const [events, logs, mentors, partnerships] = await Promise.all([
      admin.entities.Event.filter({ school_id }),
      admin.entities.PracticeLog.filter({ school_id }),
      admin.entities.Mentor.filter({ school_id }),
      admin.entities.Partnership.filter({ school_id }),
    ]);
    return { school, role, user: { email: user.email, full_name: user.full_name || user.email }, events: rows(events), logs: rows(logs), mentors: rows(mentors), partnerships: rows(partnerships) };
  });

export const getTestsData = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const { admin, school, role } = await resolveWorkspace(context);
    const [tests, events] = await Promise.all([
      admin.entities.TestRepository.filter({ school_id: school.school_id }),
      admin.entities.Event.filter({ school_id: school.school_id }),
    ]);
    return { school, role, tests: rows(tests), events: rows(events) };
  });

export const getTournamentData = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const { admin, school, role } = await resolveWorkspace(context);
    const school_id = school.school_id;
    const [tournaments, schedule, partnerships, events] = await Promise.all([
      admin.entities.Tournament.filter({ school_id }),
      admin.entities.TournamentSchedule.filter({ school_id }),
      admin.entities.Partnership.filter({ school_id }),
      admin.entities.Event.filter({ school_id }),
    ]);
    return { school, role, tournaments: rows(tournaments), schedule: rows(schedule), partnerships: rows(partnerships), events: rows(events) };
  });

export const getTeamData = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const { admin, school, role } = await resolveWorkspace(context);
    const school_id = school.school_id;
    const [applications, partnerships, mentors, events] = await Promise.all([
      admin.entities.StudentApplication.filter({ school_id }),
      admin.entities.Partnership.filter({ school_id }),
      admin.entities.Mentor.filter({ school_id }),
      admin.entities.Event.filter({ school_id }),
    ]);
    return { school, role, applications: rows(applications), partnerships: rows(partnerships), mentors: rows(mentors), events: rows(events) };
  });

export const updateSchoolInfo = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      school_name: z.string().min(2).max(120),
      division: z.enum(["Division B", "Division C"]),
      head_coach_email: z.string().email().max(160),
      team_whatsapp_group_id: z.string().max(120).optional(),
      whatsapp_webhook_url: z.string().max(400).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { admin, school } = await requireHeadCoach(context);
    return admin.entities.School.update(school.id, {
      school_name: text(data.school_name, 120),
      division: data.division,
      head_coach_email: lower(data.head_coach_email),
      team_whatsapp_group_id: text(data.team_whatsapp_group_id, 120),
      whatsapp_webhook_url: text(data.whatsapp_webhook_url, 400),
    });
  });

export const updateEventMentor = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ event_id: z.string().min(1).max(64), mentor_email: z.string().max(160) }))
  .handler(async ({ data, context }) => {
    const { admin, school } = await requireHeadCoach(context);
    const event = await admin.entities.Event.get(data.event_id);
    if (event.school_id !== school.school_id) throw new Error("Not your event");
    const mentorEmail = lower(data.mentor_email);
    const updated = await admin.entities.Event.update(event.id, { event_mentor_email: mentorEmail });
    if (mentorEmail) {
      const mentors = rows(await admin.entities.Mentor.filter({ school_id: school.school_id, mentor_email: mentorEmail }));
      if (mentors.length) await admin.entities.Mentor.update(mentors[0].id, { assigned_event: event.event_name });
    }
    return updated;
  });

export const attachRuleManual = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ event_id: z.string().min(1).max(64), file_uri: z.string().min(1).max(2000) }))
  .handler(async ({ data, context }) => {
    const { admin, school } = await requireHeadCoach(context);
    const event = await admin.entities.Event.get(data.event_id);
    if (event.school_id !== school.school_id) throw new Error("Not your event");
    return admin.entities.Event.update(event.id, { rule_manual_uri: data.file_uri });
  });

export const autoPopulateRoster = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const { admin, school } = await requireHeadCoach(context);
    const school_id = school.school_id;
    const [eventRows, partnershipRows, applicationRows] = await Promise.all([
      admin.entities.Event.filter({ school_id }),
      admin.entities.Partnership.filter({ school_id }),
      admin.entities.StudentApplication.filter({ school_id }),
    ]);
    const events = rows(eventRows);
    const partnerships = rows(partnershipRows);
    const applications = rows(applicationRows);
    const eventByName = new Map(events.map((event) => [event.event_name, event]));
    const assigned = new Map();
    const blocks = new Map();

    for (const partnership of partnerships) {
      const event = eventByName.get(partnership.event_name);
      for (const email of emailsOf(partnership)) {
        assigned.set(email, new Set([...(assigned.get(email) || []), partnership.event_name]));
        if (event?.time_block && event.time_block !== "Self-Scheduled") {
          blocks.set(email, new Set([...(blocks.get(email) || []), event.time_block]));
        }
      }
    }

    let placed = 0;
    let waitlisted = 0;
    const ordered = [...applications].sort((a, b) => (b.tryout_score || 0) - (a.tryout_score || 0));

    for (const application of ordered) {
      if (application.status === "Placed") continue;
      const email = lower(application.student_email);
      if (!email || assigned.has(email)) continue;
      const choices = [application.top_choice_1, application.top_choice_2, application.top_choice_3, application.backup_choice_4].filter(Boolean);

      let chosen = null;
      for (const name of choices) {
        const event = eventByName.get(name);
        if (!event) continue;
        const filled = partnerships.filter((partnership) => partnership.event_name === name).reduce((count, partnership) => count + slotsOf(partnership).length, 0);
        if (filled >= (event.max_partners || 2)) continue;
        const taken = blocks.get(email) || new Set();
        if (event.time_block !== "Self-Scheduled" && taken.has(event.time_block)) continue;
        chosen = event;
        break;
      }

      if (!chosen) {
        await admin.entities.StudentApplication.update(application.id, { status: "Waitlist" });
        waitlisted += 1;
        continue;
      }

      const openPartnership = partnerships.find((partnership) => partnership.event_name === chosen.event_name && slotsOf(partnership).length < (chosen.max_partners || 2));
      if (openPartnership) {
        const slot = [1, 2, 3].find((index) => !openPartnership[`student_${index}_email`] && !openPartnership[`student_${index}_name`]);
        if (slot) {
          await admin.entities.Partnership.update(openPartnership.id, {
            [`student_${slot}_name`]: application.student_name,
            [`student_${slot}_email`]: email,
          });
          openPartnership[`student_${slot}_name`] = application.student_name;
          openPartnership[`student_${slot}_email`] = email;
        }
      } else {
        const created = await admin.entities.Partnership.create({
          school_id,
          event_name: chosen.event_name,
          student_1_name: application.student_name,
          student_1_email: email,
          readiness_xp: 0,
          impound_checklist_verified: false,
        });
        partnerships.push(created);
      }

      assigned.set(email, new Set([...(assigned.get(email) || []), chosen.event_name]));
      if (chosen.time_block && chosen.time_block !== "Self-Scheduled") {
        blocks.set(email, new Set([...(blocks.get(email) || []), chosen.time_block]));
      }
      await admin.entities.StudentApplication.update(application.id, { status: "Placed", placed_event: chosen.event_name });
      placed += 1;
    }

    return { placed, waitlisted, applied: applications.length };
  });

export const saveQuizResult = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      event_name: z.string().min(1).max(120),
      mode: z.enum(["practice", "mock"]),
      score: z.number().int().min(0).max(100),
      total: z.number().int().min(1).max(100),
      missed: z
        .array(
          z.object({
            question_text: z.string().max(1200),
            sub_topic: z.string().max(160).optional(),
            options: z.array(z.string().max(400)).max(6).optional(),
            correct_answer: z.string().max(600),
            explanation: z.string().max(1600).optional(),
          }),
        )
        .max(60),
    }),
  )
  .handler(async ({ data, context }) => {
    const { admin, school, user } = await resolveWorkspace(context);
    const school_id = school.school_id;
    const email = lower(user.email);

    await admin.entities.PracticeLog.create({
      school_id,
      event_name: data.event_name,
      student_email: email,
      student_name: user.full_name || email,
      activity_type: "Quiz",
      quiz_score: data.score,
      quiz_total: data.total,
      missed_questions: data.missed,
      ai_rule_check: "Not checked",
    });

    const partnerships = rows(await admin.entities.Partnership.filter({ school_id, event_name: data.event_name })).filter((partnership) => emailsOf(partnership).includes(email));
    if (partnerships.length) {
      const partnership = partnerships[0];
      await admin.entities.Partnership.update(partnership.id, {
        readiness_xp: (partnership.readiness_xp || 0) + 40 + data.score * 3,
        last_activity_date: new Date().toISOString(),
      });
    }

    return { score: data.score, total: data.total, missed: data.missed.length };
  });

export const verifyBuildLog = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ log_id: z.string().min(1).max(64), mentor_notes: z.string().max(600).optional() }))
  .handler(async ({ data, context }) => {
    const { admin, school } = await resolveWorkspace(context);
    const log = await admin.entities.PracticeLog.get(data.log_id);
    if (log.school_id !== school.school_id) throw new Error("Not your submission");
    await admin.entities.PracticeLog.update(log.id, { mentor_verified: true, mentor_notes: text(data.mentor_notes, 600) });

    const partnerships = rows(await admin.entities.Partnership.filter({ school_id: school.school_id, event_name: log.event_name })).filter((partnership) =>
      emailsOf(partnership).includes(lower(log.student_email)),
    );
    if (partnerships.length) {
      const partnership = partnerships[0];
      await admin.entities.Partnership.update(partnership.id, {
        impound_checklist_verified: true,
        readiness_xp: (partnership.readiness_xp || 0) + 60,
        last_activity_date: new Date().toISOString(),
      });
    }
    return { verified: true };
  });

export const flagBuildLog = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ log_id: z.string().min(1).max(64), reason: z.string().min(2).max(600), base_url: z.string().max(300).optional() }))
  .handler(async ({ data, context }) => {
    const { admin, school } = await resolveWorkspace(context);
    const log = await admin.entities.PracticeLog.get(data.log_id);
    if (log.school_id !== school.school_id) throw new Error("Not your submission");
    await admin.entities.PracticeLog.update(log.id, { flag_reason: text(data.reason, 600), mentor_verified: false });

    const partnerships = rows(await admin.entities.Partnership.filter({ school_id: school.school_id, event_name: log.event_name })).filter((partnership) =>
      emailsOf(partnership).includes(lower(log.student_email)),
    );
    const { sendTeamAlert } = await import("@/lib/jobs.server");
    const emails = partnerships.length ? emailsOf(partnerships[0]) : [lower(log.student_email)];
    for (const email of emails.filter(Boolean).slice(0, 3)) {
      await sendTeamAlert(admin, school, {
        recipient_email: email,
        subject: `Fix needed: ${log.event_name} submission`,
        message_body: `Your mentor flagged the ${log.event_name} submission.\n\nReason: ${data.reason}\n\nRe-test, photograph the fix and log it again: ${data.base_url || ""}/log`,
      });
    }
    return { flagged: true };
  });

export const swapStudent = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      partnership_id: z.string().min(1).max(64),
      slot: z.number().int().min(1).max(3),
      name: z.string().min(1).max(120),
      email: z.string().max(160).optional(),
      note: z.string().max(300).optional(),
      base_url: z.string().max(300).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { admin, school } = await requireHeadCoach(context);
    const partnership = await admin.entities.Partnership.get(data.partnership_id);
    if (partnership.school_id !== school.school_id) throw new Error("Not your partnership");
    const updated = await admin.entities.Partnership.update(partnership.id, {
      [`student_${data.slot}_name`]: text(data.name, 120),
      [`student_${data.slot}_email`]: lower(data.email),
    });
    const { sendTeamAlert } = await import("@/lib/jobs.server");
    await sendTeamAlert(admin, school, {
      recipient_email: school.head_coach_email,
      group_or_phone_id: school.team_whatsapp_group_id,
      subject: `Alternate swap — ${partnership.event_name}`,
      message_body: `${data.name} now fills slot ${data.slot} for ${partnership.event_name}. ${data.note || ""}\nTournament command center: ${data.base_url || ""}/tournament`,
    });
    return updated;
  });

export const toggleScheduleItem = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      id: z.string().min(1).max(64),
      field: z.enum(["impound_complete", "students_checked_in", "event_completed"]),
      value: z.boolean(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { admin, school } = await resolveWorkspace(context);
    const item = await admin.entities.TournamentSchedule.get(data.id);
    if (item.school_id !== school.school_id) throw new Error("Not your schedule");
    return admin.entities.TournamentSchedule.update(item.id, { [data.field]: data.value });
  });

export const importSchedule = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      tournament_name: z.string().min(1).max(200),
      rows: z
        .array(
          z.object({
            event_name: z.string().min(1).max(120),
            room_location: z.string().max(160).optional(),
            impound_window: z.string().max(160).optional(),
            event_time_slot: z.string().max(160).optional(),
          }),
        )
        .min(1)
        .max(80),
    }),
  )
  .handler(async ({ data, context }) => {
    const { admin, school } = await requireHeadCoach(context);
    const created = await admin.entities.TournamentSchedule.bulkCreate(
      data.rows.map((row) => ({
        school_id: school.school_id,
        tournament_name: text(data.tournament_name, 200),
        event_name: text(row.event_name, 120),
        room_location: text(row.room_location, 160),
        impound_window: text(row.impound_window, 160),
        event_time_slot: text(row.event_time_slot, 160),
        impound_complete: false,
        students_checked_in: false,
        event_completed: false,
      })),
    );
    return { imported: Array.isArray(created) ? created.length : data.rows.length };
  });

export const runCoachAutomation = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      job: z.enum(["monday-blast", "thursday-nudge", "friday-digest", "tournament-alerts"]),
      base_url: z.string().max(300),
    }),
  )
  .handler(async ({ data, context }) => {
    const { admin, school } = await requireHeadCoach(context);
    const { runAutomation } = await import("@/lib/jobs.server");
    return runAutomation(admin, school, data.job, data.base_url.replace(/\/$/, ""));
  });

export const updateApplicationScore = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ application_id: z.string().min(1).max(64), tryout_score: z.number().min(0).max(100) }))
  .handler(async ({ data, context }) => {
    const { admin, school } = await requireHeadCoach(context);
    const application = await admin.entities.StudentApplication.get(data.application_id);
    if (application.school_id !== school.school_id) throw new Error("Not your application");
    return admin.entities.StudentApplication.update(application.id, { tryout_score: data.tryout_score });
  });

export const updateMentorCheck = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      mentor_id: z.string().min(1).max(64),
      background_check_status: z.enum(["Not Started", "Pending", "Cleared"]),
    }),
  )
  .handler(async ({ data, context }) => {
    const { admin, school } = await requireHeadCoach(context);
    const mentor = await admin.entities.Mentor.get(data.mentor_id);
    if (mentor.school_id !== school.school_id) throw new Error("Not your mentor");
    return admin.entities.Mentor.update(mentor.id, { background_check_status: data.background_check_status });
  });

// Public: the shareable tryout form needs the school name and the event list.
export const getApplyForm = createServerFn({ method: "GET" })
  .validator(z.object({ code: z.string().max(40).optional() }))
  .handler(async ({ data, context }) => {
    const admin = context.getBase44().asServiceRole;
    const { ensureDefaultSchool } = await import("@/lib/provision.server");
    let school = null;
    if (data.code) school = rows(await admin.entities.School.filter({ school_id: data.code }))[0] ?? null;
    if (!school) await ensureDefaultSchool(admin);
    if (!school) school = rows(await admin.entities.School.list("-created_date", 1))[0] ?? null;
    if (!school) return { school: null, events: [] };
    const events = rows(await admin.entities.Event.filter({ school_id: school.school_id }));
    return {
      school: { school_id: school.school_id, school_name: school.school_name, division: school.division },
      events: events.sort((a, b) => a.event_name.localeCompare(b.event_name)).map((event) => event.event_name),
    };
  });

export const submitApplication = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: z.string().max(40).optional(),
      student_name: z.string().min(2).max(120),
      grade: z.string().max(20),
      student_email: z.string().email().max(160),
      parent_name: z.string().min(2).max(120),
      parent_email: z.string().email().max(160),
      parent_whatsapp_phone: z.string().max(40),
      parent_volunteer_interest: z.boolean(),
      top_choice_1: z.string().min(1).max(120),
      top_choice_2: z.string().max(120),
      top_choice_3: z.string().max(120),
      backup_choice_4: z.string().max(120),
      preferred_partner: z.string().max(120),
      tryout_score: z.number().min(0).max(100).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const admin = context.getBase44().asServiceRole;
    const { ensureDefaultSchool } = await import("@/lib/provision.server");
    await ensureDefaultSchool(admin);
    let school = data.code ? rows(await admin.entities.School.filter({ school_id: data.code }))[0] ?? null : null;
    if (!school) school = rows(await admin.entities.School.list("-created_date", 1))[0] ?? null;
    if (!school) throw new Error("No school workspace is available yet.");

    const application = await admin.entities.StudentApplication.create({
      school_id: school.school_id,
      student_name: text(data.student_name, 120),
      grade: text(data.grade, 20),
      student_email: lower(data.student_email),
      parent_name: text(data.parent_name, 120),
      parent_email: lower(data.parent_email),
      parent_whatsapp_phone: text(data.parent_whatsapp_phone, 40),
      parent_volunteer_interest: data.parent_volunteer_interest,
      top_choice_1: text(data.top_choice_1, 120),
      top_choice_2: text(data.top_choice_2, 120),
      top_choice_3: text(data.top_choice_3, 120),
      backup_choice_4: text(data.backup_choice_4, 120),
      preferred_partner: text(data.preferred_partner, 120),
      tryout_score: data.tryout_score ?? 0,
      status: "New",
    });

    if (data.parent_volunteer_interest) {
      const existing = rows(await admin.entities.Mentor.filter({ school_id: school.school_id, mentor_email: lower(data.parent_email) }));
      if (!existing.length) {
        await admin.entities.Mentor.create({
          school_id: school.school_id,
          mentor_name: text(data.parent_name, 120),
          mentor_email: lower(data.parent_email),
          whatsapp_phone: text(data.parent_whatsapp_phone, 40),
          child_name: text(data.student_name, 120),
          volunteer_type: "Parent volunteer",
          preferred_events: [data.top_choice_1, data.top_choice_2].filter(Boolean).join(", "),
          availability_window: "",
          background_check_status: "Not Started",
        });
      }
    }

    return { ok: true, application_id: application.id };
  });

export const startSchoolTrial = createServerFn({ method: "POST" })
  .validator(
    z.object({
      school_name: z.string().min(2).max(120),
      division: z.enum(["Division B", "Division C"]),
      head_coach_email: z.string().email().max(160),
      plan: z.enum(["Single Team", "Varsity + JV", "District Bundle"]),
    }),
  )
  .handler(async ({ data, context }) => {
    const admin = context.getBase44().asServiceRole;
    const { provisionSchool } = await import("@/lib/provision.server");
    const existing = rows(await admin.entities.School.filter({ head_coach_email: lower(data.head_coach_email) }));
    if (existing.length) {
      return { school: existing[0], created: false };
    }
    const school = await provisionSchool(admin, {
      school_name: text(data.school_name, 120),
      division: data.division,
      head_coach_email: lower(data.head_coach_email),
      subscription_status: "Trial",
      plan: data.plan,
    });
    return { school, created: true };
  });

export const getMentorJoinForm = createServerFn({ method: "GET" })
  .validator(z.object({ code: z.string().max(40).optional() }))
  .handler(async ({ data, context }) => {
    const admin = context.getBase44().asServiceRole;
    const { ensureDefaultSchool } = await import("@/lib/provision.server");
    let school = null;
    if (data.code) school = rows(await admin.entities.School.filter({ school_id: data.code }))[0] ?? null;
    if (!school) await ensureDefaultSchool(admin);
    if (!school) school = rows(await admin.entities.School.list("-created_date", 1))[0] ?? null;
    if (!school) return { school: null, events: [] };
    const events = rows(await admin.entities.Event.filter({ school_id: school.school_id }));
    return {
      school: { school_id: school.school_id, school_name: school.school_name, division: school.division },
      events: events.sort((a, b) => a.event_name.localeCompare(b.event_name)).map((event) => event.event_name),
    };
  });

export const getMentorSignupData = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const { admin, school, role } = await resolveWorkspace(context);
    if (role !== "Head Coach" || !school) return { role, school: null, events: [] };
    const events = rows(await admin.entities.Event.filter({ school_id: school.school_id }));
    return {
      role,
      school: { school_id: school.school_id, school_name: school.school_name, division: school.division },
      events: events.sort((a, b) => a.event_name.localeCompare(b.event_name)).map((event) => event.event_name),
    };
  });

export const getStudentSignupData = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const { admin, school, role } = await resolveWorkspace(context);
    const empty = { "Division B": [], "Division C": [] };
    if (role !== "Head Coach" || !school) return { role, school: null, eventsByDivision: empty };

    return {
      role,
      school: { school_id: school.school_id, school_name: school.school_name, division: school.division },
      eventsByDivision: await buildEventsByDivision(admin, school.school_id),
    };
  });

export const submitStudentSignup = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(StudentSignupInput)
  .handler(async ({ data, context }) => {
    const { admin, school } = await requireHeadCoach(context);
    return admin.entities.StudentApplication.create(studentSignupPayload(data, school.school_id));
  });

export const getPublicStudentSignup = createServerFn({ method: "GET" })
  .validator(z.object({ code: z.string().max(40).optional() }))
  .handler(async ({ data, context }) => {
    const admin = context.getBase44().asServiceRole;
    const { ensureDefaultSchool } = await import("@/lib/provision.server");
    let school = null;
    if (data.code) school = rows(await admin.entities.School.filter({ school_id: data.code }))[0] ?? null;
    if (!school) await ensureDefaultSchool(admin);
    if (!school) school = rows(await admin.entities.School.list("-created_date", 1))[0] ?? null;
    if (!school) return { school: null, eventsByDivision: { "Division B": [], "Division C": [] } };
    return {
      school: { school_id: school.school_id, school_name: school.school_name, division: school.division },
      eventsByDivision: await buildEventsByDivision(admin, school.school_id),
    };
  });

export const submitPublicStudentSignup = createServerFn({ method: "POST" })
  .validator(StudentSignupInput.extend({ code: z.string().max(40).optional() }))
  .handler(async ({ data, context }) => {
    const admin = context.getBase44().asServiceRole;
    const { ensureDefaultSchool } = await import("@/lib/provision.server");
    await ensureDefaultSchool(admin);
    let school = data.code ? rows(await admin.entities.School.filter({ school_id: data.code }))[0] ?? null : null;
    if (!school) school = rows(await admin.entities.School.list("-created_date", 1))[0] ?? null;
    if (!school) throw new Error("No school workspace is available yet.");
    const application = await admin.entities.StudentApplication.create(studentSignupPayload(data, school.school_id));
    return { ok: true, application_id: application.id };
  });

export const submitMentorJoin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: z.string().max(40).optional(),
      mentor_name: z.string().min(2).max(120),
      mentor_email: z.string().email().max(160),
      whatsapp_phone: z.string().max(40).optional(),
      child_name: z.string().max(120).optional(),
      volunteer_type: z.enum(["Parent volunteer", "Community coach", "Alumni coach", "Teacher"]),
      preferred_events: z.array(z.string().max(120)).max(4),
      availability_window: z.string().max(200).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const admin = context.getBase44().asServiceRole;
    const { ensureDefaultSchool } = await import("@/lib/provision.server");
    await ensureDefaultSchool(admin);
    let school = data.code ? rows(await admin.entities.School.filter({ school_id: data.code }))[0] ?? null : null;
    if (!school) school = rows(await admin.entities.School.list("-created_date", 1))[0] ?? null;
    if (!school) throw new Error("No school workspace is available yet.");

    const email = lower(data.mentor_email);
    const existing = rows(await admin.entities.Mentor.filter({ school_id: school.school_id, mentor_email: email }));
    const payload = {
      school_id: school.school_id,
      mentor_name: text(data.mentor_name, 120),
      mentor_email: email,
      whatsapp_phone: text(data.whatsapp_phone, 40),
      child_name: text(data.child_name, 120),
      volunteer_type: data.volunteer_type,
      preferred_events: data.preferred_events.map((name) => text(name, 120)).join(", "),
      availability_window: text(data.availability_window, 200),
    };

    if (existing.length) {
      await admin.entities.Mentor.update(existing[0].id, payload);
      return { ok: true, mentor_id: existing[0].id, updated: true };
    }

    const mentor = await admin.entities.Mentor.create({ ...payload, background_check_status: "Not Started" });
    return { ok: true, mentor_id: mentor.id, updated: false };
  });

const ROLE_CODES = {
  "Head Coach": "test code",
  "Event Mentor": "Mentor test code",
  Student: "Student test code",
};

export const setAppRole = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      role: z.enum(["Head Coach", "Event Mentor", "Student"]),
      code: z.string().min(1).max(40),
    }),
  )
  .handler(async ({ data, context }) => {
    const roleLabel = { "Head Coach": "head coach", "Event Mentor": "coach", Student: "student" }[data.role];
    if (ROLE_CODES[data.role] !== data.code.trim()) {
      throw new Error(`That code does not unlock the ${roleLabel} view.`);
    }
    const { admin, user } = await resolveWorkspace(context);
    await admin.entities.User.update(user.id, { app_role: data.role });
    return { ok: true, role: data.role };
  });
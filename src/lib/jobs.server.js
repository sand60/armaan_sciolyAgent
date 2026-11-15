import { secrets } from "base44:runtime";
import { GOALS_SCHEMA, goalsPrompt } from "@/lib/scioly-prompts.server";
import { emailsOf, readinessOf } from "@/lib/scioly";

const rows = (result) => (Array.isArray(result) ? result : result?.items ?? []);
const WHAPI_FALLBACK = "https://gate.whapi.cloud/messages/text";
const DAY = 86400000;

async function logAlert(admin, school, entry) {
  await admin.entities.TeamAlert.create({
    school_id: school.school_id,
    subject: entry.subject.slice(0, 200),
    body: entry.body.slice(0, 4000),
    channel: entry.channel,
    status: entry.status,
    detail: entry.detail || "",
    recipient_email: entry.recipient_email || "",
    recipient_label: entry.recipient_label || "",
  }).catch(() => null);
}

// Unified notification: email (always logged for the head coach) + WhatsApp group post.
export async function sendTeamAlert(admin, school, { recipient_email, group_or_phone_id, subject, message_body }) {
  const channels = [];
  if (recipient_email) {
    try {
      await admin.integrations.Core.SendEmail({
        to: recipient_email,
        subject,
        body: message_body,
        from_name: school.school_name,
      });
      channels.push("email");
      await logAlert(admin, school, { subject, body: message_body, channel: "Email", status: "Sent", recipient_email, recipient_label: recipient_email });
    } catch (error) {
      await logAlert(admin, school, {
        subject,
        body: message_body,
        channel: "Email",
        status: "Failed",
        detail: String(error?.message || error).slice(0, 250),
        recipient_email,
        recipient_label: recipient_email,
      });
    }
  }

  const token = secrets.get("WHAPI_API_TOKEN");
  const target = group_or_phone_id || school.team_whatsapp_group_id;
  const endpoint = school.whatsapp_webhook_url || WHAPI_FALLBACK;
  if (target && token) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ to: target, body: message_body, typing_time: 2 }),
      });
      const ok = response.ok;
      if (ok) channels.push("whatsapp");
      await logAlert(admin, school, {
        subject,
        body: message_body,
        channel: "WhatsApp",
        status: ok ? "Sent" : "Failed",
        detail: ok ? "" : `HTTP ${response.status}`,
        recipient_label: target,
      });
    } catch (error) {
      await logAlert(admin, school, {
        subject,
        body: message_body,
        channel: "WhatsApp",
        status: "Failed",
        detail: String(error?.message || error).slice(0, 250),
        recipient_label: target,
      });
    }
  } else if (target) {
    await logAlert(admin, school, { subject, body: message_body, channel: "WhatsApp", status: "Logged", detail: "WHAPI_API_TOKEN is not configured", recipient_label: target });
  }

  return channels;
}

const asObject = (result) => {
  if (result && typeof result === "object") return result;
  if (typeof result === "string") return JSON.parse(result.trim().replace(/^```(?:json)?/i, "").replace(/```$/, ""));
  return {};
};

async function goalsForEvents(admin, events) {
  const result = await admin.integrations.Core.InvokeLLM({ prompt: goalsPrompt(events), response_json_schema: GOALS_SCHEMA });
  const parsed = asObject(result);
  const goals = {};
  for (const item of parsed.goals || []) {
    if (item?.event_name && item?.goal) goals[item.event_name] = String(item.goal).slice(0, 200);
  }
  return goals;
}

export async function weeklyBlast(admin, school, baseUrl) {
  const events = rows(await admin.entities.Event.filter({ school_id: school.school_id }));
  const partnerships = rows(await admin.entities.Partnership.filter({ school_id: school.school_id }));
  const mentors = rows(await admin.entities.Mentor.filter({ school_id: school.school_id }));
  if (!events.length) return { skipped: "No events in this workspace" };

  const goals = await goalsForEvents(admin, events);
  const updates = partnerships
    .filter((p) => goals[p.event_name])
    .map((p) => ({ id: p.id, current_week_goal: goals[p.event_name] }));
  if (updates.length) await admin.entities.Partnership.bulkUpdate(updates);

  const lines = events.map((event) => `• ${event.event_name}: ${goals[event.event_name] || "keep your binder current"} — practice quiz: ${baseUrl}/practice/${event.id}?mode=practice`);
  const subject = `Week plan + practice quizzes — ${school.school_name}`;
  const body = `This week's Science Olympiad plan:\n\n${lines.join("\n")}\n\nTake the 10-question quiz, then log builds and labs by Thursday.`;
  await sendTeamAlert(admin, school, {
    recipient_email: school.head_coach_email,
    group_or_phone_id: school.team_whatsapp_group_id,
    subject,
    message_body: body,
  });

  const recipients = new Set();
  for (const partnership of partnerships) for (const email of emailsOf(partnership)) recipients.add(email);
  for (const mentor of mentors) if (mentor.mentor_email) recipients.add(mentor.mentor_email.toLowerCase());

  let emailed = 0;
  for (const email of [...recipients].slice(0, 40)) {
    const sent = await sendTeamAlert(admin, school, { recipient_email: email, group_or_phone_id: school.team_whatsapp_group_id, subject, message_body: body });
    if (sent.includes("email")) emailed += 1;
  }
  return { events: events.length, goals: Object.keys(goals).length, recipients: recipients.size, emailed };
}

export async function thursdayNudge(admin, school, baseUrl) {
  const partnerships = rows(await admin.entities.Partnership.filter({ school_id: school.school_id }));
  const logs = rows(await admin.entities.PracticeLog.filter({ school_id: school.school_id }));
  const events = rows(await admin.entities.Event.filter({ school_id: school.school_id }));
  const eventIdByName = new Map(events.map((event) => [event.event_name, event.id]));
  const cutoff = Date.now() - 6 * DAY;

  const quiet = partnerships.filter((partnership) => {
    const emails = emailsOf(partnership);
    return !logs.some(
      (log) =>
        log.event_name === partnership.event_name &&
        new Date(log.created_date).getTime() > cutoff &&
        (emails.includes(String(log.student_email || "").toLowerCase()) || !log.student_email),
    );
  });

  let emailed = 0;
  for (const partnership of quiet.slice(0, 25)) {
    const emails = emailsOf(partnership);
    const subject = `Quick check-in: ${partnership.event_name}`;
    const body = `Hi team,\n\nNo practice log has come in for ${partnership.event_name} in the last 6 days.\nThis week's goal: ${partnership.current_week_goal || "pick one topic and run a timed quiz"}.\nLog a quiz, build test or lab drill today: ${baseUrl}/log\n\n— ${school.school_name}`;
    const sent = await sendTeamAlert(admin, school, { recipient_email: emails[0] || school.head_coach_email, subject, message_body: body });
    if (sent.includes("email")) emailed += 1;
  }

  await sendTeamAlert(admin, school, {
    recipient_email: school.head_coach_email,
    group_or_phone_id: school.team_whatsapp_group_id,
    subject: `Thursday accountability check — ${quiet.length} quiet partnership${quiet.length === 1 ? "" : "s"}`,
    message_body: quiet.length
      ? `Needs a nudge before the weekend:\n${quiet.map((p) => `• ${p.event_name} — ${p.student_1_name || "partner"}${p.student_2_name ? ` & ${p.student_2_name}` : ""}`).join("\n")}\nQuiz link for each event: ${baseUrl}/events`
      : "Every partnership logged practice in the last 6 days. Keep the streak going.",
  });

  return { quiet: quiet.length, emailed };
}

export async function fridayDigest(admin, school) {
  const events = rows(await admin.entities.Event.filter({ school_id: school.school_id }));
  const partnerships = rows(await admin.entities.Partnership.filter({ school_id: school.school_id }));
  const groups = { "On Track": [], "Needs Attention": [], Inactive: [] };

  for (const event of events) {
    const rowsForEvent = partnerships.filter((p) => p.event_name === event.event_name);
    if (!rowsForEvent.length) {
      groups.Inactive.push(`${event.event_name} — no partners assigned`);
      continue;
    }
    const best = rowsForEvent
      .map((p) => ({ partnership: p, readiness: readinessOf({ xp: p.readiness_xp, lastActivity: p.last_activity_date, requiresImpound: event.requires_impound, impoundVerified: p.impound_checklist_verified }) }))
      .sort((a, b) => (a.readiness.tone === "green" ? -1 : 1) - (b.readiness.tone === "green" ? -1 : 1))[0];
    const names = rowsForEvent.flatMap((p) => [p.student_1_name, p.student_2_name, p.student_3_name].filter(Boolean)).join(", ");
    if (best.readiness.tone === "green") groups["On Track"].push(`${event.event_name} — ${names}`);
    else if (best.readiness.tone === "red") groups.Inactive.push(`${event.event_name} — ${names} (no activity in 3+ weeks)`);
    else groups["Needs Attention"].push(`${event.event_name} — ${names}`);
  }

  const body = `Weekly readiness digest for ${school.school_name}\n\nON TRACK (${groups["On Track"].length})\n${groups["On Track"].join("\n") || "—"}\n\nNEEDS ATTENTION (${groups["Needs Attention"].length})\n${groups["Needs Attention"].join("\n") || "—"}\n\nINACTIVE (${groups.Inactive.length})\n${groups.Inactive.join("\n") || "—"}`;
  await sendTeamAlert(admin, school, {
    recipient_email: school.head_coach_email,
    group_or_phone_id: school.team_whatsapp_group_id,
    subject: `Friday digest — ${groups["On Track"].length} on track, ${groups["Needs Attention"].length} needs attention`,
    message_body: body,
  });
  return { onTrack: groups["On Track"].length, needsAttention: groups["Needs Attention"].length, inactive: groups.Inactive.length };
}

export async function tournamentAlerts(admin, school, baseUrl) {
  const tournaments = rows(await admin.entities.Tournament.filter({ school_id: school.school_id }));
  const events = rows(await admin.entities.Event.filter({ school_id: school.school_id }));
  const partnerships = rows(await admin.entities.Partnership.filter({ school_id: school.school_id }));
  const next = tournaments
    .filter((t) => t.tournament_date)
    .sort((a, b) => new Date(a.tournament_date) - new Date(b.tournament_date))[0];

  const impoundEvents = events.filter((event) => event.requires_impound);
  const unverified = impoundEvents.filter((event) => {
    const rowsForEvent = partnerships.filter((p) => p.event_name === event.event_name);
    return !rowsForEvent.length || rowsForEvent.some((p) => !p.impound_checklist_verified);
  });

  const scheduleLine = next
    ? `${next.tournament_name} on ${next.tournament_date}. Self-scheduling ${next.self_schedule_open ? `opens ${String(next.self_schedule_open).slice(0, 16).replace("T", " ")}` : "window TBD"} — portal: ${next.portal_url || "see tournament page"}`
    : "No tournament on the calendar yet.";

  const body = `Tournament alert for ${school.school_name}\n\n${scheduleLine}\n\nImpound events still unverified (${unverified.length}):\n${unverified.map((event) => `• ${event.event_name}`).join("\n") || "All impound checklists are verified."}\n\nCommand center: ${baseUrl}/tournament`;

  await sendTeamAlert(admin, school, {
    recipient_email: school.head_coach_email,
    group_or_phone_id: school.team_whatsapp_group_id,
    subject: next ? `${next.tournament_name} — scheduling and impound checklist` : "Tournament reminder",
    message_body: body,
  });

  return { tournament: next?.tournament_name || null, unverified: unverified.map((event) => event.event_name) };
}

export async function runAutomation(admin, school, job, baseUrl) {
  if (job === "monday-blast") return weeklyBlast(admin, school, baseUrl);
  if (job === "thursday-nudge") return thursdayNudge(admin, school, baseUrl);
  if (job === "friday-digest") return fridayDigest(admin, school);
  if (job === "tournament-alerts") return tournamentAlerts(admin, school, baseUrl);
  throw new Error("Unknown automation");
}
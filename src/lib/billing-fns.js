import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { totalsFor } from "@/lib/plan-catalog";

const rows = (result) => (Array.isArray(result) ? result : result?.items ?? []);
const lower = (value) => String(value || "").toLowerCase();
const text = (value, max = 300) => String(value ?? "").trim().slice(0, max);

const newSchoolCode = () =>
  `SCIO-${Math.random().toString(36).slice(2, 6).toUpperCase()}${String(Math.floor(Math.random() * 90) + 10)}`;

const isoDate = (date) => date.toISOString().slice(0, 10);

function shiftMonths(months) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return isoDate(date);
}

const RegistrationInput = z.object({
  school_name: z.string().min(2).max(120),
  division: z.enum(["Division B", "Division C"]),
  team_count: z.number().int().min(1).max(10),
  team_name: z.string().max(120).optional(),
  coach_name: z.string().min(2).max(120),
  coach_email: z.string().email().max(160),
  coach_phone: z.string().min(7).max(40),
  plan: z.enum(["monthly", "season"]),
});

// Saves the school and one license per purchased team. Every license starts in
// "Awaiting payment" — only a verified Stripe webhook can activate it.
async function persistRegistration(admin, user, data) {
  const schoolName = text(data.school_name, 120);
  const email = lower(data.coach_email);
  const totals = totalsFor(data.plan, data.team_count);

  const found = rows(await admin.entities.School.filter({ head_coach_email: email }))[0] ?? null;
  const school = found
    ? await admin.entities.School.update(found.id, {
        school_name: schoolName,
        division: data.division,
        subscription_status: found.subscription_status === "Active" ? "Active" : "Awaiting payment",
      })
    : await admin.entities.School.create({
        school_id: newSchoolCode(),
        school_name: schoolName,
        division: data.division,
        head_coach_email: email,
        subscription_status: "Awaiting payment",
        plan: "Single Team",
        stripe_customer_id: "",
        team_whatsapp_group_id: "",
        whatsapp_webhook_url: "",
      });

  const existing = rows(await admin.entities.TeamLicense.filter({ school_id: school.school_id }));
  const reusable = existing.filter((license) => license.payment_status !== "Paid");

  const licenses = [];
  for (let index = 0; index < totals.teams; index += 1) {
    const patch = {
      school_id: school.school_id,
      school_name: schoolName,
      team_name:
        index === 0 ? text(data.team_name, 120) || `${schoolName} Team 1` : `${schoolName} Team ${index + 1}`,
      division: data.division,
      plan: totals.recurring ? "Monthly" : "Season",
      amount: totals.unit,
      status: "Awaiting payment",
      payment_status: "Pending",
      coach_name: text(data.coach_name, 120),
      coach_email: email,
      coach_phone: text(data.coach_phone, 40),
      renewal_date: shiftMonths(totals.recurring ? 1 : 12),
      season_end_date: shiftMonths(12),
      ordered_by_id: user.id,
    };
    const row = reusable[index];
    licenses.push(row ? await admin.entities.TeamLicense.update(row.id, patch) : await admin.entities.TeamLicense.create(patch));
  }
  for (const extra of reusable.slice(totals.teams)) {
    await admin.entities.TeamLicense.delete(extra.id);
  }

  await admin.entities.User.update(user.id, { school_id: school.school_id, app_role: "Head Coach" });

  return { school, licenses, totals };
}

// The public app origin the platform puts on the request; internal sandbox hosts
// must never end up in a Stripe return URL.
async function appOrigin() {
  const { getRequest } = await import("@tanstack/react-start/server");
  const headers = getRequest().headers;
  const origin = headers.get("base44-api-url") || headers.get("x-base44-app-url");
  if (!origin) throw new Error("Cannot start checkout without the app URL. Reload the page and try again.");
  return origin.replace(/\/$/, "");
}

export const startCheckout = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(RegistrationInput)
  .handler(async ({ data, context }) => {
    const origin = await appOrigin();
    const { PLAN_PRICES, APP_ID, stripeRequest } = await import("@/lib/stripe.server");
    const user = context.user;
    const admin = context.getBase44().asServiceRole;
    if (lower(data.coach_email) !== lower(user.email)) {
      throw new Error("Use the email address you created the account with.");
    }

    const { school, licenses, totals } = await persistRegistration(admin, user, data);
    const price = PLAN_PRICES[totals.plan.id];
    const licenseIds = licenses.map((license) => license.id).join(",");

    const params = {
      mode: totals.recurring ? "subscription" : "payment",
      "line_items[0][price]": price.priceId,
      "line_items[0][quantity]": String(totals.teams),
      customer_email: lower(user.email),
      client_reference_id: school.school_id,
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/get-started?canceled=1`,
      "metadata[base44_app_id]": APP_ID,
      "metadata[school_id]": school.school_id,
      "metadata[plan]": totals.plan.id,
      "metadata[teams]": String(totals.teams),
      "metadata[license_ids]": licenseIds,
    };
    if (totals.recurring) {
      params["subscription_data[metadata][school_id]"] = school.school_id;
      params["subscription_data[metadata][base44_app_id]"] = APP_ID;
    }

    const session = await stripeRequest("/checkout/sessions", { method: "POST", params });

    await Promise.all(
      licenses.map((license) =>
        admin.entities.TeamLicense.update(license.id, {
          checkout_session_id: session.id,
          expected_total: totals.total * 100,
          stripe_price_id: price.priceId,
        }),
      ),
    );

    return { url: session.url, session_id: session.id, total: totals.total, teams: totals.teams };
  });

// Reads the order back for the confirmation screen. Never grants access.
export const getCheckoutStatus = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const admin = context.getBase44().asServiceRole;
    const email = lower(context.user.email);
    const school = rows(await admin.entities.School.filter({ head_coach_email: email }))[0] ?? null;
    if (!school) return { school: null, licenses: [], paid: false };
    const licenses = rows(await admin.entities.TeamLicense.filter({ school_id: school.school_id }));
    const paid = licenses.length > 0 && licenses.every((license) => license.payment_status === "Paid");
    return { school, licenses, paid };
  });

export const getBillingSummary = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const admin = context.getBase44().asServiceRole;
    const email = lower(context.user.email);
    const school = rows(await admin.entities.School.filter({ head_coach_email: email }))[0] ?? null;
    if (!school) return { school: null, licenses: [] };
    const licenses = rows(await admin.entities.TeamLicense.filter({ school_id: school.school_id }));
    return { school, licenses };
  });

function requireAdmin(user) {
  if (user?.role !== "admin") throw Object.assign(new Error("Admins only"), { status: 403 });
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    if (context.user?.role !== "admin") return { forbidden: true };
    const admin = context.getBase44().asServiceRole;
    const [schoolResult, licenseResult] = await Promise.all([
      admin.entities.School.list("-created_date", 200),
      admin.entities.TeamLicense.list("-created_date", 500),
    ]);
    const schools = rows(schoolResult);
    const licenses = rows(licenseResult);
    const active = licenses.filter((license) => license.status === "Active");
    return {
      forbidden: false,
      schools,
      licenses,
      counts: {
        schools: schools.length,
        active: active.length,
        awaiting: licenses.filter((license) => license.status === "Awaiting payment").length,
        disabled: licenses.filter((license) => license.status === "Disabled").length,
        divisionB: active.filter((license) => license.division === "Division B").length,
        divisionC: active.filter((license) => license.division === "Division C").length,
        monthly: active.filter((license) => license.plan === "Monthly").length,
        season: active.filter((license) => license.plan === "Season").length,
        revenue: active.reduce(
          (sum, license) => sum + (license.plan === "Monthly" ? (license.amount || 0) * 12 : license.amount || 0),
          0,
        ),
      },
    };
  });

export const setLicenseAccess = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ license_id: z.string().min(1).max(64), action: z.enum(["disable", "restore"]) }))
  .handler(async ({ data, context }) => {
    requireAdmin(context.user);
    const admin = context.getBase44().asServiceRole;
    const license = await admin.entities.TeamLicense.get(data.license_id);
    const updated = await admin.entities.TeamLicense.update(license.id, {
      status: data.action === "disable" ? "Disabled" : "Active",
    });

    const siblings = rows(await admin.entities.TeamLicense.filter({ school_id: license.school_id }));
    const anyActive = siblings.some((row) => row.status === "Active");
    const school = rows(await admin.entities.School.filter({ school_id: license.school_id }))[0] ?? null;
    if (school) {
      await admin.entities.School.update(school.id, { subscription_status: anyActive ? "Active" : "Expired" });
    }
    return { license: updated, anyActive };
  });
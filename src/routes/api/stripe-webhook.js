import { createFileRoute } from "@tanstack/react-router";
import { secrets } from "base44:runtime";

const rows = (result) => (Array.isArray(result) ? result : result?.items ?? []);
const today = () => new Date().toISOString().slice(0, 10);

async function verifySignature(payload, header, secret) {
  if (!header) return false;
  const parts = {};
  for (const chunk of header.split(",")) {
    const [key, value] = chunk.split("=");
    if (key && value) parts[key.trim()] = value.trim();
  }
  if (!parts.t || !parts.v1) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${parts.t}.${payload}`));
  const digest = [...new Uint8Array(mac)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return digest === parts.v1;
}

async function licensesForSession(admin, session) {
  const ids = String(session?.metadata?.license_ids || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (ids.length) {
    const found = await Promise.all(ids.map((id) => admin.entities.TeamLicense.get(id).catch(() => null)));
    return found.filter(Boolean);
  }
  if (session?.id) return rows(await admin.entities.TeamLicense.filter({ checkout_session_id: session.id }));
  return [];
}

// Grants access only for a session Stripe itself reports as paid, whose amount
// matches the total persisted before checkout.
async function activateSession(admin, session) {
  const licenses = await licensesForSession(admin, session);
  if (!licenses.length) return { activated: 0, reason: "no_licenses" };

  const expected = licenses.reduce((sum, license) => sum + (Number(license.expected_total) || 0), 0);
  if (expected > 0 && typeof session.amount_total === "number" && session.amount_total !== expected) {
    await Promise.all(licenses.map((license) => admin.entities.TeamLicense.update(license.id, { payment_status: "Failed" })));
    return { activated: 0, reason: "amount_mismatch", expected, received: session.amount_total };
  }

  if (session.payment_status !== "paid") return { activated: 0, reason: "not_paid_yet" };

  let activated = 0;
  for (const license of licenses) {
    if (license.payment_status === "Paid" && license.status === "Active") continue;
    await admin.entities.TeamLicense.update(license.id, {
      status: "Active",
      payment_status: "Paid",
      last_payment_date: today(),
      stripe_customer_id: String(session.customer || ""),
      stripe_subscription_id: String(session.subscription || ""),
    });
    activated += 1;
  }

  const school = rows(await admin.entities.School.filter({ school_id: licenses[0].school_id }))[0] ?? null;
  if (school) {
    await admin.entities.School.update(school.id, {
      subscription_status: "Active",
      stripe_customer_id: String(session.customer || ""),
    });
  }

  try {
    await admin.integrations.Core.SendEmail({
      to: licenses[0].coach_email || school?.head_coach_email,
      subject: `Payment confirmed — ${licenses[0].school_name} is active`,
      body: [
        `Your payment is confirmed and your SciOlyCoachAgent workspace is active.`,
        "",
        `School: ${licenses[0].school_name}`,
        `Division: ${licenses[0].division}`,
        `Teams: ${licenses.length}`,
        `Plan: ${licenses[0].plan === "Monthly" ? "Monthly" : "Full Science Olympiad Season"}`,
        `Renewal / season end: ${licenses[0].renewal_date || ""}`,
        "",
        "Sign in with the coach email to open your dashboard.",
      ].join("\n"),
      from_name: "SciOlyCoachAgent",
    });
  } catch {
    // Access is active regardless of email delivery.
  }

  return { activated, school_id: licenses[0].school_id };
}

async function endSubscription(admin, subscriptionId) {
  if (!subscriptionId) return { updated: 0 };
  const licenses = rows(await admin.entities.TeamLicense.filter({ stripe_subscription_id: subscriptionId }));
  for (const license of licenses) {
    await admin.entities.TeamLicense.update(license.id, { status: "Cancelled" });
  }
  if (licenses.length) {
    const school = rows(await admin.entities.School.filter({ school_id: licenses[0].school_id }))[0] ?? null;
    if (school) {
      const siblings = rows(await admin.entities.TeamLicense.filter({ school_id: school.school_id }));
      const anyActive = siblings.some((row) => row.status === "Active");
      await admin.entities.School.update(school.id, { subscription_status: anyActive ? "Active" : "Expired" });
    }
  }
  return { updated: licenses.length };
}

export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const secret = secrets.get("STRIPE_WEBHOOK_SECRET");
        if (!secret) return Response.json({ error: "STRIPE_WEBHOOK_SECRET is not configured" }, { status: 503 });

        const payload = await request.text();
        const valid = await verifySignature(payload, request.headers.get("stripe-signature"), secret);
        if (!valid) return Response.json({ error: "Invalid signature" }, { status: 400 });

        let event;
        try {
          event = JSON.parse(payload);
        } catch {
          return Response.json({ error: "Invalid payload" }, { status: 400 });
        }

        const admin = context.getBase44().asServiceRole;
        const object = event.data?.object || {};

        if (object?.metadata?.base44_test_checkout === "true") {
          return Response.json({ received: true, ignored: "base44_test_checkout" });
        }

        try {
          if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
            const result = await activateSession(admin, object);
            console.log("stripe checkout", event.type, JSON.stringify(result));
            return Response.json({ received: true, ...result });
          }

          if (event.type === "customer.subscription.deleted") {
            const result = await endSubscription(admin, object.id);
            return Response.json({ received: true, ...result });
          }

          return Response.json({ received: true, ignored: event.type });
        } catch (error) {
          console.log("stripe webhook error", event.type, error?.message);
          return Response.json({ error: error?.message || "Webhook handling failed" }, { status: 500 });
        }
      },
    },
  },
});
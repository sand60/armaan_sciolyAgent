import { secrets } from "base44:runtime";

// Server-owned price catalog. The client only ever picks a plan id; the price and
// the Stripe price id are resolved here, never sent from the browser.
export const PLAN_PRICES = {
  monthly: { priceId: "price_1Uc5LlE1dFtfjq44FHfHPeNH", amount: 1500, recurring: true, currency: "usd" },
  season: { priceId: "price_1Uc5LlE1dFtfjq440c8q5KhS", amount: 30000, recurring: false, currency: "usd" },
};

export const APP_ID = globalThis.process?.env?.BASE44_APP_ID || "";

export function stripeKey() {
  return secrets.get("STRIPE_SECRET_KEY");
}

export async function stripeRequest(path, { method = "GET", params } = {}) {
  const key = stripeKey();
  if (!key) throw Object.assign(new Error("Stripe is not configured yet."), { status: 503 });
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Stripe-Version": "2025-10-29.clover",
      ...(method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: method === "POST" ? new URLSearchParams(params).toString() : undefined,
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json?.error?.message || `Stripe request failed (${response.status})`);
  }
  return json;
}
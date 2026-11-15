// The two subscription plans sold in the registration flow. One plan covers
// exactly one Science Olympiad team, so every total is per-team price × teams.

export const MONTHLY_PRICE = 15;
export const SEASON_PRICE = 300;

export const PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    price: MONTHLY_PRICE,
    cadence: "per team / month",
    billing: "Recurring monthly",
    recurring: true,
    tagline: "Stay flexible through the season",
    ribbon: "",
    features: [
      "Access for one Science Olympiad team",
      "Unlimited AI flashcard generation (reasonable usage limits)",
      "AI quiz generation",
      "AI study guides",
      "AI study assistant",
      "Team study dashboard",
      "Cancel future renewals at any time",
    ],
  },
  {
    id: "season",
    name: "Full Science Olympiad Season",
    price: SEASON_PRICE,
    cadence: "per team / season",
    billing: "One-time seasonal payment",
    recurring: false,
    tagline: "Pay once, cover the whole season",
    ribbon: "Best value",
    features: [
      "Access for one Science Olympiad team",
      "All monthly plan features",
      "Access for the entire purchased Science Olympiad season",
      "No monthly payments",
    ],
  },
];

export function planById(id) {
  return PLANS.find((plan) => plan.id === id) || PLANS[0];
}

export function totalsFor(planId, teams) {
  const plan = planById(planId);
  const count = Math.min(10, Math.max(1, Math.round(Number(teams) || 1)));
  return { plan, teams: count, unit: plan.price, total: plan.price * count, recurring: plan.recurring };
}

export function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(amount) || 0);
}
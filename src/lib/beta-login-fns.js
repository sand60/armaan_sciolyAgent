import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { secrets } from "base44:runtime";
import { isValidAccessCode } from "@/lib/access-code";

// Turns the shared test access code into the single tester account this app signs in with.
// The account's own credentials live in app secrets, so the code alone is enough to get in.
export const getTestCodeAccount = createServerFn({ method: "POST" })
  .validator(z.object({ code: z.string().max(120) }))
  .handler(({ data }) => {
    if (!isValidAccessCode(data.code)) return { ok: false, reason: "invalid" };
    // Trim stray copy-paste whitespace off the email; the password is used exactly as stored.
    const email = secrets.get("BETA_TESTER_EMAIL")?.trim();
    const password = secrets.get("BETA_TESTER_PASSWORD");
    if (!email || !password) return { ok: false, reason: "not_configured" };
    return { ok: true, email, password };
  });
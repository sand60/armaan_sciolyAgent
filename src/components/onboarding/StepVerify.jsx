import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

// Email verification for the account created in the previous step: register alone
// leaves the account unverified, so the code step is never skipped.
export default function StepVerify({ email, onVerified, onBack }) {
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function verify() {
    setError("");
    setBusy(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      onVerified();
    } catch (err) {
      setError(err?.message || "That code didn't work. Check your email and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast("Code sent", { description: "Check your email for the new code." });
    } catch (err) {
      setError(err?.message || "Could not resend the code.");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-lg font-extrabold tracking-tight">Verify your email</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>.
        </p>
      </div>

      <div className="flex justify-center py-2">
        <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      <Button type="button" className="w-full" onClick={verify} disabled={otpCode.length < 6 || busy}>
        {busy ? "Verifying..." : "Verify and continue"}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Change details
        </button>
        <button type="button" onClick={resend} className="font-semibold text-primary hover:underline">
          Resend code
        </button>
      </div>
    </div>
  );
}
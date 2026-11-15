import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthError, AuthLink, GoogleButton, OrDivider, SubmitButton } from "@/components/auth/parts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MfaFlow } from "@/components/auth/MfaFlow";
import { MfaScreen } from "@/components/auth/MfaParts";
import { loginWithMfa } from "@/lib/authMfa";
import { safeReturnTo } from "@/lib/authReturnTo";
import { ACCESS_CODE } from "@/lib/access-code";
import { getTestCodeAccount } from "@/lib/beta-login-fns";

// The /login page. The test access code alone gets you in; email + password stays available as a fallback.
// ?returnTo= (or the platform's ?from_url=) is where the visitor goes after signing in.
export function LoginPage() {
  const returnTo = safeReturnTo();
  const resolveAccount = useServerFn(getTestCodeAccount);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mfaChallenge, setMfaChallenge] = useState(null);

  async function signIn(address, secret, fallbackError) {
    try {
      const result = await loginWithMfa(address, secret);
      if (result.mfa_required) {
        setMfaChallenge(result);
        return;
      }
      // A hard redirect: the app re-initializes with the new session.
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || fallbackError);
      setBusy(false);
    }
  }

  async function submitCode(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const account = await resolveAccount({ data: { code } });
      if (!account.ok) {
        setError(
          account.reason === "not_configured"
            ? "Test-code login isn't set up yet. Use email and password for now."
            : `That access code isn't valid. Enter ${ACCESS_CODE} to continue.`,
        );
        setBusy(false);
        return;
      }
      try {
        const result = await loginWithMfa(account.email, account.password);
        if (result.mfa_required) {
          setMfaChallenge(result);
          return;
        }
        window.location.href = returnTo;
      } catch {
        setError("That code is valid, but the tester account behind it can't sign in yet. Use email and password for now.");
        setBusy(false);
      }
    } catch (err) {
      setError(err.message || "Could not check that code. Try again.");
      setBusy(false);
    }
  }

  function submitPassword(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    signIn(email, password, "Invalid email or password");
  }

  // The second sign-in step (authenticator app or text message) replaces the whole page.
  if (mfaChallenge) return <MfaScreen><MfaFlow challenge={mfaChallenge} returnTo={returnTo} /></MfaScreen>;

  return (
    <AuthLayout icon={LogIn} title="Welcome back" subtitle="Enter the test access code to open your workspace">
      <form onSubmit={submitCode} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-code">Test access code</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="login-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ACCESS TEST CODE"
              className="h-12 pl-10 uppercase tracking-wide placeholder:normal-case"
              autoComplete="off"
              autoFocus
              required
            />
          </div>
          <p className="text-[11px] text-muted-foreground">Test access code for now: {ACCESS_CODE}</p>
        </div>
        <AuthError>{error}</AuthError>
        <SubmitButton busy={busy && !showPasswordForm} busyLabel="Checking code...">
          Continue
        </SubmitButton>
      </form>

      {showPasswordForm ? (
        <form onSubmit={submitPassword} className="mt-6 space-y-4 border-t border-border/60 pt-5">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-10" required />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <AuthLink to="/forgot-password" returnTo={returnTo} className="text-xs text-primary hover:underline">
                Forgot password?
              </AuthLink>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input id="login-password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 pl-10" required />
            </div>
          </div>
          <SubmitButton busy={busy && showPasswordForm} busyLabel="Logging in...">
            Log in
          </SubmitButton>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => {
            setShowPasswordForm(true);
            setError("");
          }}
          className="mt-6 w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Log in with email and password instead
        </button>
      )}

      <div className="mt-6 space-y-4">
        <OrDivider />
        <GoogleButton returnTo={returnTo} onError={setError} />
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/get-started" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
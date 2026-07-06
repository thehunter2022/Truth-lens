import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Mail, Lock, User, CheckCircle2 } from "lucide-react";
import GoogleSignInButton from "../components/GoogleSignInButton";

function calcStrength(pwd: string): number {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const STRENGTH_LABELS = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
const STRENGTH_COLORS = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500", "bg-emerald-500"];
const STRENGTH_TEXT_COLORS = ["text-red-400", "text-orange-400", "text-yellow-400", "text-green-400", "text-emerald-400"];

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const { register } = useAuth();
  const [, setLocation] = useLocation();

  const strength = useMemo(() => calcStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (username.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!/[0-9]/.test(password)) {
      toast.error("Password must contain at least one number");
      return;
    }
    if (!/[a-zA-Z]/.test(password)) {
      toast.error("Password must contain at least one letter");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!agreed) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(username.trim(), email.trim(), password);
      toast.success("Account created! Redirecting to dashboard…");
      setLocation("/dashboard");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") toast.error(detail);
      else if (Array.isArray(detail)) toast.error(detail.map((d: any) => d.msg).join(", "));
      else toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_40%),linear-gradient(135deg,_#020617,_#0f172a)] px-4 py-12">
      <Card className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/10 shadow-[0_30px_120px_rgba(2,8,23,0.45)] backdrop-blur-3xl">
        <CardHeader className="space-y-3 pb-6 pt-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_16px_40px_rgba(56,189,248,0.25)]">
            <svg className="h-7 w-7 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" className="opacity-40" />
              <circle cx="12" cy="12" r="5" />
              <path d="M9 12l2 2 4-4" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2" className="opacity-60" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-white">Create account</CardTitle>
            <CardDescription className="mt-1 text-slate-400">Join Truth Lens and start monitoring misinformation with confidence.</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 px-6 pb-8 sm:px-8">
          <GoogleSignInButton label="Sign up with Google" redirectTo="/dashboard" autoPrompt />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-semibold text-slate-300">Username</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input id="username" type="text" placeholder="yourname" value={username} onChange={(e) => setUsername(e.target.value)} className="h-11 rounded-2xl border-white/10 bg-slate-950/70 pl-10 text-white placeholder:text-slate-500" autoComplete="username" minLength={3} maxLength={50} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-300">Email address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-2xl border-white/10 bg-slate-950/70 pl-10 text-white placeholder:text-slate-500" autoComplete="email" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-300">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters with a number" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-2xl border-white/10 bg-slate-950/70 pl-10 pr-10 text-white placeholder:text-slate-500" autoComplete="new-password" required />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white" aria-label="Show password">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < strength ? STRENGTH_COLORS[strength] : "bg-white/10"}`} />)}
                  </div>
                  <p className={`text-xs font-medium ${STRENGTH_TEXT_COLORS[strength]}`}>{STRENGTH_LABELS[strength]}</p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-300">Confirm password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`h-11 rounded-2xl border-white/10 bg-slate-950/70 pl-10 pr-10 text-white placeholder:text-slate-500 ${passwordsMismatch ? "border-red-400" : passwordsMatch ? "border-emerald-400" : ""}`} autoComplete="new-password" required />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white" aria-label="Show confirm password">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordsMismatch && <p className="text-xs text-red-400">Passwords do not match</p>}
              {passwordsMatch && <p className="text-xs text-emerald-400">Passwords match</p>}
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-400">
              <input type="checkbox" checked={agreed} onChange={() => setAgreed((v) => !v)} className="mt-0.5 rounded border-white/10 bg-slate-950/70" />
              <span>I agree to the terms and understand that Truth Lens helps evaluate information but does not guarantee absolute accuracy.</span>
            </label>

            <Button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-[0_16px_40px_rgba(56,189,248,0.25)]">
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : <><CheckCircle2 className="mr-2 h-4 w-4" />Create account</>}
            </Button>
          </form>

          <div className="pt-2 text-center text-sm text-slate-400">
            <p>Already have an account? <button onClick={() => setLocation("/login")} className="font-semibold text-cyan-300 transition hover:text-cyan-200">Sign in</button></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

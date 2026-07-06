import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck, Github } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginForm() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      toast.success("Welcome back to Truth Lens");
      setLocation("/dashboard");
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-[0_30px_120px_rgba(2,8,23,0.45)] backdrop-blur-3xl sm:p-10">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600">
          <svg className="h-5 w-5 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" className="opacity-40" />
            <circle cx="12" cy="12" r="5" />
            <path d="M9 12l2 2 4-4" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2" className="opacity-60" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-semibold text-white">Sign in</h2>
          <p className="text-sm text-slate-400">Secure access to your verification workspace</p>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <GoogleSignInButton label="Continue with Google" redirectTo="/dashboard" />
        <Button type="button" variant="outline" className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10">
          <Github className="h-4 w-4" /> Continue with GitHub
        </Button>
      </div>

      <div className="my-7 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-[0.3em] text-slate-500">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <Label className="text-slate-300">Email</Label>
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-12 rounded-2xl border-white/10 bg-slate-950/70 pl-12 text-white placeholder:text-slate-500" />
          </div>
        </div>

        <div>
          <Label className="text-slate-300">Password</Label>
          <div className="relative mt-2">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-12 rounded-2xl border-white/10 bg-slate-950/70 pl-12 pr-12 text-white placeholder:text-slate-500" />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white" aria-label="Toggle password visibility">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-400">
            <input type="checkbox" checked={remember} onChange={() => setRemember((v) => !v)} className="rounded border-white/10 bg-slate-950/70" />
            Remember me
          </label>
          <button type="button" className="text-cyan-300 transition hover:text-cyan-200">Forgot password?</button>
        </div>

        <Button type="submit" disabled={loading} className="h-12 w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-[0_16px_40px_rgba(56,189,248,0.25)]">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : <><ShieldCheck className="mr-2 h-4 w-4" />Sign in</>}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-400">
        <p>Don’t have an account?</p>
        <button type="button" onClick={() => setLocation("/register")} className="mt-2 font-semibold text-cyan-300 transition hover:text-cyan-200">Create account</button>
      </div>
    </div>
  );
}
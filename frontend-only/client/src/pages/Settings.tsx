import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import Navbar from "../components/Navbar";
import { toast } from "sonner";
import { 
  User, 
  Settings as SettingsIcon, 
  LogOut, 
  Sun, 
  Moon, 
  Cpu, 
  ShieldCheck, 
  Loader2, 
  Database,
  Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  const { user, logout, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      toast.success("Successfully logged out");
      setLocation("/login");
    } catch {
      toast.error("Logout failed");
    } finally {
      setLoggingOut(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_40%),linear-gradient(135deg,_#020617,_#0f172a)]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_40%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white/70 dark:border-white/10 dark:bg-white/10 p-6 shadow-xl dark:shadow-[0_30px_120px_rgba(2,8,23,0.45)] backdrop-blur-2xl sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <SettingsIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">System Settings</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage configurations and system parameters</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Profile Card */}
          <Card className="border-slate-200 bg-white/70 dark:border-white/10 dark:bg-slate-950/40 backdrop-blur-2xl rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                Profile Details
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">Your current account details on this workstation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-950/20">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-bold text-white uppercase">
                  {user?.username?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{user?.username || "Username"}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Verified System Analyst</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Access Role</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" /> Admin Analyst
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">User ID Reference</span>
                  <span className="font-mono text-xs text-slate-700 dark:text-slate-300">ID-{user?.id || "N/A"}</span>
                </div>
              </div>

              <Button
                onClick={handleLogout}
                disabled={loggingOut}
                variant="outline"
                className="w-full rounded-2xl border-slate-200 bg-rose-500/5 dark:border-white/10 dark:bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 hover:text-rose-700 dark:hover:text-rose-200"
              >
                {loggingOut ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogOut className="h-4 w-4 mr-2" />}
                Logout Profile
              </Button>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card className="border-slate-200 bg-white/70 dark:border-white/10 dark:bg-slate-950/40 backdrop-blur-2xl rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                {isDark ? <Moon className="h-5 w-5 text-cyan-400" /> : <Sun className="h-5 w-5 text-yellow-500" />}
                Interface Settings
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">Customize the look and feel of the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-950/20">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Dark Theme Interface</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light mode and dark mode styles</p>
                </div>
                <Switch
                  checked={isDark}
                  onCheckedChange={toggleTheme}
                  className="cursor-pointer"
                />
              </div>

              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-xs text-cyan-700 dark:text-cyan-200">
                Theme changes are stored locally and will persist across browser reloads automatically.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System & Model Information */}
        <Card className="mt-6 border-slate-200 bg-white/70 dark:border-white/10 dark:bg-slate-950/40 backdrop-blur-2xl rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              Intelligence System Status
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">Details of running models, services, and engines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-950/20">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                  <Database className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  Local Database
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">SQLAlchemy Async Engine</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Connected
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-950/20">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                  <Cpu className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  Machine Learning Engine
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">DistilRoBERTa Model</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Ready / Active
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-950/20">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                  <Radio className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  Live News API Pool
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">GNews Global HEAD</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Operational
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-white/5 pt-4 flex flex-col sm:flex-row justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
              <span>Platform Core: Truth Lens v1.2.0</span>
              <span>Workspace Server: localhost:8000</span>
              <span>Client build target: Vite React TS</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

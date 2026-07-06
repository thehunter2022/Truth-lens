import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, History, ScanSearch, MessageSquare, Settings, LogOut, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out");
      setLocation("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const links = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "History", path: "/history", icon: History },
    { label: "News", path: "/news", icon: ScanSearch },
    { label: "AI Chat", path: "/chat", icon: MessageSquare },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-black/15 bg-white/80 dark:border-white/10 dark:bg-slate-950/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => setLocation(user ? "/dashboard" : "/login")} className="flex items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-slate-900/5 dark:hover:bg-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-indigo-500">
            <svg className="h-5 w-5 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" className="opacity-40" />
              <circle cx="12" cy="12" r="5" />
              <path d="M9 12l2 2 4-4" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2" className="opacity-60" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Truth Lens</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Premium intelligence</p>
          </div>
        </button>

        <nav className="hidden items-center gap-2 rounded-full border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5 p-1 lg:flex">
          {links.map(({ label, path, icon: Icon }) => {
            const active = location === path;
            return (
              <button key={label} onClick={() => setLocation(path)} className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${active ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950" : "text-slate-600 hover:bg-black/10 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"}`}>
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full border border-black/15 bg-black/5 text-slate-800 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {user ? (
            <>
              <div className="hidden items-center gap-3 rounded-full border border-black/15 bg-black/5 px-3 py-2 dark:border-white/10 dark:bg-white/5 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-semibold text-white">
                  {user.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.username}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Verified</p>
                </div>
              </div>
              <Button onClick={handleLogout} className="rounded-full bg-slate-900/10 text-slate-900 hover:bg-slate-900/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                <LogOut className="mr-2 h-4 w-4" />Logout
              </Button>
            </>
          ) : (
            <Button onClick={() => setLocation("/login")} className="rounded-full bg-cyan-500 text-white hover:bg-cyan-400">Sign in</Button>
          )}
        </div>
      </div>
    </header>
  );
}

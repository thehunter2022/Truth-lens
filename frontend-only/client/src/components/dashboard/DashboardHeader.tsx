import { useLocation } from "wouter";
import { LogOut, Moon, Sun, LayoutGrid, History, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

interface DashboardHeaderProps {
  username?: string;
  onLogout: () => void;
}

export default function DashboardHeader({ username, onLogout }: DashboardHeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const [location, setLocation] = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutGrid },
    { label: "History", path: "/history", icon: History },
    { label: "Results", path: "/result", icon: ScanSearch },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => setLocation("/dashboard")} className="flex items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-indigo-500 shadow-[0_10px_30px_rgba(56,189,248,0.25)]">
            <svg className="h-5 w-5 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" className="opacity-40" />
              <circle cx="12" cy="12" r="5" />
              <path d="M9 12l2 2 4-4" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2" className="opacity-60" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Truth Lens</p>
            <p className="text-[11px] text-slate-400">Live analysis OS</p>
          </div>
        </button>

        <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 lg:flex">
          {navItems.map(({ label, path, icon: Icon }) => {
            const active = location === path;
            return (
              <button
                key={path}
                onClick={() => setLocation(path)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${active ? "bg-white text-slate-950 shadow-lg" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 md:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-semibold text-white">
              {username?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">{username || "User"}</p>
              <p className="text-[11px] text-slate-400">Ready to inspect</p>
            </div>
          </div>
          <Button onClick={onLogout} className="rounded-full bg-white/10 text-white hover:bg-white/20">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
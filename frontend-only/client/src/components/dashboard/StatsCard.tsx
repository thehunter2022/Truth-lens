import { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: string;
}

export default function StatsCard({ title, value, subtitle, icon, color = "from-blue-500 to-cyan-500" }: StatsCardProps) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white/60 dark:border-white/10 dark:bg-white/5 p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_24px_80px_rgba(14,165,233,0.16)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">{value}</h2>
          {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-lg shadow-slate-950/30`}>
          {icon}
        </div>
      </div>
      <div className="mt-5 flex items-center text-sm text-cyan-600 dark:text-cyan-300">
        <ArrowUpRight className="mr-1 h-4 w-4" />
        Live statistics
      </div>
    </div>
  );
}
import { Activity, TrendingUp } from "lucide-react";

interface RecentActivityProps {
  total: number;
  fake: number;
  real: number;
}

export default function RecentActivity({ total, fake, real }: RecentActivityProps) {
  const safePercent = total === 0 ? 0 : Math.round((real / total) * 100);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/60 dark:border-white/10 dark:bg-white/5 p-6 backdrop-blur-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">Recent activity</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{total} checks completed</p>
        </div>
        <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-400">
          <Activity className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between rounded-2xl bg-slate-100 dark:bg-slate-900/70 px-4 py-3">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Verified real content</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">{real}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-slate-100 dark:bg-slate-900/70 px-4 py-3">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-4 w-4 text-rose-500 dark:text-rose-400" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Flagged questionable content</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">{fake}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${safePercent}%` }} />
        </div>
      </div>
    </div>
  );
}

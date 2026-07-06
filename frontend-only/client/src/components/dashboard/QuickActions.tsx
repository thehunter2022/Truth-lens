import { ArrowRight, BrainCircuit, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface QuickActionsProps {
  onStartAnalysis?: () => void;
  onViewInsights?: () => void;
}

export default function QuickActions({ onStartAnalysis, onViewInsights }: QuickActionsProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <button
        type="button"
        onClick={() => setLocation("/history")}
        className="group rounded-2xl border border-slate-200 bg-white/60 dark:border-white/10 dark:bg-white/5 p-4 text-left backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-cyan-400/30"
      >
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Review History</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Inspect your recent predictions.</p>
      </button>
      <button
        type="button"
        onClick={() => onViewInsights?.()}
        className="group rounded-2xl border border-slate-200 bg-white/60 dark:border-white/10 dark:bg-white/5 p-4 text-left backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-violet-400/30"
      >
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
          <BrainCircuit className="h-5 w-5 text-white" />
        </div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Open Insights</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">See explainability and next steps.</p>
      </button>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onStartAnalysis?.()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onStartAnalysis?.();
          }
        }}
        className="cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/80 via-cyan-500/70 to-slate-900 p-4 text-left text-white shadow-[0_20px_60px_rgba(59,130,246,0.25)] transition-all hover:-translate-y-1"
      >
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
          <Sparkles className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold">Fresh detection</p>
        <p className="mt-1 text-sm text-blue-50/90">Live analysis is ready for your next article.</p>
        <Button
          type="button"
          variant="secondary"
          onClick={(event) => {
            event.stopPropagation();
            onStartAnalysis?.();
          }}
          className="mt-4 h-9 rounded-xl bg-white/15 text-white hover:bg-white/25"
        >
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

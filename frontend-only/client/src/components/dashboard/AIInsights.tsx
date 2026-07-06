import { BrainCircuit, TrendingUp, ShieldCheck, Globe, ArrowUpRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HistoryItem {
  label: "FAKE" | "REAL";
  confidence: number;
  title?: string | null;
  model_used?: string;
}

interface Props {
  fake: number;
  real: number;
  confidence: number;
  history?: HistoryItem[];
}

export default function AIInsights({ fake, real, confidence, history = [] }: Props) {
  const fakePercent = fake + real === 0 ? 0 : Math.round((fake / (fake + real)) * 100);
  const realPercent = 100 - fakePercent;

  const category = history.length
    ? history
        .map((item) => item.title?.toLowerCase() ?? "")
        .find((text) => /politic|tech|world|health|finance|sports|business|science/i.test(text)) || "General News"
    : "General News";

  const topSource = history.length ? history[0].model_used || "Truth Lens" : "Truth Lens";
  const recommendation = fakePercent > 60 ? "Prioritize source verification and cross-check multiple outlets before sharing." : "The current mix looks balanced; keep reviewing emerging stories with context.";

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white/60 dark:border-white/10 dark:bg-white/5 backdrop-blur-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <BrainCircuit className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
            AI insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Insight icon={<TrendingUp className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />} title="Average confidence" value={`${confidence}%`} />
          <Insight icon={<ShieldCheck className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />} title="Fake ratio" value={`${fakePercent}%`} />
          <Insight icon={<Globe className="h-5 w-5 text-violet-500 dark:text-violet-400" />} title="Real ratio" value={`${realPercent}%`} />
          <Insight icon={<Sparkles className="h-5 w-5 text-amber-500 dark:text-amber-400" />} title="Most common category" value={category} />
          <Insight icon={<BrainCircuit className="h-5 w-5 text-blue-500 dark:text-blue-400" />} title="Top source" value={topSource} />
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-blue-600 via-cyan-500 to-slate-900 text-white shadow-[0_20px_70px_rgba(56,189,248,0.25)]">
        <CardContent className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-100">AI recommendation</p>
          <h2 className="mt-3 text-xl font-semibold">{recommendation}</h2>
          <button className="mt-6 flex items-center font-semibold text-white/90 transition hover:text-white">
            Learn more <ArrowUpRight className="ml-2 h-4 w-4" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

interface InsightProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

function Insight({ icon, title, value }: InsightProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-100/50 dark:border-white/10 dark:bg-slate-900/60 px-4 py-3">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="font-semibold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
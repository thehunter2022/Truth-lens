import { ResponsiveContainer, AreaChart, Area, CartesianGrid, Tooltip } from "recharts";

interface PredictionChartProps {
  history: Array<{
    id: number;
    confidence: number;
    created_at: string;
  }>;
}

export default function PredictionChart({ history }: PredictionChartProps) {
  const chartData = history.slice(0, 8).reverse().map((item) => ({
    name: new Date(item.created_at).toLocaleDateString("en", { month: "short", day: "numeric" }),
    confidence: Math.round(item.confidence * 100),
  }));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/60 dark:border-white/10 dark:bg-white/5 p-6 backdrop-blur-2xl">
      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">Confidence trend</p>
        <p className="text-2xl font-semibold text-slate-900 dark:text-white">Latest model confidence</p>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="confidenceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.15)" />
            <Tooltip />
            <Area type="monotone" dataKey="confidence" stroke="#60a5fa" fill="url(#confidenceFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

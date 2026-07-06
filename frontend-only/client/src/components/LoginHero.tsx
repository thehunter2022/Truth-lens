import { ShieldCheck, BrainCircuit, Newspaper, TrendingUp, Sparkles, Activity } from "lucide-react";

export default function LoginHero() {
  return (
    <section className="hidden lg:flex flex-col justify-center">
      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2">
        <Sparkles className="h-5 w-5 text-cyan-400" />
        <span className="text-sm text-slate-300">AI-powered fake news detection</span>
      </div>

      <h1 className="mt-8 text-6xl font-semibold leading-tight text-white">
        Truth <span className="text-cyan-400">Lens</span>
      </h1>

      <p className="mt-8 max-w-xl text-xl leading-9 text-slate-400">
        Detect misinformation with a premium AI workspace combining RoBERTa intelligence, explainable predictions, and live source verification.
      </p>

      <div className="mt-14 space-y-6">
        <Feature icon={<ShieldCheck className="h-6 w-6 text-emerald-400" />} title="Secure by design" desc="Enterprise-grade authentication and encrypted workflows." />
        <Feature icon={<BrainCircuit className="h-6 w-6 text-cyan-400" />} title="Explainable AI" desc="Understand every prediction with clear reasoning." />
        <Feature icon={<Newspaper className="h-6 w-6 text-blue-400" />} title="Live news intelligence" desc="Inspect breaking stories as they emerge." />
      </div>

      <div className="mt-16 grid grid-cols-3 gap-5">
        <Stat number="500K+" label="Articles" />
        <Stat number="98%" label="Accuracy" />
        <Stat number="24/7" label="Live AI" />
      </div>

      <div className="mt-12 grid grid-cols-2 gap-5">
        <MiniCard title="Live detection" value="Running" color="text-emerald-400" icon={<Activity className="h-5 w-5" />} />
        <MiniCard title="Daily predictions" value="18,426" color="text-cyan-400" icon={<TrendingUp className="h-5 w-5" />} />
      </div>
    </section>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/70">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-slate-400">{desc}</p>
      </div>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <h2 className="text-3xl font-semibold text-white">{number}</h2>
      <p className="mt-2 text-slate-400">{label}</p>
    </div>
  );
}

function MiniCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <span className={color}>{icon}</span>
      </div>
      <p className="mt-5 text-slate-400">{title}</p>
      <h2 className={`mt-2 text-2xl font-semibold ${color}`}>{value}</h2>
    </div>
  );
}
import { FileText, ShieldCheck, ShieldAlert, Target } from "lucide-react";
import StatsCard from "./StatsCard";

interface Props {
  total: number;
  fake: number;
  real: number;
  confidence: number;
}

export default function StatsGrid({ total, fake, real, confidence }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatsCard title="Total Articles" value={total} subtitle="Analyzed by AI" icon={<FileText className="h-7 w-7 text-white" />} color="from-blue-600 to-cyan-500" />
      <StatsCard title="Fake News" value={fake} subtitle="Detected" icon={<ShieldAlert className="h-7 w-7 text-white" />} color="from-red-500 to-orange-500" />
      <StatsCard title="Verified Real" value={real} subtitle="Trusted" icon={<ShieldCheck className="h-7 w-7 text-white" />} color="from-emerald-500 to-green-500" />
      <StatsCard title="Confidence" value={`${confidence}%`} subtitle="Average score" icon={<Target className="h-7 w-7 text-white" />} color="from-violet-500 to-fuchsia-500" />
    </div>
  );
}
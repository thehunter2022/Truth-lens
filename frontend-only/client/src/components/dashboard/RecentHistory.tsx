import { useMemo, useState } from "react";
import { Eye, CalendarDays, ShieldAlert, ShieldCheck, Search, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PredictionItem {
  id: number;
  title: string | null;
  text_snippet: string;
  label: "FAKE" | "REAL";
  confidence: number;
  created_at: string;
}

interface Props {
  history: PredictionItem[];
  onOpen?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function RecentHistory({ history, onOpen, onDelete }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "FAKE" | "REAL">("all");
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const filteredHistory = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return history.filter((item) => {
      const matchQuery = normalized.length === 0 || `${item.title ?? ""} ${item.text_snippet}`.toLowerCase().includes(normalized);
      const matchFilter = filter === "all" || item.label === filter;
      return matchQuery && matchFilter;
    });
  }, [history, filter, query]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
  const pagedHistory = filteredHistory.slice((page - 1) * pageSize, page * pageSize);

  if (history.length === 0) {
    return (
      <Card className="border-slate-200 bg-white/60 dark:border-white/10 dark:bg-white/5 backdrop-blur-2xl">
        <CardContent className="py-20 text-center">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">No analysis yet</h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400">Run your first prediction to start building your trusted timeline.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/60 dark:border-white/10 dark:bg-white/5 p-4 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">Recent history</p>
          <p className="text-xl font-semibold text-slate-900 dark:text-white">Your last checks</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950/50 px-3 py-2 text-sm text-slate-800 dark:text-slate-300">
            <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search" className="w-32 bg-transparent outline-none text-slate-800 dark:text-slate-200" />
          </label>
          <select value={filter} onChange={(e) => { setFilter(e.target.value as "all" | "FAKE" | "REAL"); setPage(1); }} className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950/50 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none">
            <option value="all">All</option>
            <option value="FAKE">Fake</option>
            <option value="REAL">Real</option>
          </select>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <Card className="border-slate-200 bg-white/60 dark:border-white/10 dark:bg-white/5 backdrop-blur-2xl">
          <CardContent className="py-12 text-center text-slate-500 dark:text-slate-400">No items matched your search.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pagedHistory.map((item) => (
            <Card key={item.id} className="border-slate-200 bg-white/60 dark:border-white/10 dark:bg-white/5 backdrop-blur-2xl transition-all hover:-translate-y-1 hover:border-cyan-400/30">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      {item.label === "FAKE" ? <Badge className="border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-300"><ShieldAlert className="mr-1 h-4 w-4" />FAKE</Badge> : <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"><ShieldCheck className="mr-1 h-4 w-4" />REAL</Badge>}
                      <div className="flex items-center gap-1 text-sm text-slate-500"><CalendarDays className="h-4 w-4" />{new Date(item.created_at).toLocaleDateString()}</div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{item.title || "Untitled analysis"}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{item.text_snippet}</p>
                  </div>
                  <div className="min-w-[150px]">
                    <div className="text-right text-3xl font-semibold text-slate-900 dark:text-white">{Math.round(item.confidence * 100)}%</div>
                    <p className="text-right text-sm text-slate-500">Confidence</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div className={`h-full rounded-full ${item.label === "REAL" ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${Math.round(item.confidence * 100)}%` }} />
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button onClick={() => onOpen?.(item.id)} className="flex-1 rounded-2xl bg-slate-900/10 text-slate-900 hover:bg-slate-900/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                        <Eye className="mr-2 h-4 w-4" />Open
                      </Button>
                      <Button variant="ghost" onClick={() => onDelete?.(item.id)} className="rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredHistory.length > pageSize && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-500 dark:text-slate-400">Page {page} / {totalPages}</span>
          <Button variant="ghost" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
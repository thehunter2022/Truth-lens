import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Eye, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

interface AnalyzedArticle {
  id: number;
  title: string | null;
  text_snippet: string;
  label: "REAL" | "FAKE";
  confidence: number;
  prob_fake: number;
  prob_real: number;
  created_at: string;
}

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [articles, setArticles] = useState<AnalyzedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "REAL" | "FAKE">("all");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    if (!authLoading && !user) setLocation("/login");
  }, [user, authLoading, setLocation]);

  // Reset page when query or filter changes via handlers below

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/predict/history");
        if (mounted) setArticles(res.data || []);
      } catch (err: any) {
        console.error("History load failed", err);
        toast.error(err?.response?.data?.detail || "Failed to fetch history");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  const fakeCount = articles.filter((a) => a.label === "FAKE").length;
  const realCount = articles.filter((a) => a.label === "REAL").length;

  const handleOpenResult = (article: AnalyzedArticle) => {
    sessionStorage.setItem(
      "latest_prediction",
      JSON.stringify({
        label: article.label,
        confidence: article.confidence,
        prob_fake: article.prob_fake ?? (article.label === "FAKE" ? article.confidence : 1 - article.confidence),
        prob_real: article.prob_real ?? (article.label === "REAL" ? article.confidence : 1 - article.confidence),
        explanation:
          article.label === "FAKE"
            ? "This article exhibits several characteristics common to misinformation."
            : "This article shows traits that align with authentic reporting.",
        indicators: [],
        positive_indicators: [],
        credibility_score: { score: 50, level: "Unknown" }
      })
    );
    setLocation("/result");
  };

  const handleDelete = (id: number) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    toast.success("Removed from history view");
  };

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesFilter = filter === "all" || article.label === filter;
      const haystack = `${article.title || ""} ${article.text_snippet || ""}`.toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [articles, filter, query]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / pageSize));
  const paginatedArticles = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredArticles.slice(start, start + pageSize);
  }, [filteredArticles, page]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-white">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_40%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-800 dark:text-white transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-7xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-600/10 dark:text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" /> History
          </div>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Analysis history</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">Review previous checks and bring context back into your workflow with a refined timeline.</p>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search history"
              value={query}
              onChange={(e: any) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => {
                setFilter("all");
                setPage(1);
              }}
              className="rounded-full"
            >
              All
            </Button>
            <Button
              variant={filter === "REAL" ? "default" : "outline"}
              onClick={() => {
                setFilter("REAL");
                setPage(1);
              }}
              className="rounded-full"
            >
              Real
            </Button>
            <Button
              variant={filter === "FAKE" ? "default" : "outline"}
              onClick={() => {
                setFilter("FAKE");
                setPage(1);
              }}
              className="rounded-full"
            >
              Fake
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-200 bg-white/70 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
            <CardContent className="pt-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Summary</h3>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Total</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{articles.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Real</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{realCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Fake</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{fakeCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <div className="space-y-4">
              {paginatedArticles.map((article) => (
                <Card key={article.id} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm hover:shadow transition">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate text-slate-900 dark:text-white">{article.title || "Untitled"}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{article.text_snippet}</p>
                        <div className="mt-2 text-xs text-slate-500">{new Date(article.created_at).toLocaleString()}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge variant={article.label === "FAKE" ? "destructive" : "secondary"}>{article.label}</Badge>
                        <div className="text-right text-sm font-semibold text-slate-900 dark:text-white">{Math.round(article.confidence * 100)}%</div>
                        <div className="flex gap-2 mt-1">
                          <Button size="sm" onClick={() => handleOpenResult(article)} className="rounded-xl h-8 px-3 text-xs bg-cyan-600 hover:bg-cyan-500 text-white">
                            <Eye className="h-3 w-3 mr-1" />Open
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(article.id)} className="rounded-xl h-8 px-3 text-xs border border-slate-200 dark:border-white/10 text-slate-500 hover:text-rose-500 dark:hover:text-rose-400">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl border-slate-200 dark:border-white/10">Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl border-slate-200 dark:border-white/10">Next</Button>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Page {page} of {totalPages}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

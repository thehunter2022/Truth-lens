import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import api from "../lib/api";
import { toast } from "sonner";
import { 
  Search, 
  Grid, 
  List, 
  Loader2, 
  Clock3, 
  ExternalLink, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles,
  RefreshCw,
  SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NewsArticle {
  id?: number;
  title?: string;
  description?: string;
  content?: string;
  image?: string;
  url?: string;
  published_at?: string;
  publishedAt?: string;
  source?: string;
  prediction?: string;
  label?: string;
  confidence?: number;
  credibility_score?: number;
  credibility_level?: string;
  explanation?: string;
  indicators?: string[];
  positive_indicators?: string[];
}

export default function News() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // API query states
  const [category, setCategory] = useState("general");
  const [country, setCountry] = useState("us");
  const [language, setLanguage] = useState("en");
  const [limit, setLimit] = useState(12);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // UI state
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Local filter states
  const [predFilter, setPredFilter] = useState<"ALL" | "FAKE" | "REAL">("ALL");
  const [minConfidence, setMinConfidence] = useState(0);
  const [sourceFilter, setSourceFilter] = useState("ALL");

  // Pagination states
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  // Fetch articles
  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeSearch.trim()) {
        const res = await api.get(`/predict/search-news?q=${encodeURIComponent(activeSearch)}&limit=${limit}`);
        const mapped = (res.data || []).map((art: any, idx: number) => ({
          id: idx,
          title: art.title,
          url: art.url,
          label: art.prediction,
          prediction: art.prediction,
          confidence: art.confidence,
          source: new URL(art.url).hostname.replace("www.", ""),
          published_at: new Date().toISOString()
        }));
        setArticles(mapped);
      } else {
        const res = await api.get(`/predict/live-news?category=${category}&country=${country}&language=${language}&limit=${limit}`);
        setArticles(res.data?.articles || []);
      }
    } catch (err: any) {
      console.error("Failed to load news", err);
      const errMsg = err?.response?.data?.detail || err?.message || "Failed to load live news.";
      setError(errMsg);
      toast.error("Failed to load news articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      void fetchNews();
    }
  }, [user, category, country, language, limit, activeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
    setPage(1);
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
    setPage(1);
  };

  // Get unique sources for the source filter
  const uniqueSources = useMemo(() => {
    const sources = new Set<string>();
    articles.forEach(art => {
      if (art.source) sources.add(art.source);
    });
    return Array.from(sources);
  }, [articles]);

  // Local filtering logic
  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      const label = (art.label || art.prediction || "REAL").toUpperCase();
      const matchesPred = predFilter === "ALL" || label === predFilter;

      const conf = art.confidence || 0;
      const matchesConf = conf >= (minConfidence / 100);

      const matchesSource = sourceFilter === "ALL" || art.source === sourceFilter;

      return matchesPred && matchesConf && matchesSource;
    });
  }, [articles, predFilter, minConfidence, sourceFilter]);

  // Paginated articles
  const paginatedArticles = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredArticles.slice(start, start + pageSize);
  }, [filteredArticles, page]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / pageSize));

  // Increase limit for load more
  const handleLoadMore = () => {
    setLimit(prev => prev + 12);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_40%),linear-gradient(135deg,_#020617,_#0f172a)]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_40%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white/70 dark:border-white/10 dark:bg-white/10 p-6 shadow-xl dark:shadow-[0_30px_120px_rgba(2,8,23,0.45)] backdrop-blur-2xl sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700 dark:text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" /> News Center
              </div>
              <h1 className="mt-3 text-3xl font-semibold sm:text-4xl text-slate-900 dark:text-white">Real-time Verified News</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-2xl">
                Browse verified headlines with live credibility prediction. Search global articles, filter by ML predictions, and trace verification confidence scores.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`rounded-xl border ${viewMode === "grid" ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-700 dark:text-cyan-300" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 text-slate-600 dark:text-slate-300"}`}
              >
                <Grid className="h-4 w-4 mr-2" /> Grid
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode("list")}
                className={`rounded-xl border ${viewMode === "list" ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-700 dark:text-cyan-300" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 text-slate-600 dark:text-slate-300"}`}
              >
                <List className="h-4 w-4 mr-2" /> List
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNews}
                className="rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-6 space-y-4 rounded-3xl border border-slate-200 bg-white/70 dark:border-white/10 dark:bg-white/5 p-4 backdrop-blur-2xl">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-10 rounded-2xl border-white/10 bg-white/5 text-white placeholder-slate-400 focus:border-cyan-400"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="h-11 px-6 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white">
                Search
              </Button>
              {activeSearch && (
                <Button type="button" onClick={handleResetSearch} variant="outline" className="h-11 px-4 rounded-2xl border-white/10 bg-white/5 text-slate-300">
                  Reset
                </Button>
              )}
              <Button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className={`h-11 px-4 rounded-2xl border border-white/10 ${showFilters ? "bg-cyan-500/10 border-cyan-400/30 text-cyan-300" : "bg-white/5 text-slate-300"}`}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </form>

          {/* Advanced filters toggle drawer */}
          {showFilters && (
            <div className="grid gap-6 border-t border-white/5 pt-4 md:grid-cols-4">
              {/* Category selector */}
              {!activeSearch && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Category</label>
                  <Select value={category} onValueChange={(val) => { setCategory(val); setPage(1); }}>
                    <SelectTrigger className="h-10 rounded-xl border-white/10 bg-slate-900/50">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-slate-950 text-white">
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Prediction Filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Prediction</label>
                <Select value={predFilter} onValueChange={(val: any) => { setPredFilter(val); setPage(1); }}>
                  <SelectTrigger className="h-10 rounded-xl border-white/10 bg-slate-900/50">
                    <SelectValue placeholder="AI prediction filter" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-950 text-white">
                    <SelectItem value="ALL">All Predictions</SelectItem>
                    <SelectItem value="REAL">Verified REAL</SelectItem>
                    <SelectItem value="FAKE">Verified FAKE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Source Filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Source</label>
                <Select value={sourceFilter} onValueChange={(val) => { setSourceFilter(val); setPage(1); }}>
                  <SelectTrigger className="h-10 rounded-xl border-white/10 bg-slate-900/50">
                    <SelectValue placeholder="Filter by source" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-950 text-white max-h-60">
                    <SelectItem value="ALL">All Sources</SelectItem>
                    {uniqueSources.map(src => (
                      <SelectItem key={src} value={src}>{src}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Confidence filter slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Min Confidence</label>
                  <span className="text-xs font-mono text-cyan-300">{minConfidence}%</span>
                </div>
                <div className="pt-2">
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[minConfidence]}
                    onValueChange={(val) => { setMinConfidence(val[0]); setPage(1); }}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              {/* Location & Language - hidden if searching */}
              {!activeSearch && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Country</label>
                    <Select value={country} onValueChange={(val) => { setCountry(val); setPage(1); }}>
                      <SelectTrigger className="h-10 rounded-xl border-white/10 bg-slate-900/50">
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-slate-950 text-white">
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="gb">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="in">India</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Language</label>
                    <Select value={language} onValueChange={(val) => { setLanguage(val); setPage(1); }}>
                      <SelectTrigger className="h-10 rounded-xl border-white/10 bg-slate-900/50">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-slate-950 text-white">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/70 dark:border-white/10 dark:bg-white/5 backdrop-blur-2xl">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm">Fetching and verifying latest articles...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50/80 dark:border-red-500/20 dark:bg-red-500/5 p-8 text-center backdrop-blur-2xl">
            <p className="mb-2 text-slate-900 dark:text-white font-semibold">Could not load news feed</p>
            <p className="text-sm text-red-600 dark:text-red-200/80 mb-4">{error}</p>
            <Button onClick={fetchNews} className="rounded-xl bg-slate-900/10 text-slate-900 hover:bg-slate-900/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
              Retry Connection
            </Button>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/70 dark:border-white/10 dark:bg-white/5 text-center p-8 backdrop-blur-2xl">
            <p className="text-slate-900 dark:text-white font-semibold mb-2">No articles match your criteria</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Try adjusting your filters, clearing your search query, or increasing the verification pool size.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
              {paginatedArticles.map((article, idx) => {
                const label = article.label || article.prediction || "REAL";
                const isFake = label.toUpperCase() === "FAKE";
                const confidence = article.confidence ? `${Math.round(article.confidence * 100)}%` : "—";
                const credibility = article.credibility_score != null ? `${Math.round(article.credibility_score)} / 100` : "—";

                return (
                  <Card 
                    key={article.url || idx}
                    className={`overflow-hidden border border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 ${
                      viewMode === "list" ? "flex flex-col md:flex-row md:h-52" : ""
                    }`}
                  >
                    {/* Article Image */}
                    <div className={viewMode === "list" ? "h-40 md:h-full md:w-80 shrink-0 relative overflow-hidden" : "h-48 relative overflow-hidden"}>
                      {article.image ? (
                        <img src={article.image} alt={article.title} className="h-full w-full object-cover transition-transform hover:scale-105" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-blue-600/40 via-cyan-500/40 to-indigo-500/40" />
                      )}
                    </div>

                    {/* Article Content */}
                    <div className="p-5 flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div className="mb-3 flex items-center justify-between text-xs text-slate-400 dark:text-slate-400">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{article.source || "GNews Source"}</span>
                          <span className="flex items-center gap-1">
                            <Clock3 className="h-3 w-3" />
                            {article.published_at || article.publishedAt 
                              ? new Date(article.published_at || article.publishedAt || "").toLocaleDateString() 
                              : "Recently"}
                          </span>
                        </div>

                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-semibold ${
                            isFake ? "border-red-400/30 bg-red-500/10 text-red-700 dark:text-red-200" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                          }`}>
                            {isFake ? <ShieldAlert className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                            {label}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{confidence} confidence</span>
                        </div>

                        <h3 className="text-md font-semibold text-slate-900 dark:text-white truncate leading-snug">
                          {article.title}
                        </h3>

                        {article.description && (
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                            {article.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs border-t border-slate-200 dark:border-white/5 pt-3">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Credibility: <span className="text-cyan-600 dark:text-cyan-300 font-semibold">{credibility}</span></span>
                        {article.url ? (
                          <a 
                            href={article.url} 
                            target="_blank" 
                            rel="noreferrer noopener" 
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-600 dark:text-cyan-300 hover:text-cyan-500 dark:hover:text-cyan-200 transition"
                          >
                            Read Full <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">Read unavailable</span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-white/10 pt-6">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Showing {paginatedArticles.length} of {filteredArticles.length} filtered articles
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  variant="outline"
                  className="rounded-xl border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 text-slate-600 dark:text-slate-300 disabled:opacity-50"
                >
                  Previous
                </Button>
                <span className="inline-flex items-center px-4 text-sm font-semibold text-slate-800 dark:text-white">
                  Page {page} of {totalPages}
                </span>
                <Button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  variant="outline"
                  className="rounded-xl border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 text-slate-600 dark:text-slate-300 disabled:opacity-50"
                >
                  Next
                </Button>
                {filteredArticles.length >= limit && (
                  <Button 
                    onClick={handleLoadMore}
                    className="ml-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white"
                  >
                    Load More From API
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

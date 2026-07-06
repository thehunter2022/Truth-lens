import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentHistory from "@/components/dashboard/RecentHistory";
import AIInsights from "@/components/dashboard/AIInsights";
import QuickActions from "@/components/dashboard/QuickActions";
import PredictionChart from "@/components/dashboard/PredictionChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import NewsFeed from "../components/dashboard/NewsFeed";

interface DashboardNewsItem {
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

interface PredictionItem {
  id: number;
  title: string | null;
  text_snippet: string;
  label: "FAKE" | "REAL";
  confidence: number;
  prob_fake: number;
  prob_real: number;
  model_used: string;
  latency_ms: number;
  created_at: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [history, setHistory] = useState<PredictionItem[]>([]);
  const [news, setNews] = useState<DashboardNewsItem[]>([]);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [articleTitle, setArticleTitle] = useState("");
  const [articleText, setArticleText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analyzeSectionRef = useRef<HTMLDivElement>(null);
  const insightsSectionRef = useRef<HTMLDivElement>(null);

  

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      try {
        const historyRes = await api.get("/predict/history");
        if (!mounted) return;
        setHistory(historyRes.data);
      } catch (err: unknown) {
        console.error("Dashboard history load failed", err);
        toast.error("Failed to load prediction history");
      }

      try {
        const newsRes = await api.get("/predict/live-news?limit=4");
        if (!mounted) return;
        setNews(Array.isArray(newsRes.data?.articles) ? newsRes.data.articles : []);
        setNewsError(null);
      } catch (err: unknown) {
        console.error("Dashboard live news load failed", err);
        if (!mounted) return;
        const errorMessage = (err as any)?.response?.data?.detail || (err as Error)?.message || "Failed to load live news.";
        setNews([]);
        setNewsError(errorMessage);
        toast.error("Live news could not be loaded");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      setLocation("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const handleOpenResult = (id: number) => {
    const item = history.find((entry) => entry.id === id);
    if (!item) return;
    sessionStorage.setItem("latest_prediction", JSON.stringify({
      label: item.label,
      confidence: item.confidence,
      prob_fake: item.prob_fake,
      prob_real: item.prob_real,
      explanation: item.label === "FAKE"
        ? "This article exhibits several characteristics common to misinformation."
        : "This article shows traits that align with authentic reporting.",
      indicators: [],
      positive_indicators: [],
      credibility_score: { score: 50, level: "Unknown" }
    }));
    setLocation("/result");
  };

  const handleDelete = (id: number) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    toast.success("Removed from your dashboard view");
  };

  const handleScrollToAnalysis = () => {
    analyzeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScrollToInsights = () => {
    insightsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAnalyzeArticle = async () => {
    if (!articleText.trim() || articleText.trim().length < 20) {
      toast.error("Please enter at least 20 characters to analyze.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await api.post("/predict", { text: articleText });
      console.log("Predict Response (Dashboard):", res.data);
      sessionStorage.setItem("latest_prediction", JSON.stringify(res.data));
      toast.success("Analysis complete!");
      setLocation("/result");
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to analyze text");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearAnalysis = () => {
    setArticleTitle("");
    setArticleText("");
  };

  const totalAnalyzed = history.length;
  const fakeCount = history.filter((item) => item.label === "FAKE").length;
  const realCount = totalAnalyzed - fakeCount;
  const avgConfidence = totalAnalyzed > 0 ? Math.round(history.reduce((sum, item) => sum + item.confidence, 0) / totalAnalyzed * 100) : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_40%),linear-gradient(135deg,_#020617,_#0f172a)]">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center backdrop-blur-2xl">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-cyan-400" />
          <p className="mt-4 text-sm text-slate-300">Loading your intelligence dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_40%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-900 dark:text-white transition-colors duration-300">
      <DashboardHeader username={user?.username} onLogout={handleLogout} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white/70 dark:border-white/10 dark:bg-white/10 p-6 shadow-xl dark:shadow-[0_30px_120px_rgba(2,8,23,0.45)] backdrop-blur-2xl sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-600 dark:text-cyan-300">Truth Lens control center</p>
                <h1 className="mt-3 text-3xl font-semibold sm:text-4xl text-slate-900 dark:text-white">Mission-ready fake news detection</h1>
                <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">Track predictions, review recent analyses, and keep your verification workflow sharp with a premium AI dashboard.</p>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-800 dark:text-cyan-200">Live model confidence is now visible in real time.</div>
            </div>
          </div>

          <section ref={analyzeSectionRef} id="analyze-news-section" className="rounded-[2rem] border border-slate-200 bg-white/70 dark:border-white/10 dark:bg-white/10 p-6 shadow-xl dark:shadow-[0_30px_120px_rgba(2,8,23,0.35)] backdrop-blur-2xl sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700 dark:text-cyan-200">
                  <svg className="h-3.5 w-3.5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" className="opacity-40" />
                    <circle cx="12" cy="12" r="5" />
                    <path d="M9 12l2 2 4-4" />
                    <path d="M12 2v2M12 20v2M2 12h2M20 12h2" className="opacity-60" />
                  </svg> Analyze News
                </div>
                <h2 className="mt-3 text-2xl font-semibold sm:text-3xl text-slate-900 dark:text-white">Restore the prediction workflow in one place</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 sm:text-base">Paste an article, add an optional title, and send it through the existing prediction endpoint for an instant verdict.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-100/50 dark:border-white/10 dark:bg-slate-950/30 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                {articleText.trim().length} / 500+ characters ready
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-100/30 dark:border-white/10 dark:bg-slate-950/30 p-4 sm:p-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_0.25fr]">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="article-title" className="text-sm font-medium text-slate-700 dark:text-slate-200">Optional article title</label>
                    <Input
                      id="article-title"
                      value={articleTitle}
                      onChange={(e) => setArticleTitle(e.target.value)}
                      placeholder="Add a title if you want"
                      className="h-11 rounded-2xl border-slate-200 bg-white text-sm text-slate-800 dark:text-white dark:border-white/10 dark:bg-white/10 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="article-content" className="text-sm font-medium text-slate-700 dark:text-slate-200">Article content</label>
                    <Textarea
                      id="article-content"
                      value={articleText}
                      onChange={(e) => setArticleText(e.target.value)}
                      placeholder="Paste article here..."
                      className="min-h-44 resize-none rounded-2xl border-slate-200 bg-white text-sm text-slate-800 dark:text-white dark:border-white/10 dark:bg-white/10 placeholder:text-slate-400"
                    />
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{articleText.length} characters</span>
                      <span>Minimum 20 characters</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:justify-end">
                  <Button
                    variant="outline"
                    onClick={handleClearAnalysis}
                    disabled={isAnalyzing}
                    className="h-11 rounded-2xl border-slate-200 bg-white hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 text-slate-700"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleAnalyzeArticle}
                    disabled={articleText.trim().length < 20 || isAnalyzing}
                    className="h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_20px_60px_rgba(34,211,238,0.25)]"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9" className="opacity-40" />
                          <circle cx="12" cy="12" r="5" />
                          <path d="M9 12l2 2 4-4" />
                        </svg>
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <StatsGrid total={totalAnalyzed} fake={fakeCount} real={realCount} confidence={avgConfidence} />
          <QuickActions onStartAnalysis={handleScrollToAnalysis} onViewInsights={handleScrollToInsights} />

          <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
            <PredictionChart history={history} />
            <RecentActivity total={totalAnalyzed} fake={fakeCount} real={realCount} />
          </div>

          <DashboardLayout>
            <div ref={insightsSectionRef} className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
              <RecentHistory history={history} onOpen={handleOpenResult} onDelete={handleDelete} />
              <AIInsights fake={fakeCount} real={realCount} confidence={avgConfidence} history={history} />
            </div>
            <NewsFeed articles={news} errorMessage={newsError} />
          </DashboardLayout>
        </motion.div>
      </main>
    </div>
  );
}

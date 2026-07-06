import { ExternalLink, Clock3, ShieldAlert, ShieldCheck } from "lucide-react";

interface NewsArticle {
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

interface NewsFeedProps {
  articles: NewsArticle[];
  errorMessage?: string | null;
}

export default function NewsFeed({ articles, errorMessage }: NewsFeedProps) {
  if (!articles.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400 backdrop-blur-2xl">
        {errorMessage ? (
          <>
            <p className="mb-2 text-white">Live news cannot be loaded.</p>
            <p className="text-sm text-slate-400">{errorMessage}</p>
          </>
        ) : (
          "Live news is currently unavailable. Please check back later."
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Live news</p>
          <h2 className="text-2xl font-semibold text-white">Realtime verification feed</h2>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {articles.map((article, index) => {
          const label = article.label || article.prediction || "REVIEW";
          const confidence = article.confidence ? `${Math.round(article.confidence * 100)}%` : "—";
          const credibility = article.credibility_score != null ? `${Math.round(article.credibility_score)} / 100` : "—";
          const isFake = label.toUpperCase() === "FAKE";

          return (
            <article key={`${article.title}-${index}`} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl transition-all hover:-translate-y-1 hover:border-cyan-400/30">
              {article.image ? <img src={article.image} alt={article.title} className="h-40 w-full object-cover" /> : <div className="h-40 w-full bg-gradient-to-br from-blue-600/40 to-cyan-500/40" />}
              <div className="p-5">
                <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                  <span>{article.source || "Verified source"}</span>
                  <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{article.published_at || article.publishedAt ? new Date(article.published_at || article.publishedAt || "").toLocaleDateString() : "Now"}</span>
                </div>
                <div className="mb-3 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${isFake ? "border-red-400/30 bg-red-500/10 text-red-200" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"}`}>
                    {isFake ? <ShieldAlert className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                    {label}
                  </span>
                  <span className="text-xs text-slate-400">{confidence} confidence</span>
                </div>
                <h3 className="text-lg font-semibold text-white">{article.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-400">{article.description || article.content}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>Credibility {credibility}</span>
                  {article.url ? (
                    <a href={article.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 text-sm text-cyan-300 transition hover:text-cyan-200">
                      Read more <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm text-slate-500">Read more unavailable</span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Flag, Lightbulb, Share2, FileText, AlertTriangle, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import api from "../lib/api";

/**
 * Design Philosophy: Precision Intelligence
 * - Prediction card with emerald green (real) or coral red (fake) colors
 * - Circular confidence meter for intuitive certainty visualization
 * - Highlighted suspicious phrases with subtle background
 * - Detailed explanation section with AI reasoning
 * - Soft shadows and rounded cards throughout
 * - Feedback modal for reporting incorrect analyses
 */

type FeedbackType = "incorrect" | "unclear" | "other";

export default function Result() {
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Load actual data from sessionStorage
  const [predictionData] = useState(() => {
    const data = sessionStorage.getItem("latest_prediction");
    return data ? JSON.parse(data) : null;
  });

  useEffect(() => {
    if (!predictionData) {
      setLocation("/dashboard");
    }
  }, [predictionData, setLocation]);

  useEffect(() => {
    let cancelled = false;
    api.get("/recommendations")
      .then((res) => {
        if (!cancelled && Array.isArray(res.data?.cards)) {
          setRecommendations(res.data.cards);
        }
      })
      .catch(() => { /* silently ignore — recommendations are optional */ });
    return () => { cancelled = true; };
  }, []);

  const recIconMap: Record<string, React.ReactNode> = {
    FileText: <FileText className="h-5 w-5" />,
    CheckCircle: <CheckCircle2 className="h-5 w-5" />,
    AlertTriangle: <AlertTriangle className="h-5 w-5" />,
  };

  const recColorMap: Record<string, string> = {
    blue: "border-blue-200 bg-blue-50/80 text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200",
    green: "border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
    amber: "border-amber-200 bg-amber-50/80 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
  };

  const prediction = predictionData?.label || "FAKE";
  const confidence = Math.round((predictionData?.confidence || 0.87) * 100);
  const explanation = predictionData?.explanation || "No major misinformation indicators were detected.";
  const indicators = predictionData?.indicators || [];
  const positiveIndicators = predictionData?.positive_indicators || [];
  const probFake = predictionData?.prob_fake ?? 0.5;
  const probReal = predictionData?.prob_real ?? 0.5;
  
  // Handle both { score, level } object and raw number schemas safely
  const rawCredibility = predictionData?.credibility_score;
  const credibilityScore = typeof rawCredibility === "object" && rawCredibility !== null
    ? (rawCredibility.score ?? 0)
    : (typeof rawCredibility === "number" ? rawCredibility : 0);
  const credibilityLevel = typeof rawCredibility === "object" && rawCredibility !== null
    ? (rawCredibility.level || "Unknown")
    : (predictionData?.credibility_level || "Unknown");

  const summary = predictionData?.summary || "";
  const topKeywords = predictionData?.top_keywords || predictionData?.fake_keywords || predictionData?.real_keywords || [];

  const handleCopyResult = () => {
    const text = `Prediction: ${prediction}\nConfidence: ${confidence}%\nExplanation: ${explanation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalyzeAnother = () => {
    setLocation("/");
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackType || !feedbackText.trim()) {
      toast.error("Please select a feedback type and provide details");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Thank you! Your feedback has been submitted.");
      setFeedbackOpen(false);
      setFeedbackType(null);
      setFeedbackText("");
    }, 1500);
  };

  const handleOpenFeedback = () => {
    setFeedbackOpen(true);
    setFeedbackType(null);
    setFeedbackText("");
  };

  const feedbackTypeOptions = [
    {
      type: "incorrect" as FeedbackType,
      title: "Incorrect Prediction",
      description: "The analysis result is wrong",
    },
    {
      type: "unclear" as FeedbackType,
      title: "Unclear Explanation",
      description: "The reasoning is confusing or incomplete",
    },
    {
      type: "other" as FeedbackType,
      title: "Other Feedback",
      description: "Something else to report",
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_40%),linear-gradient(135deg,_#f8fbff,_#eef4ff)] text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_40%),linear-gradient(135deg,_#020617,_#0f172a)] dark:text-white">
      <Navbar />

      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="overflow-hidden rounded-[2rem] border border-white/40 bg-white/70 shadow-[0_30px_120px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60">
            <div className="relative p-8 sm:p-10">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-600/10" />
              <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-700 dark:text-cyan-300">Analysis result</p>
                  <h1 className={`text-4xl font-semibold sm:text-5xl ${prediction === "FAKE" ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>{prediction === "FAKE" ? "FAKE" : "REAL"}</h1>
                  <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300">{prediction === "FAKE" ? "This content appears to contain signals of misinformation." : "This content appears consistent with trustworthy reporting."}</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="relative h-28 w-28">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="8" />
                      <circle cx="60" cy="60" r="54" fill="none" stroke={prediction === "FAKE" ? "#f43f5e" : "#10b981"} strokeWidth="8" strokeDasharray={`${(confidence / 100) * 339.29} 339.29`} strokeLinecap="round" className="transition-all duration-500" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-semibold">{confidence}%</div>
                        <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Confidence</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card className="border-white/40 bg-white/70 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Lightbulb className="h-5 w-5 text-cyan-600" /> Probability breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Fake probability", value: Math.round(probFake * 100), color: "bg-rose-500" },
                { label: "Real probability", value: Math.round(probReal * 100), color: "bg-emerald-500" },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>{item.label}</span>
                    <span className="font-semibold">{item.value}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className={`h-2.5 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
               <div className="rounded-2xl border border-cyan-200 bg-cyan-50/80 p-4 text-sm text-cyan-900 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-200 flex justify-between items-center">
                 <span>Credibility Score: <strong>{Math.round(credibilityScore)} / 100</strong></span>
                 <span className="text-xs uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300">Trust Level: {credibilityLevel}</span>
               </div>
             </CardContent>
           </Card>

           {summary && (
             <Card className="border-white/40 bg-white/70 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                   <Lightbulb className="h-5 w-5 text-cyan-600" /> Summary
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="leading-7 text-slate-600 dark:text-slate-300">{summary}</p>
               </CardContent>
             </Card>
           )}

           {topKeywords.length > 0 && (
             <Card className="border-white/40 bg-white/70 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                   <Lightbulb className="h-5 w-5 text-cyan-600" /> Top Keywords
                 </CardTitle>
               </CardHeader>
               <CardContent className="flex flex-wrap gap-2">
                 {topKeywords.map((kw: string, idx: number) => (
                   <span key={idx} className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                     {kw}
                   </span>
                 ))}
               </CardContent>
             </Card>
           )}

          <Card className="border-white/40 bg-white/70 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${prediction === "FAKE" ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                <AlertCircle className="h-5 w-5" />
                {prediction === "FAKE" ? "Misinformation indicators" : "Positive indicators"}
              </CardTitle>
              <CardDescription>{prediction === "FAKE" ? "Signals detected from the analyzed text." : "Signals that support a trustworthy and balanced presentation."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(prediction === "FAKE" ? indicators : positiveIndicators).length > 0 ? (
                (prediction === "FAKE" ? indicators : positiveIndicators).map((item: any, idx: number) => (
                  <div key={idx} className={`rounded-2xl border p-4 ${prediction === "FAKE" ? "border-rose-200 bg-rose-50/80 dark:border-rose-500/20 dark:bg-rose-500/10" : "border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/10"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 h-2.5 w-2.5 rounded-full ${prediction === "FAKE" ? "bg-rose-500" : "bg-emerald-500"}`} />
                      <p className="text-sm text-slate-700 dark:text-slate-200">{item}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">No major misinformation indicators were detected.</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/40 bg-white/70 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Lightbulb className="h-5 w-5 text-cyan-600" />
                {prediction === "FAKE" ? "Why this content was flagged" : "Why this content was classified as reliable"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-7 text-slate-600 dark:text-slate-300">{explanation}</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200/70 bg-emerald-50/80 shadow-[0_25px_80px_rgba(16,185,129,0.12)] backdrop-blur-xl dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" /> What you should do
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
              <p>• Verify with multiple reputable sources.</p>
              <p>• Check the original source and publication date.</p>
              <p>• Look for fact-checking articles from trusted organizations.</p>
            </CardContent>
          </Card>

          {recommendations.length > 0 && (
            <Card className="border-white/40 bg-white/70 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Lightbulb className="h-5 w-5 text-cyan-600" /> Recommendations
                </CardTitle>
                <CardDescription>Personalized tips based on your analysis</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                {recommendations.map((rec, idx) => (
                  <a
                    key={idx}
                    href={rec.action_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg ${recColorMap[rec.color] || recColorMap.blue}`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      {recIconMap[rec.icon] || <FileText className="h-5 w-5" />}
                      <span className="text-sm font-semibold">{rec.title}</span>
                    </div>
                    <p className="text-xs leading-5 opacity-80">{rec.description}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium opacity-60 group-hover:opacity-100">
                      Learn more <ExternalLink className="h-3 w-3" />
                    </div>
                  </a>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleAnalyzeAnother} className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white">Analyze another article</Button>
            <Button onClick={handleCopyResult} variant="outline" className="flex-1 rounded-2xl border-white/40 bg-white/70 dark:bg-slate-900/60"> <Share2 className="mr-2 h-4 w-4" /> {copied ? "Copied!" : "Copy result"}</Button>
          </div>

          <Button onClick={handleOpenFeedback} variant="outline" className="w-full rounded-2xl border-amber-300 bg-amber-50/80 text-amber-700 hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
            <Flag className="mr-2 h-4 w-4" /> Report incorrect analysis
          </Button>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 text-xs leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
            <strong>Disclaimer:</strong> This analysis is provided by an AI model and should not be considered definitive proof. Always verify information through multiple reputable sources before making decisions based on this content.
          </div>
        </div>
      </section>

      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-orange-600" />
              Report Analysis Feedback
            </DialogTitle>
            <DialogDescription>
              Help us improve our AI model by reporting issues or providing feedback about this analysis.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Feedback Type Selection */}
            <div className="space-y-3">
              <div id="feedback-type-label" className="text-sm font-semibold text-gray-900">What&apos;s the issue? *</div>
              <div role="group" aria-labelledby="feedback-type-label" className="space-y-2">
                {feedbackTypeOptions.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setFeedbackType(option.type)}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                      feedbackType === option.type
                        ? "border-orange-600 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{option.title}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Text */}
            <div className="space-y-3">
              <label htmlFor="feedback-text" className="text-sm font-semibold text-gray-900">Additional Details *</label>
              <Textarea
                id="feedback-text"
                placeholder="Please provide specific details about the issue. What should the correct prediction be? What information was missed?"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value.slice(0, 500))}
                className="min-h-32 border-gray-300 focus:border-orange-600 focus:ring-orange-600 text-gray-900 placeholder-gray-400"
              />
              <p className="text-xs text-gray-500">
                {feedbackText.length} / 500 characters
              </p>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Your feedback is valuable and will be used to improve our AI model. We appreciate your help in making FakeNews AI more accurate.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setFeedbackOpen(false)}
                variant="outline"
                className="border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={isSubmitting || !feedbackType || !feedbackText.trim()}
                className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-400 py-10 mt-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-cyan-500 to-indigo-500">
                  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" opacity="0.4" />
                    <circle cx="12" cy="12" r="5" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">Truth Lens</span>
              </div>
              <p className="text-sm">Detect misinformation with AI-powered analysis</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800 dark:text-white">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="hover:text-cyan-600 dark:hover:text-cyan-300 transition">Features</a></li>
                <li><a href="/about" className="hover:text-cyan-600 dark:hover:text-cyan-300 transition">Pricing</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800 dark:text-white">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="hover:text-cyan-600 dark:hover:text-cyan-300 transition">About</a></li>
                <li><a href="/about" className="hover:text-cyan-600 dark:hover:text-cyan-300 transition">Blog</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800 dark:text-white">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="hover:text-cyan-600 dark:hover:text-cyan-300 transition">Privacy</a></li>
                <li><a href="/about" className="hover:text-cyan-600 dark:hover:text-cyan-300 transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-white/10 pt-8 text-center text-sm">
            <p>&copy; 2026 Truth Lens. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

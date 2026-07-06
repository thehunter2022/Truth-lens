import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Brain, Database, Shield, Sparkles, Zap } from "lucide-react";
import { useLocation } from "wouter";
import Navbar from "../components/Navbar";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_40%),linear-gradient(135deg,_#f8fbff,_#eef4ff)] text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_40%),linear-gradient(135deg,_#020617,_#0f172a)] dark:text-white">
      <Navbar />

      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2rem] border border-white/40 bg-white/70 p-8 text-center shadow-[0_30px_120px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60 sm:p-12">
            <Badge className="mx-auto bg-cyan-50 text-cyan-700 hover:bg-cyan-50 dark:bg-cyan-600/10 dark:text-cyan-300">About our technology</Badge>
            <h1 className="mt-4 text-3xl font-semibold sm:text-5xl">Fighting misinformation with AI</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-lg">
              Truth Lens helps people inspect claims, compare signals, and make better decisions in a noisy information landscape.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-white/40 bg-white/70 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Sparkles className="h-5 w-5 text-cyan-600" /> How the model works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p>The detection system combines natural-language processing with machine-learning signals trained on verified and false content.</p>
                <p>It analyzes tone, structure, context, and source cues to provide a confidence-based judgment rather than a binary certainty.</p>
              </CardContent>
            </Card>
            <Card className="border-white/40 bg-white/70 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Shield className="h-5 w-5 text-cyan-600" /> Responsible use
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p>We recommend validating critical claims through multiple reputable outlets and checking the original evidence before sharing them.</p>
                <p>Our tool exists to strengthen human judgment, not replace it.</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-white/40 bg-white/70 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Brain className="h-5 w-5 text-cyan-600" /> RoBERTa model
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p>We use a transformer-based model that understands context and nuance in language.</p>
                <ul className="space-y-2">
                  <li>• Understands context more effectively than simple keyword checks</li>
                  <li>• Fine-tuned for fake-news detection patterns</li>
                  <li>• Designed to surface explainable signals</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-white/40 bg-white/70 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Database className="h-5 w-5 text-cyan-600" /> Training data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p>Our model is trained on a blend of verified reporting and known misinformation cases.</p>
                <ul className="space-y-2">
                  <li>• Broad coverage across domains and styles</li>
                  <li>• Continuously refined as new patterns emerge</li>
                  <li>• Used to support explainable predictions</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-white/40 bg-white/70 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Zap className="h-5 w-5 text-cyan-600" /> NLP techniques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p>Advanced natural-language techniques help identify misleading patterns and suspicious framing.</p>
                <ul className="space-y-2">
                  <li>• Sentiment and tone analysis</li>
                  <li>• Entity and source tracking</li>
                  <li>• Linguistic feature extraction</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-white/40 bg-white/70 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Activity className="h-5 w-5 text-cyan-600" /> Accuracy metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p>The platform provides a practical confidence score alongside its classification.</p>
                <ul className="space-y-2">
                  <li>• Confidence-based output for each result</li>
                  <li>• Designed for rapid review and verification</li>
                  <li>• Best used with human context and source checking</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2rem] border border-white/40 bg-white/70 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
            <h2 className="text-2xl font-semibold sm:text-3xl">Key features</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <Card className="border-white/40 bg-slate-950/5 shadow-sm backdrop-blur md:min-h-[160px] dark:border-white/10 dark:bg-white/5">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 dark:text-white">Real-time analysis</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 dark:text-slate-300">
                  Get fast results and keep momentum in your review workflow.
                </CardContent>
              </Card>
              <Card className="border-white/40 bg-slate-950/5 shadow-sm backdrop-blur md:min-h-[160px] dark:border-white/10 dark:bg-white/5">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 dark:text-white">Detailed explanations</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 dark:text-slate-300">
                  Understand the rationale behind each classification with concise reasoning.
                </CardContent>
              </Card>
              <Card className="border-white/40 bg-slate-950/5 shadow-sm backdrop-blur md:min-h-[160px] dark:border-white/10 dark:bg-white/5">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 dark:text-white">Privacy first</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 dark:text-slate-300">
                  Protect your flow of work with a product designed around secure and respectful handling of content.
                </CardContent>
              </Card>
              <Card className="border-white/40 bg-slate-950/5 shadow-sm backdrop-blur md:min-h-[160px] dark:border-white/10 dark:bg-white/5">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 dark:text-white">Continuous learning</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 dark:text-slate-300">
                  Keep pace with evolving misinformation tactics through regular model refinement.
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2rem] border border-white/40 bg-white/70 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-semibold sm:text-3xl">Built to support responsible media literacy</h2>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">We believe technology should help people verify claims faster while keeping human judgment at the center.</p>
              </div>
              <Button onClick={() => setLocation("/")} className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                Analyze a story
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

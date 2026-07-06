import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import api from "../lib/api";
import { toast } from "sonner";
import { 
  Send, 
  Sparkles, 
  Loader2, 
  Copy,
  Trash2,
  MessageSquare
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

interface ChatMessage {
  role: "user" | "model";
  content: string;
  timestamp?: string;
}

interface StructuredResponse {
  prediction?: string;
  confidence?: number;
  credibility?: string;
  summary?: string;
  top_keywords?: string[];
  trusted_sources?: string[];
}

function parseStructuredContent(content: string): { text: string; structured?: StructuredResponse } {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object") {
      return {
        text: parsed.summary || parsed.message || content,
        structured: parsed,
      };
    }
  } catch {
    // fall back
  }
  return { text: content };
}

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const fetchChatHistory = async () => {
    try {
      const res = await api.get("/chat/history");
      setMessages(res.data || []);
    } catch (err) {
      console.error("Failed to fetch chat history", err);
      toast.error("Failed to load chat history");
    }
  };

  useEffect(() => {
    if (user) {
      void fetchChatHistory();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: inputMsg };
    setMessages((prev) => [...prev, userMessage]);
    setInputMsg("");
    setIsSending(true);

    try {
      const res = await api.post("/chat", { message: userMessage.content });
      const botMessage: ChatMessage = { role: "model", content: res.data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Chat error occurred";
      toast.error(errMsg);
    } finally {
      setIsSending(false);
    }
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Unable to copy text");
    }
  };

  const clearChatSession = () => {
    setMessages([]);
    toast.success("Chat history cleared locally");
  };

  const suggestions = [
    "Is the recent headline about NASA fake?",
    "How does the AI verify credibility?",
    "Analyze this statement: 'Scientists discover cure for aging'",
    "What are common signals of fake news?"
  ];

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_40%),linear-gradient(135deg,_#020617,_#0f172a)]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_40%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6 h-[calc(100vh-6rem)]">
        {/* Left Sidebar: Quick suggestions & Info */}
        <div className="w-full md:w-80 shrink-0 flex flex-col gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5 p-6 backdrop-blur-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700 dark:text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" /> AI Chat
            </div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Truth Assistant</h1>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Ask queries about claims, verify statements, summarize long documents, or understand specific prediction metadata using conversational AI.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5 p-5 backdrop-blur-2xl flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Quick Prompts</h2>
              <div className="space-y-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputMsg(s)}
                    className="w-full text-left p-3 rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-950/20 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:border-cyan-400/30 transition duration-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={clearChatSession}
              variant="outline"
              className="mt-4 w-full rounded-2xl border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-rose-600 dark:text-rose-400"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Clear History
            </Button>
          </div>
        </div>

        {/* Right Section: Chat Dashboard */}
        <Card className="flex-1 flex flex-col overflow-hidden border border-slate-200 bg-white/80 dark:border-white/10 dark:bg-slate-950/40 backdrop-blur-2xl rounded-[2rem] shadow-xl dark:shadow-[0_30px_120px_rgba(2,8,23,0.45)]">
          <CardHeader className="border-b border-slate-200 bg-slate-50/80 dark:border-white/5 dark:bg-white/5 px-6 py-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <MessageSquare className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">Interactive Session</CardTitle>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Powered by Truth Lens Model</p>
              </div>
            </div>
          </CardHeader>

          {/* Messages Display */}
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-100/50 dark:bg-slate-950/20">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/10 border border-cyan-500/20 mb-4 animate-pulse">
                  <Sparkles className="h-8 w-8 text-cyan-500 dark:text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Start a claim verification session</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  Submit any online article text, statement, or headline. The AI will extract keywords, predict validity, and cross-reference with credible entities.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const parsed = msg.role === "model" ? parseStructuredContent(msg.content) : null;
                const isUser = msg.role === "user";

                return (
                  <div key={`${msg.role}-${idx}`} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-[1.5rem] px-5 py-4 text-sm shadow-lg ${
                      isUser 
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white" 
                        : "border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 text-slate-800 dark:text-slate-200"
                    }`}>
                      {msg.role === "model" && parsed?.structured ? (
                        <div className="space-y-4">
                          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Prediction Verdict</span>
                              <span className="rounded-full bg-cyan-500 px-3 py-1 text-xs font-bold text-white uppercase">{parsed.structured.prediction || "Verified"}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-300">
                              {parsed.structured.confidence !== undefined && <span>Confidence: <strong>{Math.round(parsed.structured.confidence * 100)}%</strong></span>}
                              {parsed.structured.credibility && <span>Credibility Score: <strong>{parsed.structured.credibility}</strong></span>}
                            </div>
                          </div>

                          {parsed.structured.summary && (
                            <div className="space-y-2 rounded-2xl border border-white/5 bg-slate-950/40 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Analysis Summary</p>
                              <div className="prose prose-sm prose-invert max-w-none text-slate-300">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                                  {parsed.structured.summary}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )}

                          {parsed.structured.top_keywords?.length ? (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Signal Keywords</p>
                              <div className="flex flex-wrap gap-2">
                                {parsed.structured.top_keywords.map((kw) => (
                                  <span key={kw} className="rounded-xl bg-cyan-600/20 border border-cyan-500/30 px-3 py-1 text-xs text-cyan-300">{kw}</span>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {parsed.structured.trusted_sources?.length ? (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Suggested Verification Sources</p>
                              <div className="flex flex-wrap gap-2">
                                {parsed.structured.trusted_sources.map((src) => (
                                  <span key={src} className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-300">{src}</span>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="prose prose-sm prose-invert max-w-none text-slate-200">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                          {!isUser && (
                            <div className="flex justify-end pt-2 border-t border-white/5">
                              <button 
                                onClick={() => copyMessage(msg.content)} 
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 transition"
                              >
                                <Copy className="h-3 w-3" /> Copy Content
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300 shadow-lg">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                    Thinking and fetching intelligence resources...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Form input */}
          <CardFooter className="border-t border-slate-200 bg-white/80 dark:border-white/5 dark:bg-slate-950/40 p-4">
            <form onSubmit={handleSend} className="flex w-full items-center gap-3">
              <Input
                type="text"
                placeholder="Ask about news legitimacy, entities, sources..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                disabled={isSending}
                className="h-12 flex-1 rounded-2xl border-white/10 bg-white/5 text-sm placeholder-slate-400 text-white focus:border-cyan-400"
              />
              <Button type="submit" size="icon" disabled={isSending || !inputMsg.trim()} className="h-12 w-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shrink-0">
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, Sparkles, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

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
    // fall back to markdown/plain text
  }

  return { text: content };
}

export default function Chatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChatHistory = async () => {
    try {
      const res = await api.get("/chat/history");
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch chat history", err);
    }
  };

  useEffect(() => {
    if (user && isOpen) {
      void fetchChatHistory();
    }
  }, [user, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    if (!user) {
      toast.error("Please login to chat with our AI assistant.");
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: inputMsg };
    setMessages((prev) => [...prev, userMessage]);
    setInputMsg("");
    setIsSending(true);

    try {
      const res = await api.post("/chat", { message: userMessage.content });
      const botMessage: ChatMessage = { role: "model", content: res.data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Chat error occurred");
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

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className="mb-4 flex h-[560px] w-[92vw] max-w-[420px] flex-col overflow-hidden border border-white/20 bg-white/80 shadow-[0_30px_120px_rgba(2,8,23,0.35)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/80">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 px-4 py-4 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15">
                <Sparkles className="h-4 w-4 text-cyan-200" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Truth Lens Assistant</CardTitle>
                <p className="text-[11px] text-cyan-100/80">Always ready to help</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-cyan-50/70 to-white p-3 dark:from-slate-900 dark:to-slate-950">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-200 bg-white/70 p-6 text-center text-sm text-slate-600 dark:border-cyan-500/20 dark:bg-slate-900/50 dark:text-slate-300">
                <Sparkles className="mb-3 h-8 w-8 text-cyan-500" />
                <p className="font-semibold">Ask anything about news credibility</p>
                <p className="mt-2 text-xs leading-5">I can help summarize articles, explain signals, and suggest trusted sources.</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const parsed = msg.role === "model" ? parseStructuredContent(msg.content) : null;
                return (
                  <div key={`${msg.role}-${idx}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[90%] rounded-2xl px-3 py-2.5 text-sm shadow-sm ${msg.role === "user" ? "bg-slate-900 text-white dark:bg-cyan-600" : "border border-slate-200 bg-white/90 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"}`}>
                      {msg.role === "model" && parsed?.structured ? (
                        <div className="space-y-3">
                          <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 dark:border-cyan-500/20 dark:bg-cyan-600/10">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">Prediction</span>
                              <span className="rounded-full bg-cyan-600 px-2 py-1 text-[11px] font-semibold text-white">{parsed.structured.prediction || "Analysis"}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
                              {parsed.structured.confidence !== undefined && <span>Confidence: {Math.round(parsed.structured.confidence * 100)}%</span>}
                              {parsed.structured.credibility && <span>Credibility: {parsed.structured.credibility}</span>}
                            </div>
                          </div>
                          {parsed.structured.summary && (
                            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/70">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Summary</p>
                              <div className="prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                                  {parsed.structured.summary}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )}
                          {parsed.structured.top_keywords?.length ? (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/70">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Top Keywords</p>
                              <div className="flex flex-wrap gap-2">
                                {parsed.structured.top_keywords.map((keyword) => (
                                  <span key={keyword} className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white dark:bg-cyan-600">{keyword}</span>
                                ))}
                              </div>
                            </div>
                          ) : null}
                          {parsed.structured.trusted_sources?.length ? (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/70">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Suggested Sources</p>
                              <div className="flex flex-wrap gap-2">
                                {parsed.structured.trusted_sources.map((source) => (
                                  <span key={source} className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[11px] font-medium text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-600/10 dark:text-cyan-300">{source}</span>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                          {msg.role === "model" && (
                            <div className="flex justify-end">
                              <button onClick={() => copyMessage(msg.content)} className="text-[11px] font-medium text-cyan-600 transition hover:text-cyan-500 dark:text-cyan-300">Copy</button>
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
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <CardFooter className="border-t border-white/10 bg-white/80 p-3 dark:bg-slate-950/80">
            <form onSubmit={handleSend} className="flex w-full items-center gap-2">
              <Input
                type="text"
                placeholder="Ask your query..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                disabled={isSending}
                className="h-11 flex-1 rounded-2xl border-white/20 bg-slate-950/5 text-sm dark:bg-white/10"
              />
              <Button type="submit" size="icon" disabled={isSending || !inputMsg.trim()} className="h-11 w-11 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      <Button onClick={() => setIsOpen(!isOpen)} size="icon" className="h-14 w-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_20px_60px_rgba(56,189,248,0.35)]">
        {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </Button>
    </div>
  );
}

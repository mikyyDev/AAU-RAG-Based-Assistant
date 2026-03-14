"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Send,
  PanelLeftOpen,
  PanelLeftClose,
  RotateCcw,
  GraduationCap,
  Wifi,
  WifiOff,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import ChatMessage from "@/components/ChatMessage";
import TypingIndicator from "@/components/TypingIndicator";
import DocumentPanel from "@/components/DocumentPanel";
import { api } from "@/lib/api";
import type { DocumentInfo, Message } from "@/types";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm the **AAU Assistant**, powered by your uploaded university documents.\n\n" +
    "You can ask me questions about:\n" +
    "- 📚 Student handbook & policies\n" +
    "- 📋 Course guides & curriculum\n" +
    "- 🏛️ University regulations & announcements\n" +
    "- 📖 Library resources & research guidelines\n\n" +
    "Upload documents using the panel on the left, then start asking questions!",
  timestamp: new Date(),
};

const SUGGESTED_QUESTIONS = [
  "What are the graduation requirements?",
  "How do I apply for a library card?",
  "What is the academic calendar?",
  "How does the grading system work?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => uuidv4());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Scroll to bottom on new messages ──────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Auto-resize textarea ───────────────────────────────────────
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  }, [input]);

  // ── Backend health check ───────────────────────────────────────
  const checkHealth = useCallback(async () => {
    try {
      const h = await api.health();
      setBackendStatus(h.status === "ok" ? "online" : "offline");
    } catch {
      setBackendStatus("offline");
    }
  }, []);

  // ── Load documents ─────────────────────────────────────────────
  const loadDocuments = useCallback(async () => {
    try {
      const data = await api.listDocuments();
      setDocuments(data.documents);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    checkHealth();
    loadDocuments();
    const interval = setInterval(checkHealth, 30_000);
    return () => clearInterval(interval);
  }, [checkHealth, loadDocuments]);

  // ── Send a message ─────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMsg: Message = {
        id: uuidv4(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      // Build history (exclude welcome message)
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const response = await api.chat({
          message: trimmed,
          conversation_history: history,
          session_id: sessionId,
        });

        // Update sessionId if server returned one
        if (response.session_id) setSessionId(response.session_id);

        const assistantMsg: Message = {
          id: uuidv4(),
          role: "assistant",
          content: response.answer,
          sources: response.sources,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const errorMsg: Message = {
          id: uuidv4(),
          role: "assistant",
          content:
            err instanceof Error
              ? `⚠️ ${err.message}`
              : "⚠️ An unexpected error occurred. Please try again.",
          timestamp: new Date(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, messages, sessionId]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    setSessionId(uuidv4());
    setInput("");
  };

  const isEmptyChat =
    messages.length === 1 && messages[0].id === "welcome";

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-100 overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`transition-all duration-300 ease-in-out flex-shrink-0 ${
          sidebarOpen ? "w-72" : "w-0"
        } overflow-hidden`}
      >
        {sidebarOpen && (
          <DocumentPanel
            documents={documents}
            onDocumentsChange={loadDocuments}
            onClose={() => setSidebarOpen(false)}
          />
        )}
      </aside>

      {/* ── Main chat area ──────────────────────────────────── */}
      <main className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-700 bg-[#0f172a]/80 backdrop-blur-sm z-10">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose size={18} />
            ) : (
              <PanelLeftOpen size={18} />
            )}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-tight">
                AAU Assistant
              </h1>
              <p className="text-[10px] text-slate-500 leading-tight">
                Addis Ababa University
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div className="ml-auto flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                backendStatus === "online"
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : backendStatus === "offline"
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-slate-700 border-slate-600 text-slate-400"
              }`}
            >
              {backendStatus === "online" ? (
                <Wifi size={11} />
              ) : (
                <WifiOff size={11} />
              )}
              <span className="capitalize">{backendStatus}</span>
            </div>

            <button
              onClick={handleReset}
              className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              title="Clear conversation"
              aria-label="Clear conversation"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {/* Suggested questions (only on empty chat) */}
            {isEmptyChat && (
              <div className="px-4 py-2">
                <p className="text-xs text-slate-500 mb-2 px-1">
                  Try asking…
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-left text-sm text-slate-300 bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 hover:border-blue-500/60 hover:bg-blue-500/5 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-slate-700 bg-[#0f172a]/80 backdrop-blur-sm px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-[#1e293b] border border-slate-600 rounded-2xl px-4 py-3 focus-within:border-blue-500 transition-colors shadow-lg">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about AAU…"
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none text-sm text-slate-100 placeholder-slate-500 leading-relaxed max-h-40 overflow-y-auto py-0.5"
                disabled={isTyping}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  input.trim() && !isTyping
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 scale-100"
                    : "bg-slate-700 text-slate-500 cursor-not-allowed scale-95"
                }`}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-600 mt-2">
              AAU Assistant may make mistakes. Always verify with official
              sources.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

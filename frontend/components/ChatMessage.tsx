"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen, ChevronDown, ChevronUp, User, Bot } from "lucide-react";
import { useState } from "react";
import type { Message } from "@/types";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === "user";

  return (
    <div
      className={`message-enter flex gap-3 px-4 py-5 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] flex flex-col gap-2 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-blue-600 text-white rounded-tr-sm"
              : message.isError
              ? "bg-red-900/40 border border-red-700 text-red-200 rounded-tl-sm"
              : "bg-[#1e293b] text-slate-100 border border-slate-700/50 rounded-tl-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="w-full">
            <button
              onClick={() => setShowSources((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-1"
            >
              <BookOpen size={12} />
              <span>
                {message.sources.length} source
                {message.sources.length > 1 ? "s" : ""}
              </span>
              {showSources ? (
                <ChevronUp size={12} />
              ) : (
                <ChevronDown size={12} />
              )}
            </button>

            {showSources && (
              <div className="mt-2 flex flex-col gap-2">
                {message.sources.map((src, i) => (
                  <div
                    key={i}
                    className="bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-xs"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <BookOpen size={11} className="text-blue-400 shrink-0" />
                      <span className="font-medium text-blue-300 truncate">
                        {src.source}
                      </span>
                      {src.page != null && (
                        <span className="text-slate-500 shrink-0">
                          p.{src.page + 1}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 line-clamp-3 leading-relaxed">
                      &ldquo;{src.snippet}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <span className="text-[10px] text-slate-600 px-1">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}

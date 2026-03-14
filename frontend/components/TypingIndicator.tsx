"use client";

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-5">
      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
      </div>
      {/* Bubble */}
      <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5 shadow-sm">
        <span className="typing-dot w-2 h-2 rounded-full bg-slate-400 inline-block" />
        <span className="typing-dot w-2 h-2 rounded-full bg-slate-400 inline-block" />
        <span className="typing-dot w-2 h-2 rounded-full bg-slate-400 inline-block" />
      </div>
    </div>
  );
}

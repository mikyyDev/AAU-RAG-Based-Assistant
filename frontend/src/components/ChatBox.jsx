import React from "react";
import { useState } from "react";
import API from "../api";

const starterQuestions = [
  "What are the library borrowing rules?",
  "How does course registration work?",
  "What policies are mentioned for student conduct?",
];

const BULLET_RE = /^[-*•]\s+/;
const NUMBERED_RE = /^\d+[.)]\s+/;

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function renderAssistantContent(text) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return <p>{text}</p>;

  if (lines.length === 1) {
    const sentences = splitSentences(lines[0]);
    if (sentences.length >= 3) {
      return (
        <ul>
          {sentences.map((sentence, idx) => (
            <li key={`sentence-${idx}`}>{sentence}</li>
          ))}
        </ul>
      );
    }
  }

  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    if (BULLET_RE.test(lines[i])) {
      const items = [];
      while (i < lines.length && BULLET_RE.test(lines[i])) {
        items.push(lines[i].replace(BULLET_RE, ""));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (NUMBERED_RE.test(lines[i])) {
      const items = [];
      while (i < lines.length && NUMBERED_RE.test(lines[i])) {
        items.push(lines[i].replace(NUMBERED_RE, ""));
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    if (lines[i].endsWith(":") && lines[i].length <= 80) {
      blocks.push({ type: "h", text: lines[i] });
      i += 1;
      continue;
    }

    blocks.push({ type: "p", text: lines[i] });
    i += 1;
  }

  return (
    <div className="answer-rich">
      {blocks.map((block, idx) => {
        if (block.type === "h") {
          return (
            <p className="answer-heading" key={`block-${idx}`}>
              {block.text}
            </p>
          );
        }

        if (block.type === "ul") {
          return (
            <ul key={`block-${idx}`}>
              {block.items.map((item, itemIdx) => (
                <li key={`ul-${idx}-${itemIdx}`}>{item}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "ol") {
          return (
            <ol key={`block-${idx}`}>
              {block.items.map((item, itemIdx) => (
                <li key={`ol-${idx}-${itemIdx}`}>{item}</li>
              ))}
            </ol>
          );
        }

        return <p key={`block-${idx}`}>{block.text}</p>;
      })}
    </div>
  );
}

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    const userMsg = { role: "user", text: question };

    setMessages((prev) => [...prev, userMsg]);
    setError("");
    setIsLoading(true);

    try {
      const res = await API.post("/chat", { question });

      const botMsg = {
        role: "assistant",
        text: res.data.answer || "No answer was returned.",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch answer.");
    } finally {
      setIsLoading(false);
    }

    setInput("");
  };

  return (
    <div className="card panel-animate chat-card">
      <div className="section-row">
        <div>
          <h2>Ask the Assistant</h2>
          <p className="muted-text">
            Answers are generated only from indexed documents.
          </p>
        </div>
      </div>

      <div className="chip-row">
        {starterQuestions.map((question) => (
          <button
            key={question}
            className="prompt-chip"
            type="button"
            onClick={() => setInput(question)}
          >
            {question}
          </button>
        ))}
      </div>

      <div className="chat-stream">
        {messages.length === 0 && (
          <div className="empty-box">
            Ask a question to start a grounded conversation.
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`chat-line ${m.role === "user" ? "user" : "assistant"}`}
          >
            <div
              className={`chat-bubble ${m.role === "user" ? "user" : "assistant"}`}
            >
              {m.role === "assistant" ? renderAssistantContent(m.text) : m.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="typing-indicator">
            Retrieving context and generating answer...
          </div>
        )}
      </div>

      {error && <div className="info-box error">{error}</div>}

      <div className="input-row">
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about AAU handbooks, policies, or guides..."
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />

        <button onClick={send} className="primary-btn" disabled={isLoading}>
          Ask
        </button>
      </div>
    </div>
  );
}

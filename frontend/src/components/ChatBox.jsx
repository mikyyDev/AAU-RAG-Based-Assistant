import React from "react";
import { useState } from "react";
import API from "../api";
import SourceList from "./SourceList";

const sampleQuestions = [
  "What are the library borrowing rules?",
  "What does the student handbook say about registration?",
  "What are the research proposal requirements?",
  "What policies apply to student conduct?",
];

export default function ChatBox() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) return;

    try {
      setIsLoading(true);
      setAnswer("");
      setSources([]);

      const res = await API.post("/chat", { question: question.trim() });

      setAnswer(res.data.answer || "No answer returned.");
      setSources(res.data.sources || []);
    } catch (err) {
      setAnswer(
        err.response?.data?.detail || "Something went wrong while asking.",
      );
      setSources([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card glass">
      <div className="section-title">
        <h2>Ask the Assistant</h2>
        <span>Grounded Q&A</span>
      </div>

      <p className="muted">
        Ask questions about the uploaded AAU documents. The assistant should
        answer only from retrieved content.
      </p>

      <div className="samples">
        {sampleQuestions.map((item) => (
          <button
            key={item}
            className="sample-chip"
            onClick={() => setQuestion(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      <textarea
        className="chat-input"
        rows="6"
        placeholder="Ask something about Addis Ababa University documents..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <button
        className="primary-btn"
        onClick={askQuestion}
        disabled={isLoading}
      >
        {isLoading ? "Thinking..." : "Ask Question"}
      </button>

      {(answer || isLoading) && (
        <div className="answer-panel">
          <div className="answer-header">
            <h3>Answer</h3>
            <span>{isLoading ? "Generating..." : "Completed"}</span>
          </div>
          <div className="answer-content">
            {isLoading ? (
              <div className="loader-wrap">
                <div className="loader"></div>
                <p>
                  Retrieving relevant chunks and generating grounded answer...
                </p>
              </div>
            ) : (
              <p>{answer}</p>
            )}
          </div>
        </div>
      )}

      {!isLoading && sources.length > 0 && <SourceList sources={sources} />}
    </div>
  );
}

import React from "react";

export default function SourceList({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="sources-section">
      <h3>Sources</h3>

      <div className="sources-grid">
        {sources.map((src, index) => (
          <div className="source-card" key={`${src.chunk_id}-${index}`}>
            <div className="source-header">
              <span className="source-file">{src.file_name}</span>
              <span className="source-page">
                {src.page ? `Page ${src.page}` : "Text"}
              </span>
            </div>

            <div className="highlight-bar"></div>

            <p className="source-text">{src.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

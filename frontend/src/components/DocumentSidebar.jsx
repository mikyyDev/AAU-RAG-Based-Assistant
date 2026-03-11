import React from "react";

export default function DocumentSidebar({ documents }) {
  return (
    <div className="card sidebar-card panel-animate">
      <h2>Indexed Documents</h2>
      <p className="muted-text">
        Uploaded files currently available for retrieval.
      </p>

      {documents.length === 0 ? (
        <div className="empty-box">No documents uploaded yet.</div>
      ) : (
        <div className="doc-list">
          {documents.map((doc, index) => (
            <div className="doc-item" key={`${doc.file_name}-${index}`}>
              <div className="doc-icon">DOC</div>
              <div>
                <div className="doc-name">{doc.file_name}</div>
                <div className="doc-meta">
                  {doc.chunks_indexed} chunks indexed
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

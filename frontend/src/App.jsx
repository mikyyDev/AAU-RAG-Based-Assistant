import React, { useState } from "react";
import Header from "./components/Header";
import UploadBox from "./components/UploadBox";
import ChatBox from "./components/ChatBox";
import DocumentSidebar from "./components/DocumentSidebar";
import "./index.css";

export default function App() {
  const [documents, setDocuments] = useState([]);

  return (
    <div className="app-shell">
      <div className="bg-glow bg-glow-one"></div>
      <div className="bg-glow bg-glow-two"></div>
      <Header />

      <div className="main-layout">
        <aside className="sidebar-area">
          <DocumentSidebar documents={documents} />
        </aside>

        <section className="content-area">
          <div className="top-panel">
            <UploadBox setDocuments={setDocuments} />
          </div>
          <div className="chat-panel">
            <ChatBox />
          </div>
        </section>
      </div>
    </div>
  );
}

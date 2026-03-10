import React from "react";
import Header from "./components/Header";
import UploadBox from "./components/UploadBox";
import ChatBox from "./components/ChatBox";
import "./index.css";

export default function App() {
  return (
    <div className="app-shell">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      <main className="container">
        <Header />

        <section className="dashboard-grid">
          <UploadBox />
          <ChatBox />
        </section>
      </main>
    </div>
  );
}

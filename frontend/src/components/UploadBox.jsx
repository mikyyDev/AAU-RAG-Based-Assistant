import React from "react";
import { useState } from "react";
import API from "../api";

export default function UploadBox() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please choose a PDF or TXT file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      setMessage("Indexing document...");

      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(
        `Indexed successfully: ${res.data.file_name} (${res.data.chunks_indexed} chunks)`,
      );
      setFile(null);
      const input = document.getElementById("fileInput");
      if (input) input.value = "";
    } catch (err) {
      setMessage(err.response?.data?.detail || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card glass">
      <div className="section-title">
        <h2>Upload Documents</h2>
        <span>PDF / TXT</span>
      </div>

      <p className="muted">
        Add AAU documents like student handbooks, policies, course guides,
        library resources, and research guidelines.
      </p>

      <label className="upload-box">
        <input
          id="fileInput"
          type="file"
          accept=".pdf,.txt"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <span>{file ? file.name : "Choose a file"}</span>
      </label>

      <button
        className="primary-btn"
        onClick={handleUpload}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Upload & Index"}
      </button>

      {message && <div className="status-box">{message}</div>}
    </div>
  );
}

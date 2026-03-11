import React, { useState } from "react";
import API from "../api";

export default function UploadBox({ setDocuments }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [statusType, setStatusType] = useState("neutral");

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please choose a file first.");
      setStatusType("error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      setMessage("Uploading and indexing...");
      setStatusType("neutral");

      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(
        `Indexed: ${res.data.file_name} (${res.data.chunks_indexed} chunks)`,
      );
      setStatusType("success");

      setDocuments((prev) => [
        ...prev,
        {
          file_name: res.data.file_name,
          chunks_indexed: res.data.chunks_indexed,
        },
      ]);

      setFile(null);
      const input = document.getElementById("fileInput");
      if (input) input.value = "";
    } catch (err) {
      setMessage(err.response?.data?.detail || "Upload failed.");
      setStatusType("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card panel-animate">
      <div className="section-row">
        <div>
          <h2>Upload Documents</h2>
          <p className="muted-text">
            Add PDF or TXT resources to expand the assistant knowledge base.
          </p>
        </div>
      </div>

      <label className="upload-zone">
        <input
          id="fileInput"
          type="file"
          accept=".pdf,.txt"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <span>{file ? file.name : "Click to choose a document"}</span>
        <small>
          {file
            ? `${(file.size / 1024).toFixed(1)} KB`
            : "Max size depends on backend settings"}
        </small>
      </label>

      <button
        className="primary-btn"
        onClick={handleUpload}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Upload & Index"}
      </button>

      {message && <div className={`info-box ${statusType}`}>{message}</div>}
    </div>
  );
}

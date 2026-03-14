"use client";

import { useCallback, useRef, useState } from "react";
import {
  Upload,
  FileText,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import type { DocumentInfo } from "@/types";

interface DocumentPanelProps {
  documents: DocumentInfo[];
  onDocumentsChange: () => void;
  onClose: () => void;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function DocumentPanel({
  documents,
  onDocumentsChange,
  onClose,
}: DocumentPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const fileArray = Array.from(files);

      setUploadStatus("uploading");
      setUploadMessage("");

      try {
        const result = await api.uploadDocuments(fileArray);
        setUploadStatus("success");
        setUploadMessage(
          `Indexed ${result.ingested_files.join(", ")} — ${result.total_chunks} chunks`
        );
        onDocumentsChange();
      } catch (err) {
        setUploadStatus("error");
        setUploadMessage(
          err instanceof Error ? err.message : "Upload failed."
        );
      }
    },
    [onDocumentsChange]
  );

  const handleDelete = async (filename: string) => {
    setDeletingFile(filename);
    try {
      await api.deleteDocument(filename);
      onDocumentsChange();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingFile(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e293b] border-r border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700">
        <h2 className="font-semibold text-slate-100 text-sm">Documents</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Close panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Upload area */}
      <div className="p-4 border-b border-slate-700">
        <div
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-blue-500 bg-blue-500/10"
              : "border-slate-600 hover:border-slate-400"
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <Upload size={24} className="mx-auto mb-2 text-slate-400" />
          <p className="text-sm text-slate-300 font-medium">
            Drop files or click to upload
          </p>
          <p className="text-xs text-slate-500 mt-1">PDF, TXT, DOCX, MD</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.docx,.md"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Upload status */}
        {uploadStatus !== "idle" && (
          <div
            className={`mt-3 flex items-start gap-2 text-xs rounded-lg px-3 py-2.5 ${
              uploadStatus === "uploading"
                ? "bg-blue-500/10 text-blue-300"
                : uploadStatus === "success"
                ? "bg-green-500/10 text-green-300"
                : "bg-red-500/10 text-red-300"
            }`}
          >
            {uploadStatus === "uploading" && (
              <Loader2 size={13} className="mt-0.5 animate-spin shrink-0" />
            )}
            {uploadStatus === "success" && (
              <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
            )}
            {uploadStatus === "error" && (
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
            )}
            <span>
              {uploadStatus === "uploading"
                ? "Uploading and indexing…"
                : uploadMessage}
            </span>
          </div>
        )}
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto p-4">
        {documents.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-8">
            <FileText size={32} className="mx-auto mb-2 opacity-40" />
            <p>No documents indexed yet.</p>
            <p className="text-xs mt-1 text-slate-600">
              Upload documents above to get started.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {documents.map((doc) => (
              <li
                key={doc.filename}
                className="flex items-center gap-3 bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2.5 group"
              >
                <FileText size={15} className="text-blue-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">
                    {doc.filename}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {doc.chunks} chunk{doc.chunks !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(doc.filename)}
                  disabled={deletingFile === doc.filename}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 disabled:opacity-50"
                  aria-label={`Delete ${doc.filename}`}
                >
                  {deletingFile === doc.filename ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Summary footer */}
      {documents.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-700 text-xs text-slate-500">
          {documents.length} document{documents.length !== 1 ? "s" : ""} •{" "}
          {documents.reduce((sum, d) => sum + d.chunks, 0)} total chunks
        </div>
      )}
    </div>
  );
}

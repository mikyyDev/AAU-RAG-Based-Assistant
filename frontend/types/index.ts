// Shared TypeScript types for the AAU RAG Assistant

export interface SourceDocument {
  source: string;
  page?: number | null;
  snippet: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceDocument[];
  timestamp: Date;
  isError?: boolean;
}

export interface ChatRequest {
  message: string;
  conversation_history: { role: string; content: string }[];
  session_id?: string;
}

export interface ChatResponse {
  answer: string;
  sources: SourceDocument[];
  session_id: string;
}

export interface DocumentInfo {
  filename: string;
  chunks: number;
}

export interface DocumentListResponse {
  documents: DocumentInfo[];
  total_chunks: number;
}

export interface UploadResponse {
  message: string;
  ingested_files: string[];
  total_chunks: number;
}

import type {
  ChatRequest,
  ChatResponse,
  DocumentListResponse,
  UploadResponse,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message =
      errorBody?.detail ?? `HTTP ${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  /** Send a chat message and receive an AI-generated answer with sources. */
  chat: async (payload: ChatRequest): Promise<ChatResponse> => {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<ChatResponse>(res);
  },

  /** Upload one or more documents for indexing. */
  uploadDocuments: async (files: File[]): Promise<UploadResponse> => {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: form,
    });
    return handleResponse<UploadResponse>(res);
  },

  /** Fetch the list of indexed documents. */
  listDocuments: async (): Promise<DocumentListResponse> => {
    const res = await fetch(`${API_BASE}/documents`);
    return handleResponse<DocumentListResponse>(res);
  },

  /** Delete a document by filename. */
  deleteDocument: async (filename: string): Promise<void> => {
    const res = await fetch(
      `${API_BASE}/documents/${encodeURIComponent(filename)}`,
      { method: "DELETE" }
    );
    await handleResponse<unknown>(res);
  },

  /** Check backend health. */
  health: async (): Promise<{ status: string; pipeline_ready: boolean }> => {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },
};

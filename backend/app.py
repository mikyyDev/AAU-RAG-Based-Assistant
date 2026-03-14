"""
AAU RAG-Based Assistant – FastAPI Backend
Handles document ingestion, chunking, embedding, retrieval, and Q&A.
"""

import shutil
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag_pipeline import RAGPipeline
from config import settings

# ──────────────────────────────────────────────
# App setup
# ──────────────────────────────────────────────

# Singleton pipeline (loaded once at startup)
pipeline: Optional[RAGPipeline] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise the RAG pipeline on startup and clean up on shutdown."""
    global pipeline
    pipeline = RAGPipeline(
        docs_path=settings.docs_path,
        chroma_db_path=settings.chroma_db_path,
        openai_api_key=settings.openai_api_key,
        chat_model=settings.openai_chat_model,
        embedding_model=settings.openai_embedding_model,
    )
    # Auto-ingest any documents already in the docs folder
    pipeline.ingest_directory()
    yield
    # Shutdown: nothing to clean up for ChromaDB with persistence


app = FastAPI(
    title="AAU RAG Assistant API",
    description="Retrieval-Augmented Generation assistant for Addis Ababa University",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# Pydantic schemas
# ──────────────────────────────────────────────


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = []
    session_id: Optional[str] = None


class SourceDocument(BaseModel):
    source: str
    page: Optional[int] = None
    snippet: str


class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceDocument]
    session_id: str


class IngestResponse(BaseModel):
    message: str
    ingested_files: List[str]
    total_chunks: int


class DocumentInfo(BaseModel):
    filename: str
    chunks: int


class DocumentListResponse(BaseModel):
    documents: List[DocumentInfo]
    total_chunks: int


# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────


@app.get("/")
async def root():
    return {"message": "AAU RAG Assistant API is running", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok", "pipeline_ready": pipeline is not None and pipeline.is_ready()}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a message and receive an AI answer grounded in AAU documents."""
    if pipeline is None or not pipeline.is_ready():
        raise HTTPException(
            status_code=503,
            detail="RAG pipeline is not ready. Please upload documents first.",
        )

    session_id = request.session_id or str(uuid.uuid4())

    result = pipeline.query(
        question=request.message,
        conversation_history=[m.model_dump() for m in request.conversation_history],
    )

    return ChatResponse(
        answer=result["answer"],
        sources=[
            SourceDocument(
                source=doc["source"],
                page=doc.get("page"),
                snippet=doc["snippet"],
            )
            for doc in result["sources"]
        ],
        session_id=session_id,
    )


@app.post("/upload", response_model=IngestResponse)
async def upload_documents(files: List[UploadFile] = File(...)):
    """Upload one or more PDF/TXT documents and index them for retrieval."""
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Pipeline not initialized.")

    docs_dir = Path(settings.docs_path)
    docs_dir.mkdir(parents=True, exist_ok=True)

    saved_files: List[str] = []
    for upload in files:
        if upload.filename is None:
            continue
        suffix = Path(upload.filename).suffix.lower()
        if suffix not in {".pdf", ".txt", ".docx", ".md"}:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {upload.filename}. Allowed: pdf, txt, docx, md",
            )
        dest = docs_dir / upload.filename
        with dest.open("wb") as f:
            shutil.copyfileobj(upload.file, f)
        saved_files.append(upload.filename)

    total_chunks = pipeline.ingest_files([str(docs_dir / fn) for fn in saved_files])

    return IngestResponse(
        message=f"Successfully ingested {len(saved_files)} document(s).",
        ingested_files=saved_files,
        total_chunks=total_chunks,
    )


@app.get("/documents", response_model=DocumentListResponse)
async def list_documents():
    """Return a list of indexed documents and their chunk counts."""
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Pipeline not initialized.")

    info = pipeline.list_documents()
    return DocumentListResponse(
        documents=[DocumentInfo(**d) for d in info["documents"]],
        total_chunks=info["total_chunks"],
    )


@app.delete("/documents/{filename}")
async def delete_document(filename: str):
    """Remove a document and its chunks from the vector store."""
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Pipeline not initialized.")

    deleted = pipeline.delete_document(filename)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Document '{filename}' not found.")

    # Also remove the file from disk
    file_path = Path(settings.docs_path) / filename
    if file_path.exists():
        file_path.unlink()

    return {"message": f"Document '{filename}' deleted successfully."}


@app.post("/reset")
async def reset_index():
    """Clear the entire vector store (useful for re-indexing)."""
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Pipeline not initialized.")

    pipeline.reset()
    return {"message": "Vector store cleared."}

import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import DOCS_DIR
from app.schemas import ChatRequest
from app.services.loader import load_document
from app.services.chunker import chunk_text
from app.services.vectorstore import add_chunks
from app.services.rag import answer_question

app = FastAPI(title="AAU RAG Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename
    if not filename.endswith((".pdf", ".txt")):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported.")

    file_path = os.path.join(DOCS_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pages = load_document(file_path)

    chunks_with_meta = []
    counter = 0

    for page_item in pages:
        page_num = page_item["page"]
        page_text = page_item["text"]

        chunks = chunk_text(page_text, chunk_size=700, overlap=100)
        for chunk in chunks:
            counter += 1
            chunks_with_meta.append({
                "chunk_id": f"{filename}_{counter}",
                "file_name": filename,
                "page": page_num,
                "text": chunk
            })

    if not chunks_with_meta:
        raise HTTPException(status_code=400, detail="No readable text found in document.")

    try:
        add_chunks(chunks_with_meta)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Indexing failed for {filename}: {exc}"
        ) from exc

    return {
        "message": "File indexed successfully",
        "file_name": filename,
        "chunks_indexed": len(chunks_with_meta)
    }

@app.post("/chat")
def chat(request: ChatRequest):
    try:
        result = answer_question(request.question)
        return result
    except RuntimeError as exc:
        detail = str(exc)
        lower_detail = detail.lower()
        if "decommissioned" in lower_detail or "model_name" in lower_detail:
            raise HTTPException(status_code=400, detail=detail) from exc
        if "insufficient_quota" in detail or "Error code: 429" in detail:
            raise HTTPException(status_code=429, detail=detail) from exc
        if "groq quota or rate limit exceeded" in lower_detail:
            raise HTTPException(status_code=429, detail=detail) from exc
        if "Invalid OPENAI_API_KEY" in detail or "Missing OPENAI_API_KEY" in detail:
            raise HTTPException(status_code=401, detail=detail) from exc
        if "invalid groq_api_key" in lower_detail or "missing groq_api_key" in lower_detail:
            raise HTTPException(status_code=401, detail=detail) from exc
        raise HTTPException(status_code=503, detail=detail) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Chat failed unexpectedly: {exc}"
        ) from exc
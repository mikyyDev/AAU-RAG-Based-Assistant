# AAU RAG-Based Assistant

> **AI &amp; RAG Workshop – Addis Ababa University**  
> A Retrieval-Augmented Generation (RAG) assistant that answers questions about AAU using uploaded documents.

---

## Project Overview

This project consists of two parts:

| Part | Tech | Directory |
|------|------|-----------|
| Backend | FastAPI + LangChain + ChromaDB | `backend/` |
| Frontend | Next.js 14 + Tailwind CSS | `frontend/` |

The assistant:
- Ingests **PDF, TXT, DOCX, and Markdown** documents
- Splits text into chunks and stores embeddings in **ChromaDB**
- Retrieves the most relevant chunks for any user query
- Generates answers using **OpenAI GPT** grounded in the retrieved content
- Returns **source references** (document name + page number + snippet)
- Supports **conversation memory** (follow-up questions)

---

## Prerequisites

- **Python 3.10+** (for the backend)
- **Node.js 18+** (for the frontend)
- An **OpenAI API key** (get one at [platform.openai.com](https://platform.openai.com))

---

## Quick Start

### 1. Clone the repository

```bash
git clone <repo-url>
cd AAU-RAG-Based-Assistant
```

### 2. Set up the Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate          # Linux/Mac
# .venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and set your OPENAI_API_KEY
```

**Start the backend:**

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

### 3. Set up the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (optional – defaults to localhost:8000)
cp .env.local.example .env.local

# Start the development server
npm run dev
```

The UI will be available at `http://localhost:3000`.

---

## Folder Structure

```
AAU-RAG-Based-Assistant/
│
├── backend/
│   ├── app.py               # FastAPI application & API routes
│   ├── rag_pipeline.py      # RAG logic (ingest, embed, retrieve, answer)
│   ├── config.py            # Settings loaded from .env
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Sample environment file
│   └── docs/                # Place your AAU documents here
│       ├── student_handbook.pdf
│       ├── course_guides.pdf
│       └── ...
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Main chat page
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── ChatMessage.tsx  # Individual message bubble
│   │   ├── DocumentPanel.tsx# Sidebar for document management
│   │   └── TypingIndicator.tsx
│   ├── lib/
│   │   └── api.ts           # API client for the FastAPI backend
│   ├── types/
│   │   └── index.ts         # Shared TypeScript types
│   └── .env.local.example   # Frontend environment variables
│
└── README.md
```

---

## Uploading Documents

### Option A – Place files in `backend/docs/`

The backend automatically indexes all files in `backend/docs/` on startup.

```bash
cp my_document.pdf backend/docs/
# Restart the backend to re-index
```

### Option B – Upload via the UI

Use the **Document Panel** (left sidebar in the chat interface) to upload files.  
Drag and drop or click to select PDF, TXT, DOCX, or Markdown files.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Backend health & pipeline status |
| `POST` | `/chat` | Send a question, receive answer + sources |
| `POST` | `/upload` | Upload documents for indexing |
| `GET` | `/documents` | List indexed documents |
| `DELETE` | `/documents/{filename}` | Remove a document |
| `POST` | `/reset` | Clear the entire vector store |

Full interactive docs available at `http://localhost:8000/docs`.

---

## Environment Variables

### Backend (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | *(required)* | Your OpenAI API key |
| `OPENAI_CHAT_MODEL` | `gpt-4o-mini` | LLM model for answering |
| `OPENAI_EMBEDDING_MODEL` | `text-embedding-3-small` | Embedding model |
| `CHROMA_DB_PATH` | `./chroma_db` | ChromaDB persistence path |
| `DOCS_PATH` | `./docs` | Documents folder |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed frontend origins |

### Frontend (`.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | FastAPI backend URL |

---

## Evaluation Criteria

| Criteria | Weight |
|----------|--------|
| Document ingestion & chunking | 30% |
| RAG QA accuracy & grounding | 30% |
| Chat interface & usability | 20% |
| Prompt engineering & answer quality | 20% |

### Bonus Features Implemented

- ✅ **Source references** – each answer shows which document + page it came from
- ✅ **Conversation memory** – follow-up questions use chat history
- ✅ **Multi-file retrieval** – indexes and queries across multiple documents simultaneously
- ✅ **Document management** – upload and delete documents through the UI

---

## Technology Stack

### Backend
- **FastAPI** – REST API framework
- **LangChain** – RAG orchestration
- **ChromaDB** – Vector database (local persistence)
- **OpenAI** – LLM (GPT) and text embeddings
- **PyPDF** – PDF parsing

### Frontend
- **Next.js 14** – React framework (App Router)
- **Tailwind CSS** – Utility-first styling
- **Lucide React** – Icons
- **React Markdown** – Markdown rendering in chat

---

## Screenshots

The frontend features a **ChatGPT-style interface** with:

- 💬 Dark-themed chat bubbles (user on the right, assistant on the left)
- 📄 Collapsible source references under each assistant reply
- 📁 Left sidebar for document management (upload, list, delete)
- 🟢 Backend connection status indicator
- 💡 Suggested starter questions on an empty chat
- 🔄 Conversation reset button

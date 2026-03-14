"""
RAG Pipeline – document ingestion, embedding, retrieval, and answer generation.
"""

from __future__ import annotations

from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List, Optional

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    UnstructuredMarkdownLoader,
    Docx2txtLoader,
)
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.chains import create_retrieval_chain, create_history_aware_retriever


# ──────────────────────────────────────────────
# Prompt templates
# ──────────────────────────────────────────────

CONTEXTUALIZE_SYSTEM_PROMPT = """Given a chat history and the latest user question \
which might reference context in the chat history, formulate a standalone question \
which can be understood without the chat history. Do NOT answer the question, \
just reformulate it if needed and otherwise return it as is."""

QA_SYSTEM_PROMPT = """You are a helpful assistant for Addis Ababa University (AAU). \
Use the following retrieved context from AAU documents to answer the question. \
If you don't know the answer or the context doesn't contain enough information, \
say so honestly — do not make up information. \
Always be concise and helpful.

Retrieved context:
{context}"""


class RAGPipeline:
    """Encapsulates the full RAG workflow."""

    COLLECTION_NAME = "aau_documents"
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200
    TOP_K = 5

    def __init__(
        self,
        docs_path: str,
        chroma_db_path: str,
        openai_api_key: str,
        chat_model: str = "gpt-4o-mini",
        embedding_model: str = "text-embedding-3-small",
    ):
        self.docs_path = Path(docs_path)
        self.chroma_db_path = chroma_db_path
        self.openai_api_key = openai_api_key
        self.chat_model_name = chat_model
        self.embedding_model_name = embedding_model

        self._vector_store: Optional[Chroma] = None
        self._retrieval_chain = None

        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.CHUNK_SIZE,
            chunk_overlap=self.CHUNK_OVERLAP,
            length_function=len,
        )

        self._init_vector_store()

    # ──────────────────────────────────────────
    # Initialisation helpers
    # ──────────────────────────────────────────

    def _get_embeddings(self):
        return OpenAIEmbeddings(
            model=self.embedding_model_name,
            openai_api_key=self.openai_api_key,
        )

    def _init_vector_store(self):
        """Load or create the Chroma vector store."""
        self._vector_store = Chroma(
            collection_name=self.COLLECTION_NAME,
            embedding_function=self._get_embeddings(),
            persist_directory=self.chroma_db_path,
        )

    def _build_chain(self):
        """Build the retrieval-augmented generation chain."""
        llm = ChatOpenAI(
            model=self.chat_model_name,
            openai_api_key=self.openai_api_key,
            temperature=0.2,
        )

        retriever = self._vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": self.TOP_K},
        )

        # History-aware retriever: rephrases follow-up questions
        contextualize_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", CONTEXTUALIZE_SYSTEM_PROMPT),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
            ]
        )
        history_aware_retriever = create_history_aware_retriever(
            llm, retriever, contextualize_prompt
        )

        # QA chain
        qa_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", QA_SYSTEM_PROMPT),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
            ]
        )
        question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)

        self._retrieval_chain = create_retrieval_chain(
            history_aware_retriever, question_answer_chain
        )

    # ──────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────

    def is_ready(self) -> bool:
        """Return True if the vector store has at least one document."""
        if self._vector_store is None:
            return False
        try:
            count = self._vector_store._collection.count()
            return count > 0
        except Exception:
            return False

    def ingest_directory(self) -> int:
        """Ingest all supported documents in docs_path."""
        if not self.docs_path.exists():
            return 0
        files = [
            str(p)
            for p in self.docs_path.iterdir()
            if p.suffix.lower() in {".pdf", ".txt", ".docx", ".md"}
        ]
        return self.ingest_files(files) if files else 0

    def ingest_files(self, file_paths: List[str]) -> int:
        """Load, chunk, embed, and store a list of file paths. Returns total new chunks."""
        if not file_paths:
            return 0

        all_docs: List[Document] = []
        for path_str in file_paths:
            path = Path(path_str)
            if not path.exists():
                continue
            docs = self._load_file(path)
            all_docs.extend(docs)

        if not all_docs:
            return 0

        chunks = self._splitter.split_documents(all_docs)

        # Add chunk index metadata so sources are traceable
        for i, chunk in enumerate(chunks):
            chunk.metadata["chunk_index"] = i

        self._vector_store.add_documents(chunks)

        # Rebuild chain now that we have data
        self._build_chain()

        return len(chunks)

    def query(
        self,
        question: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        """Run a RAG query and return answer + source references."""
        if self._retrieval_chain is None:
            self._build_chain()

        chat_history = []
        for msg in (conversation_history or []):
            if msg["role"] == "user":
                chat_history.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                chat_history.append(AIMessage(content=msg["content"]))

        result = self._retrieval_chain.invoke(
            {"input": question, "chat_history": chat_history}
        )

        sources = self._extract_sources(result.get("context", []))

        return {"answer": result["answer"], "sources": sources}

    def list_documents(self) -> Dict[str, Any]:
        """Return metadata about indexed documents."""
        try:
            collection = self._vector_store._collection
            results = collection.get(include=["metadatas"])
            metadatas = results.get("metadatas") or []
        except Exception:
            return {"documents": [], "total_chunks": 0}

        counts: Dict[str, int] = defaultdict(int)
        for meta in metadatas:
            source = meta.get("source", "unknown") if meta else "unknown"
            counts[Path(source).name] += 1

        return {
            "documents": [{"filename": k, "chunks": v} for k, v in counts.items()],
            "total_chunks": sum(counts.values()),
        }

    def delete_document(self, filename: str) -> bool:
        """Delete all chunks belonging to a specific document."""
        try:
            collection = self._vector_store._collection
            results = collection.get(include=["metadatas"])
            ids = results.get("ids") or []
            metadatas = results.get("metadatas") or []

            to_delete = [
                id_
                for id_, meta in zip(ids, metadatas)
                if meta and Path(meta.get("source", "")).name == filename
            ]
            if not to_delete:
                return False

            collection.delete(ids=to_delete)
            return True
        except Exception:
            return False

    def reset(self):
        """Delete all documents from the vector store."""
        try:
            self._vector_store._collection.delete(
                where={"chunk_index": {"$gte": 0}}
            )
        except Exception:
            # If that fails, try a broader reset
            try:
                all_ids = self._vector_store._collection.get()["ids"]
                if all_ids:
                    self._vector_store._collection.delete(ids=all_ids)
            except Exception:
                pass
        self._retrieval_chain = None

    # ──────────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────────

    def _load_file(self, path: Path) -> List[Document]:
        """Load a single file into LangChain Documents."""
        suffix = path.suffix.lower()
        try:
            if suffix == ".pdf":
                loader = PyPDFLoader(str(path))
            elif suffix == ".txt":
                loader = TextLoader(str(path), encoding="utf-8")
            elif suffix == ".docx":
                loader = Docx2txtLoader(str(path))
            elif suffix == ".md":
                loader = UnstructuredMarkdownLoader(str(path))
            else:
                return []
            return loader.load()
        except Exception as e:
            print(f"[RAGPipeline] Could not load {path}: {e}")
            return []

    def _extract_sources(self, context_docs: List[Document]) -> List[Dict[str, Any]]:
        """Deduplicate and format source references from retrieved documents."""
        seen: set = set()
        sources = []
        for doc in context_docs:
            meta = doc.metadata or {}
            source = meta.get("source", "unknown")
            page = meta.get("page")
            key = (source, page)
            if key in seen:
                continue
            seen.add(key)
            sources.append(
                {
                    "source": Path(source).name,
                    "page": page,
                    "snippet": doc.page_content[:300].strip(),
                }
            )
        return sources

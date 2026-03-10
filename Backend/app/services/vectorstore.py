import chromadb
from sentence_transformers import SentenceTransformer
from app.config import CHROMA_DIR

client = chromadb.PersistentClient(path=CHROMA_DIR)
collection = client.get_or_create_collection(name="aau_docs")

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

def add_chunks(chunks_with_meta):
    documents = []
    metadatas = []
    ids = []

    for item in chunks_with_meta:
        documents.append(item["text"])
        metadatas.append({
            "file_name": item["file_name"],
            "page": item["page"] if item["page"] is not None else -1,
            "chunk_id": item["chunk_id"]
        })
        ids.append(item["chunk_id"])

    embeddings = embedding_model.encode(documents).tolist()

    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids,
        embeddings=embeddings
    )

def search_chunks(query: str, top_k: int = 4):
    query_embedding = embedding_model.encode([query]).tolist()[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    items = []
    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    ids = results.get("ids", [[]])[0]

    for doc, meta, chunk_id in zip(docs, metas, ids):
        items.append({
            "text": doc,
            "file_name": meta.get("file_name", "unknown"),
            "page": None if meta.get("page", -1) == -1 else meta.get("page"),
            "chunk_id": chunk_id
        })

    return items
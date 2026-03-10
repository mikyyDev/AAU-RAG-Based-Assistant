from app.services.vectorstore import search_chunks
from app.services.llm import generate_answer

def answer_question(question: str):
    retrieved = search_chunks(question, top_k=4)

    context_parts = []
    for item in retrieved:
        src = f"{item['file_name']}"
        if item["page"]:
            src += f" (page {item['page']})"
        context_parts.append(f"[Source: {src}]\n{item['text']}")
        context_parts.append(
    f"[Source: {item['file_name']} page {item['page']}]\n{item['text']}"
)

    context = "\n\n".join(context_parts)
    answer = generate_answer(question, context)

    return {
        "answer": answer,
        "sources": retrieved
    }
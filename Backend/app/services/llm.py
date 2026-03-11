from groq import Groq
from app.config import GROQ_API_KEY, MODEL_NAME

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

SYSTEM_PROMPT = """
You are an AAU document assistant.

Answer ONLY using the provided context from Addis Ababa University documents.

If the answer is not present in the context, say:
"I could not find that information in the uploaded AAU documents."

Always cite the source file names when possible.
Be clear and concise.
"""

def generate_answer(question: str, context: str):
    if client is None:
        raise RuntimeError(
            "Missing GROQ_API_KEY. Add it to Backend/.env or Backend/app/.env and restart the backend."
        )

    prompt = f"""
Question:
{question}

Context:
{context}

Answer:
"""

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        return response.choices[0].message.content
    except Exception as exc:
        detail = str(exc)
        lower_detail = detail.lower()

        if "model_decommissioned" in lower_detail or "decommissioned" in lower_detail:
            raise RuntimeError(
                "Configured MODEL_NAME is decommissioned. Update MODEL_NAME in Backend/.env or Backend/app/.env."
            ) from exc
        if "authentication" in lower_detail or "api key" in lower_detail or "error code: 401" in lower_detail:
            raise RuntimeError(
                "Invalid GROQ_API_KEY. Update your key in Backend/.env or Backend/app/.env and restart the backend."
            ) from exc
        if "error code: 429" in lower_detail or "rate limit" in lower_detail or "insufficient_quota" in lower_detail:
            raise RuntimeError("Groq quota or rate limit exceeded.") from exc

        raise RuntimeError(f"Groq request failed: {detail}") from exc
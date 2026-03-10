from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are an AAU document assistant.

Answer ONLY using the provided context from Addis Ababa University documents.

If the answer is not present in the context, say:
"I could not find that information in the uploaded AAU documents."

Always cite the source file names when possible.
Be clear and concise.
"""

def generate_answer(question: str, context: str):

    prompt = f"""
Question:
{question}

Context:
{context}

Answer:
"""

    response = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )

    return response.choices[0].message.content
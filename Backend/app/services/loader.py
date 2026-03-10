import os
from pypdf import PdfReader

def load_pdf(file_path: str):
    pages = []
    reader = PdfReader(file_path)

    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        text = text.strip()
        if text:
            pages.append({
                "page": i + 1,
                "text": text
            })
    return pages

def load_txt(file_path: str):
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        text = f.read().strip()
    return [{"page": None, "text": text}] if text else []

def load_document(file_path: str):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return load_pdf(file_path)
    elif ext == ".txt":
        return load_txt(file_path)
    else:
        raise ValueError("Unsupported file type")
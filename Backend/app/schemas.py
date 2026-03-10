from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    question: str

class SourceItem(BaseModel):
    file_name: str
    page: Optional[int] = None
    chunk_id: str
    text: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceItem]
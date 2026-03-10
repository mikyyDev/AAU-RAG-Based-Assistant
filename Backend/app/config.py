import os
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)

# Load project-level env first, then app-level env to allow local overrides.
load_dotenv(os.path.join(PROJECT_DIR, ".env"))
load_dotenv(os.path.join(BASE_DIR, ".env"), override=True)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
MODEL_NAME = os.getenv("MODEL_NAME", "gpt-4o-mini")

DATA_DIR = os.path.join(BASE_DIR, "data")
DOCS_DIR = os.path.join(DATA_DIR, "docs")
CHROMA_DIR = os.path.join(DATA_DIR, "chroma_db")

os.makedirs(DOCS_DIR, exist_ok=True)
os.makedirs(CHROMA_DIR, exist_ok=True)
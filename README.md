📚 AAU RAG-Based Assistant
<div align="center">
https://img.shields.io/badge/Python-3.9+-blue.svg
https://img.shields.io/badge/FastAPI-0.104+-green.svg
https://img.shields.io/badge/RAG-Retrieval%2520Augmented%2520Generation-orange
https://img.shields.io/badge/License-MIT-yellow.svg

An intelligent document assistant for Addis Ababa University that answers questions from academic documents using Retrieval-Augmented Generation (RAG).

Features • Tech Stack • Installation • API Documentation • Contributing

</div>
🎯 Overview
The AAU RAG-Based Assistant transforms how students, faculty, and staff interact with academic documents. Instead of manually searching through PDFs and text files, users can simply ask questions in natural language and receive accurate, context-aware answers grounded in the uploaded documents.

This system combines the power of vector search with large language models to create a semantic understanding of document content, ensuring responses are both relevant and verifiable through source attribution.

✨ Features
📄 Intelligent Document Processing
Multi-format Support: Upload and process .pdf and .txt files seamlessly

Automatic Text Extraction: Advanced parsing for accurate content extraction

Smart Chunking: Documents are intelligently segmented for optimal retrieval

🧠 AI-Powered Question Answering
Natural Language Queries: Ask questions conversationally, just like talking to a human assistant

Context-Aware Responses: Answers are generated using relevant document sections

RAG Architecture: Combines retrieval precision with generative AI fluency

🔍 Advanced Search Capabilities
Semantic Search: Uses embeddings to find conceptually relevant content, not just keywords

Vector Database: Efficient similarity search with ChromaDB

Real-time Processing: Documents are indexed immediately upon upload

📊 Source Transparency
Document Attribution: Every answer shows which documents and pages were used

Verifiable Responses: Users can trace back to original sources for validation

Confidence Scoring: System indicates when answers may be uncertain

⚡ High-Performance Backend
FastAPI Framework: Asynchronous request handling for optimal performance

RESTful API: Clean, intuitive endpoints for frontend integration

CORS Enabled: Ready for cross-origin requests from any frontend application

🏗️ Architecture
The system implements a sophisticated Retrieval-Augmented Generation pipeline:












How It Works:
Document Ingestion: Uploaded files are parsed, chunked, and converted to embeddings

Query Processing: User questions are embedded and matched against document chunks

Context Assembly: Most relevant chunks are compiled as context

Answer Generation: Grok AI generates answers strictly based on provided context

Response Delivery: Answers are returned with source attribution

🛠️ Tech Stack
Backend & API
Technology	Purpose
FastAPI	High-performance web framework with automatic OpenAPI docs
Uvicorn	Lightning-fast ASGI server
Python 3.9+	Core programming language
AI & Machine Learning
Technology	Purpose
Sentence Transformers	State-of-the-art text embeddings (all-MiniLM-L6-v2)
ChromaDB	Vector database for similarity search
Grok (xAI API)	Language model for answer generation
NumPy	Numerical operations for vector processing
Document Processing
Technology	Purpose
PyPDF2	PDF text extraction
python-dotenv	Environment configuration
📁 Project Structure
text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py             # Environment and model configuration
│   ├── schemas.py            # Pydantic models for request/response
│   │
│   └── services/
│       ├── __init__.py
│       ├── loader.py         # Document loading and parsing
│       ├── chunker.py        # Text chunking strategies
│       ├── vectorstore.py    # ChromaDB integration
│       └── rag.py            # Core RAG logic
│
├── docs/                     # Uploaded document storage
├── .env                      # Environment variables (API keys)
├── requirements.txt          # Python dependencies
└── README.md                 # Project documentation
🚀 Getting Started
Prerequisites
Python 3.9 or higher

Git

xAI API key (for Grok access)

Installation Steps
1️⃣ Clone the Repository
bash
git clone https://github.com/yourusername/aau-rag-assistant.git
cd aau-rag-assistant/backend
2️⃣ Set Up Virtual Environment
bash
# Create virtual environment
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on macOS/Linux
source venv/bin/activate
3️⃣ Install Dependencies
bash
pip install --upgrade pip
pip install -r requirements.txt
4️⃣ Configure Environment Variables
Create a .env file in the backend directory:

env
# xAI API Configuration
XAI_API_KEY=your_grok_api_key_here
XAI_BASE_URL=https://api.x.ai/v1
MODEL_NAME=grok-beta

# Optional: Adjust chunk size for document processing
CHUNK_SIZE=500
CHUNK_OVERLAP=50
5️⃣ Launch the Application
bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
The server will start at http://localhost:8000

📘 API Reference
Interactive Documentation
Once the server is running, access:

Swagger UI: http://localhost:8000/docs

ReDoc: http://localhost:8000/redoc

Endpoints
Health Check
http
GET /
Returns server status and configuration.

Upload Documents
http
POST /upload
Upload PDF or TXT files for processing.

Request: multipart/form-data with file field

Response: Document ID and processing status

Ask Questions
http
POST /chat
Query uploaded documents.

Request Body:

json
{
  "question": "What programs are offered by the College of Natural and Computational Sciences?"
}
Response:

json
{
  "answer": "The College offers programs in Computer Science, Mathematics, Physics, Biology, and Chemistry.",
  "sources": [
    {
      "document": "CNCS_Handbook_2024.pdf",
      "page": 12
    }
  ]
}
💡 Usage Examples
Uploading a Document
python
import requests

url = "http://localhost:8000/upload"
files = {"file": open("aau_academic_catalog.pdf", "rb")}
response = requests.post(url, files=files)
print(response.json())
Asking a Question
python
import requests

url = "http://localhost:8000/chat"
payload = {"question": "What is the admission requirement for graduate programs?"}
response = requests.post(url, json=payload)
print(response.json()["answer"])
🛡️ Error Handling
The system gracefully handles various edge cases:

Scenario	Response
Unsupported file format	{"error": "File type not supported. Please upload PDF or TXT."}
Empty document	{"error": "Document contains no extractable text."}
Question out of scope	{"answer": "I could not find that information in the uploaded AAU documents."}
No documents uploaded	{"answer": "Please upload documents first before asking questions."}
🧪 Testing
Run the test suite:

bash
pytest tests/ -v
🔮 Roadmap
Phase 1 (Current)
✅ PDF and TXT file support

✅ Basic RAG implementation

✅ Source attribution

✅ FastAPI backend

Phase 2 (Q2 2024)
🔲 React/Next.js frontend

🔲 Multi-document simultaneous search

🔲 Document management dashboard

🔲 Batch upload support

Phase 3 (Q3 2024)
🔲 User authentication

🔲 Document versioning

🔲 Advanced analytics dashboard

🔲 Streaming responses

🔲 Mobile-responsive interface

👥 Contributing
We welcome contributions from the AAU community and beyond!

How to Contribute
Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

Contribution Guidelines
Write clear, documented code

Add tests for new features

Update documentation as needed

Follow PEP 8 style guidelines

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

👨‍💻 Author
Michael Alula

🎓 Computer Science Student at Addis Ababa University

💼 LinkedIn: Michael Alula

🐦 Twitter: @michaelalula

📧 Email: michael.alula@aau.edu.et

🙏 Acknowledgments
Addis Ababa University for inspiring this project

xAI for providing the Grok API

FastAPI team for the excellent framework

All contributors and testers from the AAU community

📊 Project Status
https://img.shields.io/github/stars/yourusername/aau-rag-assistant?style=social
https://img.shields.io/github/forks/yourusername/aau-rag-assistant?style=social
https://img.shields.io/github/issues/yourusername/aau-rag-assistant

<div align="center">
Made with ❤️ by an AAU Computer Science Student

If you found this project helpful, please ⭐ star the repository!

Report Bug • Request Feature

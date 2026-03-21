# ⚡ RAG AI Chatbot 
A fully-featured, production-ready Retrieval-Augmented Generation (RAG) Artificial Intelligence Assistant. 
Built using a modern MERN Stack + Xenova Local Embeddings + Groq Llama 3 LLM.

## ✨ Key Features
- **Premium Interface:** A completely overhauled React + Tailwind CSS UI utilizing Deep Dark Gradient Maps and Reactive Glassmorphism. Features drag & drop animations, custom chat bubbles, and native Markdown syntax parsing.
- **Flawless Mathematical Parsing:** Features a dynamically scaling "Sliding Window" word-cluster algorithm during Document Chunking (chunk size 80 overlap 25). Operates completely regardless of specific string punctuation missing from uploaded PDFs or raw formatting flaws.
- **Strict Anti-Hallucination Matrix:** Prompt engineered natively around Llama-3 parameter constraints. The LLM strictly refuses queries that lack mathematical document context, permanently preventing generic hallucinations.
- **Fully Offline Local Embeddings:** Utilizes the lightweight local `@xenova/transformers` (`all-MiniLM-L6-v2`) algorithm directly inside Node.js to mechanically generate multi-dimensional arrays, completely eliminating external embedding API costs.
- **High-Speed NLP Output:** Queries the retrieved Top-K mathematically relevant contexts dynamically via the incredibly fast Groq SDK (`llama-3.1-8b-instant`).
- **Session Segregation:** Automatically sandboxes MongoDB retrieval queries to specific algorithmic `sessionId` assignments. Uploading a new document creates a fresh cryptographic session, perfectly isolating chat context and preventing "overlap" across unrelated documents.

## 🛠️ Stack Architecture
- **Frontend**: ReactJS, Tailwind CSS (Glassmorphism design), React-Markdown, Axios
- **Backend**: Node.js, Express, Multer, `pdf-parse`
- **Database**: MongoDB (Mongoose Schema mapping vectors natively)
- **AI Processing**: `@xenova/transformers` (Local Vectoring), Groq Cloud Array (LLM Inference), Custom Math Cosine Similarity engine

## 📁 Repository Structure
\`\`\`bash
├── client/          # Frontend React Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBox.jsx     # Master LLM Dialog Container
│   │   │   ├── Message.jsx     # Markdown Context Visualizer
│   │   │   └── UploadBox.jsx   # Drag & Drop File Parser
│   │   └── App.jsx
│   ├── tailwind.config.js       
│   └── package.json
├── server/          # Node.js + Express + MongoDB Backend
│   ├── controllers/
│   │   └── ragController.js    # Core RAG Vector Math, Embeddings, & Chat Engines
│   ├── models/
│   │   └── Document.js         # Mongoose Collection schema for Session Chunks
│   ├── routes/
│   └── package.json
└── .gitignore
\`\`\`

## 🚀 Getting Started

### 1. Database Variables
In the `server/` directory, create a `.env` file referencing your endpoints:
\`\`\`env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster...
GROQ_API_KEY=gsk_...
\`\`\`

*(Note: Never push your live `.env` to GitHub. It is safely appended to `.gitignore` natively).*

### 2. Frontend Launch
\`\`\`bash
cd client
npm install
npm run dev
\`\`\`

### 3. Backend Launch
\`\`\`bash
cd server
npm install
npm run dev
\`\`\`

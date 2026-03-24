# 🤖 RAG AI Chatbot

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A production-ready Retrieval-Augmented Generation (RAG) Artificial Intelligence Assistant. Engineered with a modern MERN Stack, lightweight local vector embeddings, and ultra-low latency Llama-3 inference.

---

## ✨ Features

*   **Intelligent Document Context:** Processes unstructured PDF documents using a sliding-window chunking algorithm to preserve semantic context across complex text boundaries.
*   **Zero-Cost Local Embeddings:** Leverages `@xenova/transformers` (`all-MiniLM-L6-v2`) natively within the Node.js environment to generate vector arrays locally, eliminating reliance on paid embedding APIs.
*   **High-Performance Inference:** Integrated with the Groq SDK (`llama-3.1-8b-instant`) for instantaneous, mathematically grounded NLP responses.
*   **Anti-Hallucination Architecture:** Enforces strict boundary conditions via prompt engineering. The LLM is restricted exclusively to the provided vector context.
*   **Cryptographic Session Segregation:** Isolates document vector queries into unique MongoDB session assignments, securely preventing cross-document context contamination.
*   **Modern UI/UX:** A responsive React + Tailwind CSS frontend featuring dark mode mapping, glassmorphism, drag-and-drop file parsing, and dynamic Markdown rendering.

---

## 🛠️ Architecture

### Frontend (Client)
*   **Core:** React 18, Vite
*   **Styling:** Tailwind CSS, PostCSS, Glassmorphism UI
*   **Components:** Lucide React (Iconography), React Markdown (Response Parsing)
*   **Networking:** Axios

### Backend (Server)
*   **Core:** Node.js, Express.js
*   **Storage:** MongoDB, Mongoose (Native Vector Mapping)
*   **Processing:** `@xenova/transformers` (Local Embeddings), `pdf-parse` (Text Extraction), Multer (Multipart Data)
*   **LLM Integration:** Groq SDK

---

## 📁 Repository Structure

```tree
RAG-BOT
├── client/                      # React Frontend Environment
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBox.jsx      # LLM Dialog Interface
│   │   │   ├── Message.jsx      # Markdown Response Renderer
│   │   │   └── UploadBox.jsx    # Drag-and-Drop Parser
│   │   ├── App.jsx              # Application Root
│   │   └── main.jsx             # DOM Entry Point
│   ├── postcss.config.js
│   └── tailwind.config.js       # UI Design System
└── server/                      # Node.js Backend Environment
    ├── controllers/
    │   └── ragController.js     # Vectorization & API Logic
    ├── models/
    │   └── Document.js          # MongoDB Schema definitions
    ├── routes/
    │   └── ragRoutes.js         # API Route handling
    └── server.js                # Express Application Configuration
```

---

## 🚀 Quick Start

### 1. Environment Configuration

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<auth-cluster-url>
GROQ_API_KEY=gsk_your_api_key
```

### 2. Initialization

**Server:**
```bash
cd server
npm install
npm run dev
```

**Client:**
```bash
cd client
npm install
npm run dev
```


---

## 🔌 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/upload-file` | `POST` | Parses `.pdf` files, executes chunking/embeddings, and commits to MongoDB. |
| `/api/add-doc` | `POST` | Ingests structural text directly for chunking and vectorization. |
| `/api/docs` | `GET` | Fetches active vectorized document contexts parameters. |
| `/api/ask` | `POST` | Calculates cosine similarity against isolated vectors and streams the LLM completion. |

---

## 📄 License

Distributed under the MIT License.

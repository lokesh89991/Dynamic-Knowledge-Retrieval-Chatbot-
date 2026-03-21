import fs from 'fs';
import { createRequire } from 'module';
import dotenv from 'dotenv';
dotenv.config();
import { pipeline } from '@xenova/transformers';
import Groq from 'groq-sdk';
import Document from '../models/Document.js';

const require = createRequire(import.meta.url);
const _pdfParse = require('pdf-parse');
const pdfParse = typeof _pdfParse === 'function' ? _pdfParse : (_pdfParse.default || _pdfParse.PDFParse);

if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY in environment variables");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Global pipeline singleton
let extractor = null;
async function getExtractor() {
    if (!extractor) {
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return extractor;
}

// Dynamic Overlapping Word-Based Chunking (Best for Resumes / Multicolumn PDFs without punctuation)
async function processAndStore(content, sessionId) {
    const fn = await getExtractor();
    
    // Dynamic Overlapping Word-Based Chunking (Best for Resumes / Multicolumn PDFs without punctuation)
    const normalizedText = content.replace(/\s+/g, " ").trim();
    const words = normalizedText.split(" ");
    
    const WORDS_SIZE = 80;    // Size of the chunk cluster (~400 characters)
    const WORDS_OVERLAP = 25; // How much it slides backwards to preserve broken sentences
    
    let inserted = 0;
    
    for (let i = 0; i < words.length; i += (WORDS_SIZE - WORDS_OVERLAP)) {
        const chunkStr = words.slice(i, i + WORDS_SIZE).join(" ");
        if (chunkStr.length < 20) continue;
        
        const existingDoc = await Document.findOne({ content: chunkStr, sessionId });
        if (existingDoc) continue;
        
        const output = await fn(chunkStr, { pooling: 'mean', normalize: true });
        const embedding = Array.from(output.data);
        
        await new Document({ content: chunkStr, embedding, sessionId, createdAt: new Date() }).save();
        inserted++;
    }
    return inserted;
}

export const addDocument = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ error: "Content is required" });
        
        const count = await processAndStore(content);
        if (count === 0) return res.status(200).json({ message: "Document already exists" });
        
        return res.status(201).json({ message: "Document saved successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error while saving document: " + error.message });
    }
};

export const getDocuments = async (req, res) => {
    try {
        const docs = await Document.find({}).sort({ createdAt: -1 });
        return res.status(200).json(docs);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error while fetching documents" });
    }
};

function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function generateAnswer(question, topChunks) {
    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            {
                role: "system",
                content: `
You are a highly precise document extraction assistant.

Your job is to:
- Read the Context chunks provided and answer the user's question.
- Extract the FULL details regarding the topic asked. Do not summarize or omit anything.
- Return the EXACT, comprehensive facts present in the text.
- If the user's question is completely unrelated to the Context, or if the specific answer cannot be found in the Context, you MUST abort. Output exactly and only: "I'm sorry, I could not find relevant information regarding this in the uploaded document."
- Under absolutely NO circumstances should you invent an answer, hallucinate data, or engage in general conversation.
                `.trim()
            },
            {
                role: "user",
                content: `
Context:
${topChunks.join("\n")}

Question:
${question}

Instructions:
- If the context contains the answer, give me the COMPLETE and EXACT details about the topic asked.
- If the context does NOT contain the answer, output exactly: "I'm sorry, I could not find relevant information regarding this in the uploaded document."
- Format valid data properly using Markdown so it looks beautiful. Do not use Markdown if returning the error string.
Answer:
                `.trim()
            }
        ]
    });
    return response.choices[0].message.content;
}

export const askQuestion = async (req, res) => {
    try {
        const { question, sessionId = 'default' } = req.body;
        if (!question) return res.status(400).json({ error: "Question is required" });

        const fn = await getExtractor();
        const output = await fn(question, { pooling: 'mean', normalize: true });
        const qEmbedding = Array.from(output.data);

        const documents = await Document.find({ sessionId });
        if (documents.length === 0) {
            return res.status(200).json({ answer: "I don't have any documents uploaded to this specific chat. Please upload some files to this session." });
        }

        const validDocs = documents.filter(doc => doc.embedding && doc.embedding.length === qEmbedding.length);
        
        if (validDocs.length === 0) {
            console.error("Embedding dimension mismatch or empty docs.");
            return res.status(200).json({ answer: "I don't have enough correctly embedded vector information to answer that. Please re-upload your documents." });
        }

        let scoredChunks = validDocs.map(doc => ({
            content: doc.content,
            score: cosineSimilarity(qEmbedding, doc.embedding)
        }));

        scoredChunks.sort((a, b) => b.score - a.score);
        
        const topChunksObj = scoredChunks.slice(0, 6);
        console.log("Top Scores:", topChunksObj.map(c => c.score)); // Add exact logging
        
        const topChunks = topChunksObj.map(c => c.content);

        if (!topChunks || topChunks.length === 0) {
            return res.status(200).json({ answer: "Sorry, I could not find relevant information in the document." });
        }

        let finalAnswer;
        try {
            finalAnswer = await generateAnswer(question, topChunks);
        } catch (groqErr) {
            console.error("Groq generation failed, falling back:", groqErr);
            finalAnswer = `Based on the document:\n\n${topChunks.join("\n\n")}`;
        }
        
        return res.status(200).json({ answer: finalAnswer, sources: topChunks });
    } catch (error) {
        console.error("Ask question error:", error);
        return res.status(500).json({ error: "Server error while answering question: " + error.message });
    }
};

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const file = req.file;
        const sessionId = req.body.sessionId || 'default';
        let content = "";
        
        if (file.mimetype === "text/plain") {
            content = fs.readFileSync(file.path, "utf-8");
        } else if (file.mimetype === "application/pdf") {
            const buffer = fs.readFileSync(file.path);
            let data;
            try {
                data = await pdfParse(buffer);
            } catch (pdfErr) {
                if (pdfErr.message.includes("Class constructors cannot be invoked without 'new'")) {
                    data = await (new pdfParse(buffer));
                } else {
                    throw pdfErr;
                }
            }
            content = data.text;
        } else {
            fs.unlinkSync(file.path);
            return res.status(400).json({ error: "Unsupported file type. Only TXT or PDF allowed" });
        }

        if (!content || !content.trim()) {
            fs.unlinkSync(file.path);
            return res.status(400).json({ error: "File is empty or couldn't extract text" });
        }

        const count = await processAndStore(content, sessionId);
        fs.unlinkSync(file.path);

        if (count === 0) return res.status(200).json({ message: "Document already exists" });
        
        return res.status(201).json({ message: "File processed and embedded locally successfully!" });
    } catch (error) {
        console.error("Upload error:", error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(500).json({ error: "Server error: " + (error.stack || error.message || String(error)) });
    }
};

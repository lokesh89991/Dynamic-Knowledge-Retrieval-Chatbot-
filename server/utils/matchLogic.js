const STOP_WORDS = new Set(["i","me","my","myself","we","our","ours","ourselves","you","your","yours","yourself","yourselves","he","him","his","himself","she","her","hers","herself","it","its","itself","they","them","their","theirs","themselves","what","which","who","whom","this","that","these","these","those","am","is","are","was","were","be","been","being","have","has","had","having","do","does","did","doing","a","an","the","and","but","if","or","because","as","until","while","of","at","by","for","with","about","against","between","into","through","during","before","after","above","below","to","from","up","down","in","out","on","off","over","under","again","further","then","once","here","there","when","where","why","how","all","any","both","each","few","more","most","other","some","such","no","nor","not","only","own","same","so","than","too","very","s","t","can","will","just","don","should","now"]);

const CONCEPT_MAP = {
    "name": ["name", "who", "candidate", "person"],
    "skills": ["skills", "technologies", "stack", "languages", "tools", "frameworks", "expert"],
    "projects": ["projects", "portfolio", "application", "system", "built", "implemented"],
    "contact": ["contact", "email", "phone", "mobile", "github", "linkedin", "address", "reach"],
    "education": ["education", "college", "university", "degree", "school", "bachelor", "master", "gpa"]
};

const tokenize = (text) => {
    return text.toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(word => word.length > 0 && !STOP_WORDS.has(word));
};

export const getBestChunks = (documents, question, topK = 3) => {
    // 1. Document Chunking - SLIDING WINDOW APPROACH WITH POSITIONAL AWARENESS
    let allChunks = [];
    documents.forEach(doc => {
        let normalizedText = doc.content
            .replace(/([.!?])\s+/g, "$1\n")
            .replace(/\n{2,}/g, "\n");

        let lines = normalizedText.split('\n')
            .map(line => line.replace(/\s+/g, ' ').trim())
            .filter(line => line.length > 5);

        const windowSize = 3;
        const step = 3;
        
        for (let i = 0; i < lines.length; i += step) {
            const chunkLines = lines.slice(i, i + windowSize);
            const chunkStr = chunkLines.join('\n');
            if (chunkStr.length > 20) {
                allChunks.push({
                    text: chunkStr,
                    position: i // Record how early this chunk appears in the file
                });
            }
        }
    });

    if (allChunks.length === 0) return [];

    // 2. Text Preprocessing & Concept Expansion
    const questionLower = question.toLowerCase().trim();
    let questionTokens = tokenize(question);
    
    // Inject synonyms dynamically to give the algorithm broader context awareness
    questionTokens.forEach(token => {
        if (CONCEPT_MAP[token]) {
            questionTokens = questionTokens.concat(CONCEPT_MAP[token]);
        }
    });
    // Remove duplicates from expansion
    questionTokens = [...new Set(questionTokens)];

    if (questionTokens.length === 0) return [];

    // 3. Improved Scoring System
    let scoredChunks = allChunks.map(chunkObj => {
        let score = 0;
        const chunkLower = chunkObj.text.toLowerCase();
        const chunkTokens = tokenize(chunkObj.text);

        // Exact phrase context match
        if (chunkLower.includes(questionLower)) {
            score += 10;
        }

        let uniqueMatches = 0;

        questionTokens.forEach(qWord => {
            const count = chunkTokens.filter(w => w === qWord).length;
            if (count > 0) {
                uniqueMatches++;
                score += (2 * count);
            } else {
                if (chunkTokens.some(w => w.includes(qWord) || qWord.includes(w))) {
                    uniqueMatches += 0.5;
                    score += 1;
                }
            }
        });

        // Softer multiplier for unique mathces (since we artificially inject synonyms)
        if (uniqueMatches > 1) {
            score *= (1 + (uniqueMatches * 0.15)); // 15% bonus per unique match instead of 100%
        }

        if (chunkTokens.length > 0) {
            score = score / Math.max(1, Math.log10(chunkTokens.length + 1));
        }

        // --- POSITIONAL BIAS (The Anti-Hallucination for Names/Titles) ---
        // If the user asks for entity/metadata highly likely to be at the top of a document
        const askingForIdentity = questionLower.includes("name") || questionLower.includes("who") || questionLower.includes("contact");
        
        if (askingForIdentity) {
            if (chunkObj.position === 0) score += 15; // Massive boost for very first chunk
            else if (chunkObj.position <= 3) score += 5; // Minor boost for second chunk
        }

        return { chunk: chunkObj.text, score };
    });

    // 4. Ranking & Selection
    scoredChunks.sort((a, b) => b.score - a.score);

    // 5. Dynamic Thresholding
    const bestScore = scoredChunks[0]?.score || 0;
    if (bestScore <= 0.5) return [];

    return scoredChunks
        .filter(c => c.score >= bestScore * 0.4)
        .slice(0, topK)
        .map(c => c.chunk);
};

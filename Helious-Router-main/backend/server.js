const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = path.join(__dirname, 'data', 'conversations.json');
const LOG_FILE = path.join(__dirname, 'data', 'router.log');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Initialize data file with session structure
if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
        sessions: [],
        currentSessionId: null
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

function getAppData() {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveAppData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateSessionTitle(firstMessage) {
    // Generate title from first message (max 50 chars)
    if (!firstMessage) return 'New Chat';
    return firstMessage.length > 50 ? firstMessage.substring(0, 47) + '...' : firstMessage;
}

function getCurrentSession(data) {
    if (!data.currentSessionId) return null;
    return data.sessions.find(s => s.id === data.currentSessionId);
}

function logRouter(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
    console.log(logEntry);
}

app.get('/api/logs', (req, res) => {
    if (fs.existsSync(LOG_FILE)) {
        const logs = fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(Boolean);
        res.json(logs);
    } else {
        res.json([]);
    }
});

// Get all sessions
app.get('/api/sessions', (req, res) => {
    const data = getAppData();
    const sessions = data.sessions.map(s => ({
        id: s.id,
        title: s.title,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        messageCount: s.conversations.length
    }));
    res.json({ sessions, currentSessionId: data.currentSessionId });
});

// Get current session data
app.get('/api/session', (req, res) => {
    const data = getAppData();
    const currentSession = getCurrentSession(data);
    if (!currentSession) {
        return res.json({ conversations: [], promptCount: 0, sessionId: null });
    }
    res.json({
        conversations: currentSession.conversations,
        promptCount: currentSession.promptCount,
        sessionId: currentSession.id,
        title: currentSession.title
    });
});

// Create new session
app.post('/api/session/new', (req, res) => {
    const data = getAppData();
    const newSession = {
        id: Date.now().toString(),
        title: 'New Chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        conversations: [],
        promptCount: 0
    };
    data.sessions.unshift(newSession); // Add to beginning
    data.currentSessionId = newSession.id;
    saveAppData(data);
    logRouter(`Created new session: ${newSession.id}`);
    res.json(newSession);
});

// Switch to a session
app.post('/api/session/switch/:id', (req, res) => {
    const data = getAppData();
    const sessionId = req.params.id;
    const session = data.sessions.find(s => s.id === sessionId);
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    data.currentSessionId = sessionId;
    saveAppData(data);
    logRouter(`Switched to session: ${sessionId}`);
    res.json(session);
});

// Delete a session
app.delete('/api/session/:id', (req, res) => {
    const data = getAppData();
    const sessionId = req.params.id;
    const index = data.sessions.findIndex(s => s.id === sessionId);
    if (index === -1) {
        return res.status(404).json({ error: 'Session not found' });
    }
    data.sessions.splice(index, 1);

    // If deleted session was current, switch to most recent
    if (data.currentSessionId === sessionId) {
        data.currentSessionId = data.sessions.length > 0 ? data.sessions[0].id : null;
    }
    saveAppData(data);
    logRouter(`Deleted session: ${sessionId}`);
    res.json({ message: 'Session deleted' });
});

// Reset all sessions (for testing)
app.post('/api/reset', (req, res) => {
    const data = { sessions: [], currentSessionId: null };
    saveAppData(data);
    if (fs.existsSync(LOG_FILE)) {
        fs.writeFileSync(LOG_FILE, '');
    }
    logRouter('System Reset');
    res.json({ message: 'Reset successful' });
});

// Provider Functions
async function callGemini(prompt) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];
    let lastErr = null;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (e) {
            lastErr = e;
            logRouter(`Gemini ${modelName} failed: ${e.message}. Trying next...`);
        }
    }
    throw lastErr;
}

async function callChatGPT(prompt) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4o-mini", // Upgraded to 4o-mini for better availability
    });
    return completion.choices[0].message.content;
}

async function callGroq(prompt) {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile", // Updated from decommissioned model
        })
    });
    const groqData = await groqResponse.json();
    if (groqData.error) throw new Error(groqData.error.message);
    return groqData.choices[0].message.content;
}

app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;
    let data = getAppData();

    // Auto-create session if none exists
    let currentSession = getCurrentSession(data);
    if (!currentSession) {
        const newSession = {
            id: Date.now().toString(),
            title: 'New Chat',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            conversations: [],
            promptCount: 0
        };
        data.sessions.unshift(newSession);
        data.currentSessionId = newSession.id;
        currentSession = newSession;
        logRouter(`Auto-created new session: ${newSession.id}`);
    }

    // Increment session's prompt counter
    currentSession.promptCount += 1;
    const promptCount = currentSession.promptCount;

    let responseText = '';
    let usedProvider = '';

    // Define provider chain based on session's count (0-5: Gemini, 6-10: ChatGPT, 11+: Groq)
    const chain = [];
    if (promptCount < 6) {
        chain.push({ name: 'Gemini', call: callGemini, key: 'GEMINI_API_KEY' });
        chain.push({ name: 'ChatGPT', call: callChatGPT, key: 'OPENAI_API_KEY' });
        chain.push({ name: 'Groq', call: callGroq, key: 'GROQ_API_KEY' });
    } else if (promptCount < 11) {
        chain.push({ name: 'ChatGPT', call: callChatGPT, key: 'OPENAI_API_KEY' });
        chain.push({ name: 'Groq', call: callGroq, key: 'GROQ_API_KEY' }); // Fixed: Groq before Gemini
        chain.push({ name: 'Gemini', call: callGemini, key: 'GEMINI_API_KEY' });
    } else {
        chain.push({ name: 'Groq', call: callGroq, key: 'GROQ_API_KEY' });
        chain.push({ name: 'ChatGPT', call: callChatGPT, key: 'OPENAI_API_KEY' });
        chain.push({ name: 'Gemini', call: callGemini, key: 'GEMINI_API_KEY' });
    }

    let lastError = null;
    for (const p of chain) {
        try {
            const apiKey = process.env[p.key];
            if (!apiKey || apiKey.includes('your_')) {
                logRouter(`Provider ${p.name} has no API key. Using Mock.`);
                responseText = `[MOCK ${p.name.toUpperCase()}] This is a simulated response for: "${prompt}".`;
                usedProvider = p.name;
                break;
            }

            logRouter(`Attempting Prompt #${promptCount} via ${p.name}...`);
            responseText = await p.call(prompt);
            usedProvider = p.name;
            logRouter(`Success with ${p.name}`);
            break;
        } catch (err) {
            lastError = err;
            logRouter(`!!! Provider ${p.name} Failed: ${err.message}`);
            continue; // Failover to next in chain
        }
    }

    if (!usedProvider) {
        return res.status(500).json({ error: 'All providers failed', details: lastError?.message });
    }

    const conversation = {
        id: Date.now(),
        prompt,
        response: responseText,
        provider: usedProvider,
        timestamp: new Date().toISOString()
    };

    currentSession.conversations.push(conversation);
    currentSession.updatedAt = new Date().toISOString();

    // Update session title from first message
    if (currentSession.conversations.length === 1 || currentSession.title === 'New Chat') {
        currentSession.title = generateSessionTitle(prompt);
    }

    saveAppData(data);
    res.json(conversation);
});

app.listen(PORT, () => {
    logRouter(`Server started on port ${PORT}`);
});

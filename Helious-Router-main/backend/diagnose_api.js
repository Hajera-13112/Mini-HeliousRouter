const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

async function diagnoseGemini() {
    console.log('\n--- Gemini Diagnostic ---');
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.includes('your_')) {
        console.log('❌ GEMINI_API_KEY is missing or template value.');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(key);
        // We can't easily list models with the standard web-optimized SDK without additional setup,
        // but we can test common model strings.
        const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                await model.generateContent("test");
                console.log(`✅ Model "${modelName}" is WORKING.`);
            } catch (err) {
                console.log(`❌ Model "${modelName}" FAILED: ${err.message}`);
            }
        }
    } catch (err) {
        console.log(`❌ Gemini Initialization FAILED: ${err.message}`);
    }
}

async function diagnoseOpenAI() {
    console.log('\n--- OpenAI Diagnostic ---');
    const key = process.env.OPENAI_API_KEY;
    if (!key || key.includes('your_')) {
        console.log('❌ OPENAI_API_KEY is missing or template value.');
        return;
    }

    try {
        const openai = new OpenAI({ apiKey: key });
        const modelsToTest = ["gpt-4o-mini", "gpt-3.5-turbo"];

        for (const modelName of modelsToTest) {
            try {
                await openai.chat.completions.create({
                    messages: [{ role: "user", content: "test" }],
                    model: modelName,
                });
                console.log(`✅ Model "${modelName}" is WORKING.`);
            } catch (err) {
                console.log(`❌ Model "${modelName}" FAILED: ${err.message}`);
                if (err.message.includes('429')) {
                    console.log('   👉 Note: 429 often means you need to add credits to your OpenAI account.');
                }
            }
        }
    } catch (err) {
        console.log(`❌ OpenAI Initialization FAILED: ${err.message}`);
    }
}

async function diagnoseGroq() {
    console.log('\n--- Groq Diagnostic ---');
    const key = process.env.GROQ_API_KEY;
    if (!key || key.includes('your_')) {
        console.log('❌ GROQ_API_KEY is missing or template value.');
        return;
    }

    try {
        const modelsToTest = ["llama-3.3-70b-versatile", "llama3-8b-8192"];
        for (const modelName of modelsToTest) {
            try {
                const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: [{ role: "user", content: "test" }],
                        model: modelName,
                    })
                });
                const data = await res.json();
                if (data.error) throw new Error(data.error.message);
                console.log(`✅ Model "${modelName}" is WORKING.`);
            } catch (err) {
                console.log(`❌ Model "${modelName}" FAILED: ${err.message}`);
            }
        }
    } catch (err) {
        console.log(`❌ Groq Diagnostic FAILED: ${err.message}`);
    }
}

async function runDiagnostics() {
    console.log('Starting Helious Router API Diagnostics...');
    await diagnoseGemini();
    await diagnoseOpenAI();
    await diagnoseGroq();
    console.log('\nDiagnostics Complete.');
}

runDiagnostics();

const dotenv = require('dotenv');
dotenv.config();

async function testGeminiREST() {
    console.log('\n--- Gemini REST Diagnostic ---');
    const key = process.env.GEMINI_API_KEY;
    const model = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "hi" }] }]
            })
        });
        const data = await res.json();
        if (res.ok) {
            console.log(`✅ REST Model "${model}" is WORKING.`);
            console.log('Response:', data.candidates[0].content.parts[0].text);
        } else {
            console.log(`❌ REST Model "${model}" FAILED with status ${res.status}.`);
            console.log('Error Data:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.log(`❌ REST Diagnostic FAILED: ${err.message}`);
    }
}

testGeminiREST();

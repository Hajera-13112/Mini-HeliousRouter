const dotenv = require('dotenv');
dotenv.config();

async function listGeminiModels() {
    console.log('\n--- Gemini ListModels Diagnostic ---');
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok) {
            console.log('✅ ListModels SUCCESS.');
            console.log('Available Models (first 10):');
            data.models.slice(0, 10).forEach(m => {
                console.log(`- ${m.name} (${m.displayName})`);
            });
        } else {
            console.log(`❌ ListModels FAILED with status ${res.status}.`);
            console.log('Error Data:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.log(`❌ ListModels Diagnostic FAILED: ${err.message}`);
    }
}

listGeminiModels();

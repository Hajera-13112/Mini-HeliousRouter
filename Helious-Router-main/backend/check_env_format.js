const fs = require('fs');
const dotenv = require('dotenv');

function checkEnv() {
    console.log('--- Env Format Check ---');
    const content = fs.readFileSync('.env', 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
        if (line.startsWith('GEMINI_API_KEY=')) {
            const val = line.split('=')[1];
            console.log(`GEMINI_API_KEY length: ${val.trim().length}`);
            if (val.startsWith('"') || val.startsWith("'")) {
                console.log('⚠️ Warning: Key is wrapped in quotes. This can sometimes cause issues in the JS SDK.');
            }
            if (val !== val.trim()) {
                console.log('⚠️ Warning: Key has leading or trailing whitespace.');
            }
        }
    }
}

checkEnv();

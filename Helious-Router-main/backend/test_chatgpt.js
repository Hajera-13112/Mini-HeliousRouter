const OpenAI = require('openai');
require('dotenv').config();

async function testChatGPT() {
    console.log('\n--- ChatGPT API Key Test ---');

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey.includes('your_')) {
        console.log('❌ No API key found in .env file');
        return;
    }

    console.log(`API Key: ${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 10)}`);

    try {
        const openai = new OpenAI({ apiKey });

        console.log('\nAttempting to call ChatGPT...');
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: "Say 'Hello' in one word" }],
            model: "gpt-4o-mini",
        });

        console.log('✅ ChatGPT API Key is VALID!');
        console.log('Response:', completion.choices[0].message.content);

    } catch (error) {
        console.log('❌ ChatGPT API call FAILED:');
        console.log('Status:', error.status);
        console.log('Error:', error.message);

        if (error.status === 401) {
            console.log('\n⚠️  Your API key is INVALID or EXPIRED.');
            console.log('Solution: Generate a new key at https://platform.openai.com/api-keys');
        } else if (error.status === 429) {
            console.log('\n⚠️  You exceeded your rate limit or quota.');
            console.log('Solution: Check your usage at https://platform.openai.com/usage');
        }
    }
}

testChatGPT();

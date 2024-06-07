// api/gpt.js

const fetch = require('node-fetch');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    const userMessage = req.body.input;

    if (!userMessage) {
        return res.status(400).json({ error: 'Input text is required' });
    }

    console.log('Received message:', userMessage);

    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: userMessage }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response data:', errorData);
            return res.status(response.status).json(errorData);
        }

        const responseData = await response.json();
        console.log('GPT response data:', responseData);

        res.status(200).json({ output: responseData.choices[0].message.content });
    } catch (error) {
        console.error('Error interacting with GPT API:', error);
        res.status(500).json({ error: error.message });
    }
};

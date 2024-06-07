const express = require('express');
const fetch = require('node-fetch'); // This will use node-fetch v2
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Use the PORT environment variable set by Heroku, or default to 3000 for local development

app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/gpt', async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    const apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    const userMessage = req.body.input;

    if (!userMessage) {
        return res.status(400).send({ error: 'Input text is required' });
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
            return res.status(response.status).send(errorData);
        }

        const responseData = await response.json();
        console.log('GPT response data:', responseData);

        res.json({ output: responseData.choices[0].message.content });
    } catch (error) {
        console.error('Error interacting with GPT API:', error);

        if (error.response) {
            // Detailed error from the response
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // No response received
            console.error('Request made, no response received:', error.request);
            res.status(500).send('No response received from GPT API');
        } else {
            // Other errors
            console.error('Error message:', error.message);
            res.status(500).send(error.message);
        }
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

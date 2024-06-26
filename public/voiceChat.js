// public/voiceChat.js

document.getElementById('activateVoiceChat').addEventListener('click', function() {
    startVoiceChat();
});

function startVoiceChat() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const button = document.getElementById('activateVoiceChat');
    const icon = button.querySelector('.icon');
    icon.style.display = 'none';

    const loader = document.createElement('div');
    loader.className = 'loader';
    button.appendChild(loader);

    recognition.start();

    recognition.onstart = function() {
        console.log('Speech recognition service has started');
    };

    recognition.onresult = function(event) {
        const userText = event.results[0][0].transcript;
        console.log('Recognized text:', userText);
        displayUserText(userText); // Display user text in the chat window
        getGPTResponse(userText);
        loader.className = 'thinking';
    };

    recognition.onspeechend = function() {
        recognition.stop();
        console.log('Speech recognition service disconnected');
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error detected: ' + event.error);
        button.removeChild(loader);
        icon.style.display = 'block';
    };

    recognition.onend = function() {
        console.log('Speech recognition service ended');
    };
}

function getGPTResponse(text) {
    const apiEndpoint = '/.netlify/functions/gpt'; // Correct endpoint for Netlify function

    console.log('Sending request to GPT API with text:', text);

    fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: text })
    })
    .then(response => {
        if (!response.ok) {
            // Handle non-200 responses
            return response.text().then(text => {
                console.error('Error response:', text);
                throw new Error(`HTTP error! status: ${response.status} - ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('GPT response:', data);
        const gptResponse = data.output;
        displayGPTResponse(gptResponse); // Display GPT response in the chat window
        speakResponse(gptResponse);
        const button = document.getElementById('activateVoiceChat');
        const loader = button.querySelector('.thinking');
        button.removeChild(loader);
        const icon = button.querySelector('.icon');
        icon.style.display = 'block';
    })
    .catch(error => {
        console.error('Error interacting with GPT:', error);
        const button = document.getElementById('activateVoiceChat');
        const loader = button.querySelector('.thinking');
        button.removeChild(loader);
        const icon = button.querySelector('.icon');
        icon.style.display = 'block';
    });
}

function speakResponse(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = function() {
        console.log('Speech synthesis started');
    };
    utterance.onend = function() {
        console.log('Speech synthesis ended');
    };
    utterance.onerror = function(event) {
        console.error('Speech synthesis error detected: ' + event.error);
    };
    synth.speak(utterance);
}

function displayUserText(text) {
    const chatWindow = document.getElementById('chatWindow');
    const userTextElement = document.createElement('div');
    userTextElement.className = 'chat-message user-message';
    userTextElement.innerText = text;
    chatWindow.appendChild(userTextElement);
    chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to the bottom
}

function displayGPTResponse(text) {
    const chatWindow = document.getElementById('chatWindow');
    const gptResponseElement = document.createElement('div');
    gptResponseElement.className = 'chat-message gpt-message';
    gptResponseElement.innerText = text;
    chatWindow.appendChild(gptResponseElement);
    chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to the bottom
}

// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Verify webhook URL for 360dialog
app.get('/webhook', (req, res) => {
    // 360dialog sends a challenge parameter for verification
    const challenge = req.query.challenge;
    if (challenge) {
        return res.send(challenge);
    }
    res.status(400).send('Challenge not found');
});

// Handle incoming messages
app.post('/webhook', async (req, res) => {
    try {
        const message = req.body;
        console.log('Received message:', JSON.stringify(message, null, 2));

        // Extract the message content
        if (message.messages && message.messages[0]) {
            const incomingMessage = message.messages[0];
            const sender = incomingMessage.from;
            const messageContent = incomingMessage.text?.body;

            // Here you'll add your LLM integration later
            console.log(`From: ${sender}, Message: ${messageContent}`);

            // For now, we'll just acknowledge receipt
            res.status(200).send('OK');
        }
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).send('Error processing message');
    }
});

// Function to send message back to WhatsApp (you'll need this later)
async function sendWhatsAppMessage(to, message) {
    try {
        const response = await fetch('https://waba.360dialog.io/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'D360-API-KEY': process.env.D360_API_KEY
            },
            body: JSON.stringify({
                to: to,
                type: 'text',
                text: {
                    body: message
                }
            })
        });
        
        const data = await r

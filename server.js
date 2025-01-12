// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Simple route for testing if server is alive
app.get('/', (req, res) => {
    res.send('WhatsApp Bot Server is Running!');
});

// Update just this webhook GET handler in your server.js
app.get('/webhook', (req, res) => {
    console.log('Webhook test received:', req.query);

    // Handle the webhook test event
    if (req.query.event_name === 'webhook-test-event') {
        console.log('Handling test event');
        return res.status(200).json({ status: 'success' });
    }

    // Handle Meta/WhatsApp verification
    if (req.query['hub.mode'] === 'subscribe') {
        console.log('Handling subscription verification');
        return res.status(200).send(req.query['hub.challenge']);
    }

    // Default response
    console.log('Sending default OK response');
    return res.status(200).send('OK');
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

// Function to send message back to WhatsApp
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
        
        const data = await response.json();
        console.log('Message sent:', data);
        return data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

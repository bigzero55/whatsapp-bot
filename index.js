require('dotenv').config();
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('Starting Asro (Asisten Rojak)...');

// Check for required environment variables
if (!process.env.GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY is not set in environment variables');
    process.exit(1);
}

// Initialize the WhatsApp client with minimal configuration
const client = new Client({
    puppeteer: {
        args: ['--no-sandbox']
    }
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Global state for AI toggle
let isAIEnabled = true;

// Function to get AI response
async function getAIResponse(message, retryCount = 0) {
    try {
        // Create a context-aware prompt
        const prompt = `Kamu adalah Asro (Asisten ${process.env.YOUR_NAME}), asisten virtual milik ${process.env.YOUR_NAME}. 
        Kamu harus menjawab dengan sopan, ramah, dan membantu. 
        Berikut beberapa aturan untuk menjawab:
        1. Gunakan bahasa yang sopan dan formal
        2. Selalu perkenalkan diri sebagai Asro di awal percakapan
        3. Berikan jawaban yang informatif tapi ringkas
        4. Jika ada yang bertanya tentang pemilikmu, jelaskan bahwa kamu adalah asisten virtual milik Abdul Rojak
        
        Pesan dari pengguna: "${message}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('AI Error:', error);
        
        // Handle specific error cases
        if (error.status === 503) {
            if (retryCount < 2) {
                console.log(`Retrying request (attempt ${retryCount + 1})...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
                return getAIResponse(message, retryCount + 1);
            }
            return 'Maaf, layanan AI sedang sibuk. Mohon tunggu beberapa saat dan coba lagi.';
        }
        
        if (error.status === 429) {
            return 'Maaf, kuota AI sudah mencapai batas. Mohon coba lagi besok.';
        }

        return 'Maaf, saya mengalami kendala teknis. Mohon coba lagi dalam beberapa saat.';
    }
}

// Basic message handling
client.on('message', async (message) => {
    try {
        if (message.fromMe) return; // Ignore messages from self
        
        console.log('Received message:', message.body);
        const text = message.body.toLowerCase();

        // Handle AI toggle commands
        if (text === 'stopai') {
            isAIEnabled = false;
            await message.reply('Baik, saya akan berhenti menjawab menggunakan AI. Gunakan "onai" untuk mengaktifkan saya kembali.');
            return;
        }

        if (text === 'onai') {
            isAIEnabled = true;
            await message.reply('Halo! Saya Asro, asisten virtual Abdul Rojak. Saya sudah aktif kembali dan siap membantu Anda!');
            return;
        }

        // If AI is enabled, process all messages with AI
        if (isAIEnabled) {
            try {
                console.log('Processing message with AI...');
                const aiResponse = await getAIResponse(message.body);
                await message.reply(aiResponse);
                console.log('AI response sent successfully');
            } catch (error) {
                console.error('Error in AI response:', error);
                await message.reply('Maaf, saya mengalami kendala. Mohon coba beberapa saat lagi.');
            }
        }
        // If AI is disabled, ignore messages except for 'onai' command

    } catch (error) {
        console.error('Error handling message:', error);
        if (isAIEnabled) {
            try {
                await message.reply('Maaf, terjadi kesalahan. Silakan coba lagi.');
            } catch (replyError) {
                console.error('Error sending error message:', replyError);
            }
        }
    }
});

// QR Code event
client.on('qr', (qr) => {
    console.log('QR Code received. Please scan:');
    qrcode.generate(qr, { small: true });
});

// Ready event
client.on('ready', () => {
    console.log('Asro (Asisten Rojak) sudah siap melayani!');
});

// Authentication failure
client.on('auth_failure', (msg) => {
    console.error('Authentication failed:', msg);
});

// Disconnected event
client.on('disconnected', (reason) => {
    console.log('Client was disconnected:', reason);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

// Initialize client
console.log('Initializing Asro...');
client.initialize();

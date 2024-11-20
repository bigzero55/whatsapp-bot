require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// Create logs directory if it doesn't exist
const LOGS_DIR = './logs';
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR);
}

// Setup logging
const logger = pino({
    level: 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
        }
    }
}, pino.destination('./logs/bot.log'));

// Log both to file and console
const log = (...args) => {
    console.log(...args);
    logger.info(args.join(' '));
};

log('Starting Asro (Asisten Rojak)...');

// Check for required environment variables
if (!process.env.GEMINI_API_KEY) {
    log('Error: GEMINI_API_KEY is not set in environment variables');
    process.exit(1);
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Global state for AI toggle
let isAIEnabled = true;

// Function to get AI response
async function getAIResponse(message, retryCount = 0) {
    try {
        log('Generating AI response for:', message);
        const prompt = `Kamu adalah Asro (Asisten ${process.env.YOUR_NAME}), asisten virtual milik ${process.env.YOUR_NAME}. 
        Kamu harus menjawab dengan sopan, ramah, dan membantu. 
        Berikut beberapa aturan untuk menjawab:
        1. Gunakan bahasa yang sopan dan formal
        2. Selalu perkenalkan diri sebagai Asro di awal percakapan
        3. Berikan jawaban yang informatif tapi ringkas
        4. Jika ada yang bertanya tentang pemilikmu, jelaskan bahwa kamu adalah asisten virtual milik ${process.env.YOUR_NAME} yang berbasis AI yang canggih
        5. jangan ulangi sapaan setiap membalas chat, sapaan hanya di gunakan untuk pertama kali membalas saja, selanjutnya berikan jawaban sesuai kebutuhan pengguna.
        6. anda di ciptakan oleh seorang fullstack developer dengan nama ${process.env.YOUR_NAME}
        
        Pesan dari pengguna: "${message}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        log('AI response generated successfully');
        return response.text();
    } catch (error) {
        logger.error('AI Error:', error);
        
        if (error.status === 503 && retryCount < 2) {
            log(`Retrying AI request (attempt ${retryCount + 1})...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            return getAIResponse(message, retryCount + 1);
        }
        
        return 'Maaf, saya sedang mengalami masalah teknis. Mohon coba lagi nanti.';
    }
}

// Ensure auth directory exists
const AUTH_DIR = './auth_info_baileys';
if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR);
}

async function connectToWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
        
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            logger: pino({ level: 'silent' }),
            browser: ['Chrome (Linux)', 'Desktop', '1.0.0'],
            syncFullHistory: false,
            markOnlineOnConnect: true,
            connectTimeoutMs: 60_000,
            defaultQueryTimeoutMs: 60_000,
            keepAliveIntervalMs: 10_000,
            emitOwnEvents: false,
            fireInitQueries: false,
            downloadHistory: false
        });

        // Handle connection events
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                log('QR Code received, please scan with WhatsApp');
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                log('Connection closed due to:', lastDisconnect?.error?.output?.payload);
                
                if (shouldReconnect) {
                    log('Reconnecting to WhatsApp...');
                    setTimeout(connectToWhatsApp, 5000);
                } else {
                    log('Session ended. Please scan the QR code again.');
                    if (fs.existsSync(AUTH_DIR)) {
                        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
                    }
                    setTimeout(connectToWhatsApp, 5000);
                }
            } else if (connection === 'open') {
                log('WhatsApp connection established successfully!');
            }
        });

        // Save credentials whenever they are updated
        sock.ev.on('creds.update', saveCreds);

        // Handle messages
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;

            const m = messages[0];
            if (!m.message || m.key.fromMe) return;

            const messageContent = m.message?.conversation || 
                                 m.message?.extendedTextMessage?.text || 
                                 m.message?.imageMessage?.caption || 
                                 '';
            
            if (!messageContent) return;

            const sender = m.key.remoteJid;
            log(`New message from ${sender}:`, messageContent);

            try {
                if (messageContent.toLowerCase() === '/ai off') {
                    isAIEnabled = false;
                    log('AI mode disabled by user');
                    await sock.sendMessage(sender, { 
                        text: 'AI mode dinonaktifkan.' 
                    }, { quoted: m });
                    return;
                }

                if (messageContent.toLowerCase() === '/ai on') {
                    isAIEnabled = true;
                    log('AI mode enabled by user');
                    await sock.sendMessage(sender, { 
                        text: 'AI mode diaktifkan.' 
                    }, { quoted: m });
                    return;
                }

                if (isAIEnabled) {
                    log('Processing message with AI...');
                    const aiResponse = await getAIResponse(messageContent);
                    log('Sending AI response:', aiResponse);
                    
                    await sock.sendMessage(sender, { 
                        text: aiResponse 
                    }, { 
                        quoted: m 
                    });
                    log('AI response sent successfully');
                }
            } catch (error) {
                logger.error('Error processing message:', error);
                await sock.sendMessage(sender, { 
                    text: 'Maaf, terjadi kesalahan dalam memproses pesan Anda.' 
                }, { 
                    quoted: m 
                });
            }
        });

        return sock;
    } catch (error) {
        logger.error('Error in connectToWhatsApp:', error);
        log('Retrying connection in 5 seconds...');
        setTimeout(connectToWhatsApp, 5000);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    logger.error('Unhandled promise rejection:', error);
});

// Start the bot
log('Starting WhatsApp connection...');
connectToWhatsApp();

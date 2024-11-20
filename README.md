# Asro (Asisten Rojak) - WhatsApp Bot

A WhatsApp bot powered by Google's Gemini AI that provides intelligent responses and automated interactions.

## Features

- 🤖 AI-powered responses using Google's Gemini Pro model
- 💬 Natural language understanding and context-aware conversations
- ⚡ Real-time message processing
- 🔄 Automatic reconnection handling
- 🔐 Environment-based configuration
- 🎯 Customizable AI behavior

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm (Node Package Manager)
- A Google Cloud account with Gemini API access
- WhatsApp account for the bot

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd whatsapp-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
YOUR_NAME=your_name_here
```

## Usage

1. Start the bot:
```bash
npm start
```

2. For development with auto-reload:
```bash
npm run dev
```

3. Scan the QR code that appears in the terminal with WhatsApp Web to connect your WhatsApp account.

## Configuration

The bot's behavior can be customized through:

1. Environment Variables:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `YOUR_NAME`: Your name for the bot's responses

2. AI Behavior:
The bot is configured to:
- Respond politely and formally
- Introduce itself as Asro
- Provide informative but concise answers
- Identify itself as your virtual assistant

## Dependencies

- `whatsapp-web.js`: WhatsApp Web API client
- `@google/generative-ai`: Google's Gemini AI API
- `dotenv`: Environment configuration
- `qrcode-terminal`: QR code generation
- `puppeteer`: Browser automation
- `nodemon`: Development auto-reload

## Troubleshooting

If you encounter issues:

1. Make sure all environment variables are properly set
2. Check your internet connection
3. Ensure your WhatsApp account is active
4. Verify your Gemini API key is valid

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open-source and available under the MIT License.

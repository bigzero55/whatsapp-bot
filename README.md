# WhatsApp Keyword Response Bot

A WhatsApp bot that automatically responds to specific keywords with custom messages and button links.

## Features

- Automatic response to predefined keywords
- Custom text messages
- Interactive buttons with links
- Built with Hyper-Express and Baileys

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the bot:
```bash
npm start
```

3. Scan the QR code that appears in the terminal with WhatsApp Web to connect your WhatsApp account.

## Usage

The bot will automatically respond to the following keywords:
- "hello" - Sends a welcome message with website and contact buttons
- "info" - Sends information about services with relevant links

You can modify the keywords and responses in the `index.js` file under the `responses` object.

## Configuration

Edit the `responses` object in `index.js` to add or modify keywords and their responses:

```javascript
const responses = {
    'keyword': {
        text: 'Your response message',
        buttons: [
            { text: 'Button Text', url: 'https://your-url.com' }
        ]
    }
};
```

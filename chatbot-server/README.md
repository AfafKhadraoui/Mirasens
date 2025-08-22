# MIRASENS Chatbot Installation Guide

## Overview
This chatbot integrates Google Gemini AI with the MIRASENS website to provide intelligent, multilingual customer support for IoT solutions.

## Features
- 🤖 **AI-Powered**: Uses Google Gemini for intelligent responses
- 🌍 **Multilingual**: Automatic French/English language detection
- 📱 **Responsive**: Works on desktop and mobile devices
- 🎯 **Context-Aware**: Understands MIRASENS products and services
- 🔒 **Secure**: API keys stored server-side only
- ⚡ **Fast**: Real-time responses with typing indicators

## Prerequisites
- Node.js 16+ installed
- Google Gemini API key
- Web server to serve static files

## Installation Steps

### 1. Server Setup

1. **Navigate to chatbot server directory:**
```bash
cd chatbot-server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
# Copy the example file
cp .env.example .env

# Edit .env file with your values
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
```

4. **Start the server:**
```bash
# Development
npm run dev

# Production
npm start
```

### 2. Get Google Gemini API Key

1. **Visit Google AI Studio:**
   - Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account

2. **Create API Key:**
   - Click "Create API Key"
   - Select or create a Google Cloud project
   - Copy the generated API key

3. **Add to environment:**
   ```bash
   GEMINI_API_KEY=your_copied_api_key_here
   ```

### 3. Frontend Configuration

The chatbot is already integrated into the HTML files. Update the API URL in `assets/js/chatbot.js`:

```javascript
window.mirasensChatbot = new MirasensChatbot({
    language: language,
    apiUrl: 'https://your-server-domain.com/api' // Update this
});
```

## Server Deployment Options

### Option 1: Local Development
```bash
cd chatbot-server
npm run dev
```
Server runs on `http://localhost:3001`

### Option 2: Production Server (Linux)

1. **Install PM2 for process management:**
```bash
npm install -g pm2
```

2. **Start with PM2:**
```bash
cd chatbot-server
pm2 start server.js --name "mirasens-chatbot"
pm2 startup
pm2 save
```

### Option 3: Docker Deployment

Create `Dockerfile` in chatbot-server:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t mirasens-chatbot .
docker run -d -p 3001:3001 --env-file .env mirasens-chatbot
```

## Configuration Options

### Chatbot Widget Configuration
In `assets/js/chatbot.js`, you can customize:

```javascript
window.mirasensChatbot = new MirasensChatbot({
    apiUrl: 'http://localhost:3001/api',        // API endpoint
    language: 'fr',                             // Default language
    autoDetectLanguage: true,                   // Auto-detect from browser/URL
    showWelcomeMessage: true,                   // Show welcome on first open
    showNotifications: true                     // Show notification badge
});
```

### Server Configuration
In `.env` file:

```env
# Required
GEMINI_API_KEY=your_api_key

# Optional
PORT=3001                                      # Server port
NODE_ENV=production                            # Environment
FRONTEND_URL=https://your-domain.com           # CORS allowed origin
RATE_LIMIT_WINDOW_MS=900000                    # Rate limit window (15 min)
RATE_LIMIT_MAX_REQUESTS=100                    # Max requests per window
```

## Testing

### 1. Test Server Health
```bash
curl http://localhost:3001/api/health
```

### 2. Test Chat Endpoint
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Bonjour"}'
```

### 3. Test Frontend
1. Open your website
2. Look for the blue chat bubble in bottom-right corner
3. Click to open chat window
4. Send a test message

## Knowledge Base Customization

The chatbot's knowledge is defined in `server.js`. To customize:

1. **Edit company information:**
```javascript
const MIRASENS_KNOWLEDGE = {
    fr: {
        company: `Your updated company info...`,
        scenarios: [
            // Add new conversation scenarios
        ]
    }
}
```

2. **Add new conversation scenarios:**
```javascript
{
    keywords: ['nouveau', 'produit', 'innovation'],
    response: `Your response about new products...`
}
```

## Security Best Practices

1. **Never expose API keys in frontend code**
2. **Use HTTPS in production**
3. **Implement rate limiting** (included)
4. **Regular security updates**
5. **Monitor API usage**

## Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Update `FRONTEND_URL` in `.env`
   - Ensure server allows your domain

2. **API Key Issues:**
   - Verify Gemini API key is correct
   - Check API quotas in Google Cloud Console

3. **Connection Errors:**
   - Verify server is running
   - Check firewall settings
   - Ensure correct API URL in frontend

4. **Language Detection Issues:**
   - Check i18next integration
   - Verify language codes (fr/en)

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

### Logs
Monitor server logs:
```bash
pm2 logs mirasens-chatbot
```

## Performance Optimization

1. **Enable gzip compression**
2. **Use CDN for static assets**
3. **Implement caching for common responses**
4. **Monitor API response times**

## Support

For technical support or questions:
- Email: contact@mirasens.com
- Check server logs for error details
- Verify API key quotas and usage

## Updates

To update the chatbot:

1. **Backend updates:**
```bash
cd chatbot-server
git pull
npm install
pm2 restart mirasens-chatbot
```

2. **Frontend updates:**
- Replace chatbot.css and chatbot.js files
- Clear browser cache
- Test functionality

## API Reference

### POST /api/chat
Send a message to the chatbot.

**Request:**
```json
{
    "message": "Your message here",
    "conversationHistory": [
        {"role": "user", "content": "Previous message"},
        {"role": "assistant", "content": "Previous response"}
    ]
}
```

**Response:**
```json
{
    "response": "AI generated response",
    "language": "fr"
}
```

### GET /api/health
Check server health status.

**Response:**
```json
{
    "status": "OK",
    "timestamp": "2025-01-16T10:30:00.000Z",
    "service": "MIRASENS Chatbot API"
}
```

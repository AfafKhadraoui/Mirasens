# MIRASENS Chatbot - Infomaniak Deployment Guide

## Pre-Deployment Checklist

### 1. Backend Preparation (Node.js App)
- [ ] Update CORS origins in `server.js` with your domain
- [ ] Create `.env` file with your Gemini API key
- [ ] Test locally: `cd chatbot-server && npm start`
- [ ] Verify `package.json` includes all dependencies

### 2. Frontend Configuration
- [ ] Frontend automatically detects production vs development
- [ ] API calls will use same domain in production
- [ ] Test chatbot locally before deploying

### 3. Required Files for Upload

#### Backend Files (Node.js app folder):
```
chatbot-server/
├── server.js
├── package.json
├── package-lock.json
├── .env (create from .env.example)
├── README.md
└── start.sh
```

#### Frontend Files (website):
```
assets/
├── css/
│   └── chatbot.css
└── js/
    └── chatbot.js (updated)
```

### 4. Infomaniak Setup Steps

1. **Create Node.js Application:**
   - Log into Infomaniak control panel
   - Go to "Web Hosting" → "Node.js Applications"
   - Create new Node.js app
   - Select Node.js version (16+ recommended)

2. **Upload Backend:**
   - Upload `chatbot-server` folder contents
   - Set entry point: `server.js`
   - Set start command: `npm start`

3. **Environment Variables:**
   - Add `GEMINI_API_KEY=your_actual_api_key`
   - Add `NODE_ENV=production`
   - Add `PORT=3001` (or use Infomaniak's assigned port)

4. **Domain Configuration:**
   - Note your Node.js app URL (e.g., `https://yourapp.infomaniak.dev`)
   - Update CORS origins in server.js if needed

5. **Frontend Upload:**
   - Upload website files via FTP
   - Ensure updated `chatbot.js` is included

### 5. Testing

1. **Backend Test:**
   ```bash
   curl https://your-nodejs-app.infomaniak.dev/api/health
   ```

2. **Frontend Test:**
   - Open your website
   - Click chatbot icon
   - Send test message
   - Check browser console for errors

### 6. Troubleshooting

- **CORS Errors:** Update server.js with correct domain
- **API Not Found:** Check Node.js app is running
- **Environment Variables:** Verify in Infomaniak panel
- **Dependencies:** Ensure all packages in package.json

## Important Notes

- Keep your Gemini API key secure
- Monitor API usage and costs
- Set up proper error logging
- Consider implementing rate limiting
- Test thoroughly before going live

## Support

If issues persist:
1. Check Infomaniak Node.js documentation
2. Review browser console errors
3. Check server logs in Infomaniak panel
4. Verify all environment variables are set

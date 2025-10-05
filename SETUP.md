# FORTif.ai Chatbot - Setup Instructions

## 🎯 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
# Install all dependencies (backend + frontend)
npm run install-all
```

### Step 2: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Click "Create new secret key"
4. Copy the API key (starts with `sk-`)

### Step 3: Configure Environment

```bash
# Copy the example environment file
cp env.example .env

# Edit .env file and add your API key
# Replace 'your_openai_api_key_here' with your actual key
```

### Step 4: Start the Application

```bash
# This starts both backend and frontend
npm run dev
```

### Step 5: Open in Browser

Navigate to: `http://localhost:3000`

## 🔧 Troubleshooting

### Common Issues

**1. "Cannot find module" errors**

```bash
# Make sure you ran the install command
npm run install-all
```

**2. "OpenAI API error"**

- Check your API key in `.env` file
- Ensure you have credits in your OpenAI account
- Verify the key starts with `sk-`

**3. "Port already in use"**

```bash
# Kill any process using port 5000 or 3000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

**4. Text-to-speech not working**

- Make sure you're using a modern browser (Chrome, Firefox, Safari)
- Check that your browser allows audio permissions
- Try clicking the "Speak" button manually first

## 📁 File Structure Overview

```
fortif-ai-chatbot/
├── server/
│   └── index.js              # Backend API server
├── client/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── App.tsx          # Main app
│   │   └── index.tsx        # Entry point
│   └── public/
│       └── index.html       # HTML template
├── package.json             # Backend dependencies
├── env.example             # Environment template
└── README.md               # Full documentation
```

## 🎨 Customization

### Changing Font Sizes

Edit `client/src/index.css`:

```css
body {
  font-size: 24px; /* Increase from 20px */
}
```

### Changing Colors

Edit `client/src/index.css`:

```css
.bg-primary {
  background-color: #1976d2; /* Change from green to blue */
}
```

### Adding New Features

1. Create new components in `client/src/components/`
2. Add new API endpoints in `server/index.js`
3. Update `client/src/App.tsx` to include new features

## 🚀 Production Deployment

### Environment Variables

```bash
NODE_ENV=production
PORT=5000
OPENAI_API_KEY=your_production_key
```

### Build for Production

```bash
# Build the React app
npm run build

# The built files will be in client/build/
```

### Deploy to Heroku

1. Create `Procfile`:
   ```
   web: node server/index.js
   ```
2. Deploy:
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push heroku main
   ```

## 📱 Mobile Testing

The app is responsive and works on mobile devices:

- Test on different screen sizes
- Verify touch interactions work properly
- Check that text-to-speech works on mobile browsers

## 🎥 Demo Script for Presentation

### 1. Introduction (30 seconds)

- "This is a senior-friendly AI chatbot built for FORTif.ai"
- "It features large fonts, text-to-speech, and a reminder system"

### 2. Chat Demo (90 seconds)

- Show the chat interface
- Ask a question like "What time should I take my medication?"
- Demonstrate text-to-speech by clicking the speak button
- Show the large, clear font sizes

### 3. Reminder Demo (90 seconds)

- Switch to the Reminders tab
- Create a new reminder for "Take morning medication at 8 AM"
- Show how to mark it complete
- Demonstrate the simple, intuitive interface

### 4. Accessibility Demo (60 seconds)

- Show keyboard navigation (Tab key)
- Point out high contrast colors
- Demonstrate screen reader compatibility

### 5. Limitations (30 seconds)

- Requires internet connection
- Browser compatibility for text-to-speech
- Local storage only (reminders don't sync)

## 🛠️ Development Commands

```bash
# Start both frontend and backend
npm run dev

# Start only backend
npm run server

# Start only frontend
npm run client

# Install all dependencies
npm run install-all

# Build for production
npm run build
```

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Verify all dependencies are installed
3. Ensure your OpenAI API key is correct
4. Try refreshing the browser
5. Check browser console for error messages

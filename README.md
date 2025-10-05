# FORTif.ai Senior-Friendly Chatbot

A comprehensive AI-powered daily assistant designed specifically for senior citizens, featuring large fonts, text-to-speech, voice navigation, and multiple helpful tools for daily living.

## 🌟 Features

### Senior-Friendly Design

- **Large fonts** (20px+ base font size) for better readability
- **High contrast colors** (black text on white background)
- **Simple, intuitive interface** with minimal cognitive load
- **Accessibility features** including keyboard navigation and screen reader support
- **Responsive design** that works on desktop, tablet, and mobile devices

### AI Chat Assistant (FORTiFriend)

- **Intelligent responses** powered by OpenAI GPT-3.5-turbo or Groq AI (free tier)
- **Senior-focused prompts** for patient, encouraging, and clear communication
- **Conversation history** for contextual responses
- **Natural language reminder creation** - just say "remind me to..."

### Voice Navigation & Control

- **Universal voice commands** for hands-free navigation
- **Speech recognition** for natural interaction
- **Voice-activated reminders** and calendar events
- **Navigation commands** - "go to reminders", "switch to calendar", etc.
- **Automatic text-to-speech** for all AI responses

### Text-to-Speech

- **Automatic audio responses** for all AI messages
- **Manual speak button** for individual messages
- **Adjustable speech rate** optimized for seniors
- **Natural voice selection** when available
- **Voice feedback** for all user actions

### To-Do & Reminder System

- **Simple reminder creation** with title, date, time, and description
- **Visual completion tracking** with checkboxes
- **Upcoming vs completed** reminder organization
- **Easy deletion and editing**
- **Voice-activated reminder creation**

### Calendar System

- **Monthly calendar view** with clear, large text
- **Event visualization** with color-coded categories
- **Birthday tracking** with special icons
- **Appointment management** with visual indicators
- **Easy month navigation** with large buttons

### Daily Assistant Dashboard

- **Weather information** with clothing suggestions
- **Meal planning** with simple recipes and ingredients
- **Home maintenance reminders** (smoke detectors, filters, etc.)
- **Common locations** with contact information
- **Daily overview** with current time and date

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- AI API key (OpenAI or Groq)

### Installation

1. **Clone and install dependencies:**

   ```bash
   npm run install-all
   ```

2. **Set up environment variables:**

   ```bash
   cp env.example .env
   ```

   Edit `.env` and add your AI API key. You can use either:

   **Option A: OpenAI (Recommended for production)**

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

   **Option B: Groq AI (Free tier - 6,000 requests/day)**

   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

   **Getting API Keys:**

   - **OpenAI**: Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - **Groq**: Visit [Groq Console](https://console.groq.com/keys) (Free tier available)

3. **Start the application:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

   The application will automatically detect which AI service you have configured and use the appropriate one.

## 🏗️ Project Structure

```
fortif-ai-chatbot/
├── server/                 # Backend API
│   └── index.js           # Express server with AI integration (OpenAI/Groq)
├── client/                # React frontend
│   ├── public/
│   │   ├── index.html     # HTML template
│   │   └── favicon.svg    # App icon
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ChatInterface.tsx      # AI chat interface
│   │   │   ├── ReminderSystem.tsx     # To-do and reminders
│   │   │   ├── CalendarComponent.tsx  # Calendar view with events
│   │   │   ├── DailyAssistantComponent.tsx  # Daily dashboard
│   │   │   ├── Header.tsx             # Navigation header
│   │   │   └── TabNavigation.tsx      # Tab navigation
│   │   ├── types/
│   │   │   └── speech.d.ts            # TypeScript speech recognition types
│   │   ├── App.tsx        # Main app component with voice navigation
│   │   ├── App.css        # App-specific styles
│   │   ├── index.tsx      # React entry point
│   │   └── index.css      # Global senior-friendly styles
│   ├── package.json       # Frontend dependencies
│   └── tsconfig.json      # TypeScript configuration
├── package.json           # Backend dependencies and scripts
├── env.example           # Environment variables template
├── SETUP.md              # Detailed setup instructions
└── README.md             # This file
```

## 🎯 Senior-Friendly Features Explained

### 1. Large Font Sizes

- Base font size: 20px (compared to standard 16px)
- Headers: 2.5rem (40px) for main titles
- Buttons: 1.3rem (21px) minimum
- Input fields: 1.2rem (19px)

### 2. High Contrast Design

- Black text (#000000) on white background (#FFFFFF)
- Green accent color (#2E7D32) for primary actions
- Clear borders and shadows for visual separation

### 3. Text-to-Speech Integration

- Uses Web Speech API for browser-based synthesis
- Automatically speaks AI responses
- Manual control with speak/stop buttons
- Slower speech rate (0.8x) for better comprehension

### 4. Simple Reminder System

- One-click reminder creation
- Clear date/time selection
- Visual completion status
- Easy deletion and management

## 🔧 Technical Implementation

### Backend (Node.js/Express)

- RESTful API endpoints for chat, reminders, and calendar events
- Dual AI integration: OpenAI GPT-3.5-turbo and Groq AI (free tier)
- Senior-focused system prompts with concise responses
- Natural language reminder parsing
- CORS enabled for frontend communication
- Automatic AI service detection and fallback

### Frontend (React/TypeScript)

- Component-based architecture with modern React hooks
- TypeScript for type safety and better development experience
- Universal voice recognition for hands-free navigation
- Speech synthesis for all AI responses
- Responsive design for desktop, tablet, and mobile
- Accessibility attributes (ARIA labels, roles, keyboard navigation)
- Real-time voice command processing

### Voice Navigation System

- **Universal microphone** for continuous voice commands
- **Speech recognition** using Web Speech API
- **Command processing** for navigation, reminders, and calendar events
- **Auto-restart** functionality for seamless voice interaction
- **Error handling** with user-friendly feedback

### Key Dependencies

- **Frontend**: React 18, TypeScript, Axios, Web Speech API
- **Backend**: Express, OpenAI SDK, Groq AI, CORS, node-cron
- **Styling**: Custom CSS with senior-friendly design principles
- **Development**: Concurrently, Nodemon for hot reloading

## 🎤 Voice Commands

The application supports hands-free navigation and interaction through voice commands:

### Navigation Commands

- **"Go to reminders"** or **"Switch to to-do"** - Navigate to reminder system
- **"Go to calendar"** or **"Switch to calendar"** - Navigate to calendar view
- **"Go to chat"** or **"Switch to chat"** - Navigate to AI chat interface
- **"Go to daily assistant"** or **"Switch to home"** - Navigate to daily dashboard

### Reminder Creation Commands

- **"Remind me to [task] at [time] on [date]"** - Create reminders via voice
- **"Add reminder [task]"** - Quick reminder creation
- **Examples**:
  - "Remind me to take medication at 8 AM tomorrow"
  - "Add reminder to call the doctor"
  - "Remind me to get groceries this afternoon"

### Calendar Commands

- **"Add event [description]"** - Create calendar events
- **"Schedule [event] for [date]"** - Schedule specific events

### Voice Control

- **Click the microphone button** (🎤) to start voice recognition
- **Click the stop button** (🛑) to stop voice recognition
- **Automatic restart** for navigation commands
- **Visual feedback** when listening for commands

## 🎥 Presentation Points

### Code Explanation

- Clean, well-commented code structure with TypeScript
- Separation of concerns (UI, API, business logic, voice processing)
- Modern React hooks and functional components
- Responsive design principles with accessibility focus
- Universal voice recognition system with error handling

### Feature Justification

- **Voice Navigation**: Enables hands-free operation for mobility-challenged users
- **Text-to-Speech**: Addresses vision challenges common in seniors
- **Large Fonts**: Improves readability for aging eyes
- **Simple Interface**: Reduces cognitive load and confusion
- **Multi-tool Dashboard**: Provides comprehensive daily assistance
- **Calendar Integration**: Helps with appointment and event management

### Demo Flow

1. **Welcome Screen**: Show the daily assistant dashboard with weather and meal suggestions
2. **Voice Navigation**: Demonstrate voice commands - "go to chat", "switch to reminders"
3. **Chat Interface**: Ask a question and show text-to-speech functionality
4. **Voice Reminders**: Create a reminder using voice - "remind me to take medication at 8 AM"
5. **Calendar View**: Show monthly calendar with events and birthdays
6. **Accessibility**: Highlight keyboard navigation and screen reader compatibility

### Limitations

- Requires internet connection for AI responses
- Text-to-speech and voice recognition depend on browser support
- Reminders stored locally (not persistent across devices)
- AI API costs for production use (mitigated by Groq free tier)
- Voice commands require microphone permissions

## 🚀 Future Enhancements

- **Database integration** for persistent reminders and user data
- **Enhanced voice input** with wake word detection
- **Medication tracking** with photo recognition and scheduling
- **Family member notifications** and sharing capabilities
- **Offline mode** for basic functionality without internet
- **Multi-language support** for diverse senior populations
- **Health monitoring integration** with wearable devices
- **Emergency contact system** with one-touch calling
- **Advanced calendar sync** with Google Calendar and Apple Calendar
- **Customizable themes** for personal preferences
- **Voice training** for improved recognition accuracy

## 📱 Browser Compatibility

- **Chrome/Edge**: Full support including text-to-speech and voice recognition
- **Firefox**: Full support including text-to-speech and voice recognition
- **Safari**: Full support including text-to-speech and voice recognition
- **Mobile browsers**: Responsive design support with touch-optimized interface
- **Screen readers**: Compatible with NVDA, JAWS, and VoiceOver
- **Keyboard navigation**: Full accessibility support for motor-impaired users

## 🎯 Component Overview

### ChatInterface.tsx

AI-powered chat interface with text-to-speech functionality and natural language reminder creation.

### ReminderSystem.tsx

Complete to-do and reminder management system with voice-activated creation and visual completion tracking.

### CalendarComponent.tsx

Monthly calendar view with event visualization, birthday tracking, and appointment management.

### DailyAssistantComponent.tsx

Comprehensive daily dashboard featuring weather, meal planning, home maintenance reminders, and common locations.

### Voice Navigation System

Universal speech recognition integrated throughout the application for hands-free operation and accessibility.

## 🤝 Contributing

This is a take-home assessment project for FORTif.ai demonstrating modern web development practices for senior-friendly applications. For production use, consider:

- Adding proper error handling and logging
- Implementing user authentication and profiles
- Adding comprehensive testing (unit, integration, e2e)
- Setting up CI/CD pipelines and automated deployment
- Adding monitoring, analytics, and performance optimization
- Implementing data persistence and backup systems
- Adding security measures and data privacy compliance
- Creating comprehensive documentation and user guides

## 📄 License

MIT License - Feel free to use for learning and development purposes.

---

**Built with ❤️ for senior citizens and their families**

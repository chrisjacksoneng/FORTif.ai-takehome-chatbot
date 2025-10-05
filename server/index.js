const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const cron = require('node-cron');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize AI - Try Groq first (free), fallback to OpenAI
let aiClient;
let useGroq = false;

if (process.env.GROQ_API_KEY) {
  aiClient = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });
  useGroq = true;
  console.log('🤖 Using Groq AI (Free tier - 6,000 requests/day)');
}


// Store for reminders (in production, use a database)
let reminders = [];

// Senior-friendly prompts for the AI
const SYSTEM_PROMPT = `You are a helpful AI assistant designed specifically for senior citizens. Your responses should be:

1. Clear and simple language
2. Professional and respectful (never use terms like "sweetie", "dear", or "honey")
3. Avoid complex medical advice
4. Focus on daily living assistance
5. Be warm but professional
6. Keep responses SHORT and concise - maximum 2 sentences
7. Ask only ONE question at a time, never multiple questions
8. Get straight to the point

You can help with:
- Daily reminders and scheduling
- Simple explanations of technology
- General questions about health and wellness
- Memory assistance
- Social connection topics
- Basic problem-solving

Always maintain a respectful, professional tone. Keep responses brief and focused.`;

// Fallback responses when AI is not available
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm your AI assistant. I'm here to help with your daily needs. How can I assist you today?";
  }
  
  if (lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
    return "I can help you set up medication reminders. Please use the Reminders tab to create a reminder for taking your medications at the right time.";
  }
  
  if (lowerMessage.includes('appointment') || lowerMessage.includes('doctor')) {
    return "I can help you remember appointments. Use the Reminders tab to add your doctor's appointments or other important events.";
  }
  
  if (lowerMessage.includes('technology') || lowerMessage.includes('computer')) {
    return "I'm here to help explain technology in simple terms. Feel free to ask me about using your computer, phone, or other devices.";
  }
  
  if (lowerMessage.includes('health') || lowerMessage.includes('wellness')) {
    return "I can provide general wellness information, but always consult with your healthcare provider for medical advice.";
  }
  
  return "I'm here to help! I can assist with reminders, explain technology, answer general questions, and provide support for daily living. What would you like to know?";
}

// Function to parse reminder from natural language
function parseReminderFromText(text) {
  const lowerText = text.toLowerCase();
  
  // Check if user wants to add a reminder
  if (!lowerText.includes('reminder') && !lowerText.includes('remind me')) {
    return null;
  }

  // Extract title
  let title = '';
  if (lowerText.includes('groceries') || lowerText.includes('grocery')) {
    title = 'Get groceries';
  } else if (lowerText.includes('medication') || lowerText.includes('medicine')) {
    title = 'Take medication';
  } else if (lowerText.includes('doctor') || lowerText.includes('appointment')) {
    title = 'Doctor appointment';
  } else {
    // Try to extract title from the text
    const titleMatch = text.match(/remind me to (.+?)(?:\s+for|\s+at|\s+on|$)/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
  }

  // Extract date
  let date = '';
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  if (lowerText.includes('tomorrow')) {
    date = tomorrow.toISOString().split('T')[0];
  } else if (lowerText.includes('today')) {
    date = today.toISOString().split('T')[0];
  } else if (lowerText.includes('monday') || lowerText.includes('tuesday') || lowerText.includes('wednesday') || 
             lowerText.includes('thursday') || lowerText.includes('friday') || lowerText.includes('saturday') || 
             lowerText.includes('sunday')) {
    // For now, default to tomorrow for weekday mentions
    date = tomorrow.toISOString().split('T')[0];
  }

  // Extract time
  let time = '';
  if (lowerText.includes('noon') || lowerText.includes('12:00')) {
    time = '12:00';
  } else if (lowerText.includes('morning')) {
    time = '09:00';
  } else if (lowerText.includes('afternoon')) {
    time = '14:00';
  } else if (lowerText.includes('evening')) {
    time = '18:00';
  } else {
    // Try to extract time like "3pm", "15:30", etc.
    const timeMatch = text.match(/(\d{1,2}):?(\d{0,2})\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : '';
      
      if (ampm === 'pm' && hours !== 12) {
        hours += 12;
      } else if (ampm === 'am' && hours === 12) {
        hours = 0;
      }
      
      time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }

  // Check if all required fields are present
  const missingFields = [];
  if (!title) missingFields.push('task/title');
  if (!date) missingFields.push('date');
  if (!time) missingFields.push('time');

  if (missingFields.length > 0) {
    return {
      error: `I'd be happy to create a reminder for you! However, I need you to specify the ${missingFields.join(', ')}. Please tell me what you'd like to be reminded about, when (date), and what time.`,
      missingFields
    };
  }

  return {
    title,
    date,
    time,
    description: `Created from chat: "${text}"`
  };
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if user wants to create a reminder
    const reminderData = parseReminderFromText(message);
    let createdReminder = null;
    let reminderError = null;
    
    if (reminderData) {
      if (reminderData.error) {
        // Missing required fields - return error message
        reminderError = reminderData.error;
      } else {
        // Create the reminder
        const reminder = {
          id: Date.now().toString(),
          title: reminderData.title,
          time: reminderData.time,
          date: reminderData.date,
          description: reminderData.description,
          completed: false,
          createdAt: new Date().toISOString()
        };
        
        reminders.push(reminder);
        createdReminder = reminder;
      }
    }

    // Build conversation context
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    let response;
    
    if (aiClient) {
      try {
        const model = useGroq ? "llama-3.1-8b-instant" : "gpt-3.5-turbo";
        const completion = await aiClient.chat.completions.create({
          model: model,
          messages: messages,
          max_tokens: 200,
          temperature: 0.7,
        });
        response = completion.choices[0].message.content;
      } catch (error) {
        console.error('AI API error:', error.message);
        response = getFallbackResponse(message);
      }
    } else {
      response = getFallbackResponse(message);
    }

    // If there's a reminder error, use that as the response
    if (reminderError) {
      response = reminderError;
    }
    // If a reminder was created, modify the response
    else if (createdReminder) {
      const reminderDate = new Date(createdReminder.date).toLocaleDateString();
      const reminderTime = new Date(`2000-01-01T${createdReminder.time}`).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'});
      response = `I've created a reminder for "${createdReminder.title}" on ${reminderDate} at ${reminderTime}. You can see it in the Reminders tab!`;
    }

    res.json({ 
      response,
      timestamp: new Date().toISOString(),
      reminder: createdReminder
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Sorry, I encountered an error. Please try again.' 
    });
  }
});

// Reminders endpoints
app.post('/api/reminders', (req, res) => {
  try {
    const { title, time, date, description } = req.body;
    
    if (!title || !time || !date) {
      return res.status(400).json({ error: 'Title, time, and date are required' });
    }

    const reminder = {
      id: Date.now().toString(),
      title,
      time,
      date,
      description: description || '',
      completed: false,
      createdAt: new Date().toISOString()
    };

    reminders.push(reminder);
    res.json(reminder);
  } catch (error) {
    console.error('Reminder creation error:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

app.get('/api/reminders', (req, res) => {
  res.json(reminders);
});

app.put('/api/reminders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const reminderIndex = reminders.findIndex(r => r.id === id);
    if (reminderIndex === -1) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    reminders[reminderIndex].completed = completed;
    res.json(reminders[reminderIndex]);
  } catch (error) {
    console.error('Reminder update error:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

app.delete('/api/reminders/:id', (req, res) => {
  try {
    const { id } = req.params;
    reminders = reminders.filter(r => r.id !== id);
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Reminder deletion error:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FORTif.ai Chatbot API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('FORTif.ai Senior-Friendly Chatbot API is ready!');
});

module.exports = app;

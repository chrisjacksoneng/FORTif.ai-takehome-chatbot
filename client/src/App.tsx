import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import ReminderSystem from './components/ReminderSystem';
import CalendarComponent from './components/CalendarComponent';
import DailyAssistantComponent from './components/DailyAssistantComponent';

export type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
};

export type Reminder = {
  id: string;
  title: string;
  time: string;
  date: string;
  description: string;
  completed: boolean;
  createdAt: string;
};

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'reminders' | 'calendar' | 'daily-assistant'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isUniversalListening, setIsUniversalListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const universalRecognitionRef = useRef<SpeechRecognition | null>(null);
  const manuallyStoppedRef = useRef(false);

  // Load reminders on component mount
  useEffect(() => {
    fetchReminders();
  }, []);

  // Initialize universal speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      let lastCommandWasNavigation = false;
      
      recognition.onstart = () => {
        console.log('Universal speech recognition started');
        setIsUniversalListening(true);
      };
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('Universal speech recognized:', transcript);
        
        // Check if it's a navigation, reminder, or calendar command before processing
        const isNavigationCommand = transcript.includes('reminder') || transcript.includes('reminders') || 
          transcript.includes('todo') || transcript.includes('to-do') || transcript.includes('to do') ||
          transcript.includes('chat') || transcript.includes('conversation') || transcript.includes('talk') ||
          transcript.includes('calendar') || transcript.includes('schedule') ||
          transcript.includes('daily') || transcript.includes('assistant') || transcript.includes('home') ||
          (transcript.includes('go to') || transcript.includes('switch to') || transcript.includes('change to'));
        
        const isReminderCommand = transcript.includes('remind me') || transcript.includes('add reminder') || transcript.includes('create reminder') || transcript.includes('reminder');
        const isCalendarCommand = transcript.includes('add event') || transcript.includes('schedule event') || transcript.includes('add to calendar');
        
        console.log('Command detection:', { isNavigationCommand, isReminderCommand, isCalendarCommand });
        
        lastCommandWasNavigation = isNavigationCommand || isReminderCommand || isCalendarCommand;
        
        processVoiceCommand(transcript);
        
        // For navigation, reminder, or calendar commands, don't change the listening state here
        // The onend handler will handle restarting
        if (!isNavigationCommand && !isReminderCommand && !isCalendarCommand) {
          console.log('No recognized command - stopping universal mic');
          setIsUniversalListening(false);
        } else {
          console.log('Command detected - will restart listening in onend');
        }
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Universal speech recognition error:', event.error);
        setIsUniversalListening(false);
        
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access and try again.');
        } else if (event.error === 'no-speech') {
          alert('No speech detected. Please try again.');
        } else {
          alert(`Speech recognition error: ${event.error}`);
        }
      };
      
      recognition.onend = () => {
        console.log('Universal speech recognition ended');
        
        // If manually stopped, don't restart
        if (manuallyStoppedRef.current) {
          console.log('Manually stopped - not restarting');
          manuallyStoppedRef.current = false;
          return;
        }
        
        // If the last command was navigation, restart listening
        if (lastCommandWasNavigation) {
          console.log('Restarting universal mic after navigation command');
          setTimeout(() => {
            try {
              if (universalRecognitionRef.current) {
                console.log('Starting universal recognition again');
                universalRecognitionRef.current.start();
                // Keep the listening state as true since we're restarting
              }
            } catch (error) {
              console.error('Failed to restart universal recognition:', error);
              setIsUniversalListening(false);
            }
          }, 500);
        } else {
          setIsUniversalListening(false);
        }
      };
      
      universalRecognitionRef.current = recognition;
    } else {
      console.log('Speech recognition not supported in this browser');
      setSpeechSupported(false);
    }
    
    return () => {
      if (universalRecognitionRef.current) {
        universalRecognitionRef.current.stop();
      }
    };
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/reminders');
      if (response.ok) {
        const data = await response.json();
        setReminders(data);
      }
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
    }
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const addReminder = (reminder: Reminder) => {
    setReminders(prev => [...prev, reminder]);
  };

  const updateReminder = (id: string, completed: boolean) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id ? { ...reminder, completed } : reminder
      )
    );
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const processVoiceCommand = async (transcript: string) => {
    console.log('Processing voice command:', transcript);
    
    let isNavigationCommand = false;
    let isReminderCommand = false;
    let isCalendarCommand = false;
    
    // Check for reminder creation commands
    if (transcript.includes('remind me') || transcript.includes('add reminder') || transcript.includes('create reminder') || transcript.includes('reminder')) {
      isReminderCommand = true;
      console.log('Reminder creation command detected:', transcript);
      
      try {
        // Send to chat API to process reminder creation
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: transcript,
            conversationHistory: []
          }),
        });
        
        const data = await response.json();
        console.log('Server response:', data);
        
        if (data.reminder) {
          // Add the reminder to state
          setReminders(prev => [...prev, data.reminder]);
          console.log('Reminder created and added to state:', data.reminder);
          
          // Speak the confirmation
          if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(data.response);
            utterance.rate = 1.3;
            utterance.pitch = 1.15;
            utterance.volume = 0.95;
            window.speechSynthesis.speak(utterance);
          }
        } else {
          console.log('No reminder created. Server response:', data.response);
          // Speak the response (which might be an error message)
          if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(data.response);
            utterance.rate = 1.3;
            utterance.pitch = 1.15;
            utterance.volume = 0.95;
            window.speechSynthesis.speak(utterance);
          }
        }
      } catch (error) {
        console.error('Failed to create reminder:', error);
        alert('Failed to create reminder. Please try again.');
      }
    }
    
    // Check for calendar event creation commands
    else if (transcript.includes('add event') || transcript.includes('schedule event') || transcript.includes('add to calendar')) {
      isCalendarCommand = true;
      console.log('Calendar event creation command detected');
      
      try {
        // Send to chat API to process calendar event creation
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: transcript,
            conversationHistory: []
          }),
        });
        
        const data = await response.json();
        
        // Speak the response
        if (window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(data.response);
          utterance.rate = 1.3;
          utterance.pitch = 1.15;
          utterance.volume = 0.95;
          window.speechSynthesis.speak(utterance);
        }
      } catch (error) {
        console.error('Failed to create calendar event:', error);
        alert('Failed to create calendar event. Please try again.');
      }
    }
    
    // Navigation commands
    else if (transcript.includes('reminder') || transcript.includes('reminders') || transcript.includes('todo') || transcript.includes('to-do') || transcript.includes('to do')) {
      setActiveTab('reminders');
      console.log('Navigating to to-do page');
      isNavigationCommand = true;
    }
    
    else if (transcript.includes('chat') || transcript.includes('conversation') || transcript.includes('talk')) {
      setActiveTab('chat');
      console.log('Navigating to chat page');
      isNavigationCommand = true;
    }
    
    else if (transcript.includes('calendar') || transcript.includes('schedule')) {
      setActiveTab('calendar');
      console.log('Navigating to calendar page');
      isNavigationCommand = true;
    }
    
    else if (transcript.includes('daily') || transcript.includes('assistant') || transcript.includes('home')) {
      setActiveTab('daily-assistant');
      console.log('Navigating to daily assistant page');
      isNavigationCommand = true;
    }
    
    // General navigation phrases
    else if (transcript.includes('go to') || transcript.includes('switch to') || transcript.includes('change to')) {
      if (transcript.includes('reminder') || transcript.includes('todo') || transcript.includes('to-do') || transcript.includes('to do')) {
        setActiveTab('reminders');
        console.log('Navigating to to-do page');
      } else if (transcript.includes('chat')) {
        setActiveTab('chat');
        console.log('Navigating to chat page');
      } else if (transcript.includes('calendar')) {
        setActiveTab('calendar');
        console.log('Navigating to calendar page');
      } else if (transcript.includes('daily') || transcript.includes('assistant') || transcript.includes('home')) {
        setActiveTab('daily-assistant');
        console.log('Navigating to daily assistant page');
      }
      isNavigationCommand = true;
    }
    
    // For navigation, reminder, or calendar commands, keep the universal mic active
    if (isNavigationCommand || isReminderCommand || isCalendarCommand) {
      console.log('Command processed - keeping universal mic active');
      return;
    }
    
    // Show help for unrecognized commands
    console.log('Voice command not recognized:', transcript);
    alert(`Command not recognized: "${transcript}". Try saying "remind me to...", "go to reminders", "switch to chat", "go to calendar", or "open daily assistant".`);
  };

  const startUniversalListening = () => {
    if (universalRecognitionRef.current && !isUniversalListening) {
      try {
        universalRecognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start universal speech recognition:', error);
        alert('Failed to start speech recognition. Please try again.');
      }
    }
  };

  const stopUniversalListening = () => {
    if (universalRecognitionRef.current && isUniversalListening) {
      console.log('Stopping universal listening');
      // Set flag to prevent auto-restart
      manuallyStoppedRef.current = true;
      universalRecognitionRef.current.stop();
      setIsUniversalListening(false);
    }
  };

  return (
    <div className="App">
      {/* Left Sidebar */}
      <div className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <img 
            src="https://media.licdn.com/dms/image/v2/C4E0BAQHGK7Z0TZl0dw/company-logo_200_200/company-logo_200_200/0/1658552911662/wat_ai_logo?e=1762387200&v=beta&t=uAT4IVtcpRA7xgh-e3ei5wRtyXnFzmazce0Y3oDrGYQ" 
            alt="WAT.ai Logo" 
            className="logo-image"
          />
          <span className="logo-text">FORTif.ai</span>
        </div>

        {/* Navigation Tabs */}
        <div className="sidebar-nav">
          <button 
            className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <span className="nav-icon">💬</span>
            <span className="nav-text">Chat</span>
          </button>
          
          <button 
            className={`nav-tab ${activeTab === 'reminders' ? 'active' : ''}`}
            onClick={() => setActiveTab('reminders')}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">To-Do</span>
          </button>
          
          
          <button 
            className={`nav-tab ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-text">Calendar</span>
          </button>
          
          <button 
            className={`nav-tab ${activeTab === 'daily-assistant' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily-assistant')}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Daily Assistant</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="user-profile">
          <div className="user-avatar">
            <span>JD</span>
          </div>
          <div className="user-info">
            <div className="user-name">John Doe</div>
            <div className="user-email">johndoe@gmail.com</div>
          </div>
          <div className="user-menu">
            <span>⋮</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Universal Header with Microphone */}
                <div className="universal-header">
                  <div className="universal-header-content">
                    <h1>
                      {activeTab === 'chat' ? 'FORTiFriend' : 
                       activeTab === 'reminders' ? '📋 To-Do' :
                       activeTab === 'calendar' ? '📅 Calendar' :
                       activeTab === 'daily-assistant' ? '🏠 Daily Assistant' : 'FORTiFriend'}
                    </h1>
                    {speechSupported && (
                      <button
                        onClick={isUniversalListening ? stopUniversalListening : startUniversalListening}
                        className={`universal-mic-button ${isUniversalListening ? 'listening' : ''}`}
                        title={isUniversalListening ? 'Stop listening' : 'Start voice navigation'}
                        aria-label={isUniversalListening ? 'Stop listening' : 'Start voice navigation'}
                      >
                        {isUniversalListening ? '🛑' : '🎤'}
                      </button>
                    )}
                  </div>
          {isUniversalListening && (
            <div className="universal-listening-indicator">
              <span className="listening-dot"></span>
              <span>Listening for navigation commands...</span>
            </div>
          )}
        </div>

        {activeTab === 'chat' && (
          <div className="chat-panel">
            <ChatInterface 
              messages={messages}
              onAddMessage={addMessage}
            />
          </div>
        )}
        
        {activeTab === 'reminders' && (
          <ReminderSystem 
            reminders={reminders}
            onAddReminder={addReminder}
            onUpdateReminder={updateReminder}
            onDeleteReminder={deleteReminder}
            onRefreshReminders={fetchReminders}
          />
        )}


        {activeTab === 'calendar' && (
          <div className="calendar-panel">
            <CalendarComponent />
          </div>
        )}

        {activeTab === 'daily-assistant' && (
          <div className="daily-assistant-panel">
            <DailyAssistantComponent />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

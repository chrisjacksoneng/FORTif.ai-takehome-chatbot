import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../App';
import axios from 'axios';

interface ChatInterfaceProps {
  messages: Message[];
  onAddMessage: (message: Message) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onAddMessage }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synth = window.speechSynthesis;
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const noSpeechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setSpeechSupported(true);
      
      // Main recognition for chat
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        
        // Set timeout to turn off microphone after 30 seconds of no speech
        noSpeechTimeoutRef.current = setTimeout(() => {
          console.log('No speech detected for 30 seconds - turning off microphone');
          if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
          }
          setIsListening(false);
        }, 30000);
      };
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const rawTranscript = event.results[0][0].transcript;
        const transcript = rawTranscript.toLowerCase();
        
        console.log('Speech recognized:', rawTranscript);
        
        // Check for microphone control commands
        if (transcript.includes('microphone on') || transcript.includes('mic on') || transcript.includes('start microphone')) {
          console.log('Microphone on command detected');
          if (!isListening) {
            startListening();
          }
          return; // Don't process as a chat message
        }
        
        if (transcript.includes('microphone off') || transcript.includes('mic off') || transcript.includes('stop microphone')) {
          console.log('Microphone off command detected');
          if (isListening) {
            stopListening();
          }
          return; // Don't process as a chat message
        }
        
        // If user starts talking while bot is speaking, stop the bot
        if (isSpeaking && rawTranscript.trim()) {
          console.log('User interrupting bot speech');
          stopSpeaking();
          return; // Don't process the transcript yet, just stop the bot
        }
        
        // Clear the no-speech timeout since speech was detected
        if (noSpeechTimeoutRef.current) {
          clearTimeout(noSpeechTimeoutRef.current);
          noSpeechTimeoutRef.current = null;
        }
        
        // Process the transcript and auto-send
        if (rawTranscript.trim()) {
          console.log('Processing transcript:', rawTranscript);
          // Capitalize the first letter of the message
          const capitalizedTranscript = rawTranscript.charAt(0).toUpperCase() + rawTranscript.slice(1);
          setInputMessage(capitalizedTranscript);
          setIsListening(false);
          
          // Auto-send the message after speech recognition
          setTimeout(() => {
            console.log('Auto-sending message:', capitalizedTranscript);
            // Trigger form submission by clicking the send button
            const sendButton = document.querySelector('.send-button') as HTMLButtonElement;
            console.log('Send button found:', !!sendButton, 'Disabled:', sendButton?.disabled);
            if (sendButton && !sendButton.disabled) {
              console.log('Clicking send button');
              sendButton.click();
            } else {
              console.log('Send button not available or disabled');
            }
          }, 500);
        }
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          console.log('Speech recognition not allowed - this is normal');
          // Don't show alert, just log the error
        } else if (event.error === 'no-speech') {
          console.log('No speech detected - turning off microphone');
          // Just turn off the microphone without showing alert
        } else if (event.error === 'aborted') {
          console.log('Speech recognition aborted - this is normal');
          // Don't show alert for aborted errors
        } else {
          console.log('Speech recognition error:', event.error);
          // Don't show alert for other errors either
        }
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        
        // Clear the no-speech timeout
        if (noSpeechTimeoutRef.current) {
          clearTimeout(noSpeechTimeoutRef.current);
          noSpeechTimeoutRef.current = null;
        }
      };
      
      recognitionRef.current = recognition;
    } else {
      console.log('Speech recognition not supported in this browser');
      setSpeechSupported(false);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    onAddMessage(userMessage);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await axios.post('/api/chat', {
        message: inputMessage,
        conversationHistory
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.response,
        isUser: false,
        timestamp: response.data.timestamp
      };

      onAddMessage(assistantMessage);
      
      // Automatically speak the response for senior accessibility
      speakText(response.data.response);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date().toISOString()
      };
      onAddMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (!synth) {
      alert('Text-to-speech is not supported in your browser. Please try Chrome, Firefox, or Edge.');
      return;
    }

    console.log('Starting speech for:', text.substring(0, 50) + '...');

    // Cancel any ongoing speech and wait a moment
    synth.cancel();
    
    // Small delay to ensure previous speech is fully cancelled
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.3; // Faster pace
      utterance.pitch = 1.15; // Higher pitch for more expressive tone
      utterance.volume = 0.95; // Clear volume
      
      // Wait for voices to load if they haven't yet
      const speakWithVoice = () => {
        const voices = synth.getVoices();
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang}) - ${v.default ? 'default' : 'not default'}`));
        
        // Force voice list refresh if needed
        if (voices.length === 0) {
          console.log('No voices loaded, forcing refresh...');
          synth.getVoices(); // This triggers voice loading
          setTimeout(speakWithVoice, 100);
          return;
        }
        
        // Look for natural, expressive voices first
        let preferredVoice = voices.find(voice => 
          voice.name.includes('Neural') ||
          voice.name.includes('Natural') ||
          voice.name.includes('Enhanced') ||
          voice.name.includes('Premium') ||
          voice.name.includes('Samantha') ||
          voice.name.includes('Karen') ||
          voice.name.includes('Victoria') ||
          voice.name.includes('Susan') ||
          voice.name.includes('Zira') ||
          voice.name.includes('Hazel')
        );
        
        // Try Google or Microsoft high-quality voices
        if (!preferredVoice) {
          preferredVoice = voices.find(voice => 
            voice.name.includes('Google') && voice.name.includes('US') ||
            voice.name.includes('Microsoft') && voice.name.includes('US') ||
            voice.name.includes('Azure') ||
            voice.name.includes('WaveNet')
          );
        }
        
        // Fallback to any female voice
        if (!preferredVoice) {
          preferredVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('woman') ||
            voice.name.toLowerCase().includes('girl')
          );
        }
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
          console.log('Using voice:', preferredVoice.name);
        } else if (voices.length > 0) {
          utterance.voice = voices[0];
          console.log('Using default voice:', voices[0].name);
        }

        // Add slight pitch variation to reduce monotone
        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            // Slight pitch variation every few words to sound more natural
            const variation = Math.random() * 0.1 - 0.05; // ±0.05 pitch variation
            utterance.pitch = Math.max(1.0, Math.min(1.3, 1.15 + variation));
          }
        };

        utterance.onstart = () => {
          console.log('Speech started successfully');
          setIsSpeaking(true);
        };
        utterance.onend = () => {
          console.log('Speech ended');
          setIsSpeaking(false);
          
          // Auto-start microphone when bot finishes speaking
          setTimeout(() => {
            console.log('Auto-starting microphone after bot speech, current state:', { isListening, isSpeaking });
            if (!isListening) {
              console.log('Starting microphone...');
              startListening();
            } else {
              console.log('Microphone already listening');
            }
          }, 500); // Slightly longer delay to ensure speech is fully finished
        };
        utterance.onerror = (event) => {
          console.error('Speech error:', event.error);
          if (event.error === 'interrupted') {
            console.log('Speech was interrupted - this is normal when cancelling');
            setIsSpeaking(false);
          } else if (event.error === 'not-allowed') {
            console.log('Speech not allowed - this is normal in some browsers');
            setIsSpeaking(false);
          } else {
            console.log('Speech error:', event.error);
            setIsSpeaking(false);
          }
        };

        try {
          synth.speak(utterance);
        } catch (error) {
          console.error('Failed to start speech:', error);
          console.log('Speech synthesis failed - this may be normal');
          setIsSpeaking(false);
        }
      };

      // If voices are already loaded, speak immediately
      if (synth.getVoices().length > 0) {
        speakWithVoice();
      } else {
        // Wait for voices to load
        synth.onvoiceschanged = speakWithVoice;
      }
    }, 100); // 100ms delay
  };

  const stopSpeaking = () => {
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    console.log('startListening called, current state:', { isListening, hasRecognition: !!recognitionRef.current });
    if (recognitionRef.current && !isListening) {
      try {
        // Stop any ongoing speech when starting to listen
        if (isSpeaking) {
          console.log('Stopping speech before starting listening');
          stopSpeaking();
        }
        
        console.log('Starting speech recognition...');
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        console.log('Speech recognition failed - this may be normal');
      }
    } else {
      console.log('Cannot start listening:', { hasRecognition: !!recognitionRef.current, isListening });
    }
  };

  const stopListening = () => {
    console.log('stopListening called');
    if (recognitionRef.current && isListening) {
      console.log('Stopping speech recognition...');
      recognitionRef.current.stop();
    }
    
    // Clear the no-speech timeout
    if (noSpeechTimeoutRef.current) {
      clearTimeout(noSpeechTimeoutRef.current);
      noSpeechTimeoutRef.current = null;
    }
    
    // Update state immediately
    setIsListening(false);
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      // This would need to be implemented in the parent component
      window.location.reload(); // Simple solution for demo
    }
  };

  return (
    <div className="chat-container">
      {/* Chat Messages Area */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-center">
            <div className="pre-prompts">
              <h2>Hi! How can I help you today?</h2>
              <div className="prompt-grid">
                <div className="prompt-card">
                  <div className="prompt-icon">📅</div>
                  <div className="prompt-text">Scheduling & Reminders</div>
                </div>
                <div className="prompt-card">
                  <div className="prompt-icon">💻</div>
                  <div className="prompt-text">Technology Help</div>
                </div>
                <div className="prompt-card">
                  <div className="prompt-icon">🏥</div>
                  <div className="prompt-text">Health & Wellness</div>
                </div>
                <div className="prompt-card">
                  <div className="prompt-icon">🧠</div>
                  <div className="prompt-text">Memory Assistance</div>
                </div>
                <div className="prompt-card">
                  <div className="prompt-icon">👥</div>
                  <div className="prompt-text">Social Connection</div>
                </div>
                <div className="prompt-card">
                  <div className="prompt-icon">🔧</div>
                  <div className="prompt-text">Problem Solving</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.isUser ? 'user' : 'assistant'}`}
          >
            <div className="message-text">{message.text}</div>
            {!message.isUser && (
              <button
                onClick={() => speakText(message.text)}
                className="speak-button"
                disabled={isSpeaking}
              >
                🔊 {isSpeaking ? 'Speaking...' : 'Speak'}
              </button>
            )}
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="loading">
              <p>Loading...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Area */}
      <div className="chat-input">
        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-container">
            {speechSupported && (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
                className={`mic-button ${isListening ? 'listening' : ''}`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? '🛑' : '🎤'}
              </button>
            )}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={messages.length === 0 ? "Start the conversation..." : "Continue the conversation..."}
              disabled={isLoading || isListening}
              autoComplete="off"
              aria-label="Chat message input"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim() || isListening}
              className="send-button"
            >
              Send
            </button>
          </div>
        </form>
        {isListening && (
          <div className="listening-indicator">
            <span className="listening-dot"></span>
            <span>Listening... Speak now</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;

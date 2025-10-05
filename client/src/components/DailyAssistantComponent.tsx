import React, { useState, useEffect } from 'react';

interface WeatherData {
  temperature: number;
  condition: string;
  clothing: string[];
  icon: string;
}

interface MealSuggestion {
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  ingredients: string[];
  prepTime: string;
}

interface MaintenanceReminder {
  id: string;
  task: string;
  frequency: string;
  lastDone: string;
  due: boolean;
}

interface TransportationOption {
  id: string;
  type: string;
  time: string;
  destination: string;
  contact: string;
}

const DailyAssistantComponent: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 22,
    condition: 'Partly Cloudy',
    clothing: ['Light jacket', 'Comfortable shoes'],
    icon: '⛅'
  });

  const [mealSuggestions] = useState<MealSuggestion[]>([
    {
      name: 'Oatmeal with Berries',
      type: 'breakfast',
      ingredients: ['Oats', 'Blueberries', 'Milk', 'Honey'],
      prepTime: '5 minutes'
    },
    {
      name: 'Chicken Soup',
      type: 'lunch',
      ingredients: ['Chicken breast', 'Vegetables', 'Broth', 'Rice'],
      prepTime: '20 minutes'
    },
    {
      name: 'Baked Salmon',
      type: 'dinner',
      ingredients: ['Salmon fillet', 'Lemon', 'Herbs', 'Sweet potato'],
      prepTime: '25 minutes'
    }
  ]);

  const [maintenanceReminders] = useState<MaintenanceReminder[]>([
    {
      id: '1',
      task: 'Check smoke detector batteries',
      frequency: 'Monthly',
      lastDone: '2024-12-15',
      due: true
    },
    {
      id: '2',
      task: 'Clean air filters',
      frequency: 'Every 3 months',
      lastDone: '2024-11-01',
      due: true
    },
    {
      id: '3',
      task: 'Test carbon monoxide detector',
      frequency: 'Monthly',
      lastDone: '2024-12-20',
      due: false
    }
  ]);

  const [transportationOptions] = useState<TransportationOption[]>([
    {
      id: '1',
      type: 'Doctor Appointment',
      time: '2:00 PM',
      destination: '123 Oak Street Medical Center',
      contact: '555-0123'
    },
    {
      id: '2',
      type: 'Grocery Shopping',
      time: '10:00 AM',
      destination: '456 Maple Avenue Supermarket',
      contact: '555-0456'
    },
    {
      id: '3',
      type: 'Community Center',
      time: '1:00 PM',
      destination: '789 Pine Street Senior Center',
      contact: '555-0789'
    }
  ]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="daily-assistant-container">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h2>Good morning! Here's your daily overview</h2>
        <p className="current-time">{getCurrentTime()}</p>
        <p className="current-date">{getCurrentDate()}</p>
      </div>

      {/* Weather Section */}
      <div className="assistant-section">
        <h3>🌤️ Today's Weather</h3>
        <div className="weather-card">
          <div className="weather-main">
            <span className="weather-icon">{weather.icon}</span>
            <div className="weather-info">
              <span className="temperature">{weather.temperature}°C</span>
              <span className="condition">{weather.condition}</span>
            </div>
          </div>
          <div className="clothing-suggestions">
            <h4>Suggested Clothing:</h4>
            <ul>
              {weather.clothing.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Meal Planning Section */}
      <div className="assistant-section">
        <h3>🍽️ Today's Meal Suggestions</h3>
        <div className="meal-grid">
          {mealSuggestions.map((meal, index) => (
            <div key={index} className="meal-card">
              <h4>{meal.name}</h4>
              <p className="meal-type">{meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}</p>
              <p className="prep-time">⏱️ {meal.prepTime}</p>
              <div className="ingredients">
                <strong>Ingredients:</strong>
                <ul>
                  {meal.ingredients.map((ingredient, idx) => (
                    <li key={idx}>{ingredient}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Home Maintenance Section */}
      <div className="assistant-section">
        <h3>🏠 Home Maintenance Reminders</h3>
        <div className="maintenance-list">
          {maintenanceReminders.map((reminder) => (
            <div key={reminder.id} className={`maintenance-item ${reminder.due ? 'due' : ''}`}>
              <div className="maintenance-info">
                <h4>{reminder.task}</h4>
                <p>Frequency: {reminder.frequency}</p>
                <p>Last done: {reminder.lastDone}</p>
              </div>
              {reminder.due && (
                <div className="due-indicator">
                  <span>⚠️ Due</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Common Locations Section */}
      <div className="assistant-section">
        <h3>🚗 Common Locations</h3>
        <div className="transportation-list">
          {transportationOptions.map((option) => (
            <div key={option.id} className="transportation-item">
              <div className="transport-info">
                <h4>{option.type}</h4>
                <p>📍 {option.destination}</p>
                <p>📞 {option.contact}</p>
              </div>
              <button className="call-button">Call</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyAssistantComponent;

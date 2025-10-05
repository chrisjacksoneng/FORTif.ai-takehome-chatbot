import React, { useState } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'birthday' | 'reminder' | 'appointment';
}

const CalendarComponent: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Sample events for demonstration
  const sampleEvents: { [key: string]: CalendarEvent[] } = {
    '1': [
      { id: '1', title: "Chris's Birthday", type: 'birthday' },
      { id: '2', title: 'Doctor Appointment', type: 'appointment' }
    ],
    '3': [
      { id: '3', title: "John's Birthday", type: 'birthday' }
    ],
    '7': [
      { id: '4', title: 'Take Medication', type: 'reminder' },
      { id: '5', title: "Sarah's Birthday", type: 'birthday' }
    ],
    '12': [
      { id: '6', title: 'Grocery Shopping', type: 'reminder' }
    ],
    '13': [
      { id: '15', title: 'Thanksgiving', type: 'reminder' }
    ],
    '15': [
      { id: '7', title: "Mike's Birthday", type: 'birthday' },
      { id: '8', title: 'Dentist Appointment', type: 'appointment' }
    ],
    '18': [
      { id: '9', title: 'Call Family', type: 'reminder' }
    ],
    '22': [
      { id: '10', title: "Emma's Birthday", type: 'birthday' }
    ],
    '25': [
      { id: '12', title: 'Family Dinner', type: 'reminder' }
    ],
    '28': [
      { id: '13', title: 'Take Medication', type: 'reminder' }
    ],
    '30': [
      { id: '14', title: "Tom's Birthday", type: 'birthday' }
    ]
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };


  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    const isCurrentMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="calendar-day empty"></div>
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today.getDate();
      const dayEvents = sampleEvents[day.toString()] || [];
      
      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
        >
          <div className="day-number">{day}</div>
          {dayEvents.length > 0 && (
            <div className="day-events">
              {dayEvents.slice(0, 2).map(event => (
                <div 
                  key={event.id} 
                  className={`event-item ${event.type}`}
                  title={event.title}
                >
                  <span className="event-icon">
                    {event.title === 'Thanksgiving' ? '🦃' : 
                     event.type === 'birthday' ? '🎂' : 
                     event.type === 'appointment' ? '🏥' : '📋'}
                  </span>
                  <span className="event-text">{event.title}</span>
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="more-events">+{dayEvents.length - 2} more</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-wrapper">
        {/* Calendar Navigation */}
        <div className="calendar-navigation">
          <button onClick={goToPreviousMonth} className="nav-button">
            ← Previous
          </button>
          <div className="current-month">
            <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          </div>
          <button onClick={goToNextMonth} className="nav-button">
            Next →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {/* Day Headers */}
          <div className="calendar-weekdays">
            {dayNames.map(day => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="calendar-days">
            {renderCalendar()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;

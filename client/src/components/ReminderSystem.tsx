import React, { useState } from 'react';
import { Reminder } from '../App';
import axios from 'axios';

interface ReminderSystemProps {
  reminders: Reminder[];
  onAddReminder: (reminder: Reminder) => void;
  onUpdateReminder: (id: string, completed: boolean) => void;
  onDeleteReminder: (id: string) => void;
  onRefreshReminders: () => void;
}

const ReminderSystem: React.FC<ReminderSystemProps> = ({
  reminders,
  onAddReminder,
  onUpdateReminder,
  onDeleteReminder,
  onRefreshReminders
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    time: '',
    date: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.time || !formData.date) {
      alert('Please fill in all required fields (Title, Time, Date)');
      return;
    }

    try {
      const response = await axios.post('/api/reminders', formData);
      onAddReminder(response.data);
      setFormData({ title: '', time: '', date: '', description: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create reminder:', error);
      alert('Failed to create reminder. Please try again.');
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await axios.put(`/api/reminders/${id}`, { completed });
      onUpdateReminder(id, completed);
    } catch (error) {
      console.error('Failed to update reminder:', error);
      alert('Failed to update reminder. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await axios.delete(`/api/reminders/${id}`);
        onDeleteReminder(id);
      } catch (error) {
        console.error('Failed to delete reminder:', error);
        alert('Failed to delete reminder. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const upcomingReminders = reminders.filter(r => !r.completed);
  const completedReminders = reminders.filter(r => r.completed);

  return (
    <div className="content-area" id="reminders-panel" role="tabpanel">
      <div style={{ padding: '20px' }}>
        {!showAddForm ? (
          <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '120px' }}>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
              style={{ fontSize: '1.3rem', padding: '15px 30px' }}
            >
              ➕ Add New Reminder
            </button>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: '30px' }}>
            <h3>Add New Reminder</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="title" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Take morning medication"
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="date" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="time" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Time *
                </label>
                <input
                  type="time"
                  id="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional notes or details..."
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button type="submit" className="btn-primary">
                  ✅ Save Reminder
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary"
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '15px', color: '#2E7D32' }}>
              📅 Upcoming Reminders ({upcomingReminders.length})
            </h3>
            {upcomingReminders.map((reminder) => (
              <div key={reminder.id} className="reminder-item">
                <div style={{ flex: 1 }}>
                  <h4 style={{ marginBottom: '5px', fontSize: '1.3rem' }}>
                    {reminder.title}
                  </h4>
                  <p style={{ marginBottom: '5px', fontSize: '1.1rem' }}>
                    📅 {formatDate(reminder.date)} at {formatTime(reminder.time)}
                  </p>
                  {reminder.description && (
                    <p style={{ fontSize: '1rem', color: '#cccccc' }}>
                      {reminder.description}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => handleToggleComplete(reminder.id, true)}
                    className="btn-primary"
                    style={{ fontSize: '1rem', padding: '8px 12px' }}
                  >
                    ✅ Done
                  </button>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="btn-danger"
                    style={{ fontSize: '1rem', padding: '8px 12px' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completed Reminders */}
        {completedReminders.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '15px', color: '#cccccc' }}>
              ✅ Completed Reminders ({completedReminders.length})
            </h3>
            {completedReminders.map((reminder) => (
              <div key={reminder.id} className="reminder-item reminder-completed">
                <div style={{ flex: 1 }}>
                  <h4 style={{ marginBottom: '5px', fontSize: '1.2rem' }}>
                    {reminder.title}
                  </h4>
                  <p style={{ marginBottom: '5px', fontSize: '1rem' }}>
                    📅 {formatDate(reminder.date)} at {formatTime(reminder.time)}
                  </p>
                  {reminder.description && (
                    <p style={{ fontSize: '0.9rem', color: '#aaaaaa' }}>
                      {reminder.description}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => handleToggleComplete(reminder.id, false)}
                    className="btn-secondary"
                    style={{ fontSize: '1rem', padding: '8px 12px' }}
                  >
                    ↩️ Undo
                  </button>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="btn-danger"
                    style={{ fontSize: '1rem', padding: '8px 12px' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {reminders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#cccccc', marginTop: '60px' }}>
            <p style={{ fontSize: '1.3rem', marginBottom: '10px' }}>
              📝 No reminders yet
            </p>
            <p>Add your first reminder to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderSystem;

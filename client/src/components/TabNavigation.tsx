import React from 'react';

interface TabNavigationProps {
  activeTab: 'chat' | 'reminders';
  onTabChange: (tab: 'chat' | 'reminders') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="tab-navigation" role="tablist">
      <button
        className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
        onClick={() => onTabChange('chat')}
        role="tab"
        aria-selected={activeTab === 'chat'}
        aria-controls="chat-panel"
      >
        💬 Chat Assistant
      </button>
      <button
        className={`tab-button ${activeTab === 'reminders' ? 'active' : ''}`}
        onClick={() => onTabChange('reminders')}
        role="tab"
        aria-selected={activeTab === 'reminders'}
        aria-controls="reminders-panel"
      >
        ⏰ Reminders
      </button>
    </nav>
  );
};

export default TabNavigation;

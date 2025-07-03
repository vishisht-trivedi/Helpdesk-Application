import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

// Toast component for each notification
const icons = {
  success: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#22c55e"/><path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  danger: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#ef4444"/><path d="M15 9l-6 6M9 9l6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
  ),
  warning: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#f59e42"/><path d="M12 7v5m0 4h.01" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
  ),
  info: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#2563eb"/><path d="M12 8h.01M12 12v4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
  ),
};

const NotificationToast = ({ id, message, type, onClose }) => (
  <div
    className={`notification-toast notification-${type}`}
    role="alert"
    aria-live="assertive"
    tabIndex={0}
    onClick={onClose}
  >
    <div className="notification-accent" />
    <div className="notification-icon">{icons[type] || icons.info}</div>
    <div className="notification-message">{message}</div>
    <button className="notification-close" aria-label="Close" onClick={onClose}>&times;</button>
  </div>
);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      <div className="notification-stack">
        {notifications.map((n) => (
          <NotificationToast key={n.id} {...n} onClose={() => removeNotification(n.id)} />
        ))}
      </div>
      {children}
    </NotificationContext.Provider>
  );
};

// Legacy component for direct use (not recommended)
const Notification = ({ message, type }) => {
  if (!message) return null;
  return (
    <div className={`notification-toast notification-${type}`}>{message}</div>
  );
};

export default Notification;

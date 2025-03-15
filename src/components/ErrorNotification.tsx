'use client';

import { useEffect, useState } from 'react';

interface ErrorNotificationProps {
  message: string;
  onClose?: () => void;
  duration?: number;
}

export function ErrorNotification({ 
  message, 
  onClose, 
  duration = 5000 
}: ErrorNotificationProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 200); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div 
      className={`error-notification bg-red-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center justify-between gap-4 ${
        isExiting ? 'error-notification-exit' : ''
      }`}
    >
      <span>{message}</span>
      <button 
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => {
            if (onClose) onClose();
          }, 200);
        }}
        className="text-white hover:text-red-100 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
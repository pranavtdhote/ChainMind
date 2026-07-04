"use client";

import React, { createContext, useContext, useState } from "react";

export interface INotification {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  timestamp: Date;
}

interface NotificationContextType {
  notifications: INotification[];
  addNotification: (message: string, type: INotification["type"]) => void;
  clearNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);

  const addNotification = (message: string, type: INotification["type"]) => {
    const newNotif: INotification = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Automatically remove toast notifications after 5 seconds
    setTimeout(() => {
      clearNotification(newNotif.id);
    }, 5000);
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        clearNotification,
      }}
    >
      {children}
      {/* Absolute container rendering active toast messages */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`pointer-events-auto p-4 rounded-lg shadow-lg border transition-all duration-300 transform translate-y-0 opacity-100 flex items-center justify-between min-w-[300px] max-w-[400px] backdrop-blur-md ${
              notif.type === "success"
                ? "bg-emerald-950/80 border-emerald-500 text-emerald-200"
                : notif.type === "error"
                ? "bg-red-950/80 border-red-500 text-red-200"
                : notif.type === "warning"
                ? "bg-amber-950/80 border-amber-500 text-amber-200"
                : "bg-indigo-950/80 border-indigo-500 text-indigo-200"
            }`}
          >
            <span className="text-sm font-medium">{notif.message}</span>
            <button
              onClick={() => clearNotification(notif.id)}
              className="ml-4 text-xs font-bold hover:opacity-80"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

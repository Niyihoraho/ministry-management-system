"use client";
import React from "react";

export default function NotificationDropdown() {
  // For demo, always show unread
  const hasUnread = true;
  return (
    <button className="w-11 h-11 flex items-center justify-center rounded-full border border-gray-700/30 dark:border-gray-200/10 bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 transition-colors relative">
      {/* Bell icon */}
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-gray-400 dark:text-gray-400"><path d="M18 16v-5a6 6 0 10-12 0v5l-1 2h14l-1-2z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>
      {hasUnread && (
        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white dark:border-gray-900"></span>
      )}
    </button>
  );
} 
'use client';

import React from 'react';
import { Bell, X, Bus, Package, ArrowRight } from 'lucide-react';
import { AppNotification } from '@/lib/useNotifications';

interface NotificationToastProps {
  notification: AppNotification | null;
  onDismiss: () => void;
  onTrackCode: (code: string) => void;
}

export function NotificationToast({
  notification,
  onDismiss,
  onTrackCode,
}: NotificationToastProps) {
  if (!notification) return null;

  const isBus = notification.type.includes('bus');

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 border-2 border-orange-500/70 rounded-2xl shadow-2xl p-4 text-white animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start space-x-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
            isBus
              ? 'bg-orange-500/20 border-orange-500 text-orange-400'
              : 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
          }`}
        >
          {isBus ? <Bus className="w-5 h-5" /> : <Package className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
              Live Checkpoint Alert
            </span>
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-xs font-bold text-white mt-0.5 leading-snug">
            {notification.title}
          </h4>
          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
            {notification.body}
          </p>

          {notification.code && (
            <button
              onClick={() => {
                onTrackCode(notification.code!);
                onDismiss();
              }}
              className="mt-2.5 inline-flex items-center space-x-1 text-xs font-bold text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 px-2.5 py-1 rounded-lg border border-orange-500/30 transition"
            >
              <span>Track {notification.code}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

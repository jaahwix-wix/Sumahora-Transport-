'use client';

import React from 'react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Bus, 
  Package, 
  Sparkles, 
  Volume2, 
  Clock, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { AppNotification } from '@/lib/useNotifications';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: NotificationPermission;
  isSupported: boolean;
  onRequestPermission: () => Promise<string>;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onSendTestNotification: () => void;
  onTrackCode: (code: string) => void;
}

export function NotificationCenterModal({
  isOpen,
  onClose,
  permission,
  isSupported,
  onRequestPermission,
  notifications,
  onMarkAllRead,
  onSendTestNotification,
  onTrackCode,
}: NotificationCenterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Bell className="w-5 h-5 text-white animate-bounce" />
            <div>
              <h3 className="text-base font-black tracking-tight">Real-Time Dispatch Notifications</h3>
              <p className="text-[11px] text-orange-100">
                Web Notifications API &amp; Satellite Checkpoint Alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Permission Status Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Browser Web Notification Status
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  permission === 'granted'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : permission === 'denied'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {permission === 'granted'
                  ? 'System Active'
                  : permission === 'denied'
                  ? 'Permission Blocked'
                  : 'Permission Required'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Receive automatic pop-up alerts and audio chimes the instant your coach reaches cross-border customs or your cargo arrives at a terminal depot.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {permission !== 'granted' && (
                <button
                  onClick={onRequestPermission}
                  className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 shadow"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Enable Browser Notifications</span>
                </button>
              )}

              <button
                onClick={onSendTestNotification}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                <span>Test Checkpoint Alert Sound</span>
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white uppercase tracking-wider">
                Recent Alerts ({notifications.length})
              </span>
              <button
                onClick={onMarkAllRead}
                className="text-orange-400 hover:text-orange-300 font-medium"
              >
                Mark all as read
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-500">
                  No alerts received yet. System monitors active coaches 24/7.
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-xl border transition flex items-start space-x-3 ${
                      n.read
                        ? 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                        : 'bg-slate-950 border-orange-500/40 text-slate-200 shadow-md'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                        n.type.includes('bus')
                          ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                          : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                      }`}
                    >
                      {n.type.includes('bus') ? (
                        <Bus className="w-4 h-4" />
                      ) : (
                        <Package className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                        <span className="text-[10px] text-slate-500 shrink-0 ml-2 font-mono">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">{n.body}</p>

                      {n.code && (
                        <div className="mt-2 flex items-center space-x-2">
                          <button
                            onClick={() => {
                              onTrackCode(n.code!);
                              onClose();
                            }}
                            className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center space-x-1"
                          >
                            <span>Live Track {n.code}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

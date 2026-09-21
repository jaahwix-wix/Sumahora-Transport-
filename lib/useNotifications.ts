'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'bus_checkpoint' | 'bus_arrival' | 'cargo_checkpoint' | 'cargo_arrival' | 'system';
  timestamp: string;
  read: boolean;
  code?: string; // trip id or tracking number
}

// Synthesize pleasant acoustic chime using browser AudioContext
export function playNotificationChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Second higher tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.12); // A5
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.55);
  } catch {
    // AudioContext might be blocked until user gesture, safely ignore
  }
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [isSupported] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window;
  });
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-init-1',
      title: 'ST-802 Atlantic Express Checkpoint Cleared',
      body: 'Scania Coach ST-802 successfully cleared Lomé - Aflao ECOWAS Fast Border. En route to Accra Circle Terminal.',
      type: 'bus_checkpoint',
      timestamp: '10 min ago',
      read: false,
      code: 'ST-802',
    },
    {
      id: 'notif-init-2',
      title: 'Cargo Waybill ST-WB-78924 Manifested',
      body: '42.5 kg Electronics received and sealed in cargo bay at Lagos Trade Fair Mega Station.',
      type: 'cargo_checkpoint',
      timestamp: '25 min ago',
      read: false,
      code: 'ST-WB-78924',
    },
  ]);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      return res;
    } catch {
      return 'denied';
    }
  }, []);

  const notify = useCallback(
    (
      title: string,
      body: string,
      type: AppNotification['type'] = 'system',
      code?: string
    ) => {
      // 1. Play chime
      playNotificationChime();

      // 2. Add to internal state
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title,
        body,
        type,
        timestamp: 'Just now',
        read: false,
        code,
      };

      setNotifications((prev) => [newNotif, ...prev]);

      // 3. Show In-App Toast
      setActiveToast(newNotif);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setActiveToast(null);
      }, 6000);

      // 4. Trigger Web Notifications API if permitted
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          try {
            const nativeNotif = new Notification(`Sumahora Transport: ${title}`, {
              body,
              icon: '/st-logo.svg',
              badge: '/st-logo.svg',
              tag: code || 'st-notification',
            });
            nativeNotif.onclick = () => {
              window.focus();
              nativeNotif.close();
            };
          } catch {
            // Some browsers restrict in iframe
          }
        }
      }
    },
    []
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    isSupported,
    permission,
    requestPermission,
    notifications,
    unreadCount,
    notify,
    markAllAsRead,
    activeToast,
    dismissToast,
  };
}

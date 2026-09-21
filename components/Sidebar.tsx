'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Radio, 
  Bus, 
  Package, 
  CreditCard, 
  Building2, 
  Bell, 
  Search, 
  LogOut, 
  ShieldCheck, 
  Phone, 
  Menu, 
  X, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { CurrencyCode, UserProfile } from '@/lib/types';
import { EXCHANGE_RATES, convertCurrency } from '@/lib/data';
import { STLogo } from './STLogo';

interface SidebarProps {
  activeTab: 'tracking' | 'booking' | 'cargo' | 'billing' | 'depots';
  setActiveTab: (tab: 'tracking' | 'booking' | 'cargo' | 'billing' | 'depots') => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onQuickTrack: (code: string) => void;
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  notificationPermission: NotificationPermission;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  user,
  onOpenAuth,
  onLogout,
  onQuickTrack,
  unreadNotifsCount,
  onOpenNotifications,
  notificationPermission,
}: SidebarProps) {
  const [quickTrackInput, setQuickTrackInput] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackInput.trim()) {
      onQuickTrack(quickTrackInput.trim());
      setQuickTrackInput('');
      setMobileOpen(false);
    }
  };

  const navItems = [
    {
      id: 'tracking' as const,
      label: 'Live Fleet Radar',
      subtitle: 'Track Each Bus & Cargo Location',
      icon: Radio,
      badge: 'Live GPS',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'booking' as const,
      label: 'Bus Booking & Calendar',
      subtitle: 'Route Availability & Visual Calendar',
      icon: Bus,
      badge: '6 Hubs',
      badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    },
    {
      id: 'cargo' as const,
      label: 'Interactive Cargo Calculator',
      subtitle: 'Dynamic Weight & Distance Pricing',
      icon: Package,
      badge: 'Tariff Calc',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    },
    {
      id: 'billing' as const,
      label: 'Activity & Ticket Center',
      subtitle: 'Manage & Print Passenger Tickets',
      icon: CreditCard,
      badge: 'Print Pass',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    {
      id: 'depots' as const,
      label: 'Official Depots & Hubs',
      subtitle: 'Lagos, Accra, Abidjan, Freetown...',
      icon: Building2,
      badge: 'Verified',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-200">
      {/* Brand & Logo Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          {/* Logo matching uploaded image */}
          <STLogo size={46} glow={true} />
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base font-black text-white tracking-tight leading-none">
                SOUL TRANSPORT
              </h1>
            </div>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mt-1">
              &amp; Logistics • West Africa
            </p>
          </div>
        </div>

        {/* Live Satellite status badge */}
        <div className="mt-3.5 flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Starlink Satellite Active
          </span>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
            6 Stations
          </span>
        </div>
      </div>

      {/* Quick Track Search Input */}
      <div className="p-4 pb-2">
        <form onSubmit={handleTrackSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={quickTrackInput}
            onChange={(e) => setQuickTrackInput(e.target.value)}
            placeholder="Quick Track (ST-802, Waybill...)"
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono transition"
          />
        </form>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          System Menu
        </span>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileOpen(false);
              }}
              className={`w-full text-left p-3 rounded-2xl transition flex items-center justify-between group ${
                isActive
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-950/50'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    isActive
                      ? 'bg-white/20 border-white/30 text-white'
                      : 'bg-slate-950 border-slate-800 text-orange-400 group-hover:border-orange-500/40'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate leading-tight">{item.label}</p>
                  <p
                    className={`text-[10px] truncate mt-0.5 ${
                      isActive ? 'text-orange-100' : 'text-slate-400'
                    }`}
                  >
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <span
                className={`text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded border shrink-0 ml-2 ${
                  isActive
                    ? 'bg-black/20 text-white border-white/20'
                    : item.badgeColor
                }`}
              >
                {item.badge}
              </span>
            </button>
          );
        })}

        {/* Real-time Notifications Drawer Item */}
        <div className="pt-2">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Dispatch Alerts
          </span>
          <button
            onClick={() => {
              onOpenNotifications();
              setMobileOpen(false);
            }}
            className="w-full text-left p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-orange-500/50 transition flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center relative">
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Web Alerts</p>
                <p className="text-[10px] text-slate-400">
                  {notificationPermission === 'granted' ? 'Live Push Active' : 'Enable Web Notifications'}
                </p>
              </div>
            </div>
            <span
              className={`text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded border ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {notificationPermission === 'granted' ? 'Push ON' : 'Enable'}
            </span>
          </button>
        </div>

        {/* Currency Switcher */}
        <div className="pt-2">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2.5">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Display Currency
              </span>
              <span className="text-[10px] font-mono text-orange-400">
                {EXCHANGE_RATES[currency].symbol}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(['USD', 'NGN', 'GHS', 'SLE', 'XOF', 'GNF'] as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`py-1 rounded-lg text-[10px] font-bold font-mono transition ${
                    currency === c
                      ? 'bg-orange-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Session Profile & Switcher */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/70">
        {user ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-xl object-cover border border-orange-500/50 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {user.name}
                  </p>
                  <span className="text-[9px] uppercase font-bold text-orange-400 font-mono">
                    {user.role} • {user.country}
                  </span>
                </div>
              </div>

              <button
                onClick={onOpenAuth}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                title="Switch Persona or Role"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>

            {/* Wallet quick balance */}
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Pass Wallet:</span>
              <span className="font-mono font-bold text-emerald-400">
                {convertCurrency(user.walletBalanceUSD, currency).formatted}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-3 rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sign In / Switch Role</span>
          </button>
        )}

        {/* 24/7 Hotline support reminder */}
        <div className="mt-2 text-center">
          <a
            href="tel:+2348032367381"
            className="text-[10px] text-slate-400 hover:text-orange-400 font-mono flex items-center justify-center space-x-1"
          >
            <Phone className="w-3 h-3 text-emerald-400" />
            <span>24/7 Hotline: +234 803 236 7381</span>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Left-Hand Sidebar (Persistent) */}
      <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-30 shadow-2xl">
        {sidebarContent}
      </aside>

      {/* Mobile Top Header with Logo & Hamburger Toggle */}
      <div className="md:hidden sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between text-white shadow-xl">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-xl"
            aria-label="Open Left Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <STLogo size={34} glow={false} />
          <div>
            <h2 className="text-xs font-black tracking-tight leading-none text-white">
              SOUL TRANSPORT
            </h2>
            <p className="text-[9px] text-orange-400 font-bold uppercase mt-0.5">
              West Africa Express
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Notifications icon */}
          <button
            onClick={onOpenNotifications}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white relative"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Quick role button */}
          <button
            onClick={onOpenAuth}
            className="px-2 py-1 rounded-xl bg-orange-600 text-white text-[11px] font-bold flex items-center space-x-1"
          >
            <span>{user ? user.role : 'Login'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out Left Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-slate-800/80 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

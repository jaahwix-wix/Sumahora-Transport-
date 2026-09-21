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
  ChevronDown,
  RefreshCw,
  Calculator,
  ArrowRightLeft
} from 'lucide-react';
import { CurrencyCode, UserProfile } from '@/lib/types';
import { EXCHANGE_RATES, convertCurrency } from '@/lib/data';
import { useExchangeRates } from '@/lib/useExchangeRates';
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

  // Automated Real-Time Exchange Rates & Converter
  const {
    rates,
    isLive,
    loading: ratesLoading,
    lastUpdated,
    source: ratesSource,
    refreshRates,
    convert
  } = useExchangeRates();

  const [isConverterOpen, setIsConverterOpen] = useState(true);
  const [convertAmount, setConvertAmount] = useState<string>('45');
  const [convertFrom, setConvertFrom] = useState<CurrencyCode>('USD');

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
                SUMAHORA TRANSPORT
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

        {/* Enhanced Currency Selector & Automated Exchange Rate Converter */}
        <div className="pt-2">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2.5 shadow-lg">
            {/* Currency Header with Live Indicator & Refresh Trigger */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Currency &amp; Forex
                </span>
                <span 
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    isLive 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}
                  title={ratesSource}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  {isLive ? 'LIVE' : 'PARITY'}
                </span>
              </div>

              <button
                type="button"
                id="sidebar-refresh-rates-btn"
                onClick={() => refreshRates()}
                disabled={ratesLoading}
                className="text-slate-400 hover:text-orange-400 transition p-1 hover:bg-slate-900 rounded-md cursor-pointer disabled:opacity-50"
                title={`Refresh real-time rates (Source: ${ratesSource})`}
              >
                <RefreshCw className={`w-3 h-3 ${ratesLoading ? 'animate-spin text-orange-400' : ''}`} />
              </button>
            </div>

            {/* Quick Currency Selector Grid */}
            <div className="grid grid-cols-3 gap-1">
              {(['USD', 'NGN', 'GHS', 'SLE', 'XOF', 'GNF'] as CurrencyCode[]).map((c) => {
                const isSelected = currency === c;
                const meta = EXCHANGE_RATES[c];
                return (
                  <button
                    key={c}
                    type="button"
                    id={`sidebar-curr-btn-${c}`}
                    onClick={() => {
                      setCurrency(c);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-left transition flex flex-col justify-between border cursor-pointer ${
                      isSelected
                        ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-950/40'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-[11px] font-black">{c}</span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-white' : 'text-orange-400 font-bold'}`}>
                        {meta.symbol}
                      </span>
                    </div>
                    <span className={`text-[8px] truncate leading-tight mt-0.5 ${isSelected ? 'text-orange-100' : 'text-slate-400'}`}>
                      {meta.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Parity Banner */}
            <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800/80 text-[10px] space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span>Active Parity Rate:</span>
                <span className="text-white font-mono font-bold">
                  {currency === 'USD' 
                    ? `1 USD = ₦${Math.round(rates.NGN || 1485.5).toLocaleString()}` 
                    : `1 USD = ${convert(1, 'USD', currency).formatted}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-500 pt-0.5 border-t border-slate-800/60">
                <span className="truncate max-w-[130px]">{ratesSource}</span>
                <span>
                  {lastUpdated 
                    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Real-Time'}
                </span>
              </div>
            </div>

            {/* Expandable Automated Converter & Cost Estimator */}
            <div className="pt-0.5">
              <button
                type="button"
                id="toggle-currency-converter-btn"
                onClick={() => setIsConverterOpen(!isConverterOpen)}
                className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-orange-500/40 rounded-xl text-[10px] font-bold text-slate-300 hover:text-white flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center space-x-1.5 text-orange-400">
                  <Calculator className="w-3.5 h-3.5" />
                  <span className="text-white">Automated ECOWAS Converter</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isConverterOpen ? 'rotate-180 text-orange-400' : ''}`} />
              </button>

              {isConverterOpen && (
                <div className="space-y-2 pt-2 text-[10px]">
                  {/* Amount Input & Source Selector */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[9px]">
                      <span>Enter Cost / Fare:</span>
                      <span className="text-orange-400 font-mono">Live Sync</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="number"
                        id="sidebar-converter-amount-input"
                        min="0"
                        step="any"
                        value={convertAmount}
                        onChange={(e) => setConvertAmount(e.target.value)}
                        placeholder="Amount"
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                      />
                      <select
                        id="sidebar-converter-from-select"
                        value={convertFrom}
                        onChange={(e) => setConvertFrom(e.target.value as CurrencyCode)}
                        className="bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-orange-400 font-mono font-bold focus:outline-none focus:border-orange-500 cursor-pointer"
                      >
                        {(['USD', 'NGN', 'GHS', 'SLE', 'XOF', 'GNF'] as CurrencyCode[]).map((c) => (
                          <option key={c} value={c} className="bg-slate-950 text-white font-mono">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Fare Presets */}
                  <div className="flex items-center space-x-1">
                    {[
                      { label: '$25 Econ', usd: 25 },
                      { label: '$45 VIP', usd: 45 },
                      { label: '$80 Cargo', usd: 80 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setConvertFrom('USD');
                          setConvertAmount(preset.usd.toString());
                        }}
                        className="flex-1 py-0.5 px-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[8.5px] font-semibold text-slate-400 hover:text-white rounded-md transition text-center cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Calculated Local ECOWAS Costs Matrix */}
                  <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-800 space-y-1">
                    <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-800">
                      Converted Local ECOWAS Costs:
                    </span>
                    <div className="space-y-1">
                      {(['NGN', 'GHS', 'GNF', 'XOF', 'SLE', 'USD'] as CurrencyCode[])
                        .filter((c) => c !== convertFrom)
                        .map((targetCur) => {
                          const numVal = parseFloat(convertAmount) || 0;
                          const result = convert(numVal, convertFrom, targetCur);
                          const countryLabels: Record<CurrencyCode, string> = {
                            USD: 'Base Interbank',
                            NGN: 'Nigeria (Lagos)',
                            GHS: 'Ghana (Accra)',
                            GNF: 'Guinea (Conakry)',
                            XOF: "Côte d'Ivoire (Abidjan)",
                            SLE: 'Sierra Leone (Freetown)',
                          };
                          const isAppCur = currency === targetCur;
                          return (
                            <div
                              key={targetCur}
                              onClick={() => setCurrency(targetCur)}
                              className={`flex items-center justify-between py-1 px-1.5 rounded-lg transition cursor-pointer group ${
                                isAppCur ? 'bg-orange-600/20 border border-orange-500/30' : 'hover:bg-slate-800/80'
                              }`}
                              title={`Click to set ${targetCur} as app currency`}
                            >
                              <div className="flex items-center space-x-1.5 min-w-0">
                                <span className={`font-mono font-bold text-[10px] ${isAppCur ? 'text-orange-400' : 'text-slate-300 group-hover:text-orange-400'}`}>
                                  {targetCur}
                                </span>
                                <span className="text-[8.5px] text-slate-500 truncate">
                                  {countryLabels[targetCur]}
                                </span>
                              </div>
                              <span className={`font-mono font-bold text-[10.5px] ${isAppCur ? 'text-orange-400' : 'text-white group-hover:text-orange-400'}`}>
                                {result.formatted}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
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

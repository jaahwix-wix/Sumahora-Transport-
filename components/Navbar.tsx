'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Bus, 
  Package, 
  MapPin, 
  CreditCard, 
  Building2, 
  Search, 
  Phone, 
  User, 
  LogOut, 
  CheckCircle,
  Menu,
  X,
  Radio
} from 'lucide-react';
import { CurrencyCode, UserProfile } from '@/lib/types';
import { EXCHANGE_RATES } from '@/lib/data';

interface NavbarProps {
  activeTab: 'tracking' | 'booking' | 'cargo' | 'billing' | 'depots';
  setActiveTab: (tab: 'tracking' | 'booking' | 'cargo' | 'billing' | 'depots') => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onQuickTrack: (code: string) => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  user,
  onOpenAuth,
  onLogout,
  onQuickTrack,
}: NavbarProps) {
  const [quickTrackInput, setQuickTrackInput] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackInput.trim()) {
      onQuickTrack(quickTrackInput.trim());
      setQuickTrackInput('');
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    { id: 'tracking', label: 'Real-Time Tracking', icon: Radio },
    { id: 'booking', label: 'Book Passenger Bus', icon: Bus },
    { id: 'cargo', label: 'Send Cargo & Parcel', icon: Package },
    { id: 'billing', label: 'Billing & Tickets', icon: CreditCard },
    { id: 'depots', label: 'West Africa Depots', icon: Building2 },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      {/* Top utility alert banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 py-1 px-4 text-xs font-medium text-white flex items-center justify-between overflow-x-auto">
        <div className="flex items-center space-x-2 shrink-0">
          <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
            ECOWAS Express Corridor
          </span>
          <span>Lagos • Accra • Abidjan • Monrovia • Freetown • Conakry</span>
        </div>
        <div className="flex items-center space-x-4 shrink-0 text-xs">
          <span className="hidden sm:inline">24/7 Hotline: +234 803 236 7381</span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            GPS & Starlink Live
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('tracking')}
            className="flex items-center space-x-3 cursor-pointer group shrink-0"
            id="brand-logo-btn"
          >
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center border border-orange-400/40">
                <div className="text-center font-black tracking-tight leading-none">
                  <span className="text-orange-400 text-sm block">ST</span>
                  <span className="text-[9px] text-white/90 uppercase tracking-widest font-bold">SUMAHORA</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-black tracking-tight text-white">SUMAHORA</span>
                <span className="text-xl font-black tracking-tight text-orange-500">TRANSPORT</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                West Africa Cross-Border Travel & Logistics
              </p>
            </div>
          </div>

          {/* Quick Track Input in Header */}
          <form 
            onSubmit={handleTrackSubmit} 
            className="hidden md:flex items-center relative max-w-xs w-full"
            id="header-quick-track-form"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              id="header-quick-track-input"
              value={quickTrackInput}
              onChange={(e) => setQuickTrackInput(e.target.value)}
              placeholder="Track Ticket or Waybill #..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-full pl-9 pr-20 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="absolute right-1 px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-full text-xs font-semibold transition"
            >
              Track
            </button>
          </form>

          {/* Right actions: Currency + User Auth */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-slate-400 mr-1.5 font-medium">Curr:</span>
              <select
                id="currency-selector"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                {(Object.keys(EXCHANGE_RATES) as CurrencyCode[]).map((cur) => (
                  <option key={cur} value={cur} className="bg-slate-900 text-white">
                    {cur} ({EXCHANGE_RATES[cur].symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="flex items-center space-x-2">
                <button
                  id="user-profile-button"
                  onClick={onOpenAuth}
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-1.5 pr-3 text-left transition"
                  title="Manage Account"
                >
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-lg object-cover border border-orange-500/40"
                    referrerPolicy="no-referrer"
                  />
                  <div className="hidden lg:block text-xs">
                    <p className="font-semibold text-white leading-tight">{user.name}</p>
                    <span className="inline-block text-[10px] text-orange-400 uppercase font-medium">
                      {user.role}
                    </span>
                  </div>
                </button>
                <button
                  id="navbar-logout-btn"
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="navbar-login-btn"
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-orange-900/20 transition"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Demo</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              id="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 border-t border-slate-800/80 pt-2 pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-orange-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleTrackSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={quickTrackInput}
              onChange={(e) => setQuickTrackInput(e.target.value)}
              placeholder="Track ticket or waybill..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-20 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1 px-3 py-1 bg-orange-600 text-white rounded text-xs font-bold"
            >
              Track
            </button>
          </form>

          <div className="grid grid-cols-1 gap-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-left ${
                    isActive ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

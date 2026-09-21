'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  X, 
  User, 
  ShieldCheck, 
  Lock, 
  Phone, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  KeyRound
} from 'lucide-react';
import { UserProfile, CurrencyCode } from '@/lib/types';
import { DEMO_USERS, convertCurrency } from '@/lib/data';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  currency: CurrencyCode;
}

export function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  currency,
}: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'otp' | 'register'>('signin');
  const [phoneNumber, setPhoneNumber] = useState('+234 803 236 7381');
  const [otpCode, setOtpCode] = useState('8924');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'passenger' | 'merchant' | 'driver' | 'agent'>('passenger');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handlePersonaSelect = (persona: UserProfile) => {
    onLogin(persona);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: fullName || (phoneNumber.includes('234') ? 'Oluwaseun Adeyemi' : 'Amara Sesay'),
        role,
        email: `${(fullName || 'user').toLowerCase().replace(/\s+/g, '.')}@soultransport.com`,
        phone: phoneNumber,
        country: phoneNumber.startsWith('+233') ? 'Ghana' : phoneNumber.startsWith('+232') ? 'Sierra Leone' : 'Nigeria',
        preferredCurrency: currency,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        walletBalanceUSD: 100.0,
      };

      onLogin(newUser);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-6 h-6 text-white" />
            <div>
              <h3 className="text-base font-black tracking-tight">
                {currentUser ? 'Manage Secure Identity' : 'Secure User Authentication'}
              </h3>
              <p className="text-[11px] text-orange-100">
                ECOWAS Biometric & Encrypted Session Authorization
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

        <div className="p-6 space-y-6">
          {currentUser ? (
            /* Current User Active Profile */
            <div className="space-y-5">
              <div className="flex items-center space-x-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                <Image
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500/50"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-base font-bold text-white">{currentUser.name}</h4>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{currentUser.phone}</p>
                  <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                </div>
              </div>

              {/* Digital Wallet Card */}
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-orange-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    ST Express Transit Pass Wallet
                  </span>
                  <p className="text-2xl font-black text-white font-mono mt-1">
                    {convertCurrency(currentUser.walletBalanceUSD, currency).formatted}
                  </p>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    Verified ECOWAS Travel Pass #ECO-{currentUser.id.slice(-4).toUpperCase()}
                  </span>
                </div>

                <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-mono font-bold">
                  PASS
                </div>
              </div>
            </div>
          ) : null}

          {/* Quick 1-Click Demo Personas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Instant Demo Personas (1-Click Test Login)
              </span>
              <span className="text-[10px] text-slate-400">Select Role</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {DEMO_USERS.map((persona) => (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => handlePersonaSelect(persona)}
                  className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                    currentUser?.id === persona.id
                      ? 'bg-orange-600/20 border-orange-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <Image
                    src={persona.avatarUrl}
                    alt={persona.name}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-lg object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold truncate text-white">{persona.name}</p>
                    <span className="text-[10px] text-orange-400 uppercase font-semibold block">
                      {persona.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Phone/OTP Login Form */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Or Authenticate with Custom Phone / OTP
            </span>

            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">West Africa Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+234 803 236 7381 or +233 555 545 359"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="passenger">Passenger Traveler</option>
                    <option value="merchant">Cargo Consignor / Merchant</option>
                    <option value="driver">Fleet Coach Captain</option>
                    <option value="agent">Depot Station Agent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">SMS Verification Code</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="8924"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2"
              >
                {isVerifying ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Verifying Cryptographic Session...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Establish Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

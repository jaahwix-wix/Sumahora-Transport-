'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Users, 
  Check, 
  Sparkles, 
  AlertCircle,
  Tag
} from 'lucide-react';
import { CurrencyCode } from '@/lib/types';
import { convertCurrency } from '@/lib/data';

interface RouteCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  originCity: string;
  destinationCity: string;
  basePriceUSD: number;
  currency: CurrencyCode;
  selectedTimeSlot?: string;
  onSelectTimeSlot?: (time: string) => void;
}

export function RouteCalendar({
  selectedDate,
  onSelectDate,
  originCity,
  destinationCity,
  basePriceUSD,
  currency,
  selectedTimeSlot = '06:30 AM',
  onSelectTimeSlot,
}: RouteCalendarProps) {
  // Parse current selected or default to September 2026
  const initialDate = selectedDate ? new Date(selectedDate) : new Date(2026, 8, 22);
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear() || 2026);
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth() || 8); // 8 is September (0-indexed)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Helper: days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  // Deterministic mock availability generator for route
  const getDayAvailability = (day: number) => {
    // Generate pseudo-random availability based on day
    const seed = (currentYear * 12 + currentMonth) * 31 + day;
    if (day < 20 && currentMonth === 8 && currentYear === 2026) {
      return { status: 'past' as const, seats: 0, label: 'Departed', priceOffset: 0 };
    }
    if (seed % 9 === 0) {
      return { status: 'sold_out' as const, seats: 0, label: 'Sold Out', priceOffset: 0 };
    }
    if (seed % 4 === 0) {
      return { status: 'filling' as const, seats: 4 + (seed % 8), label: 'Few Seats', priceOffset: 5 };
    }
    return { status: 'available' as const, seats: 20 + (seed % 22), label: 'Seats Open', priceOffset: 0 };
  };

  const formatDateStr = (day: number) => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  };

  const departures = [
    {
      time: '06:30 AM',
      name: 'Atlantic Dawn Express',
      coach: 'Scania Marcopolo G7',
      class: 'VIP Royal Sleeper',
      seatsAvailable: 28,
      status: 'On Time',
    },
    {
      time: '10:15 AM',
      name: 'ECOWAS Coastal Monarch',
      coach: 'Volvo 9700 Grand Cruiser',
      class: 'Standard Executive',
      seatsAvailable: 14,
      status: 'Filling Fast',
    },
    {
      time: '02:45 PM',
      name: 'Trans-Gulf Twilight Express',
      coach: 'Mercedes Tourismo HD',
      class: 'VIP Royal Sleeper',
      seatsAvailable: 32,
      status: 'On Time',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div>
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-orange-500" />
            Visual Travel Calendar &amp; Route Availability
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Select your travel date for {originCity} ➔ {destinationCity}
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center space-x-2 self-start sm:self-auto bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-white font-mono min-w-[120px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Date Presets */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="text-[10px] text-slate-400 font-medium">Quick Dates:</span>
        {[
          { label: 'Today (Sep 21)', date: '2026-09-21' },
          { label: 'Tomorrow (Sep 22)', date: '2026-09-22' },
          { label: 'This Friday (Sep 25)', date: '2026-09-25' },
          { label: 'Next Monday (Sep 28)', date: '2026-09-28' },
        ].map((p) => (
          <button
            key={p.date}
            type="button"
            onClick={() => onSelectDate(p.date)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition border ${
              selectedDate === p.date
                ? 'bg-orange-600 text-white border-orange-500 shadow'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Calendar Grid Table */}
      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
            <span
              key={d}
              className={`text-[10px] font-bold uppercase ${
                i === 0 || i === 6 ? 'text-orange-400/80' : 'text-slate-400'
              }`}
            >
              {d}
            </span>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 rounded-xl bg-slate-900/20 border border-transparent" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = formatDateStr(dayNum);
            const isSelected = selectedDate === dateStr;
            const avail = getDayAvailability(dayNum);
            const isPast = avail.status === 'past';
            const isSoldOut = avail.status === 'sold_out';

            const price = Math.round(basePriceUSD + avail.priceOffset);

            return (
              <button
                key={dateStr}
                type="button"
                disabled={isPast || isSoldOut}
                onClick={() => onSelectDate(dateStr)}
                className={`h-16 p-1.5 rounded-xl border flex flex-col justify-between text-left transition relative group ${
                  isSelected
                    ? 'bg-gradient-to-b from-orange-600 to-amber-600 border-white text-white shadow-lg shadow-orange-950/80 z-10'
                    : isPast
                    ? 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed'
                    : isSoldOut
                    ? 'bg-rose-950/20 border-rose-900/40 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-900/80 border-slate-800/90 text-slate-200 hover:border-orange-500/60 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-bold font-mono ${
                      isSelected ? 'text-white' : isPast ? 'text-slate-600' : 'text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {/* Dot status */}
                  {!isPast && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected
                          ? 'bg-white'
                          : avail.status === 'available'
                          ? 'bg-emerald-400'
                          : avail.status === 'filling'
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                      title={avail.label}
                    />
                  )}
                </div>

                {/* Seats and Fare details */}
                <div className="w-full">
                  {!isPast && !isSoldOut ? (
                    <>
                      <span
                        className={`text-[9px] font-mono block leading-tight truncate ${
                          isSelected ? 'text-orange-100 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {avail.seats} seats
                      </span>
                      <span
                        className={`text-[10px] font-bold font-mono block leading-none mt-0.5 ${
                          isSelected ? 'text-white' : 'text-orange-400'
                        }`}
                      >
                        {convertCurrency(price, currency).formatted}
                      </span>
                    </>
                  ) : isSoldOut ? (
                    <span className="text-[9px] font-bold text-rose-400/90 uppercase block leading-tight">
                      Full
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-600 block">Past</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Summary & Departures Available for this Route */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-white">
              Scheduled Coach Departures on {selectedDate}:
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
            3 Daily Cross-Border Services
          </span>
        </div>

        {/* Departure cards list */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {departures.map((dep) => {
            const isSelectedSlot = selectedTimeSlot === dep.time;
            return (
              <div
                key={dep.time}
                onClick={() => onSelectTimeSlot && onSelectTimeSlot(dep.time)}
                className={`p-2.5 rounded-xl border cursor-pointer transition ${
                  isSelectedSlot
                    ? 'bg-orange-500/15 border-orange-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black font-mono text-orange-400">
                    {dep.time}
                  </span>
                  {isSelectedSlot && <Check className="w-3.5 h-3.5 text-orange-400" />}
                </div>
                <p className="text-[11px] font-bold text-white truncate mt-0.5">{dep.name}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>{dep.class}</span>
                  <span className="text-emerald-400">{dep.seatsAvailable} left</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Copy, 
  Truck, 
  Bus,
  Search
} from 'lucide-react';
import { STATIONS } from '@/lib/data';
import { Station } from '@/lib/types';

interface DepotsViewProps {
  onSelectStationForBooking: (station: Station) => void;
  onSelectStationForCargo: (station: Station) => void;
}

export function DepotsView({
  onSelectStationForBooking,
  onSelectStationForCargo,
}: DepotsViewProps) {
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const handleCopyPhone = (num: string) => {
    navigator.clipboard.writeText(num.replace(/\s+/g, ''));
    setCopiedPhone(num);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const filteredStations = STATIONS.filter(
    (s) =>
      s.city.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.country.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.address.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-black text-white tracking-tight">
                Official Depots, Terminals & Cross-Border Hubs
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Verified physical terminals across West Africa. Open daily with full ticketing, heavy cargo warehousing, 
              customs manifest processing, and 24/7 passenger dispatch.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search depot by city or country..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Grid of Depots directly from flyer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStations.map((station) => (
          <div
            key={station.id}
            className="bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-2xl p-5 shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Flag & Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl">{station.flag}</span>
                  <div>
                    <h3 className="text-base font-black text-white leading-tight">
                      {station.country.toUpperCase()}
                    </h3>
                    <p className="text-xs text-orange-400 font-semibold">
                      {station.city} Terminal
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Open 06:00 - 21:00
                </span>
              </div>

              {/* Physical Address from Flyer */}
              <div className="mt-3 space-y-2">
                <div className="flex items-start space-x-2 text-xs text-slate-300">
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed">{station.address}</p>
                </div>

                {/* Verified Phone numbers */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 space-y-2 mt-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Official Station Hotlines
                  </span>
                  <div className="space-y-1.5">
                    {station.phoneNumbers.map((phone, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <a
                          href={`tel:${phone.replace(/\s+/g, '')}`}
                          className="font-mono font-bold text-white hover:text-orange-400 transition flex items-center space-x-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{phone}</span>
                        </a>

                        <button
                          onClick={() => handleCopyPhone(phone)}
                          className="p-1 text-slate-500 hover:text-slate-300 rounded"
                          title="Copy phone number"
                        >
                          {copiedPhone === phone ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Available services pills */}
                <div className="pt-2">
                  <span className="text-[10px] text-slate-500 block mb-1.5 font-medium">Terminal Facilities:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['VIP Passenger Lounge', 'Heavy Cargo Bay', 'Customs Clearing', 'Starlink WiFi'].map((f, i) => (
                      <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center space-x-2">
              <button
                onClick={() => onSelectStationForBooking(station)}
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
              >
                <Bus className="w-3.5 h-3.5" />
                <span>Book From Here</span>
              </button>

              <button
                onClick={() => onSelectStationForCargo(station)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
              >
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Drop Cargo</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

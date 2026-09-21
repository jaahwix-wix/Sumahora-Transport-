'use client';

import React from 'react';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Compass, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Station } from '@/lib/types';
import { STATIONS, getRouteDistanceKm } from '@/lib/data';

interface RouteMapPreviewProps {
  originStation: Station;
  destinationStation: Station;
  busClass?: string;
}

export function RouteMapPreview({
  originStation,
  destinationStation,
  busClass = 'VIP Royal Sleeper',
}: RouteMapPreviewProps) {
  const distanceKm = getRouteDistanceKm(originStation.id, destinationStation.id);

  // Approximate travel duration (hours) based on distance and corridor speed + border clearances
  const rawHours = distanceKm / 65 + (distanceKm > 400 ? 1.5 : 0.5);
  const hours = Math.floor(rawHours);
  const minutes = Math.round((rawHours - hours) * 60);
  const formattedDuration = `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();

  // Determine stations along the ordered route
  const stationOrder = [
    'station-conakry',
    'station-freetown',
    'station-monrovia',
    'station-abidjan',
    'station-accra',
    'station-lagos',
  ];

  const originIdx = stationOrder.indexOf(originStation.id);
  const destIdx = stationOrder.indexOf(destinationStation.id);
  const minIdx = Math.min(originIdx, destIdx);
  const maxIdx = Math.max(originIdx, destIdx);

  // List of intermediate stops on this journey
  const routeStations = STATIONS.filter((s) => {
    const idx = stationOrder.indexOf(s.id);
    return idx >= minIdx && idx <= maxIdx;
  });

  // Calculate SVG route coordinates
  const originCoord = originStation.geo;
  const destCoord = destinationStation.geo;

  // Arc control point for aesthetic curved route line
  const midX = (originCoord.x + destCoord.x) / 2;
  const midY = (originCoord.y + destCoord.y) / 2 - 8; // slight curve upwards

  // Identify ECOWAS border crossings based on stations traversed
  const borderCrossings: string[] = [];
  if (minIdx <= 0 && maxIdx >= 1) borderCrossings.push('Kambia (GN-SL)');
  if (minIdx <= 1 && maxIdx >= 2) borderCrossings.push('Mano River / Bo Waterside (SL-LR)');
  if (minIdx <= 2 && maxIdx >= 3) borderCrossings.push('Prollo / Harper (LR-CI)');
  if (minIdx <= 3 && maxIdx >= 4) borderCrossings.push('Noé / Elubo (CI-GH)');
  if (minIdx <= 4 && maxIdx >= 5) borderCrossings.push('Aflao & Sémé (GH-TG-BJ-NG)');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-400 border border-orange-500/20">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Selected Corridor Route Path</span>
              <span className="text-[10px] font-mono text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                TAH 7 Coastal Highway
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Interactive corridor schematic &amp; route telemetry for {originStation.city} ➔ {destinationStation.city}
            </p>
          </div>
        </div>

        {/* Telemetry Metric Badges */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-xl text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Corridor Distance</span>
            <span className="text-xs font-mono font-black text-orange-400 leading-none">
              {distanceKm} km
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-xl text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Estimated Drive</span>
            <span className="text-xs font-mono font-black text-emerald-400 leading-none">
              ~{formattedDuration}
            </span>
          </div>
        </div>
      </div>

      {/* Compact Interactive Map Canvas */}
      <div className="relative w-full h-[200px] sm:h-[220px] bg-gradient-to-b from-slate-950 to-slate-900 rounded-xl border border-slate-800 overflow-hidden select-none">
        {/* Radar grid lines */}
        <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
          <div className="w-[360px] h-[360px] rounded-full border border-dashed border-orange-500"></div>
          <div className="w-[220px] h-[220px] rounded-full border border-orange-400/30 absolute"></div>
          <div className="w-[100px] h-[100px] rounded-full border border-orange-400/40 absolute"></div>
        </div>

        {/* Gulf of Guinea / Atlantic coastline graphic curve */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none" 
          preserveAspectRatio="none" 
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id="routeGradientGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
            </linearGradient>

            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* West African Coastal Base Trunk Highway (all 6 hubs) */}
          <path
            d="M 8,35 Q 22,55 38,72 T 56,64 T 73,58 T 92,52"
            fill="none"
            stroke="#1e293b"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Active Highlighted Route Arc connecting Origin to Destination */}
          <path
            d={`M ${originCoord.x},${originCoord.y} Q ${midX},${midY} ${destCoord.x},${destCoord.y}`}
            fill="none"
            stroke="url(#routeGradientGlow)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#glowEffect)"
          />

          {/* Animated dashes travelling along the route */}
          <path
            d={`M ${originCoord.x},${originCoord.y} Q ${midX},${midY} ${destCoord.x},${destCoord.y}`}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="4,6"
            strokeLinecap="round"
            className="animate-pulse"
          />
        </svg>

        {/* Render Stations along the corridor */}
        {STATIONS.map((st) => {
          const isOrigin = st.id === originStation.id;
          const isDestination = st.id === destinationStation.id;
          const isIntermediate = routeStations.some((rs) => rs.id === st.id) && !isOrigin && !isDestination;

          return (
            <div
              key={st.id}
              style={{
                left: `${st.geo.x}%`,
                top: `${st.geo.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-10 flex flex-col items-center pointer-events-none"
            >
              {/* Origin Beacon */}
              {isOrigin && (
                <div className="relative flex flex-col items-center">
                  <span className="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-orange-400 opacity-60"></span>
                  <div className="w-6 h-6 rounded-full bg-orange-600 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold shadow-lg shadow-orange-950">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="mt-1 bg-orange-600/95 text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow whitespace-nowrap uppercase tracking-wider">
                    Departure: {st.city}
                  </div>
                </div>
              )}

              {/* Destination Beacon */}
              {isDestination && (
                <div className="relative flex flex-col items-center">
                  <span className="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-emerald-400 opacity-60"></span>
                  <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold shadow-lg shadow-emerald-950">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="mt-1 bg-emerald-600/95 text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow whitespace-nowrap uppercase tracking-wider">
                    Arrival: {st.city}
                  </div>
                </div>
              )}

              {/* Intermediate Route Hub */}
              {isIntermediate && (
                <div className="flex flex-col items-center opacity-85">
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-slate-900 shadow"></div>
                  <div className="mt-0.5 bg-slate-950/80 text-amber-300 font-semibold text-[8px] px-1 py-0.2 rounded border border-slate-800 whitespace-nowrap">
                    Stop: {st.city}
                  </div>
                </div>
              )}

              {/* Inactive Hub */}
              {!isOrigin && !isDestination && !isIntermediate && (
                <div className="flex flex-col items-center opacity-40">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-800"></div>
                  <span className="text-[8px] text-slate-400 whitespace-nowrap mt-0.5">
                    {st.city}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Bottom map metadata HUD */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/80 text-[10px] text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="text-orange-400 font-bold">{originStation.city}</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="text-emerald-400 font-bold">{destinationStation.city}</span>
          </div>

          <div className="flex items-center space-x-3 text-[9px] text-slate-400 font-mono">
            <span>Class: <strong className="text-white">{busClass}</strong></span>
            <span>•</span>
            <span>Border Clearance: <strong className="text-emerald-400">ECOWAS Seal Included</strong></span>
          </div>
        </div>
      </div>

      {/* Corridor Border Crossings & Route Highlights */}
      {borderCrossings.length > 0 && (
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-300">Border Checkpoints Traversed:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {borderCrossings.map((crossing, i) => (
              <span 
                key={i} 
                className="bg-slate-900 border border-slate-700/80 text-orange-300 text-[10px] font-mono px-2 py-0.5 rounded-md"
              >
                🛂 {crossing}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

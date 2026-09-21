'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  Compass, 
  CheckCircle2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ArrowRight,
  Info,
  Layers,
  Phone,
  Building2,
  Bus,
  Wifi,
  Coffee,
  DollarSign,
  Maximize2,
  Minimize2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Station, BusTrip } from '@/lib/types';
import { STATIONS, getRouteDistanceKm } from '@/lib/data';

interface DetailedRouteMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  originStation: Station;
  destinationStation: Station;
  busClass?: string;
  activeTrip?: BusTrip;
}

export function DetailedRouteMapModal({
  isOpen,
  onClose,
  originStation,
  destinationStation,
  busClass = 'VIP Royal Sleeper',
  activeTrip,
}: DetailedRouteMapModalProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [showBorders, setShowBorders] = useState<boolean>(true);
  const [showAmenities, setShowAmenities] = useState<boolean>(true);
  const [showWeather, setShowWeather] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Station route order along the coastal corridor
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

  // Stations traversed on this trip
  const routeStations = useMemo(() => {
    return STATIONS.filter((s) => {
      const idx = stationOrder.indexOf(s.id);
      return idx >= minIdx && idx <= maxIdx;
    });
  }, [minIdx, maxIdx]);

  const distanceKm = getRouteDistanceKm(originStation.id, destinationStation.id);
  const rawHours = distanceKm / 65 + (distanceKm > 400 ? 1.5 : 0.5);
  const hours = Math.floor(rawHours);
  const minutes = Math.round((rawHours - hours) * 60);
  const formattedDuration = `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();

  // Border checkpoints along the chosen route
  const borderCrossings = useMemo(() => {
    const list = [];
    if (minIdx <= 0 && maxIdx >= 1) {
      list.push({ 
        name: 'Kambia / Forecariah (GN-SL)', 
        x: 13, 
        y: 41, 
        type: 'ECOWAS Border Gate',
        waitTime: '~45 mins',
        currency: 'GNF ➔ SLE'
      });
    }
    if (minIdx <= 1 && maxIdx >= 2) {
      list.push({ 
        name: 'Mano River / Bo Waterside (SL-LR)', 
        x: 24, 
        y: 56, 
        type: 'ECOWAS Customs Post',
        waitTime: '~50 mins',
        currency: 'SLE ➔ USD'
      });
    }
    if (minIdx <= 2 && maxIdx >= 3) {
      list.push({ 
        name: 'Prollo / Harper (LR-CI)', 
        x: 40, 
        y: 65, 
        type: 'Maritime River Crossing',
        waitTime: '~60 mins',
        currency: 'USD ➔ XOF'
      });
    }
    if (minIdx <= 3 && maxIdx >= 4) {
      list.push({ 
        name: 'Noé / Elubo Border (CI-GH)', 
        x: 60, 
        y: 64, 
        type: 'FastTrack Express Gate',
        waitTime: '~30 mins',
        currency: 'XOF ➔ GHS'
      });
    }
    if (minIdx <= 4 && maxIdx >= 5) {
      list.push({ 
        name: 'Aflao (GH-TG) & Sémé (BJ-NG)', 
        x: 81, 
        y: 58, 
        type: 'High-Volume Coastal Corridor',
        waitTime: '~40 mins',
        currency: 'GHS ➔ XOF ➔ NGN'
      });
    }
    return list;
  }, [minIdx, maxIdx]);

  // Coordinates
  const originCoord = originStation.geo;
  const destCoord = destinationStation.geo;
  const midX = (originCoord.x + destCoord.x) / 2;
  const midY = (originCoord.y + destCoord.y) / 2 - 10;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className={`bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl max-h-[92vh]'
        }`}
      >
        {/* Modal Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-600/20 text-orange-400 border border-orange-500/30 rounded-xl">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  Detailed Route Corridor &amp; Station Telemetry
                </h3>
                <span className="bg-orange-600/20 text-orange-400 border border-orange-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  TAH 7 Coastal Highway
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sumahora Transport Express Network • {originStation.city} ({originStation.country}) to {destinationStation.city} ({destinationStation.country})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl transition"
              title="Close Map"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Telemetry Strip */}
        <div className="bg-slate-900/95 border-b border-slate-800 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 font-bold text-white">
              <span className="text-base">{originStation.flag}</span>
              <span>{originStation.city}</span>
              <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-base">{destinationStation.flag}</span>
              <span>{destinationStation.city}</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">
              Class: <strong className="text-slate-200">{busClass}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] mr-1.5">Distance:</span>
              <strong className="text-orange-400">{distanceKm} km</strong>
            </div>
            <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] mr-1.5">Transit:</span>
              <strong className="text-emerald-400">~{formattedDuration}</strong>
            </div>
            <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 hidden md:block">
              <span className="text-slate-400 text-[10px] mr-1.5">Checkpoints:</span>
              <strong className="text-amber-400">{borderCrossings.length} Border Gates</strong>
            </div>
          </div>
        </div>

        {/* Main Content Area: Map Canvas + Details Side Drawer */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative overflow-hidden">
          {/* Interactive Map Viewport (Left/Center) */}
          <div className="flex-1 relative bg-gradient-to-b from-slate-950 via-[#060c18] to-slate-950 overflow-hidden flex items-center justify-center p-4">
            {/* Map Background Grid & Radar Sweep */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="w-full h-full bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px]"></div>
            </div>

            {/* Floating Map Controls Toolbar */}
            <div className="absolute top-4 left-4 z-20 flex flex-col space-y-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-xl">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.0))}
                className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Layer Toggles Pill Bar (Top Right) */}
            <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setShowBorders(!showBorders)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  showBorders ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Checkpoints ({borderCrossings.length})
              </button>
              <button
                type="button"
                onClick={() => setShowAmenities(!showAmenities)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  showAmenities ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Hub Facilities
              </button>
            </div>

            {/* Transformable Interactive Canvas */}
            <div 
              className="w-full h-full relative transition-transform duration-300 flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <svg 
                className="w-full h-full max-h-[550px]" 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="modalRouteGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ea580c" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.95" />
                  </linearGradient>

                  <filter id="modalGlowEffect" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* West African Coastline Backdrop Guide */}
                <path
                  d="M 2,20 Q 15,35 25,60 T 45,74 T 65,70 T 85,62 T 98,58"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.5"
                />

                {/* Ocean Area Wave lines */}
                <path
                  d="M 5,80 Q 30,95 60,88 T 95,82"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="2"
                  strokeDasharray="4,8"
                />

                {/* Trans-West African Coastal Highway Base (Connecting All 6 Hubs) */}
                <path
                  d="M 8,35 Q 22,55 38,72 T 56,64 T 73,58 T 92,52"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Active Chosen Route Arc connecting Origin to Destination */}
                <path
                  d={`M ${originCoord.x},${originCoord.y} Q ${midX},${midY} ${destCoord.x},${destCoord.y}`}
                  fill="none"
                  stroke="url(#modalRouteGlow)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  filter="url(#modalGlowEffect)"
                />

                {/* Animated Light Pulses traveling down highway */}
                <path
                  d={`M ${originCoord.x},${originCoord.y} Q ${midX},${midY} ${destCoord.x},${destCoord.y}`}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeDasharray="6,8"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              </svg>

              {/* Border Checkpoints Rendered along the corridor */}
              {showBorders && borderCrossings.map((border, idx) => (
                <div
                  key={idx}
                  style={{
                    left: `${border.x}%`,
                    top: `${border.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute z-15 flex flex-col items-center group cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-md bg-amber-500/90 border border-white text-slate-950 flex items-center justify-center font-bold text-[9px] shadow-md shadow-amber-950">
                    🛂
                  </div>
                  <div className="mt-1 bg-slate-950/95 text-amber-300 border border-amber-500/40 text-[9px] font-mono px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                    {border.name.split('(')[0]}
                  </div>
                </div>
              ))}

              {/* Station Markers leveraging existing Station Coordinates */}
              {STATIONS.map((st) => {
                const isOrigin = st.id === originStation.id;
                const isDestination = st.id === destinationStation.id;
                const isTraversed = routeStations.some((rs) => rs.id === st.id);
                const isSelected = selectedStation?.id === st.id;

                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStation(st)}
                    style={{
                      left: `${st.geo.x}%`,
                      top: `${st.geo.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute z-20 flex flex-col items-center cursor-pointer transition-all duration-200 group ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                    }`}
                  >
                    {/* Origin Station Highlight */}
                    {isOrigin && (
                      <div className="relative flex flex-col items-center">
                        <span className="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-orange-500 opacity-60"></span>
                        <div className="w-8 h-8 rounded-full bg-orange-600 border-2 border-white flex items-center justify-center text-white shadow-xl shadow-orange-950">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="mt-1 bg-orange-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-md whitespace-nowrap uppercase tracking-wider">
                          DEPARTURE: {st.city}
                        </div>
                      </div>
                    )}

                    {/* Destination Station Highlight */}
                    {isDestination && (
                      <div className="relative flex flex-col items-center">
                        <span className="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-emerald-500 opacity-60"></span>
                        <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xl shadow-emerald-950">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="mt-1 bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-md whitespace-nowrap uppercase tracking-wider">
                          ARRIVAL: {st.city}
                        </div>
                      </div>
                    )}

                    {/* Intermediate Route Stops */}
                    {!isOrigin && !isDestination && isTraversed && (
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center text-[10px] shadow-md">
                          {st.flag}
                        </div>
                        <div className="mt-1 bg-slate-950 text-amber-300 font-bold text-[9px] px-1.5 py-0.5 rounded border border-slate-800 whitespace-nowrap">
                          Stop: {st.city}
                        </div>
                      </div>
                    )}

                    {/* Other Corridor Stations */}
                    {!isOrigin && !isDestination && !isTraversed && (
                      <div className="flex flex-col items-center opacity-40 hover:opacity-100 transition">
                        <div className="w-4 h-4 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center text-[8px]">
                          {st.flag}
                        </div>
                        <span className="text-[8px] text-slate-400 whitespace-nowrap mt-0.5">
                          {st.city}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom HUD Overlay */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                  Starlink GPS Satellite Live Sync Active
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400 text-[11px]">
                  Click any station node to view terminal facilities &amp; dispatch hotline
                </span>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                <span>Highway: <strong>TAH 7 Coastal Corridor</strong></span>
                <span>•</span>
                <span>Border Clearance: <strong>FastTrack ECOWAS Protocol</strong></span>
              </div>
            </div>
          </div>

          {/* Detailed Side Panel (Right) */}
          <div className="w-full lg:w-96 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 overflow-y-auto space-y-5 shrink-0">
            {/* Selected Station or Route Overview */}
            {selectedStation ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{selectedStation.flag}</span>
                    <div>
                      <h4 className="text-sm font-black text-white">{selectedStation.city} Terminal</h4>
                      <p className="text-[11px] text-orange-400 font-medium">{selectedStation.country}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStation(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    View Route
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Official Terminal Name &amp; Address
                    </span>
                    <p className="text-white font-semibold">{selectedStation.terminalName}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">{selectedStation.address}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Dispatch Phone</span>
                      <p className="text-orange-400 font-mono font-bold text-[11px] mt-0.5">{selectedStation.phone}</p>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Local Currency</span>
                      <p className="text-emerald-400 font-mono font-bold text-[11px] mt-0.5">{selectedStation.localCurrency}</p>
                    </div>
                  </div>

                  {showAmenities && (
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Station Amenities &amp; Services
                      </span>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          VIP Lounge
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Starlink Wi-Fi
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Cargo Depository
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Forex Exchange
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
                    <Navigation className="w-4 h-4 text-orange-500" />
                    Corridor Itinerary &amp; Waypoint Milestones
                  </h4>
                </div>

                {/* Ordered Station Sequence */}
                <div className="space-y-2.5">
                  {routeStations.map((st, i) => {
                    const isOrigin = st.id === originStation.id;
                    const isDest = st.id === destinationStation.id;

                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStation(st)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                          isOrigin
                            ? 'bg-orange-600/15 border-orange-500/50 text-white'
                            : isDest
                            ? 'bg-emerald-600/15 border-emerald-500/50 text-white'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-950 font-mono text-[10px] font-bold flex items-center justify-center text-slate-400 border border-slate-800">
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-bold flex items-center gap-1">
                              <span>{st.flag}</span>
                              <span>{st.city}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[170px]">
                              {st.terminalName}
                            </p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          isOrigin ? 'bg-orange-600 text-white' : isDest ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isOrigin ? 'Origin' : isDest ? 'Destination' : 'Transit'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Border Checkpoints Traversed List */}
                {borderCrossings.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                      Border Clearance Checkpoints ({borderCrossings.length})
                    </span>
                    <div className="space-y-1.5">
                      {borderCrossings.map((b, i) => (
                        <div key={i} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-white text-[11px]">{b.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Currency: {b.currency}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {b.waitTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Coach Amenities Summary */}
            <div className="p-3 bg-gradient-to-br from-slate-900 to-slate-950 border border-orange-500/30 rounded-2xl space-y-2 text-xs">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                Fleet Standard Amenities
              </span>
              <p className="text-[11px] text-slate-400">
                All Sumahora coaches are equipped with dual USB-C charging, individual AC climate control, chilled bottled water, and Starlink High-Speed Satellite Internet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  Wifi, 
  Thermometer, 
  Gauge, 
  Clock, 
  Truck, 
  Bus, 
  Package, 
  Play, 
  Pause, 
  RefreshCw, 
  Phone, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowRight
} from 'lucide-react';
import { BusTrip, CargoShipment, Station, CurrencyCode } from '@/lib/types';
import { STATIONS, convertCurrency } from '@/lib/data';

interface LiveTrackingViewProps {
  busTrips: BusTrip[];
  cargoShipments: CargoShipment[];
  currency: CurrencyCode;
  selectedTrackingCode?: string;
  onSelectBooking: (trip: BusTrip) => void;
}

export function LiveTrackingView({
  busTrips,
  cargoShipments,
  currency,
  selectedTrackingCode,
  onSelectBooking,
}: LiveTrackingViewProps) {
  const [selectedTripId, setSelectedTripId] = useState<string>(busTrips[0]?.id || '');
  const [selectedCargoTracking, setSelectedCargoTracking] = useState<string>(
    selectedTrackingCode || cargoShipments[0]?.trackingNumber || ''
  );
  const [activeTrackingMode, setActiveTrackingMode] = useState<'buses' | 'cargo'>('buses');
  const [searchQuery, setSearchQuery] = useState(selectedTrackingCode || '');
  const [isSimulating, setIsSimulating] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState<1 | 2 | 5>(1);
  const [lastPingTime, setLastPingTime] = useState<Date>(new Date());
  const [liveOffset, setLiveOffset] = useState<number>(0);

  const [prevSelectedCode, setPrevSelectedCode] = useState(selectedTrackingCode);
  if (selectedTrackingCode !== prevSelectedCode) {
    setPrevSelectedCode(selectedTrackingCode);
    if (selectedTrackingCode) {
      setSearchQuery(selectedTrackingCode);
      const isCargo = cargoShipments.some((c) => c.trackingNumber === selectedTrackingCode);
      if (isCargo) {
        setSelectedCargoTracking(selectedTrackingCode);
        setActiveTrackingMode('cargo');
      } else {
        const found = busTrips.find((b) => b.busNumber === selectedTrackingCode || b.id === selectedTrackingCode);
        if (found) {
          setSelectedTripId(found.id);
          setActiveTrackingMode('buses');
        }
      }
    }
  }

  // Live simulation tick effect
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setLiveOffset((prev) => (prev + 0.15 * simulationSpeed) % 100);
      setLastPingTime(new Date());
    }, 2000);
    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed]);

  const activeTrip = busTrips.find((t) => t.id === selectedTripId) || busTrips[0];
  const activeCargo = cargoShipments.find((c) => c.trackingNumber === selectedCargoTracking) || cargoShipments[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toUpperCase();
    if (!q) return;

    // Check cargo
    const foundCargo = cargoShipments.find((c) => c.trackingNumber.toUpperCase().includes(q));
    if (foundCargo) {
      setSelectedCargoTracking(foundCargo.trackingNumber);
      setActiveTrackingMode('cargo');
      return;
    }

    // Check bus
    const foundBus = busTrips.find(
      (b) => b.busNumber.toUpperCase().includes(q) || b.id.toUpperCase().includes(q) || b.plateNumber.toUpperCase().includes(q)
    );
    if (foundBus) {
      setSelectedTripId(foundBus.id);
      setActiveTrackingMode('buses');
      return;
    }
  };

  const getStationById = (id: string) => STATIONS.find((s) => s.id === id);

  return (
    <div className="space-y-6">
      {/* Top Tracking Header & Status Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Real-Time Fleet & Logistics Radar
              </h2>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                LIVE ECOWAS CORRIDOR
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active satellite GPS monitoring across Guinea, Sierra Leone, Liberia, Côte d&apos;Ivoire, Ghana &amp; Nigeria.
            </p>
          </div>

          {/* Search bar & mode switch */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
              <button
                id="toggle-tracking-buses"
                onClick={() => setActiveTrackingMode('buses')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                  activeTrackingMode === 'buses'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bus className="w-3.5 h-3.5" />
                <span>Passenger Coaches ({busTrips.length})</span>
              </button>
              <button
                id="toggle-tracking-cargo"
                onClick={() => setActiveTrackingMode('cargo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                  activeTrackingMode === 'cargo'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Cargo Shipments ({cargoShipments.length})</span>
              </button>
            </div>

            {/* Simulation controls */}
            <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <button
                id="sim-play-pause-btn"
                onClick={() => setIsSimulating(!isSimulating)}
                className={`p-1 rounded ${isSimulating ? 'text-amber-400 hover:bg-slate-700' : 'text-emerald-400 hover:bg-slate-700'}`}
                title={isSimulating ? 'Pause GPS Telemetry Simulation' : 'Resume Live Telemetry'}
              >
                {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                {isSimulating ? 'Live Pulse' : 'Paused'}
              </span>
              <button
                onClick={() => setSimulationSpeed(simulationSpeed === 1 ? 2 : simulationSpeed === 2 ? 5 : 1)}
                className="bg-slate-900 border border-slate-700 hover:border-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold text-orange-400"
                title="Simulation speed multiplier"
              >
                {simulationSpeed}x
              </button>
              <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
                Ping: {lastPingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Quick code chips */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Quick Telemetry Targets:</span>
          {busTrips.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                setSelectedTripId(b.id);
                setActiveTrackingMode('buses');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border transition ${
                selectedTripId === b.id && activeTrackingMode === 'buses'
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                  : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              🚌 {b.busNumber} ({b.originId.replace('station-', '').toUpperCase()} → {b.destinationId.replace('station-', '').toUpperCase()})
            </button>
          ))}
          {cargoShipments.map((c) => (
            <button
              key={c.trackingNumber}
              onClick={() => {
                setSelectedCargoTracking(c.trackingNumber);
                setActiveTrackingMode('cargo');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border transition ${
                selectedCargoTracking === c.trackingNumber && activeTrackingMode === 'cargo'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                  : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              📦 {c.trackingNumber} ({c.packageType})
            </button>
          ))}
        </div>
      </div>

      {/* Visual Interactive Coastal Highway Corridor Map */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl overflow-hidden relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Navigation className="w-4 h-4 text-orange-500" />
              Trans-West African Coastal Highway Network Map
            </h3>
            <p className="text-xs text-slate-400">
              Interactive high-resolution corridor schematic connecting all 6 national hub terminals.
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full font-mono border border-slate-700">
            Total Corridor Length: ~2,840 km
          </span>
        </div>

        {/* Map Canvas Card */}
        <div className="relative w-full h-[280px] sm:h-[340px] bg-gradient-to-b from-slate-950 to-slate-900 rounded-xl border border-slate-800 p-4 overflow-hidden">
          {/* Subtle radar circular rings for modern high-tech aesthetic */}
          <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
            <div className="w-[500px] h-[500px] rounded-full border border-dashed border-orange-500/40"></div>
            <div className="w-[300px] h-[300px] rounded-full border border-orange-400/20 absolute"></div>
            <div className="w-[120px] h-[120px] rounded-full border border-orange-400/30 absolute"></div>
          </div>

          {/* SVG Map Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="corridorGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ea580c" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Ocean / Land separator curve */}
            <path
              d="M 5,30 Q 25,60 40,75 T 70,60 T 95,50"
              fill="none"
              stroke="#334155"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Active illuminated Highway Route */}
            <path
              d="M 8,35 Q 22,55 38,72 T 56,64 T 73,58 T 92,52"
              fill="none"
              stroke="url(#corridorGlow)"
              strokeWidth="2.5"
              strokeDasharray="2,2"
              strokeLinecap="round"
            />
          </svg>

          {/* Stations positioned accurately along corridor */}
          {STATIONS.map((station, idx) => (
            <div
              key={station.id}
              style={{
                left: `${station.geo.x}%`,
                top: `${station.geo.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-10 flex flex-col items-center group cursor-pointer"
              onClick={() => {
                // Focus trip originating or heading to this station
                const matchingTrip = busTrips.find(
                  (b) => b.originId === station.id || b.destinationId === station.id
                );
                if (matchingTrip) {
                  setSelectedTripId(matchingTrip.id);
                  setActiveTrackingMode('buses');
                }
              }}
            >
              <div className="relative">
                <span className="w-5 h-5 rounded-full bg-slate-900 border-2 border-orange-500 flex items-center justify-center text-[10px] shadow-lg shadow-orange-950/60 group-hover:scale-125 transition-transform">
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                </span>
                <span className="absolute -top-1 -right-1 text-xs">{station.flag}</span>
              </div>
              <div className="mt-1 bg-slate-900/90 backdrop-blur-sm border border-slate-700/80 rounded px-1.5 py-0.5 text-center shadow-md">
                <p className="text-[10px] font-bold text-white tracking-tight leading-none">
                  {station.city}
                </p>
                <p className="text-[8px] text-slate-400 leading-none mt-0.5">
                  {station.country}
                </p>
              </div>
            </div>
          ))}

          {/* Active Bus Markers on Map */}
          {busTrips.map((trip, idx) => {
            const orig = getStationById(trip.originId);
            const dest = getStationById(trip.destinationId);
            if (!orig || !dest) return null;

            // Compute dynamic position between origin and destination based on live offset
            const progressRatio = ((idx * 33 + liveOffset) % 80 + 10) / 100;
            const curX = orig.geo.x + (dest.geo.x - orig.geo.x) * progressRatio;
            const curY = orig.geo.y + (dest.geo.y - orig.geo.y) * progressRatio;

            const isSelected = selectedTripId === trip.id && activeTrackingMode === 'buses';

            return (
              <div
                key={trip.id}
                style={{
                  left: `${curX}%`,
                  top: `${curY}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={() => {
                  setSelectedTripId(trip.id);
                  setActiveTrackingMode('buses');
                }}
                className={`absolute z-20 cursor-pointer transition-all duration-700 ${
                  isSelected ? 'scale-110 z-30' : 'hover:scale-105'
                }`}
              >
                <div className="relative flex flex-col items-center">
                  {/* Pulsing indicator */}
                  {isSelected && (
                    <span className="absolute -inset-2 rounded-full bg-orange-500/30 animate-ping"></span>
                  )}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xl border ${
                      isSelected
                        ? 'bg-orange-600 border-white text-white shadow-orange-500/50'
                        : 'bg-slate-800 border-orange-400/80 text-orange-400'
                    }`}
                  >
                    <Bus className="w-4 h-4" />
                  </div>
                  <div className="mt-1 bg-slate-950/95 border border-slate-700 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-white shadow whitespace-nowrap">
                    {trip.busNumber} • {trip.currentSpeedKmH} km/h
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              Official ST Depots (6 Hubs)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              ECOWAS FastTrack Borders
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-600"></span>
              In-Transit Fleet
            </span>
          </div>
          <span className="text-slate-500">Click any bus or station pin to inspect live telemetry</span>
        </div>
      </div>

      {/* Main Details Panel: Bus Telemetry or Cargo Journey */}
      {activeTrackingMode === 'buses' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Live Telemetry Dashboard */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold bg-orange-600 text-white px-2.5 py-0.5 rounded">
                    {activeTrip.busNumber}
                  </span>
                  <h3 className="text-lg font-black text-white">
                    {activeTrip.busName}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    ({activeTrip.plateNumber})
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Model: {activeTrip.model} • Class: <span className="text-orange-400 font-semibold">{activeTrip.busType}</span>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {activeTrip.status}
                </span>
                <button
                  onClick={() => onSelectBooking(activeTrip)}
                  className="bg-orange-600 hover:bg-orange-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow transition"
                >
                  Book Seat on This Coach
                </button>
              </div>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Speed</span>
                  <Gauge className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {activeTrip.currentSpeedKmH} <span className="text-xs font-normal text-slate-400">km/h</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-medium">Safe Limit: 90 km/h</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Next Stop ETA</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {activeTrip.etaNextStop}
                </div>
                <span className="text-[10px] text-slate-400 truncate block">{activeTrip.nextStop}</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Cabin Climate</span>
                  <Thermometer className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-xl font-black text-white font-mono">
                  21.5 <span className="text-xs font-normal text-slate-400">°C</span>
                </div>
                <span className="text-[10px] text-cyan-400">Climate Controlled</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Connectivity</span>
                  <Wifi className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-base font-black text-white font-mono">
                  Starlink
                </div>
                <span className="text-[10px] text-emerald-400">98 Mbps Low Latency</span>
              </div>
            </div>

            {/* Checkpoint & Border Crossing Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Corridor Progress & Border Checkpoints
              </h4>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">
                      {getStationById(activeTrip.originId)?.city} ({getStationById(activeTrip.originId)?.country})
                    </span>
                    <span className="text-slate-500">→</span>
                    <span className="font-bold text-orange-400">
                      {getStationById(activeTrip.destinationId)?.city} ({getStationById(activeTrip.destinationId)?.country})
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono">
                    Departure: {activeTrip.departureTime}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(95, Math.max(25, (activeTrip.currentSpeedKmH > 0 ? 68 : 15)))}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Customs Pre-Cleared
                  </span>
                  <span className="text-white font-medium">
                    Current Zone: <span className="text-amber-400">{activeTrip.currentLatLong.label}</span>
                  </span>
                  <span className="text-slate-400">
                    Est. Arrival: {activeTrip.arrivalTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Onboard Amenities */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Certified Vehicle Amenities
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeTrip.amenities.map((item, i) => (
                  <span
                    key={i}
                    className="bg-slate-800 border border-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-lg"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Driver & Bus Crew Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              Assigned Fleet Captain & Crew
            </h3>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-600 p-0.5">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-bold text-white">
                  {activeTrip.driverName.split(' ')[1]?.[0] || 'D'}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-snug">
                  {activeTrip.driverName}
                </h4>
                <p className="text-xs text-slate-400">
                  Senior Trans-West Africa Highway Master
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-amber-400 text-xs font-bold">★ {activeTrip.driverRating}</span>
                  <span className="text-[10px] text-slate-500">• 12+ Yrs Clean Record</span>
                </div>
              </div>
            </div>

            {/* Seat capacity & Booking quick stats */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Passenger Capacity</span>
                <span className="font-bold text-white">{activeTrip.totalSeats} Reclining Seats</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Seats Reserved</span>
                <span className="font-bold text-orange-400">
                  {activeTrip.occupiedSeats.length} / {activeTrip.totalSeats}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Available Now</span>
                <span className="font-bold text-emerald-400">
                  {activeTrip.totalSeats - activeTrip.occupiedSeats.length} seats free
                </span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-400">Standard Ticket Fare</span>
                <span className="font-black text-white text-sm">
                  {convertCurrency(activeTrip.basePriceUSD, currency).formatted}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`tel:${activeTrip.driverPhone}`}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Contact Dispatch Hotline</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* Cargo Waybill Tracking Inspector */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-black text-white font-mono">
                  {activeCargo.trackingNumber}
                </h3>
                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  {activeCargo.packageType}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                From: <span className="text-white font-medium">{getStationById(activeCargo.originId)?.city} ({getStationById(activeCargo.originId)?.country})</span> → 
                To: <span className="text-orange-400 font-medium"> {getStationById(activeCargo.destinationId)?.city} ({getStationById(activeCargo.destinationId)?.country})</span>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {activeCargo.status}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Updated: {activeCargo.lastUpdated}
              </span>
            </div>
          </div>

          {/* Cargo Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-xs text-slate-400">Total Weight</span>
              <p className="text-lg font-black text-white font-mono mt-1">
                {activeCargo.weightKg} <span className="text-xs font-normal text-slate-400">kg</span>
              </p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-xs text-slate-400">Declared Value</span>
              <p className="text-lg font-black text-white font-mono mt-1">
                {convertCurrency(activeCargo.declaredValueUSD, currency).formatted}
              </p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-xs text-slate-400">Assigned Transit</span>
              <p className="text-sm font-bold text-orange-400 truncate mt-1">
                {activeCargo.assignedVehicle}
              </p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-xs text-slate-400">Est. Consignee Delivery</span>
              <p className="text-sm font-bold text-emerald-400 truncate mt-1">
                {activeCargo.estimatedDeliveryDate}
              </p>
            </div>
          </div>

          {/* Interactive Waypoint Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
              Real-Time Waypoint Progress & Depot Handover
            </h4>

            <div className="space-y-4">
              {activeCargo.waypoints.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-3.5">
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow ${
                        step.completed
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {step.completed ? '✓' : idx + 1}
                    </div>
                    {idx < activeCargo.waypoints.length - 1 && (
                      <div
                        className={`w-0.5 h-8 my-1 ${
                          step.completed ? 'bg-emerald-500/60' : 'bg-slate-800'
                        }`}
                      ></div>
                    )}
                  </div>

                  <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold ${step.completed ? 'text-white' : 'text-slate-400'}`}>
                        {step.label}
                      </p>
                      {step.timestamp && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {step.timestamp}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sender & Receiver Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs space-y-1">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">Consignor (Sender)</span>
              <p className="font-bold text-white">{activeCargo.senderName}</p>
              <p className="font-mono text-slate-400">{activeCargo.senderPhone}</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs space-y-1">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">Consignee (Receiver)</span>
              <p className="font-bold text-orange-400">{activeCargo.receiverName}</p>
              <p className="font-mono text-slate-400">{activeCargo.receiverPhone}</p>
            </div>
          </div>
        </div>
      )}

      {/* Complete Fleet Roster: Track & Display Each Bus Location */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bus className="w-4 h-4 text-orange-500" />
              Active Fleet Manifest &amp; Live Bus Locations
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time telemetry and GPS coordinates for every coach operating on the West African Coastal Highway.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/30">
            {busTrips.length} Active Coaches Monitored
          </span>
        </div>

        {/* Responsive Table / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {busTrips.map((b) => {
            const isSelected = selectedTripId === b.id && activeTrackingMode === 'buses';
            const orig = getStationById(b.originId);
            const dest = getStationById(b.destinationId);

            return (
              <div
                key={b.id}
                onClick={() => {
                  setSelectedTripId(b.id);
                  setActiveTrackingMode('buses');
                }}
                className={`p-4 rounded-xl border cursor-pointer transition relative group ${
                  isSelected
                    ? 'bg-slate-950 border-orange-500 shadow-lg shadow-orange-950/60 ring-1 ring-orange-500/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold bg-orange-600 text-white px-2 py-0.5 rounded">
                      {b.busNumber}
                    </span>
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">
                      {b.busName}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      b.status === 'In Transit'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="mt-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Route Corridor:</span>
                    <span className="font-bold text-white">
                      {orig?.flag} {orig?.city} ➔ {dest?.flag} {dest?.city}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Current Location:</span>
                    <span className="font-mono text-orange-400 font-semibold truncate max-w-[170px]">
                      📍 {b.currentLatLong.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Telemetry Speed:</span>
                    <span className="font-mono font-bold text-white">
                      {b.currentSpeedKmH} km/h • ETA: {b.etaNextStop}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">Driver / Class:</span>
                    <span className="text-slate-300 truncate max-w-[150px]">
                      {b.driverName} • {b.busType.split(' ')[0]}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-400 font-mono">
                    {b.totalSeats - b.occupiedSeats.length} seats free
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTripId(b.id);
                      setActiveTrackingMode('buses');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Track on Radar</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

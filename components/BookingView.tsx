'use client';

import React, { useState, useMemo } from 'react';
import { 
  Bus, 
  Calendar, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Armchair, 
  Info,
  Clock,
  Filter,
  ArrowUpDown,
  SlidersHorizontal,
  Wifi,
  Coffee,
  CheckCircle2,
  ChevronDown,
  Maximize2,
  Map
} from 'lucide-react';
import { Station, BusTrip, CurrencyCode, UserProfile } from '@/lib/types';
import { STATIONS, INITIAL_BUS_TRIPS, convertCurrency, getRouteDistanceKm } from '@/lib/data';
import { RouteCalendar } from './RouteCalendar';
import { RouteMapPreview } from './RouteMapPreview';
import { DetailedRouteMapModal } from './DetailedRouteMapModal';

interface BookingViewProps {
  currency: CurrencyCode;
  user: UserProfile | null;
  onProceedToBilling: (bookingDetails: {
    type: 'passenger';
    origin: Station;
    destination: Station;
    trip: BusTrip;
    selectedSeats: number[];
    passengerName: string;
    passengerPhone: string;
    passengerEmail: string;
    idNumber: string;
    busType: string;
    totalAmountUSD: number;
    travelDate: string;
  }) => void;
  initialTrip?: BusTrip;
}

// Convert departure time (e.g., "06:30 AM", "01:15 PM") to minutes from midnight for sorting
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(' ');
  const time = parts[0];
  const modifier = parts[1] || 'AM';
  const [hStr, mStr] = time.split(':');
  let hours = parseInt(hStr, 10) || 0;
  const minutes = parseInt(mStr, 10) || 0;
  if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
  if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// Helper to generate multiple realistic departures for any route
function getAvailableTrips(originId: string, destinationId: string): BusTrip[] {
  const distanceKm = getRouteDistanceKm(originId, destinationId);
  const basePrice = Math.max(25, Math.round(distanceKm * 0.052 + 18));
  const baseDuration = Math.round((distanceKm / 65 + 1.2) * 10) / 10;

  const existing = INITIAL_BUS_TRIPS.filter(
    (t) => t.originId === originId && t.destinationId === destinationId
  );

  const departuresTemplate = [
    {
      idSuffix: 'MORN-1',
      busNumber: 'ST-802',
      busName: 'Atlantic Express Monarch',
      model: 'Scania Marcopolo G7 Luxury Coach',
      departureTime: '06:30 AM',
      arrivalTime: '03:15 PM',
      durationHours: baseDuration,
      basePriceUSD: basePrice,
      busType: 'VIP Royal Sleeper' as const,
      totalSeats: 44,
      occupiedSeats: [1, 2, 5, 6, 11, 12, 17, 18, 23, 24, 30, 31, 35],
      amenities: ['Ultra AC', 'High-Speed Starlink WiFi', 'USB Power Ports', 'Reclining Sleeper Bed', 'Complimentary Breakfast'],
      driverName: 'Capt. Ibrahim Conteh',
      driverRating: 4.9,
    },
    {
      idSuffix: 'MID-2',
      busNumber: 'ST-414',
      busName: 'Savannah Coastline Cruiser',
      model: 'Mercedes-Benz Tourismo HD',
      departureTime: '08:45 AM',
      arrivalTime: '05:30 PM',
      durationHours: Math.round((baseDuration + 0.6) * 10) / 10,
      basePriceUSD: Math.max(22, Math.round(basePrice * 0.88)),
      busType: 'Standard Executive' as const,
      totalSeats: 48,
      occupiedSeats: [3, 4, 7, 8, 15, 16, 20, 25, 26, 32],
      amenities: ['Full Air Conditioning', 'Onboard Audio/Video', 'Ergonomic Recline', 'Luggage Compartment'],
      driverName: 'Alhaji Musa Diallo',
      driverRating: 4.8,
    },
    {
      idSuffix: 'AFT-3',
      busNumber: 'ST-620',
      busName: 'ECOWAS Direct Express',
      model: 'Volvo 9700 Grand Coach',
      departureTime: '01:15 PM',
      arrivalTime: '09:45 PM',
      durationHours: Math.round((baseDuration - 0.3) * 10) / 10,
      basePriceUSD: Math.round(basePrice * 1.15),
      busType: 'VIP Royal Sleeper' as const,
      totalSeats: 40,
      occupiedSeats: [2, 5, 9, 10, 14, 22, 28, 33, 34],
      amenities: ['Starlink Satellite WiFi', 'VIP Sleeper Pods', 'Snack & Coffee Bar', 'Customs Fast-Track'],
      driverName: 'Samuel Johnson Jr.',
      driverRating: 4.95,
    },
    {
      idSuffix: 'NIGHT-4',
      busNumber: 'ST-905',
      busName: 'Inter-Capital Nightliner',
      model: 'Scania Irizar i8 Master Coach',
      departureTime: '08:30 PM',
      arrivalTime: '05:00 AM',
      durationHours: Math.round((baseDuration - 0.2) * 10) / 10,
      basePriceUSD: Math.round(basePrice * 1.05),
      busType: 'VIP Royal Sleeper' as const,
      totalSeats: 44,
      occupiedSeats: [1, 4, 6, 12, 17, 21, 29, 31, 38],
      amenities: ['Full Flat Bed Sleeper', 'Starlink WiFi', 'Night Curtains', 'USB-C Charging'],
      driverName: 'Mamadou Bah',
      driverRating: 4.85,
    },
  ];

  if (existing.length > 0) {
    const others = departuresTemplate.slice(1).map((s) => ({
      id: `TRIP-${originId}-${destinationId}-${s.idSuffix}`,
      busNumber: s.busNumber,
      busName: s.busName,
      model: s.model,
      plateNumber: `ST-${s.busNumber}-WA`,
      originId,
      destinationId,
      departureTime: s.departureTime,
      arrivalTime: s.arrivalTime,
      durationHours: s.durationHours,
      basePriceUSD: s.basePriceUSD,
      busType: s.busType,
      totalSeats: s.totalSeats,
      occupiedSeats: s.occupiedSeats,
      amenities: s.amenities,
      status: 'Scheduled' as const,
      currentSpeedKmH: 0,
      currentLatLong: { lat: 0, lng: 0, label: 'Station Depot' },
      nextStop: 'Terminal Hub',
      etaNextStop: `${s.durationHours} hrs`,
      driverName: s.driverName,
      driverRating: s.driverRating,
      driverPhone: '+234 803 236 7381',
    }));
    return [existing[0], ...others];
  }

  return departuresTemplate.map((s) => ({
    id: `TRIP-${originId}-${destinationId}-${s.idSuffix}`,
    busNumber: s.busNumber,
    busName: s.busName,
    model: s.model,
    plateNumber: `ST-${s.busNumber}-WA`,
    originId,
    destinationId,
    departureTime: s.departureTime,
    arrivalTime: s.arrivalTime,
    durationHours: s.durationHours,
    basePriceUSD: s.basePriceUSD,
    busType: s.busType,
    totalSeats: s.totalSeats,
    occupiedSeats: s.occupiedSeats,
    amenities: s.amenities,
    status: 'Scheduled' as const,
    currentSpeedKmH: 0,
    currentLatLong: { lat: 0, lng: 0, label: 'Station Depot' },
    nextStop: 'Terminal Hub',
    etaNextStop: `${s.durationHours} hrs`,
    driverName: s.driverName,
    driverRating: s.driverRating,
    driverPhone: '+234 803 236 7381',
  }));
}

export function BookingView({
  currency,
  user,
  onProceedToBilling,
  initialTrip,
}: BookingViewProps) {
  const [originId, setOriginId] = useState<string>(initialTrip ? initialTrip.originId : 'station-lagos');
  const [destinationId, setDestinationId] = useState<string>(initialTrip ? initialTrip.destinationId : 'station-accra');
  const [travelDate, setTravelDate] = useState<string>('2026-09-22');
  const [busClass, setBusClass] = useState<'Standard Executive' | 'VIP Royal Sleeper'>(
    initialTrip?.busType || 'VIP Royal Sleeper'
  );

  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'duration-asc' | 'departure-asc' | 'departure-desc'>('departure-asc');
  const [classFilter, setClassFilter] = useState<'all' | 'VIP Royal Sleeper' | 'Standard Executive'>('all');

  const originStation = STATIONS.find((s) => s.id === originId) || STATIONS[5];
  const destinationStation = STATIONS.find((s) => s.id === destinationId) || STATIONS[4];

  // Available trips for this corridor
  const corridorTrips = useMemo(() => {
    return getAvailableTrips(originId, destinationId);
  }, [originId, destinationId]);

  // Filter and Sort Trips
  const filteredAndSortedTrips = useMemo(() => {
    let result = [...corridorTrips];

    // Filter by class
    if (classFilter !== 'all') {
      result = result.filter((t) => t.busType === classFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePriceUSD - b.basePriceUSD;
      if (sortBy === 'price-desc') return b.basePriceUSD - a.basePriceUSD;
      if (sortBy === 'duration-asc') return a.durationHours - b.durationHours;
      if (sortBy === 'departure-asc') {
        return parseTimeToMinutes(a.departureTime) - parseTimeToMinutes(b.departureTime);
      }
      if (sortBy === 'departure-desc') {
        return parseTimeToMinutes(b.departureTime) - parseTimeToMinutes(a.departureTime);
      }
      return 0;
    });

    return result;
  }, [corridorTrips, classFilter, sortBy]);

  // Selected Trip state (defaults to first available trip or initialTrip)
  const [selectedTripId, setSelectedTripId] = useState<string>(
    initialTrip ? initialTrip.id : corridorTrips[0]?.id || ''
  );

  // Sync selected trip when origin or destination changes
  const activeTrip = useMemo(() => {
    return corridorTrips.find((t) => t.id === selectedTripId) || corridorTrips[0];
  }, [corridorTrips, selectedTripId]);

  const [selectedSeats, setSelectedSeats] = useState<number[]>([7]);
  const [isFullMapOpen, setIsFullMapOpen] = useState<boolean>(false);
  const [passengerName, setPassengerName] = useState<string>(user?.name || 'Amara Sesay');
  const [passengerPhone, setPassengerPhone] = useState<string>(user?.phone || '+234 803 236 7381');
  const [passengerEmail, setPassengerEmail] = useState<string>(user?.email || 'amara.sesay@gmail.com');
  const [idNumber, setIdNumber] = useState<string>('ECOWAS-7829-NG');
  const [formError, setFormError] = useState<string>('');

  // Pricing math based on selected trip
  const singleSeatPriceUSD = activeTrip ? activeTrip.basePriceUSD : 45;
  const borderClearanceFeeUSD = 5;
  const totalAmountUSD = singleSeatPriceUSD * selectedSeats.length + borderClearanceFeeUSD;

  // Toggle seat selection
  const handleToggleSeat = (seatNum: number) => {
    if (activeTrip?.occupiedSeats.includes(seatNum)) return; // occupied
    if (selectedSeats.includes(seatNum)) {
      if (selectedSeats.length === 1) return; // keep at least 1 seat
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNum));
    } else {
      if (selectedSeats.length >= 6) {
        setFormError('Maximum 6 seats per booking.');
        return;
      }
      setFormError('');
      setSelectedSeats([...selectedSeats, seatNum]);
    }
  };

  const handleSwapStations = () => {
    const temp = originId;
    setOriginId(destinationId);
    setDestinationId(temp);
  };

  const handleSelectTrip = (trip: BusTrip) => {
    setSelectedTripId(trip.id);
    setBusClass(trip.busType as 'Standard Executive' | 'VIP Royal Sleeper');
    // Ensure selected seats don't collide with new trip's occupied seats
    const validSeats = selectedSeats.filter((s) => !trip.occupiedSeats.includes(s));
    if (validSeats.length > 0) {
      setSelectedSeats(validSeats);
    } else {
      // Find first available seat
      const firstFree = Array.from({ length: trip.totalSeats }, (_, i) => i + 1).find(
        (s) => !trip.occupiedSeats.includes(s)
      );
      if (firstFree) setSelectedSeats([firstFree]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (originId === destinationId) {
      setFormError('Departure and Destination terminals cannot be the same.');
      return;
    }
    if (selectedSeats.length === 0) {
      setFormError('Please select at least 1 seat from the coach seating map.');
      return;
    }
    if (!passengerName.trim() || !passengerPhone.trim()) {
      setFormError('Please fill in passenger contact details.');
      return;
    }
    setFormError('');

    onProceedToBilling({
      type: 'passenger',
      origin: originStation,
      destination: destinationStation,
      trip: { ...activeTrip, busType: busClass },
      selectedSeats,
      passengerName,
      passengerPhone,
      passengerEmail,
      idNumber,
      busType: busClass,
      totalAmountUSD,
      travelDate,
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner / Title */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Bus className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-black text-white tracking-tight">
                Book Inter-State &amp; Cross-Border Passenger Coach
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Travel comfortably with Sumahora Transport across Lagos, Accra, Abidjan, Monrovia, Freetown, and Conakry. 
              Enjoy air conditioning, Starlink WiFi, and automated ECOWAS border clearance.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ECOWAS Free Movement Compliant</span>
          </div>
        </div>
      </div>

      {formError && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl flex items-center space-x-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Booking Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Route Selection, Compact Map, Trips Filter Bar, Calendar & Passenger Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Station Selection */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                1. Select Origin &amp; Destination Terminals
              </h3>
              <button
                type="button"
                id="open-full-map-btn"
                onClick={() => setIsFullMapOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-orange-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition border border-slate-700 hover:border-orange-500 cursor-pointer shadow-sm group"
                title="Open detailed interactive corridor map"
              >
                <Maximize2 className="w-3.5 h-3.5 text-orange-400 group-hover:text-white transition" />
                <span>Open Full Map</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
              {/* Origin */}
              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Departure Depot (From)
                </label>
                <select
                  id="booking-origin-select"
                  value={originId}
                  onChange={(e) => setOriginId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  {STATIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.flag} {s.city}, {s.country}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 truncate">
                  {originStation.terminalName}
                </p>
              </div>

              {/* Swap Button */}
              <div className="sm:col-span-1 flex justify-center pt-3">
                <button
                  type="button"
                  id="swap-route-btn"
                  onClick={handleSwapStations}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-orange-400 rounded-full border border-slate-700 transition hover:scale-110 active:scale-95"
                  title="Swap Departure and Destination"
                >
                  ⇄
                </button>
              </div>

              {/* Destination */}
              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Arrival Depot (To)
                </label>
                <select
                  id="booking-dest-select"
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  {STATIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.flag} {s.city}, {s.country}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 truncate">
                  {destinationStation.terminalName}
                </p>
              </div>
            </div>
          </div>

          {/* Compact Map Visualization displaying route path, distance, and telemetry */}
          <RouteMapPreview
            originStation={originStation}
            destinationStation={destinationStation}
            busClass={busClass}
            onOpenFullMap={() => setIsFullMapOpen(true)}
          />

          {/* Available Bus Trips & Sort / Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-orange-500" />
                  2. Available Bus Trips &amp; Departures ({filteredAndSortedTrips.length})
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Choose your preferred coach departure. Click any card to select.
                </p>
              </div>

              {/* Filter Bar Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Sort Dropdown */}
                <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
                  <ArrowUpDown className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-[11px] text-slate-400 font-medium">Sort:</span>
                  <select
                    id="booking-sort-select"
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="departure-asc" className="bg-slate-900 text-white">Departure: Earliest First</option>
                    <option value="departure-desc" className="bg-slate-900 text-white">Departure: Latest First</option>
                    <option value="price-asc" className="bg-slate-900 text-white">Price: Low to High</option>
                    <option value="price-desc" className="bg-slate-900 text-white">Price: High to Low</option>
                    <option value="duration-asc" className="bg-slate-900 text-white">Duration: Shortest First</option>
                  </select>
                </div>

                {/* Class Filter Dropdown */}
                <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
                  <Filter className="w-3.5 h-3.5 text-amber-400" />
                  <select
                    id="booking-class-filter-select"
                    value={classFilter}
                    onChange={(e: any) => setClassFilter(e.target.value)}
                    className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-900 text-white">All Classes</option>
                    <option value="VIP Royal Sleeper" className="bg-slate-900 text-white">VIP Royal Sleeper</option>
                    <option value="Standard Executive" className="bg-slate-900 text-white">Standard Executive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Trips List */}
            <div className="space-y-3">
              {filteredAndSortedTrips.map((trip) => {
                const isSelected = activeTrip?.id === trip.id;
                const freeSeats = trip.totalSeats - trip.occupiedSeats.length;

                return (
                  <div
                    key={trip.id}
                    id={`bus-trip-card-${trip.id}`}
                    onClick={() => handleSelectTrip(trip)}
                    className={`p-4 rounded-xl border transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-slate-950 border-orange-500 shadow-lg shadow-orange-950/50 ring-1 ring-orange-500/60'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    {/* Top row: Times, duration, price */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-4">
                        {/* Radio selection indicator */}
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition shrink-0 ${
                          isSelected ? 'border-orange-500 bg-orange-600' : 'border-slate-600 bg-slate-900'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>

                        {/* Timing Block */}
                        <div>
                          <div className="flex items-center space-x-2 text-sm font-black text-white font-mono">
                            <span>{trip.departureTime}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                            <span>{trip.arrivalTime}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-orange-400" />
                              {trip.durationHours}h transit
                            </span>
                            <span>•</span>
                            <span className="text-emerald-400 font-medium">Direct Coastal Highway</span>
                          </div>
                        </div>
                      </div>

                      {/* Price & Class Badge */}
                      <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                        <div className="text-lg font-black text-white font-mono leading-none">
                          {convertCurrency(trip.basePriceUSD, currency).formatted}
                          <span className="text-[10px] text-slate-400 font-sans font-normal ml-1">/ seat</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 ${
                          trip.busType === 'VIP Royal Sleeper'
                            ? 'bg-gradient-to-r from-orange-600/20 to-amber-600/20 text-orange-400 border-orange-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {trip.busType}
                        </span>
                      </div>
                    </div>

                    {/* Bottom row: Bus number, model, seats remaining & amenities */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-orange-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {trip.busNumber}
                        </span>
                        <span className="text-white font-semibold truncate max-w-[160px] sm:max-w-none">
                          {trip.busName}
                        </span>
                        <span className="text-[11px] text-slate-500 hidden md:inline">
                          ({trip.model.split(' ')[0]})
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-[11px]">
                        <span className="text-emerald-400 font-mono font-semibold">
                          {freeSeats} seats available
                        </span>
                        <span className="text-slate-600">•</span>
                        <div className="flex items-center space-x-1.5 text-slate-400">
                          <Wifi className="w-3 h-3 text-orange-400" />
                          <Coffee className="w-3 h-3 text-amber-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredAndSortedTrips.length === 0 && (
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                  No bus trips match your selected filter criteria. Try selecting &quot;All Classes&quot;.
                </div>
              )}
            </div>
          </div>

          {/* Visual Route Calendar with Live Date Availability */}
          <RouteCalendar
            selectedDate={travelDate}
            onSelectDate={(newDate) => setTravelDate(newDate)}
            originCity={originStation.city}
            destinationCity={destinationStation.city}
            basePriceUSD={activeTrip.basePriceUSD}
            currency={currency}
          />

          {/* Passenger Details Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              3. Passenger Manifest Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Full Name (as on Passport/ID) *
                </label>
                <input
                  type="text"
                  id="passenger-name-input"
                  required
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="e.g. Amara Sesay"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  WhatsApp / Phone Number *
                </label>
                <input
                  type="tel"
                  id="passenger-phone-input"
                  required
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  placeholder="+234 803 236 7381"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Email for E-Ticket Delivery
                </label>
                <input
                  type="email"
                  id="passenger-email-input"
                  value={passengerEmail}
                  onChange={(e) => setPassengerEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  National ID / ECOWAS Passport #
                </label>
                <input
                  type="text"
                  id="passenger-id-input"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="e.g. SL-904812 or ECOWAS-WA"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Coach Seat Layout & Instant Automated Billing Quote */}
        <div className="lg:col-span-5 space-y-6">
          {/* Visual Seat Map */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Armchair className="w-4 h-4 text-orange-500" />
                  4. Select Coach Seats ({selectedSeats.length} chosen)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Coach {activeTrip.busNumber} • Seats: {selectedSeats.join(', ')}
                </p>
              </div>

              <div className="flex items-center space-x-3 text-[10px]">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-orange-600 rounded"></div>
                  <span className="text-slate-300">Selected</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-slate-800 border border-slate-700 rounded"></div>
                  <span className="text-slate-300">Free</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-slate-950 border border-rose-900/60 rounded"></div>
                  <span className="text-slate-500">Booked</span>
                </div>
              </div>
            </div>

            {/* Coach Cabin Diagram */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-w-sm mx-auto">
              {/* Driver & Cabin Front */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[10px] text-slate-500">
                <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">
                  🚪 Door / Stairs
                </span>
                <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800 font-mono text-slate-300">
                  🚌 Driver ({activeTrip.driverName})
                </span>
              </div>

              {/* Seating Grid (Rows of 4 with center aisle) */}
              <div className="space-y-2">
                {[...Array(11)].map((_, rowIndex) => {
                  const s1 = rowIndex * 4 + 1;
                  const s2 = rowIndex * 4 + 2;
                  const s3 = rowIndex * 4 + 3;
                  const s4 = rowIndex * 4 + 4;

                  const renderSeat = (num: number) => {
                    const isOccupied = activeTrip.occupiedSeats.includes(num);
                    const isSelected = selectedSeats.includes(num);

                    return (
                      <button
                        type="button"
                        key={num}
                        id={`seat-btn-${num}`}
                        disabled={isOccupied}
                        onClick={() => handleToggleSeat(num)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center transition ${
                          isOccupied
                            ? 'bg-slate-950 text-slate-700 border border-slate-900 cursor-not-allowed'
                            : isSelected
                            ? 'bg-orange-600 text-white shadow-md shadow-orange-950/60 scale-105 border border-orange-400 ring-2 ring-orange-400/40'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/80 hover:border-orange-500/50'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  };

                  return (
                    <div key={rowIndex} className="flex items-center justify-between">
                      <div className="flex space-x-1.5">
                        {renderSeat(s1)}
                        {renderSeat(s2)}
                      </div>
                      <span className="text-[9px] text-slate-700 font-mono">
                        {rowIndex + 1}
                      </span>
                      <div className="flex space-x-1.5">
                        {renderSeat(s3)}
                        {renderSeat(s4)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800 text-center text-[10px] text-slate-500">
                Restroom &amp; Emergency Exit at Rear
              </div>
            </div>
          </div>

          {/* Automated Billing Summary Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-orange-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Automated Billing Breakdown
                </h3>
                <span className="text-[10px] text-emerald-400 font-medium">
                  Instant E-Ticket Calculation
                </span>
              </div>
              <span className="text-xs font-bold font-mono bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/40">
                {currency}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>
                  Coach Fare ({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''})
                </span>
                <span className="font-mono font-medium">
                  {convertCurrency(singleSeatPriceUSD * selectedSeats.length, currency).formatted}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>ECOWAS FastTrack Border Clearance</span>
                <span className="font-mono font-medium">
                  {convertCurrency(borderClearanceFeeUSD, currency).formatted}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Selected Coach Service</span>
                <span className="text-orange-400 font-semibold">{activeTrip.busName} ({activeTrip.busType})</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Luggage Allowance (2x 25kg free)</span>
                <span className="text-emerald-400 font-medium">Included</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Starlink WiFi &amp; Refreshments</span>
                <span className="text-emerald-400 font-medium">Free</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Payable</p>
                <div className="text-2xl font-black text-white font-mono">
                  {convertCurrency(totalAmountUSD, currency).formatted}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                USD Eq: ${totalAmountUSD}
              </span>
            </div>

            <button
              type="submit"
              id="proceed-to-automated-billing-btn"
              className="w-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-500 hover:to-amber-500 text-white py-3.5 px-4 rounded-xl text-xs font-bold shadow-lg shadow-orange-950/50 flex items-center justify-center space-x-2 transition"
            >
              <span>Proceed to Automated Billing &amp; Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[10px] text-slate-500">
              Instant E-Ticket &amp; Barcode issued upon payment completion.
            </p>
          </div>
        </div>
      </form>

      {/* Detailed Interactive Route Map Modal */}
      <DetailedRouteMapModal
        isOpen={isFullMapOpen}
        onClose={() => setIsFullMapOpen(false)}
        originStation={originStation}
        destinationStation={destinationStation}
        busClass={busClass}
        activeTrip={activeTrip}
      />
    </div>
  );
}

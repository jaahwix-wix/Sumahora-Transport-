'use client';

import React, { useState, useId, useMemo } from 'react';
import { 
  Package, 
  MapPin, 
  Scale, 
  ShieldAlert, 
  ArrowRight, 
  FileText, 
  Truck, 
  Check, 
  Info, 
  DollarSign, 
  AlertCircle,
  Navigation,
  Sparkles,
  Zap,
  Box,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Radio,
  Search,
  ExternalLink,
  Copy,
  ChevronRight
} from 'lucide-react';
import { Station, CurrencyCode, UserProfile, CargoShipment } from '@/lib/types';
import { STATIONS, convertCurrency, getRouteDistanceKm, INITIAL_CARGO_SHIPMENTS } from '@/lib/data';

interface CargoViewProps {
  currency: CurrencyCode;
  user: UserProfile | null;
  onProceedToBilling: (cargoDetails: {
    type: 'cargo';
    origin: Station;
    destination: Station;
    packageType: CargoShipment['packageType'];
    weightKg: number;
    declaredValueUSD: number;
    withInsurance: boolean;
    senderName: string;
    senderPhone: string;
    receiverName: string;
    receiverPhone: string;
    totalAmountUSD: number;
    deliveryMethod: 'Depot-to-Depot' | 'Depot-to-Doorstep';
    distanceKm: number;
    priorityTier: string;
    packagingType: string;
  }) => void;
  cargoShipments?: CargoShipment[];
  onTrackCode?: (code: string) => void;
}

export function CargoView({ 
  currency, 
  user, 
  onProceedToBilling,
  cargoShipments = INITIAL_CARGO_SHIPMENTS,
  onTrackCode
}: CargoViewProps) {
  const originSelectId = useId();
  const destSelectId = useId();
  const pkgTypeSelectId = useId();
  const packagingSelectId = useId();
  const prioritySelectId = useId();

  // Active subtab: 'calculator' or 'shipments'
  const [activeSubTab, setActiveSubTab] = useState<'calculator' | 'shipments'>('calculator');

  // Search & filter state for shipments
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'In Transit' | 'Customs Cleared' | 'Received at Depot'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form input states
  const [originId, setOriginId] = useState<string>('station-lagos');
  const [destinationId, setDestinationId] = useState<string>('station-accra');
  const [packageType, setPackageType] = useState<CargoShipment['packageType']>('Electronics');
  const [weightKg, setWeightKg] = useState<number>(25);
  const [declaredValueUSD, setDeclaredValueUSD] = useState<number>(450);
  const [withInsurance, setWithInsurance] = useState<boolean>(true);
  const [deliveryMethod, setDeliveryMethod] = useState<'Depot-to-Depot' | 'Depot-to-Doorstep'>('Depot-to-Depot');
  const [priorityTier, setPriorityTier] = useState<'standard' | 'express' | 'next_coach'>('express');
  const [packagingType, setPackagingType] = useState<'standard_wrap' | 'wooden_crate' | 'anti_tamper'>('standard_wrap');
  
  // Volumetric dimensions
  const [useVolumetric, setUseVolumetric] = useState<boolean>(false);
  const [dimLength, setDimLength] = useState<number>(40);
  const [dimWidth, setDimWidth] = useState<number>(30);
  const [dimHeight, setDimHeight] = useState<number>(25);

  // Contact info
  const [senderName, setSenderName] = useState<string>(user?.name || 'Chief Emmanuel Eze');
  const [senderPhone, setSenderPhone] = useState<string>(user?.phone || '+234 803 236 7381');
  const [receiverName, setReceiverName] = useState<string>('Kwame Mensah');
  const [receiverPhone, setReceiverPhone] = useState<string>('+233 555 545 359');
  const [formError, setFormError] = useState<string>('');

  const originStation = STATIONS.find((s) => s.id === originId) || STATIONS[5];
  const destinationStation = STATIONS.find((s) => s.id === destinationId) || STATIONS[4];

  // Dynamic Distance Calculation
  const distanceKm = getRouteDistanceKm(originId, destinationId);

  // Volumetric Weight Calculation (Standard IATA cargo formula: L*W*H / 5000 in cm)
  const volumetricWeightKg = useVolumetric ? Math.round(((dimLength * dimWidth * dimHeight) / 5000) * 10) / 10 : 0;
  const billableWeightKg = Math.max(weightKg, volumetricWeightKg);

  // Dynamic Real-time Cost Estimation Formula based on Weight & Distance
  // 1. Distance factor: $4.50 base + $1.80 per 200 km
  const distanceFactorUSD = (distanceKm / 100) * 1.65;

  // 2. Weight tariff: tiered rate
  // First 10 kg: $1.25/kg; next 40 kg: $0.95/kg; over 50 kg: $0.75/kg
  let weightTariffUSD = 0;
  if (billableWeightKg <= 10) {
    weightTariffUSD = billableWeightKg * 1.25;
  } else if (billableWeightKg <= 50) {
    weightTariffUSD = 10 * 1.25 + (billableWeightKg - 10) * 0.95;
  } else {
    weightTariffUSD = 10 * 1.25 + 40 * 0.95 + (billableWeightKg - 50) * 0.75;
  }

  // 3. Category complexity surcharge
  const categorySurcharge: Record<CargoShipment['packageType'], number> = {
    'Electronics': 8,
    'Commercial Freight': 12,
    'Textiles & Garments': 4,
    'Documents': 0,
    'Perishables': 15,
  };
  const categoryFeeUSD = categorySurcharge[packageType] || 5;

  // 4. Priority tier multiplier
  const priorityMultipliers = {
    standard: 1.0,
    express: 1.2,
    next_coach: 1.45,
  };
  const priorityExtraUSD = Math.round((weightTariffUSD + distanceFactorUSD) * (priorityMultipliers[priorityTier] - 1));

  // 5. Packaging fee
  const packagingFeeUSD = packagingType === 'wooden_crate' ? 18 : packagingType === 'anti_tamper' ? 8 : 2;

  // 6. Customs clearance & ECOWAS seal
  const customsClearingUSD = 10;

  // 7. Insurance
  const insuranceUSD = withInsurance ? Math.max(5, Math.round(declaredValueUSD * 0.025)) : 0;

  // 8. Doorstep delivery
  const doorstepFeeUSD = deliveryMethod === 'Depot-to-Doorstep' ? 12 : 0;

  // Total dynamic cost
  const rawSubtotalUSD = distanceFactorUSD + weightTariffUSD + categoryFeeUSD + priorityExtraUSD + packagingFeeUSD + customsClearingUSD + insuranceUSD + doorstepFeeUSD;
  const totalAmountUSD = Math.max(18, Math.round(rawSubtotalUSD));

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (originId === destinationId) {
      setFormError('Dispatch Depot and Destination Hub cannot be the same station.');
      return;
    }
    if (weightKg <= 0) {
      setFormError('Weight must be at least 0.5 kg.');
      return;
    }
    if (!senderName || !senderPhone || !receiverName || !receiverPhone) {
      setFormError('Please enter both sender and receiver contact information.');
      return;
    }
    setFormError('');

    onProceedToBilling({
      type: 'cargo',
      origin: originStation,
      destination: destinationStation,
      packageType,
      weightKg: billableWeightKg,
      declaredValueUSD,
      withInsurance,
      senderName,
      senderPhone,
      receiverName,
      receiverPhone,
      totalAmountUSD,
      deliveryMethod,
      distanceKm,
      priorityTier,
      packagingType,
    });
  };

  // Filtered shipments for progress bar view
  const filteredShipments = useMemo(() => {
    return cargoShipments.filter((s) => {
      const matchesSearch = 
        s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.packageType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [cargoShipments, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Title Card & Mode Navigation Toggle */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-black text-white tracking-tight">
                ECOWAS Cross-Border Cargo &amp; Freight Services
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Calculate instant dynamic freight tariffs, book sealed waybill consignments, and monitor real-time shipment progress along the West African coastal transport corridor.
            </p>
          </div>

          {/* Subtab Toggle Buttons */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              id="cargo-tab-calculator"
              type="button"
              onClick={() => setActiveSubTab('calculator')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeSubTab === 'calculator'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Tariff Calculator &amp; Booking</span>
            </button>

            <button
              id="cargo-tab-shipments"
              type="button"
              onClick={() => setActiveSubTab('shipments')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeSubTab === 'shipments'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Shipments &amp; Waypoint Progress</span>
              <span className="bg-slate-900 text-orange-400 text-[10px] px-1.5 py-0.2 rounded-full border border-slate-700 ml-1">
                {cargoShipments.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {formError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center space-x-2 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* VIEW 1: SHIPMENTS & WAYPOINT PROGRESS DASHBOARD */}
      {activeSubTab === 'shipments' && (
        <div className="space-y-6">
          {/* Filter and search bar for consignments */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="search-cargo-shipments-input"
                placeholder="Search tracking #, sender, or consignee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Status Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', 'In Transit', 'Customs Cleared', 'Received at Depot'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  id={`filter-shipment-status-${st.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    statusFilter === st
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {st === 'all' ? 'All Active' : st}
                </button>
              ))}
            </div>
          </div>

          {/* List of Shipments with Dynamic Waypoint Progress Bars */}
          <div className="space-y-5">
            {filteredShipments.map((shipment) => {
              const originSt = STATIONS.find((s) => s.id === shipment.originId);
              const destSt = STATIONS.find((s) => s.id === shipment.destinationId);

              // Waypoint Progress Calculation
              const totalWaypoints = shipment.waypoints.length;
              const completedWaypoints = shipment.waypoints.filter((w) => w.completed).length;
              const progressPercent = totalWaypoints > 0 
                ? Math.round((completedWaypoints / totalWaypoints) * 100) 
                : 0;

              // Current active waypoint
              const currentWaypoint = shipment.waypoints.find((w) => !w.completed) || shipment.waypoints[shipment.waypoints.length - 1];

              return (
                <div
                  key={shipment.trackingNumber}
                  id={`shipment-card-${shipment.trackingNumber}`}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700/90 rounded-2xl p-5 shadow-xl transition space-y-4"
                >
                  {/* Top Row: Tracking #, Status, Origin/Destination Route */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400 shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-white text-sm">
                            {shipment.trackingNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(shipment.trackingNumber)}
                            className="text-slate-400 hover:text-white p-1 rounded transition"
                            title="Copy Tracking Number"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {copiedCode === shipment.trackingNumber && (
                            <span className="text-[10px] text-emerald-400 font-mono">Copied!</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {shipment.packageType} • <strong className="text-slate-300">{shipment.weightKg} kg</strong> • Declared: ${shipment.declaredValueUSD}
                        </p>
                      </div>
                    </div>

                    {/* Route & Status Badge */}
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                          <span>{originSt?.flag} {originSt?.city}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                          <span>{destSt?.flag} {destSt?.city}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Carrier: {shipment.assignedVehicle}
                        </span>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        shipment.status === 'In Transit'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                          : shipment.status === 'Customs Cleared'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/40'
                      }`}>
                        {shipment.status}
                      </span>
                    </div>
                  </div>

                  {/* VISUAL PROGRESS BAR SECTION (Requested Feature) */}
                  <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-orange-400" />
                          Transit Waypoint Progress
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 text-[11px]">
                          {completedWaypoints} of {totalWaypoints} checkpoints cleared
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 font-mono">
                        <span className={`text-xs font-black ${
                          progressPercent >= 100 
                            ? 'text-emerald-400' 
                            : progressPercent >= 60 
                            ? 'text-amber-400' 
                            : 'text-orange-400'
                        }`}>
                          {progressPercent}% Complete
                        </span>
                      </div>
                    </div>

                    {/* Animated Progress Bar Track */}
                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 relative">
                      <div 
                        className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 shadow-sm shadow-orange-500/50"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>

                    {/* Waypoint Milestones Timeline */}
                    <div className="pt-3 grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                      {shipment.waypoints.map((wp, idx) => {
                        const isDone = wp.completed;
                        const isCurrent = !isDone && (idx === 0 || shipment.waypoints[idx - 1]?.completed);

                        return (
                          <div 
                            key={idx}
                            className={`p-2 rounded-lg border text-left flex flex-col justify-between transition ${
                              isDone
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : isCurrent
                                ? 'bg-orange-500/10 border-orange-500/40 text-orange-300 shadow-sm ring-1 ring-orange-500/30'
                                : 'bg-slate-900/40 border-slate-800 text-slate-500'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] font-mono font-bold">
                                Step {idx + 1}
                              </span>
                              {isDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : isCurrent ? (
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                </span>
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                              )}
                            </div>

                            <p className="text-[11px] font-medium leading-tight truncate-2-lines line-clamp-2">
                              {wp.label}
                            </p>

                            <span className="text-[9px] font-mono mt-1 opacity-80 block">
                              {wp.timestamp || (isCurrent ? 'Current' : 'Pending')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Consignment Footer Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs text-slate-400">
                    <div className="flex flex-wrap items-center gap-3">
                      <span>Sender: <strong className="text-slate-300">{shipment.senderName}</strong></span>
                      <span>•</span>
                      <span>Receiver: <strong className="text-slate-300">{shipment.receiverName}</strong></span>
                      <span>•</span>
                      <span>ETA: <strong className="text-emerald-400">{shipment.estimatedDeliveryDate}</strong></span>
                    </div>

                    {onTrackCode && (
                      <button
                        type="button"
                        onClick={() => onTrackCode(shipment.trackingNumber)}
                        className="bg-slate-800 hover:bg-slate-700 text-orange-400 border border-slate-700 hover:border-orange-500/50 px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition self-end sm:self-auto"
                      >
                        <span>View on GPS Radar</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredShipments.length === 0 && (
              <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-2">
                <Package className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-white">No Cargo Consignments Found</p>
                <p className="text-xs text-slate-400">
                  No shipments matched your search or status filter.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE CARGO TARIFF CALCULATOR & BOOKING FORM */}
      {activeSubTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Input Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-orange-500" />
                  1. Route &amp; Transit Corridor Distance
                </span>
                <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/30">
                  {distanceKm} km transit
                </span>
              </div>

              {/* Origin & Destination Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor={originSelectId} className="text-xs text-slate-300 font-medium">Origin Dispatch Depot</label>
                  <select
                    id={originSelectId}
                    value={originId}
                    onChange={(e) => setOriginId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    {STATIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.flag} {s.city}, {s.country} ({s.terminalName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={destSelectId} className="text-xs text-slate-300 font-medium">Destination Hub</label>
                  <select
                    id={destSelectId}
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    {STATIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.flag} {s.city}, {s.country} ({s.terminalName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Distance bar visual indicator */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{originStation.flag}</span>
                  <span className="font-bold text-white">{originStation.city}</span>
                </div>
                <div className="flex-1 px-4 flex items-center space-x-2">
                  <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 w-full animate-pulse"></div>
                  </div>
                  <span className="font-mono text-orange-400 font-bold text-[11px]">{distanceKm} km</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white">{destinationStation.city}</span>
                  <span className="text-lg">{destinationStation.flag}</span>
                </div>
              </div>
            </div>

            {/* Cargo Category, Weight & Volumetric Dimensions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-orange-500" />
                  2. Cargo Category &amp; Weight Specifications
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Billable Weight: <strong className="text-orange-400">{billableWeightKg} kg</strong>
                </span>
              </div>

              {/* Package Category */}
              <div className="space-y-1.5">
                <label htmlFor={pkgTypeSelectId} className="text-xs text-slate-300 font-medium">Consignment Category</label>
                <select
                  id={pkgTypeSelectId}
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Electronics">Electronics (High Value, Seal Verified)</option>
                  <option value="Commercial Freight">Commercial Freight (Pallet / Bulk Cartons)</option>
                  <option value="Textiles & Garments">Textiles, Garments &amp; Fabrics</option>
                  <option value="Documents">Secure Documents &amp; Diplomatic Pouches</option>
                  <option value="Perishables">Perishables &amp; Temperature Regulated</option>
                </select>
              </div>

              {/* Weight Inputs (Slider + Number) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Physical Gross Weight:</span>
                  <span className="font-mono text-white font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {weightKg} kg
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={250}
                  step={1}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1 kg (Parcel)</span>
                  <span>50 kg</span>
                  <span>100 kg</span>
                  <span>250 kg (Freight)</span>
                </div>
              </div>

              {/* Volumetric Calculator Toggle */}
              <div className="pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Box className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-slate-300 font-medium">Volumetric (Dimensional) Weight Check</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseVolumetric(!useVolumetric)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition ${
                      useVolumetric 
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' 
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {useVolumetric ? 'Enabled (L x W x H)' : 'Calculate Dimensions'}
                  </button>
                </div>

                {useVolumetric && (
                  <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
                    <p className="text-[11px] text-slate-400">
                      Standard IATA air &amp; road freight rule: (Length × Width × Height in cm) ÷ 5000.
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Length (cm)</label>
                        <input
                          type="number"
                          min={5}
                          value={dimLength}
                          onChange={(e) => setDimLength(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Width (cm)</label>
                        <input
                          type="number"
                          min={5}
                          value={dimWidth}
                          onChange={(e) => setDimWidth(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Height (cm)</label>
                        <input
                          type="number"
                          min={5}
                          value={dimHeight}
                          onChange={(e) => setDimHeight(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[11px] pt-1">
                      <span className="text-slate-400">Calculated Volumetric Weight:</span>
                      <span className="font-mono font-bold text-amber-400">{volumetricWeightKg} kg</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Priority & Packaging */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-3 border-b border-slate-800">
                <Zap className="w-4 h-4 text-orange-500" />
                3. Dispatch Priority &amp; Security Packaging
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor={prioritySelectId} className="text-xs text-slate-300 font-medium">Dispatch Priority Tier</label>
                  <select
                    id={prioritySelectId}
                    value={priorityTier}
                    onChange={(e) => setPriorityTier(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="standard">Standard Route Carrier (2-3 days)</option>
                    <option value="express">Express Bay Allocation (+20%)</option>
                    <option value="next_coach">Immediate Next Coach Priority (+45%)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={packagingSelectId} className="text-xs text-slate-300 font-medium">Customs Security Packaging</label>
                  <select
                    id={packagingSelectId}
                    value={packagingType}
                    onChange={(e) => setPackagingType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="standard_wrap">Heavy-Duty Heat Shrink Film ($2)</option>
                    <option value="anti_tamper">Anti-Tamper Barcode Security Bag ($8)</option>
                    <option value="wooden_crate">Reinforced Wooden Export Crate ($18)</option>
                  </select>
                </div>
              </div>

              {/* Declared Value & Insurance */}
              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Declared Merchandise Value (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={declaredValueUSD}
                      onChange={(e) => setDeclaredValueUSD(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-7 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-4 sm:pt-6">
                  <input
                    type="checkbox"
                    id="cargo-insurance-check"
                    checked={withInsurance}
                    onChange={(e) => setWithInsurance(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                  <label htmlFor="cargo-insurance-check" className="text-xs text-slate-300 cursor-pointer">
                    <span className="font-semibold block text-white">Full Marine/Transit Insurance</span>
                    <span className="text-[10px] text-slate-400">Guarantees 100% loss/damage compensation (2.5%)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Sender & Receiver Contacts */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-3 border-b border-slate-800">
                <FileText className="w-4 h-4 text-orange-500" />
                4. Manifest Contact Information
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Shipper / Sender Name *</label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Chief Emmanuel Eze"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Shipper WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    required
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="+234 803 236 7381"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Consignee / Receiver Name *</label>
                  <input
                    type="text"
                    required
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="e.g. Kwame Mensah"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Consignee WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    required
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    placeholder="+233 555 545 359"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Dynamic Live Tariff Breakdown & Automated Billing Quote (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-orange-500/40 rounded-2xl p-5 shadow-2xl space-y-4 sticky top-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    Automated Waybill Quote
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    Calculated in Real-Time
                  </span>
                </div>
                <span className="text-xs font-bold font-mono bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/40">
                  {currency}
                </span>
              </div>

              {/* Dynamic Formula Itemization */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Corridor Distance Tariff ({distanceKm} km)</span>
                  <span className="font-mono font-medium">
                    {convertCurrency(distanceFactorUSD, currency).formatted}
                  </span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Weight Surcharge ({billableWeightKg} kg billable)</span>
                  <span className="font-mono font-medium">
                    {convertCurrency(weightTariffUSD, currency).formatted}
                  </span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Category Rate ({packageType})</span>
                  <span className="font-mono font-medium">
                    {convertCurrency(categoryFeeUSD, currency).formatted}
                  </span>
                </div>

                {priorityExtraUSD > 0 && (
                  <div className="flex justify-between text-amber-300">
                    <span>Priority Tier Dispatch Surcharge</span>
                    <span className="font-mono font-medium">
                      +{convertCurrency(priorityExtraUSD, currency).formatted}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-300">
                  <span>Packaging &amp; Anti-Tamper Sealing</span>
                  <span className="font-mono font-medium">
                    {convertCurrency(packagingFeeUSD, currency).formatted}
                  </span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>ECOWAS Customs FastTrack Clearing &amp; Seal</span>
                  <span className="font-mono font-medium">
                    {convertCurrency(customsClearingUSD, currency).formatted}
                  </span>
                </div>

                {withInsurance && (
                  <div className="flex justify-between text-emerald-300">
                    <span>Transit Comprehensive Insurance (2.5%)</span>
                    <span className="font-mono font-medium">
                      {convertCurrency(insuranceUSD, currency).formatted}
                    </span>
                  </div>
                )}

                {doorstepFeeUSD > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span>Final Doorstep Last-Mile Delivery</span>
                    <span className="font-mono font-medium">
                      {convertCurrency(doorstepFeeUSD, currency).formatted}
                    </span>
                  </div>
                )}
              </div>

              {/* Delivery method selector */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400 block mb-1 font-semibold">Collection / Delivery Method:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('Depot-to-Depot')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition border ${
                      deliveryMethod === 'Depot-to-Depot'
                        ? 'bg-orange-600/20 text-orange-400 border-orange-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Depot Collection
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('Depot-to-Doorstep')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition border ${
                      deliveryMethod === 'Depot-to-Doorstep'
                        ? 'bg-orange-600/20 text-orange-400 border-orange-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Doorstep (+$12)
                  </button>
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Consignment Price</p>
                  <div className="text-2xl font-black text-white font-mono">
                    {convertCurrency(totalAmountUSD, currency).formatted}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  USD Eq: ${totalAmountUSD}
                </span>
              </div>

              {/* Action Button */}
              <button
                type="button"
                id="book-waybill-btn"
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white py-3.5 px-4 rounded-xl text-sm font-black transition flex items-center justify-center space-x-2 shadow-xl shadow-orange-950/60"
              >
                <span>Book Waybill &amp; Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Includes official Barcoded Consignment Manifest
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

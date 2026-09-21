import { Station, BusTrip, CargoShipment, UserProfile, CurrencyCode } from './types';

// Exchange rates against USD base (approx real-world parity for West Africa)
export const EXCHANGE_RATES: Record<CurrencyCode, { rate: number; symbol: string; name: string }> = {
  USD: { rate: 1.0, symbol: '$', name: 'US Dollar' },
  NGN: { rate: 1485.50, symbol: '₦', name: 'Nigerian Naira' },
  GHS: { rate: 15.35, symbol: '₵', name: 'Ghanaian Cedi' },
  SLE: { rate: 22.90, symbol: 'Le', name: 'Sierra Leonean Leone' },
  XOF: { rate: 612.40, symbol: 'CFA', name: 'West African CFA' },
  GNF: { rate: 8690.00, symbol: 'FG', name: 'Guinean Franc' },
};

export function updateLiveExchangeRates(newRates: Partial<Record<CurrencyCode, number>>) {
  for (const [key, rate] of Object.entries(newRates)) {
    const c = key as CurrencyCode;
    if (EXCHANGE_RATES[c] && typeof rate === 'number' && rate > 0) {
      EXCHANGE_RATES[c].rate = rate;
    }
  }
}

export function convertCurrency(
  amountUSD: number,
  targetCurrency: CurrencyCode
): { formatted: string; raw: number } {
  const meta = EXCHANGE_RATES[targetCurrency] || EXCHANGE_RATES.USD;
  const converted = amountUSD * meta.rate;
  let formatted = '';
  if (targetCurrency === 'USD') {
    formatted = `$${converted.toFixed(2)}`;
  } else if (targetCurrency === 'NGN') {
    formatted = `₦${Math.round(converted).toLocaleString()}`;
  } else if (targetCurrency === 'GHS') {
    formatted = `₵${converted.toFixed(2)}`;
  } else if (targetCurrency === 'SLE') {
    formatted = `Le ${Math.round(converted).toLocaleString()}`;
  } else if (targetCurrency === 'XOF') {
    formatted = `${Math.round(converted).toLocaleString()} CFA`;
  } else if (targetCurrency === 'GNF') {
    formatted = `${Math.round(converted).toLocaleString()} FG`;
  }
  return { formatted, raw: converted };
}

// Distance matrix (in kilometers) between official terminals along the ECOWAS coastal transit corridor
export const ROUTE_DISTANCES_KM: Record<string, number> = {
  'station-conakry_station-freetown': 310,
  'station-conakry_station-monrovia': 890,
  'station-conakry_station-abidjan': 1640,
  'station-conakry_station-accra': 2200,
  'station-conakry_station-lagos': 2680,

  'station-freetown_station-monrovia': 580,
  'station-freetown_station-abidjan': 1330,
  'station-freetown_station-accra': 1890,
  'station-freetown_station-lagos': 2370,

  'station-monrovia_station-abidjan': 750,
  'station-monrovia_station-accra': 1310,
  'station-monrovia_station-lagos': 1790,

  'station-abidjan_station-accra': 560,
  'station-abidjan_station-lagos': 1040,

  'station-accra_station-lagos': 480,
};

export function getRouteDistanceKm(originId: string, destinationId: string): number {
  if (originId === destinationId) return 0;
  const key1 = `${originId}_${destinationId}`;
  const key2 = `${destinationId}_${originId}`;
  return ROUTE_DISTANCES_KM[key1] || ROUTE_DISTANCES_KM[key2] || 650;
}

// 6 Official ST Depots and Hubs from the attached document
export const STATIONS: Station[] = [
  {
    id: 'station-conakry',
    country: 'Guinea',
    city: 'Conakry',
    flag: '🇬🇳',
    terminalName: 'Conakry Yimbaya Terminal',
    address: 'Yimbaya Bougie, Conakry, Republic of Guinea',
    phoneNumbers: ['+224 622 611 272', '+224 620 343 294'],
    currency: 'GNF',
    geo: { x: 8, y: 35 },
    isMajorHub: true,
  },
  {
    id: 'station-freetown',
    country: 'Sierra Leone',
    city: 'Freetown',
    flag: '🇸🇱',
    terminalName: 'Freetown Lumley Depot',
    address: 'Lumley Mall, @ Lumley, Freetown Road, Freetown, Sierra Leone',
    phoneNumbers: ['+232 783 335 51', '+232 904 455 33'],
    currency: 'SLE',
    geo: { x: 22, y: 55 },
    isMajorHub: true,
  },
  {
    id: 'station-monrovia',
    country: 'Liberia',
    city: 'Monrovia',
    flag: '🇱🇷',
    terminalName: 'Monrovia Red Light Central Hub',
    address: 'Red Light, Opposite Zone 9, Depot 1 Police Station, Monrovia, Liberia',
    phoneNumbers: ['+231 886 888 538', '+231 775 908 830'],
    currency: 'USD',
    geo: { x: 38, y: 72 },
    isMajorHub: true,
  },
  {
    id: 'station-abidjan',
    country: 'Ivory Coast',
    city: 'Abidjan',
    flag: '🇨🇮',
    terminalName: 'Abidjan Treichville Terminal',
    address: 'Red Light, Opposite Zone 9, Depot 1 Police Station / Treichville Port Road, Abidjan',
    phoneNumbers: ['+225 101 857 708', '+225 777 399 611'],
    currency: 'XOF',
    geo: { x: 56, y: 64 },
    isMajorHub: true,
  },
  {
    id: 'station-accra',
    country: 'Ghana',
    city: 'Accra',
    flag: '🇬🇭',
    terminalName: 'Accra Circle Main Terminal',
    address: 'Emmest Chimist Road Circle, Accra, Greater Accra, Ghana',
    phoneNumbers: ['+233 555 545 359', '+233 543 339 868'],
    currency: 'GHS',
    geo: { x: 73, y: 58 },
    isMajorHub: true,
  },
  {
    id: 'station-lagos',
    country: 'Nigeria',
    city: 'Lagos',
    flag: '🇳🇬',
    terminalName: 'Lagos Trade Fair Mega Station',
    address: 'Oscar Plaza By Old Madilas Gate Trade Fair – Lagos, Nigeria',
    phoneNumbers: ['+234 803 236 7381', '+234 816 574 7367'],
    currency: 'NGN',
    geo: { x: 92, y: 52 },
    isMajorHub: true,
  },
];

export const INITIAL_BUS_TRIPS: BusTrip[] = [
  {
    id: 'TRIP-ST-802',
    busNumber: 'ST-802',
    busName: 'Atlantic Express Monarch',
    model: 'Scania Marcopolo G7 Luxury Coach',
    plateNumber: 'LAG-892-XZ',
    originId: 'station-lagos',
    destinationId: 'station-accra',
    departureTime: '06:30 AM',
    arrivalTime: '03:15 PM',
    durationHours: 8.5,
    basePriceUSD: 42,
    busType: 'VIP Royal Sleeper',
    totalSeats: 44,
    occupiedSeats: [1, 2, 5, 6, 11, 12, 17, 18, 23, 24, 30, 31, 35],
    amenities: ['Ultra AC', 'High-Speed Starlink WiFi', 'USB Power Ports', 'Reclining Sleeper Seats', 'Complimentary Refreshment', 'CCTV Security'],
    status: 'In Transit',
    currentSpeedKmH: 82,
    currentLatLong: { lat: 6.284, lng: 1.215, label: 'Lomé - Aflao ECOWAS Fast Border' },
    nextStop: 'Accra Circle Terminal (Ghana)',
    etaNextStop: '1 hr 45 min',
    driverName: 'Capt. Ibrahim Conteh',
    driverRating: 4.9,
    driverPhone: '+234 803 236 7381',
  },
  {
    id: 'TRIP-ST-414',
    busNumber: 'ST-414',
    busName: 'Savannah Coastline Cruiser',
    model: 'Mercedes-Benz Tourismo HD',
    plateNumber: 'ACC-7741-24',
    originId: 'station-accra',
    destinationId: 'station-abidjan',
    departureTime: '07:00 AM',
    arrivalTime: '02:30 PM',
    durationHours: 7.5,
    basePriceUSD: 38,
    busType: 'Standard Executive',
    totalSeats: 48,
    occupiedSeats: [3, 4, 7, 8, 9, 14, 15, 20, 21, 22, 29, 36, 40],
    amenities: ['Full Air Conditioning', 'Onboard Entertainment', 'Reclining Ergonomic Seats', 'Luggage Compartment (25kg free)'],
    status: 'In Transit',
    currentSpeedKmH: 74,
    currentLatLong: { lat: 5.214, lng: -2.712, label: 'Elubo - Noé Border Zone' },
    nextStop: 'Abidjan Treichville Terminal',
    etaNextStop: '2 hr 10 min',
    driverName: 'Alhaji Musa Diallo',
    driverRating: 4.8,
    driverPhone: '+233 555 545 359',
  },
  {
    id: 'TRIP-ST-109',
    busNumber: 'ST-109',
    busName: 'West African Trans-Pioneer',
    model: 'Volvo 9700 Grand Coach',
    plateNumber: 'MON-204-LR',
    originId: 'station-monrovia',
    destinationId: 'station-freetown',
    departureTime: '06:00 AM',
    arrivalTime: '04:00 PM',
    durationHours: 10,
    basePriceUSD: 35,
    busType: 'Standard Executive',
    totalSeats: 44,
    occupiedSeats: [1, 3, 10, 12, 19, 21, 33],
    amenities: ['Dual A/C', 'Satellite Live Tracking', 'Overhead Luggage Racks', 'First Aid Responder Kit'],
    status: 'In Transit',
    currentSpeedKmH: 68,
    currentLatLong: { lat: 7.185, lng: -11.512, label: 'Bo Waterside - Mano River Checkpoint' },
    nextStop: 'Lumley Mall, Freetown',
    etaNextStop: '3 hr 20 min',
    driverName: 'Samuel Johnson Jr.',
    driverRating: 4.95,
    driverPhone: '+231 886 888 538',
  },
  {
    id: 'TRIP-ST-550',
    busNumber: 'ST-550',
    busName: 'Conakry - Freetown Coastal Link',
    model: 'Toyota Coaster VIP 28',
    plateNumber: 'CKY-491-GN',
    originId: 'station-conakry',
    destinationId: 'station-freetown',
    departureTime: '08:00 AM',
    arrivalTime: '01:30 PM',
    durationHours: 5.5,
    basePriceUSD: 28,
    busType: 'VIP Royal Sleeper',
    totalSeats: 28,
    occupiedSeats: [2, 4, 8, 12, 14, 18],
    amenities: ['High-Output AC', 'Leather Captain Chairs', 'Speed Limiter Active', 'WiFi'],
    status: 'Boarding',
    currentSpeedKmH: 0,
    currentLatLong: { lat: 9.578, lng: -13.612, label: 'Yimbaya Bougie Terminal, Conakry' },
    nextStop: 'Kambia Border Customs Gate',
    etaNextStop: '1 hr 15 min',
    driverName: 'Mamadou Bah',
    driverRating: 4.75,
    driverPhone: '+224 622 611 272',
  },
];

export const INITIAL_CARGO_SHIPMENTS: CargoShipment[] = [
  {
    trackingNumber: 'ST-WB-78924',
    senderName: 'Chief Emmanuel Eze',
    senderPhone: '+234 803 236 7381',
    receiverName: 'Kwame Mensah',
    receiverPhone: '+233 555 545 359',
    originId: 'station-lagos',
    destinationId: 'station-accra',
    packageType: 'Electronics',
    weightKg: 42.5,
    declaredValueUSD: 850,
    totalCostUSD: 65,
    currency: 'USD',
    status: 'In Transit',
    estimatedDeliveryDate: 'Today, 04:30 PM',
    assignedVehicle: 'ST-802 (Atlantic Express)',
    lastCheckpoint: 'Aflao Border Customs - Cleared',
    lastUpdated: '12 minutes ago',
    waypoints: [
      { stationId: 'station-lagos', label: 'Accepted at Lagos Trade Fair Depot', completed: true, timestamp: '06:15 AM' },
      { stationId: 'station-lagos', label: 'Loaded into Sealed Cargo Bay ST-802', completed: true, timestamp: '06:40 AM' },
      { stationId: 'station-accra', label: 'Cross-Border ECOWAS Clearance (Aflao)', completed: true, timestamp: '01:20 PM' },
      { stationId: 'station-accra', label: 'Arrival at Accra Circle Hub (Sorting)', completed: false },
      { stationId: 'station-accra', label: 'Ready for Consignee Collection', completed: false },
    ],
  },
  {
    trackingNumber: 'ST-WB-99120',
    senderName: 'Fatoumata Camara',
    senderPhone: '+224 622 611 272',
    receiverName: 'Fatmata Sesay',
    receiverPhone: '+232 783 335 51',
    originId: 'station-conakry',
    destinationId: 'station-freetown',
    packageType: 'Textiles & Garments',
    weightKg: 28.0,
    declaredValueUSD: 340,
    totalCostUSD: 38,
    currency: 'USD',
    status: 'Customs Cleared',
    estimatedDeliveryDate: 'Today, 02:00 PM',
    assignedVehicle: 'ST-550 (Coastal Link)',
    lastCheckpoint: 'Kambia Border Customs',
    lastUpdated: '25 minutes ago',
    waypoints: [
      { stationId: 'station-conakry', label: 'Received at Conakry Yimbaya Depot', completed: true, timestamp: '07:30 AM' },
      { stationId: 'station-conakry', label: 'Security & Weight Inspection Verified', completed: true, timestamp: '07:50 AM' },
      { stationId: 'station-freetown', label: 'Kambia Border Customs Gate Pass Cleared', completed: true, timestamp: '10:10 AM' },
      { stationId: 'station-freetown', label: 'En route to Lumley Mall Depot, Freetown', completed: false },
      { stationId: 'station-freetown', label: 'SMS Notification sent to Receiver', completed: false },
    ],
  },
  {
    trackingNumber: 'ST-WB-44091',
    senderName: 'Jean-Luc Kouassi',
    senderPhone: '+225 101 857 708',
    receiverName: 'Joseph Boakai',
    receiverPhone: '+231 886 888 538',
    originId: 'station-abidjan',
    destinationId: 'station-monrovia',
    packageType: 'Commercial Freight',
    weightKg: 110.0,
    declaredValueUSD: 1600,
    totalCostUSD: 145,
    currency: 'USD',
    status: 'Received at Depot',
    estimatedDeliveryDate: 'Tomorrow, 11:00 AM',
    assignedVehicle: 'ST-Cargo Logistics Carrier 14',
    lastCheckpoint: 'Abidjan Treichville Terminal - Warehoused',
    lastUpdated: '1 hour ago',
    waypoints: [
      { stationId: 'station-abidjan', label: 'Weighed & Manifested at Abidjan Depot', completed: true, timestamp: '09:00 AM' },
      { stationId: 'station-abidjan', label: 'Awaiting Scheduled Depart 06:00 PM', completed: false },
      { stationId: 'station-monrovia', label: 'Liberia Border Transit & Customs', completed: false },
      { stationId: 'station-monrovia', label: 'Monrovia Red Light Depot Final Delivery', completed: false },
    ],
  },
];

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user-passenger',
    name: 'Amara Sesay',
    role: 'passenger',
    email: 'amara.sesay@gmail.com',
    phone: '+232 783 335 51',
    country: 'Sierra Leone',
    preferredCurrency: 'SLE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    walletBalanceUSD: 120.0,
  },
  {
    id: 'user-merchant',
    name: 'Kwame Mensah',
    role: 'merchant',
    email: 'kwame.imports@accra-trade.gh',
    phone: '+233 555 545 359',
    country: 'Ghana',
    preferredCurrency: 'GHS',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    walletBalanceUSD: 450.0,
  },
  {
    id: 'user-driver',
    name: 'Capt. Ibrahim Conteh',
    role: 'driver',
    email: 'captain.ibrahim@sumahoratransport.com',
    phone: '+234 803 236 7381',
    country: 'Nigeria',
    preferredCurrency: 'NGN',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    walletBalanceUSD: 85.0,
  },
  {
    id: 'user-agent',
    name: 'Chidinma Okafor (Depot Officer)',
    role: 'agent',
    email: 'chidinma.lagos@sumahoratransport.com',
    phone: '+234 816 574 7367',
    country: 'Nigeria',
    preferredCurrency: 'NGN',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    walletBalanceUSD: 1250.0,
  },
];

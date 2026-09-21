export type CurrencyCode = 'USD' | 'NGN' | 'GHS' | 'SLE' | 'XOF' | 'GNF';

export interface Station {
  id: string;
  country: string;
  city: string;
  flag: string;
  terminalName: string;
  address: string;
  phoneNumbers: string[];
  currency: CurrencyCode;
  geo: { x: number; y: number }; // normalized coordinate along the coastal map
  isMajorHub: boolean;
}

export interface BusTrip {
  id: string;
  busNumber: string;
  busName: string;
  model: string;
  plateNumber: string;
  originId: string;
  destinationId: string;
  departureTime: string;
  arrivalTime: string;
  durationHours: number;
  basePriceUSD: number;
  busType: 'Standard Executive' | 'VIP Royal Sleeper';
  totalSeats: number;
  occupiedSeats: number[];
  amenities: string[];
  status: 'Scheduled' | 'Boarding' | 'In Transit' | 'Arrived';
  currentSpeedKmH: number;
  currentLatLong: { lat: number; lng: number; label: string };
  nextStop: string;
  etaNextStop: string;
  driverName: string;
  driverRating: number;
  driverPhone: string;
}

export interface CargoShipment {
  trackingNumber: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  originId: string;
  destinationId: string;
  packageType: 'Electronics' | 'Documents' | 'Commercial Freight' | 'Textiles & Garments' | 'Perishables';
  weightKg: number;
  declaredValueUSD: number;
  totalCostUSD: number;
  currency: CurrencyCode;
  status: 'Booked' | 'Received at Depot' | 'Customs Cleared' | 'In Transit' | 'Arrived at Destination Hub' | 'Delivered';
  estimatedDeliveryDate: string;
  assignedVehicle: string;
  lastCheckpoint: string;
  lastUpdated: string;
  waypoints: {
    stationId: string;
    label: string;
    completed: boolean;
    timestamp?: string;
  }[];
}

export interface TicketBooking {
  ticketNumber: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  tripId: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  seatNumbers: number[];
  busType: string;
  busName: string;
  totalAmountUSD: number;
  currency: CurrencyCode;
  paymentMethod: 'Mobile Money' | 'Credit/Debit Card' | 'Bank Transfer' | 'Pay at Depot';
  paymentStatus: 'Paid' | 'Pending';
  bookedAt: string;
  qrCodeToken: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'passenger' | 'merchant' | 'driver' | 'agent';
  email: string;
  phone: string;
  country: string;
  preferredCurrency: CurrencyCode;
  avatarUrl: string;
  walletBalanceUSD: number;
}

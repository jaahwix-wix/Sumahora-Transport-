'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { LiveTrackingView } from '@/components/LiveTrackingView';
import { BookingView } from '@/components/BookingView';
import { CargoView } from '@/components/CargoView';
import { InvoicesLedgerView } from '@/components/InvoicesLedgerView';
import { DepotsView } from '@/components/DepotsView';
import { BillingCheckoutModal } from '@/components/BillingCheckoutModal';
import { AuthModal } from '@/components/AuthModal';
import { ReceiptModal } from '@/components/ReceiptModal';
import { NotificationCenterModal } from '@/components/NotificationCenterModal';
import { NotificationToast } from '@/components/NotificationToast';
import { useNotifications } from '@/lib/useNotifications';
import { 
  CurrencyCode, 
  UserProfile, 
  BusTrip, 
  CargoShipment, 
  Station 
} from '@/lib/types';
import { 
  INITIAL_BUS_TRIPS, 
  INITIAL_CARGO_SHIPMENTS, 
  DEMO_USERS, 
  STATIONS,
  convertCurrency 
} from '@/lib/data';
import { 
  Radio, 
  Bus, 
  Package, 
  CreditCard, 
  Building2, 
  ShieldCheck, 
  Phone, 
  ArrowRight,
  Sparkles,
  Bell,
  Volume2,
  CheckCircle2
} from 'lucide-react';
import { STLogo } from '@/components/STLogo';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'tracking' | 'booking' | 'cargo' | 'billing' | 'depots'>('tracking');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DEMO_USERS[0]); // default passenger Amara Sesay
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Fleet and Cargo state
  const [busTrips, setBusTrips] = useState<BusTrip[]>(INITIAL_BUS_TRIPS);
  const [cargoShipments, setCargoShipments] = useState<CargoShipment[]>(INITIAL_CARGO_SHIPMENTS);

  // Billing & Checkout state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any | null>(null);

  // Invoices & Ledger state (All activities managed)
  const [invoices, setInvoices] = useState<any[]>([
    {
      id: 'inv-1',
      type: 'passenger',
      code: 'ST-TKT-88214',
      origin: 'Lagos, Nigeria',
      destination: 'Accra, Ghana',
      customerName: 'Amara Sesay',
      customerPhone: '+234 803 236 7381',
      details: 'VIP Royal Sleeper • Seat 7, 8',
      amountUSD: 89,
      paymentMethod: 'Mobile Money (MTN)',
      paymentStatus: 'Paid',
      date: '2026-09-21 07:15',
    },
    {
      id: 'inv-2',
      type: 'cargo',
      code: 'ST-WB-78924',
      origin: 'Lagos, Nigeria',
      destination: 'Accra, Ghana',
      customerName: 'Chief Emmanuel Eze',
      customerPhone: '+234 803 236 7381',
      details: 'Electronics (42.5 kg)',
      amountUSD: 65,
      paymentMethod: 'Credit Card',
      paymentStatus: 'Paid',
      date: '2026-09-21 06:15',
    },
    {
      id: 'inv-3',
      type: 'cargo',
      code: 'ST-WB-99120',
      origin: 'Conakry, Guinea',
      destination: 'Freetown, Sierra Leone',
      customerName: 'Fatoumata Camara',
      customerPhone: '+224 622 611 272',
      details: 'Textiles & Garments (28.0 kg)',
      amountUSD: 38,
      paymentMethod: 'Orange Money',
      paymentStatus: 'Paid',
      date: '2026-09-21 07:30',
    },
  ]);

  // Selected trip for booking directly from map/depots
  const [preselectedTrip, setPreselectedTrip] = useState<BusTrip | undefined>(undefined);
  const [selectedTrackingCode, setSelectedTrackingCode] = useState<string | undefined>(undefined);
  const [receiptRecord, setReceiptRecord] = useState<any | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // Web Notifications API Hook
  const {
    isSupported: notifSupported,
    permission: notifPermission,
    requestPermission: requestNotifPermission,
    notifications,
    unreadCount: unreadNotifsCount,
    notify,
    markAllAsRead,
    activeToast,
    dismissToast,
  } = useNotifications();
  const [notifModalOpen, setNotifModalOpen] = useState(false);

  // Periodic automatic checkpoint arrival alerts simulation
  useEffect(() => {
    const checkpoints = [
      {
        title: 'ST-802 Cleared Lomé - Aflao ECOWAS Border',
        body: 'Coach ST-802 passed customs gate scan. Next stop: Accra Central Terminal ETA 1h 45m.',
        type: 'bus_checkpoint' as const,
        code: 'ST-802',
      },
      {
        title: 'Cargo Waybill ST-WB-78924 Cleared Customs',
        body: '42.5 kg Electronics cleared at Ghana Border Customs. Transferred to Accra delivery bay.',
        type: 'cargo_checkpoint' as const,
        code: 'ST-WB-78924',
      },
      {
        title: 'ST-414 Arrived at Abidjan Treichville Terminal',
        body: 'VIP Royal Sleeper coach ST-414 safely docked at Abidjan Platform 2 for passenger disembarkation.',
        type: 'bus_arrival' as const,
        code: 'ST-414',
      },
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      const nextAlert = checkpoints[stepIndex % checkpoints.length];
      notify(nextAlert.title, nextAlert.body, nextAlert.type, nextAlert.code);
      stepIndex++;
    }, 45000); // Trigger every 45s for live simulation

    return () => clearInterval(interval);
  }, [notify]);

  // Quick track handler from sidebar or alerts
  const handleQuickTrack = (code: string) => {
    setSelectedTrackingCode(code);
    setActiveTab('tracking');
  };

  // Passenger booking trigger
  const handleProceedPassengerBilling = (details: any) => {
    setCheckoutData(details);
    setCheckoutModalOpen(true);
  };

  // Cargo booking trigger
  const handleProceedCargoBilling = (details: any) => {
    setCheckoutData(details);
    setCheckoutModalOpen(true);
  };

  // Payment completed callback
  const handlePaymentSuccess = (newRecord: any) => {
    const isPassenger = newRecord.type === 'passenger';
    const invoiceItem = {
      id: `inv-${Date.now()}`,
      type: isPassenger ? 'passenger' : 'cargo',
      code: newRecord.code,
      origin: `${newRecord.origin.city}, ${newRecord.origin.country}`,
      destination: `${newRecord.destination.city}, ${newRecord.destination.country}`,
      customerName: isPassenger ? newRecord.passengerName : newRecord.senderName,
      customerPhone: isPassenger ? newRecord.passengerPhone : newRecord.senderPhone,
      details: isPassenger 
        ? `${newRecord.busType} • Seats: ${newRecord.selectedSeats.join(', ')}`
        : `${newRecord.packageType} (${newRecord.weightKg} kg)`,
      amountUSD: newRecord.totalAmountUSD,
      paymentMethod: newRecord.paymentMethod,
      paymentStatus: 'Paid',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setInvoices([invoiceItem, ...invoices]);

    // Send instant notification
    if (isPassenger) {
      notify(
        `Ticket Issued: ${newRecord.code}`,
        `Booking confirmed for ${newRecord.passengerName} (${newRecord.origin.city} ➔ ${newRecord.destination.city}). Seats: ${newRecord.selectedSeats.join(', ')}.`,
        'bus_arrival',
        newRecord.code
      );
    } else {
      // Add new cargo shipment to real-time tracking
      const newShipment: CargoShipment = {
        trackingNumber: newRecord.code,
        senderName: newRecord.senderName,
        senderPhone: newRecord.senderPhone,
        receiverName: newRecord.receiverName,
        receiverPhone: newRecord.receiverPhone,
        originId: newRecord.origin.id,
        destinationId: newRecord.destination.id,
        packageType: newRecord.packageType,
        weightKg: newRecord.weightKg,
        declaredValueUSD: newRecord.declaredValueUSD || 100,
        totalCostUSD: newRecord.totalAmountUSD,
        currency,
        status: 'Booked',
        estimatedDeliveryDate: 'Within 24 Hours',
        assignedVehicle: 'ST Scheduled Dispatch Express',
        lastCheckpoint: `${newRecord.origin.city} Depot - Manifested & Sealed`,
        lastUpdated: 'Just now',
        waypoints: [
          { stationId: newRecord.origin.id, label: `Accepted at ${newRecord.origin.city} Depot`, completed: true, timestamp: 'Just now' },
          { stationId: newRecord.origin.id, label: 'Customs Seal & Barcoding', completed: true, timestamp: 'Just now' },
          { stationId: newRecord.destination.id, label: 'En Route on Coastal Corridor', completed: false },
          { stationId: newRecord.destination.id, label: `Ready for Consignee Collection at ${newRecord.destination.city}`, completed: false },
        ],
      };
      setCargoShipments([newShipment, ...cargoShipments]);

      notify(
        `Waybill Manifested: ${newRecord.code}`,
        `${newRecord.weightKg} kg ${newRecord.packageType} registered from ${newRecord.origin.city} to ${newRecord.destination.city}. Sealed for transit.`,
        'cargo_checkpoint',
        newRecord.code
      );
    }
  };

  const handleSelectTripFromRadar = (trip: BusTrip) => {
    setPreselectedTrip(trip);
    setActiveTab('booking');
  };

  const handleSelectStationForBooking = (station: Station) => {
    setActiveTab('booking');
  };

  const handleSelectStationForCargo = (station: Station) => {
    setActiveTab('cargo');
  };

  const handleOpenReceipt = (record: any) => {
    setReceiptRecord(record);
    setReceiptModalOpen(true);
  };

  const handleManualTestAlert = () => {
    notify(
      'ST-802 Reached Lomé - Aflao Border Checkpoint',
      'Coach ST-802 just docked at the ECOWAS Express Inspection Bay. Automated biometrics and baggage seal verified.',
      'bus_checkpoint',
      'ST-802'
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-orange-500 selection:text-white">
      {/* 
        System Menu on the Left-Hand Side as requested 
        Fixed full-height on desktop, sliding drawer on mobile
      */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        user={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={() => setCurrentUser(null)}
        onQuickTrack={handleQuickTrack}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={() => setNotifModalOpen(true)}
        notificationPermission={notifPermission}
      />

      {/* Main App Content Area (Pushed right by md:ml-72 for left-hand menu) */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-72">
        {/* Top ECOWAS Corridor Alert & Web Notification Bar */}
        <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center space-x-2.5 overflow-x-auto text-slate-300">
              <span className="bg-orange-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0">
                ECOWAS Express Corridor
              </span>
              <span className="text-slate-400 truncate">
                Conakry • Freetown • Monrovia • Abidjan • Accra • Lagos
              </span>
            </div>

            {/* Notification API quick tester & status */}
            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={handleManualTestAlert}
                className="bg-slate-800 hover:bg-slate-700 text-orange-400 border border-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 transition"
                title="Send a real-time checkpoint alert using Web Notifications API"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Checkpoint Alert</span>
              </button>

              <button
                onClick={() => setNotifModalOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center space-x-1 border border-slate-700 transition"
              >
                <Bell className="w-3.5 h-3.5 text-orange-400" />
                <span>Alerts ({unreadNotifsCount})</span>
              </button>
            </div>
          </div>
        </header>

        {/* View Content Components */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'tracking' && (
            <LiveTrackingView
              busTrips={busTrips}
              cargoShipments={cargoShipments}
              currency={currency}
              selectedTrackingCode={selectedTrackingCode}
              onSelectBooking={handleSelectTripFromRadar}
            />
          )}

          {activeTab === 'booking' && (
            <BookingView
              currency={currency}
              user={currentUser}
              onProceedToBilling={handleProceedPassengerBilling}
              initialTrip={preselectedTrip}
            />
          )}

          {activeTab === 'cargo' && (
            <CargoView
              currency={currency}
              user={currentUser}
              onProceedToBilling={handleProceedCargoBilling}
              cargoShipments={cargoShipments}
              onTrackCode={handleQuickTrack}
            />
          )}

          {activeTab === 'billing' && (
            <InvoicesLedgerView
              currency={currency}
              records={invoices}
              onTrackCode={handleQuickTrack}
              onOpenReceipt={handleOpenReceipt}
            />
          )}

          {activeTab === 'depots' && (
            <DepotsView
              onSelectStationForBooking={handleSelectStationForBooking}
              onSelectStationForCargo={handleSelectStationForCargo}
            />
          )}
        </main>

        {/* Persistent In-App Notification Toast */}
        <NotificationToast
          notification={activeToast}
          onDismiss={dismissToast}
          onTrackCode={handleQuickTrack}
        />

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <STLogo size={36} glow={false} />
              <div>
                <p className="font-bold text-white text-sm">SOUL TRANSPORT &amp; LOGISTICS</p>
                <p className="text-[11px] text-slate-400">
                  For Your Convenient and Affordable Transport and Logistics Services Across West Africa
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <span>6 Hub Terminals Across ECOWAS</span>
              <span>•</span>
              <span className="text-orange-400 font-mono">24/7 Dispatch Hotline: +234 803 236 7381</span>
            </div>

            <p className="text-[11px] text-slate-400">
              © 2026 Soul Transport &amp; Logistics Inc. All rights reserved. ECOWAS FastTrack Certified.
            </p>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <NotificationCenterModal
        isOpen={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
        permission={notifPermission}
        isSupported={notifSupported}
        onRequestPermission={requestNotifPermission}
        notifications={notifications}
        onMarkAllRead={markAllAsRead}
        onSendTestNotification={handleManualTestAlert}
        onTrackCode={handleQuickTrack}
      />

      <BillingCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        currency={currency}
        checkoutData={checkoutData}
        onPaymentSuccess={handlePaymentSuccess}
        onTrackNow={(code) => {
          setSelectedTrackingCode(code);
          setActiveTab('tracking');
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={(user) => setCurrentUser(user)}
        currency={currency}
      />

      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        record={receiptRecord}
        currency={currency}
      />
    </div>
  );
}

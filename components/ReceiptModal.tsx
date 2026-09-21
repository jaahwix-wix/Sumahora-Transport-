'use client';

import React from 'react';
import { 
  X, 
  Printer, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  Bus, 
  Package, 
  Calendar, 
  Clock, 
  Armchair, 
  Luggage,
  Sparkles,
  Download
} from 'lucide-react';
import { CurrencyCode } from '@/lib/types';
import { convertCurrency } from '@/lib/data';
import { STLogo } from './STLogo';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: any | null;
  currency: CurrencyCode;
}

export function ReceiptModal({ isOpen, onClose, record, currency }: ReceiptModalProps) {
  if (!isOpen || !record) return null;

  const isPassenger = record.type === 'passenger';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Top Modal Controls */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2.5">
            <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/30">
              {record.code}
            </span>
            <span className="text-xs font-bold">
              {isPassenger ? 'Official Passenger Boarding Pass & Ticket' : 'Official Cargo Consignment Waybill'}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Printable Ticket Container with specialized print classes */}
          <div 
            id="printable-voucher" 
            className="bg-white text-slate-900 rounded-2xl p-6 shadow-2xl border-2 border-dashed border-slate-300 relative overflow-hidden"
          >
            {/* Watermark subtle logo */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none select-none">
              <STLogo size={280} glow={false} />
            </div>

            {/* Header: Logo, Title, Badge */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
              <div className="flex items-center space-x-3">
                <STLogo size={44} glow={false} />
                <div>
                  <h4 className="text-sm font-black text-slate-900 tracking-tight leading-none">
                    SUMAHORA TRANSPORT &amp; LOGISTICS
                  </h4>
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mt-1">
                    ECOWAS Express Cross-Border Network
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 uppercase">
                  ✓ Confirmed &amp; Paid
                </span>
                <p className="text-[9px] text-slate-500 font-mono mt-1">
                  Issued: {record.date || 'Today'}
                </p>
              </div>
            </div>

            {/* Voucher Body: Passenger vs Cargo */}
            {isPassenger ? (
              /* Passenger Ticket Content */
              <div className="py-4 space-y-4">
                {/* Route Banner */}
                <div className="bg-slate-100 rounded-xl p-3.5 flex items-center justify-between border border-slate-200">
                  <div className="text-left">
                    <span className="text-[9px] uppercase font-bold text-slate-500">Departure</span>
                    <p className="text-sm font-black text-slate-900">{record.origin}</p>
                    <span className="text-[10px] text-slate-600 font-medium">Terminal Hub</span>
                  </div>

                  <div className="flex flex-col items-center px-3">
                    <span className="text-[9px] font-mono font-bold text-orange-600">DIRECT ROUTE</span>
                    <div className="w-20 h-0.5 bg-orange-400 relative my-1">
                      <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-orange-600"></div>
                    </div>
                    <Bus className="w-4 h-4 text-orange-600" />
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-500">Destination</span>
                    <p className="text-sm font-black text-slate-900">{record.destination}</p>
                    <span className="text-[10px] text-slate-600 font-medium">Arrival Terminal</span>
                  </div>
                </div>

                {/* Ticket Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Passenger</span>
                    <p className="font-bold text-slate-900 truncate">{record.customerName}</p>
                    <p className="text-[10px] text-slate-600 font-mono">{record.customerPhone}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Seats Assigned</span>
                    <p className="font-bold text-orange-600 font-mono text-sm">
                      {record.details?.includes('Seats:') ? record.details.split('Seats:')[1]?.trim() : 'Seat 7'}
                    </p>
                    <p className="text-[10px] text-slate-600">Executive Bay</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Coach Class</span>
                    <p className="font-bold text-slate-900">VIP Sleeper</p>
                    <p className="text-[10px] text-slate-600">AC + WiFi + Meals</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Baggage</span>
                    <p className="font-bold text-slate-900">25 kg Included</p>
                    <p className="text-[10px] text-emerald-700">Tagged &amp; Sealed</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Cargo Waybill Content */
              <div className="py-4 space-y-4">
                <div className="bg-slate-100 rounded-xl p-3.5 flex items-center justify-between border border-slate-200">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500">Origin Depot</span>
                    <p className="text-sm font-black text-slate-900">{record.origin}</p>
                  </div>
                  <Package className="w-5 h-5 text-orange-600" />
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-500">Destination Hub</span>
                    <p className="text-sm font-black text-slate-900">{record.destination}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Consignor / Shipper</span>
                    <p className="font-bold text-slate-900 truncate">{record.customerName}</p>
                    <p className="text-[10px] text-slate-600 font-mono">{record.customerPhone}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Manifest Details</span>
                    <p className="font-bold text-slate-900">{record.details}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Customs Clearance</span>
                    <p className="font-bold text-emerald-700">ECOWAS Seal Passed</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Handling</span>
                    <p className="font-bold text-slate-900">Tracked Bay</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Row: QR Code, Barcode & Amount */}
            <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-slate-900 rounded-lg">
                  <QrCode className="w-12 h-12 text-white" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">
                    Security E-Ticket Code
                  </span>
                  <p className="text-sm font-black text-slate-900 font-mono tracking-tight">
                    {record.code}
                  </p>
                  <p className="text-[9px] text-slate-500">Scan at boarding gate or depot</p>
                </div>
              </div>

              {/* Barcode & Total */}
              <div className="text-right w-full sm:w-auto">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Total Fare Paid
                </span>
                <p className="text-2xl font-black text-slate-900 font-mono leading-none mt-0.5">
                  {convertCurrency(record.amountUSD, currency).formatted}
                </p>
                <div className="h-4 w-36 ml-auto mt-2 bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_4px,#000_4px,#000_7px,#fff_7px,#fff_9px)] rounded"></div>
              </div>
            </div>

            {/* Legal Notice */}
            <p className="text-[9px] text-slate-400 text-center mt-3 pt-2 border-t border-slate-100">
              Sumahora Transport &amp; Logistics Cross-Border Ticket Voucher. Valid across all 6 West African ECOWAS terminals. Present photo ID at coach boarding.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition shadow-lg shadow-orange-950/60"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official {isPassenger ? 'Passenger Ticket' : 'Cargo Waybill'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

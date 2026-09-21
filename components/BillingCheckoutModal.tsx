'use client';

import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Building, 
  QrCode, 
  Printer, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Copy, 
  Check, 
  Clock, 
  Download,
  AlertCircle
} from 'lucide-react';
import { CurrencyCode, Station, BusTrip, CargoShipment, TicketBooking } from '@/lib/types';
import { convertCurrency } from '@/lib/data';

interface BillingCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  checkoutData: any | null; // Passenger booking or Cargo booking
  onPaymentSuccess: (newRecord: any) => void;
  onTrackNow: (code: string) => void;
}

export function BillingCheckoutModal({
  isOpen,
  onClose,
  currency,
  checkoutData,
  onPaymentSuccess,
  onTrackNow,
}: BillingCheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card' | 'bank' | 'depot'>('momo');
  const [momoProvider, setMomoProvider] = useState<'MTN' | 'Orange' | 'Telecel' | 'Wave'>('MTN');
  const [momoPhone, setMomoPhone] = useState(checkoutData?.passengerPhone || checkoutData?.senderPhone || '+234 803 236 7381');
  
  // Card states
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 9012');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('883');
  
  // Processing & Confirmation
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<any | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  if (!isOpen || !checkoutData) return null;

  const isPassenger = checkoutData.type === 'passenger';
  const totalAmountUSD = checkoutData.totalAmountUSD;
  const formattedTotal = convertCurrency(totalAmountUSD, currency).formatted;

  const handleProcessPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentCompleted(true);

      const generatedCode = isPassenger
        ? `ST-TKT-${Math.floor(10000 + Math.random() * 90000)}`
        : `ST-WB-${Math.floor(10000 + Math.random() * 90000)}`;

      const newRecord = {
        ...checkoutData,
        code: generatedCode,
        paymentStatus: 'Paid',
        paymentMethod: paymentMethod === 'momo' ? `Mobile Money (${momoProvider})` : paymentMethod === 'card' ? 'Credit/Debit Card' : 'Bank Transfer',
        paidAt: new Date().toISOString(),
        currency,
      };

      setGeneratedTicket(newRecord);
      onPaymentSuccess(newRecord);
    }, 1800);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('0198234812');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-950/40 flex items-center justify-center font-black">
              ST
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight leading-tight">
                {paymentCompleted ? 'Payment Confirmed & Receipt Issued' : 'Automated Billing & Secure Checkout'}
              </h3>
              <p className="text-[11px] text-orange-100">
                Sumahora Transport & Logistics Automated Gateway
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {!paymentCompleted ? (
            <>
              {/* Order Summary Pill */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Transaction Type</span>
                  <span className="font-bold text-white uppercase">
                    {isPassenger ? 'Passenger Coach Travel' : 'Cross-Border Cargo Freight'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">
                      {checkoutData.origin.city} ({checkoutData.origin.country}) → {checkoutData.destination.city} ({checkoutData.destination.country})
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isPassenger
                        ? `Class: ${checkoutData.busType} • Seats: ${checkoutData.selectedSeats.join(', ')}`
                        : `Consignment: ${checkoutData.packageType} (${checkoutData.weightKg} kg)`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Total Due</span>
                    <span className="text-lg font-black text-orange-400 font-mono">
                      {formattedTotal}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Select Automated Payment Channel
                </label>

                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('momo')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1.5 transition ${
                      paymentMethod === 'momo'
                        ? 'bg-orange-500/10 border-orange-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-amber-400" />
                    <span>Mobile Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1.5 transition ${
                      paymentMethod === 'card'
                        ? 'bg-orange-500/10 border-orange-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-cyan-400" />
                    <span>Card / Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1.5 transition ${
                      paymentMethod === 'bank'
                        ? 'bg-orange-500/10 border-orange-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Building className="w-5 h-5 text-emerald-400" />
                    <span>Bank Transfer</span>
                  </button>
                </div>
              </div>

              {/* Method Details */}
              {paymentMethod === 'momo' && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Mobile Money Operator
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['MTN', 'Orange', 'Telecel', 'Wave'] as const).map((prov) => (
                      <button
                        type="button"
                        key={prov}
                        onClick={() => setMomoProvider(prov)}
                        className={`p-2 rounded-lg text-xs font-bold border text-center transition ${
                          momoProvider === prov
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {prov} {prov === 'MTN' ? 'MoMo' : ''}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] text-slate-400">Mobile Money Phone Number</label>
                    <input
                      type="tel"
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                      placeholder="+234 / +233 / +232 ..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                    <p className="text-[10px] text-slate-500">
                      An automated push authorization prompt will be triggered to this number.
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400">Card Number (Visa / Mastercard / Verve)</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400">Expires (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Security CVC</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'bank' && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                  <span className="text-slate-400 text-[11px] block">
                    Instant Automated Virtual Account
                  </span>
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-xl p-3">
                    <div>
                      <p className="text-[10px] text-slate-400">Bank: Ecobank Transnational / UBA</p>
                      <p className="font-mono font-black text-white text-sm">0198234812</p>
                      <p className="text-[10px] text-orange-400">Acc Name: SOUL TRANSPORT LOGISTICS</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs flex items-center space-x-1"
                    >
                      {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Auto-reconciles within 5 seconds of transfer via NIBSS/GIP.
                  </p>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                id="execute-automated-payment-btn"
                disabled={isProcessing}
                onClick={handleProcessPayment}
                className="w-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white py-3.5 px-4 rounded-xl text-xs font-black shadow-lg shadow-orange-950/60 flex items-center justify-center space-x-2 transition"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Reconciling & Generating Secured Digital Document...</span>
                  </>
                ) : (
                  <>
                    <span>Authorize Automated Payment of {formattedTotal}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          ) : (
            /* Digital E-Ticket & Receipt Confirmation */
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-black text-white">Payment Authorized & Verified!</h4>
                <p className="text-xs text-slate-400">
                  Your official digital credential has been registered in the Sumahora Transport automated ledger.
                </p>
              </div>

              {/* Official Digital Ticket / Waybill Container */}
              <div className="bg-slate-950 border border-orange-500/40 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
                {/* Header of pass */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">
                      ST
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs leading-none">
                        SOUL TRANSPORT & LOGISTICS
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {isPassenger ? 'Official Passenger Boarding Pass' : 'Official Cargo Consignment Waybill'}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    PAID • VERIFIED
                  </span>
                </div>

                {/* Tracking / Ticket Number */}
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {isPassenger ? 'E-Ticket Reference Number' : 'Live Tracking Waybill Number'}
                    </span>
                    <p className="text-base font-black text-orange-400 font-mono tracking-wider">
                      {generatedTicket?.code}
                    </p>
                  </div>
                  <QrCode className="w-9 h-9 text-slate-300" />
                </div>

                {/* Route & Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px]">Route Origin</span>
                    <p className="font-bold text-white">{checkoutData.origin.city}, {checkoutData.origin.country}</p>
                    <p className="text-[10px] text-slate-400 truncate">{checkoutData.origin.terminalName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Destination</span>
                    <p className="font-bold text-white">{checkoutData.destination.city}, {checkoutData.destination.country}</p>
                    <p className="text-[10px] text-slate-400 truncate">{checkoutData.destination.terminalName}</p>
                  </div>
                </div>

                {isPassenger ? (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-500 text-[10px]">Passenger</span>
                      <p className="font-bold text-white truncate">{checkoutData.passengerName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Coach Class</span>
                      <p className="font-bold text-orange-400">{checkoutData.busType}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Reserved Seats</span>
                      <p className="font-bold text-emerald-400 font-mono">
                        {checkoutData.selectedSeats.join(', ')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-500 text-[10px]">Consignee</span>
                      <p className="font-bold text-white truncate">{checkoutData.receiverName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Cargo Type</span>
                      <p className="font-bold text-orange-400">{checkoutData.packageType}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Weight</span>
                      <p className="font-bold text-emerald-400 font-mono">{checkoutData.weightKg} kg</p>
                    </div>
                  </div>
                )}

                {/* Barcode graphic */}
                <div className="pt-2 text-center border-t border-slate-800">
                  <div className="h-6 w-full bg-[repeating-linear-gradient(90deg,#fff,#fff_2px,#000_2px,#000_5px,#fff_5px,#fff_8px,#000_8px,#000_12px)] opacity-60 rounded"></div>
                  <span className="text-[9px] font-mono text-slate-500 mt-1 block">
                    * {generatedTicket?.code} *
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onTrackNow(generatedTicket.code);
                    onClose();
                  }}
                  className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow"
                >
                  <Clock className="w-4 h-4" />
                  <span>Track Live on Radar</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save E-Ticket</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

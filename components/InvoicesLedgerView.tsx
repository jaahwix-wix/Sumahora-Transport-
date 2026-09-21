'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  Receipt, 
  Bus, 
  Package, 
  Printer, 
  QrCode, 
  ExternalLink, 
  Download, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Search 
} from 'lucide-react';
import { CurrencyCode } from '@/lib/types';
import { convertCurrency } from '@/lib/data';

interface InvoiceRecord {
  id: string;
  type: 'passenger' | 'cargo';
  code: string;
  origin: string;
  destination: string;
  customerName: string;
  customerPhone: string;
  details: string;
  amountUSD: number;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending';
  date: string;
}

interface InvoicesLedgerViewProps {
  currency: CurrencyCode;
  records: InvoiceRecord[];
  onTrackCode: (code: string) => void;
  onOpenReceipt: (record: InvoiceRecord) => void;
}

export function InvoicesLedgerView({
  currency,
  records,
  onTrackCode,
  onOpenReceipt,
}: InvoicesLedgerViewProps) {
  const [filterType, setFilterType] = useState<'all' | 'passenger' | 'cargo'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = records.filter((r) => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.code.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.origin.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalSpentUSD = records.reduce((acc, curr) => acc + curr.amountUSD, 0);
  const passengerCount = records.filter((r) => r.type === 'passenger').length;
  const cargoCount = records.filter((r) => r.type === 'cargo').length;

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Total Billing Volume</span>
            <Receipt className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {convertCurrency(totalSpentUSD, currency).formatted}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Automated Reconciliation
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Issued Passenger Tickets</span>
            <Bus className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {passengerCount} <span className="text-xs font-normal text-slate-400">Boarding Passes</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cross-Border Express Network</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Cargo Waybills Manifested</span>
            <Package className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {cargoCount} <span className="text-xs font-normal text-slate-400">Consignments</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">ECOWAS Sealed Logistics Bays</p>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-orange-500" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Automated Billing & Digital Tickets Ledger
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter buttons */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterType === 'all' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({records.length})
              </button>
              <button
                onClick={() => setFilterType('passenger')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterType === 'passenger' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Coach Tickets ({passengerCount})
              </button>
              <button
                onClick={() => setFilterType('cargo')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterType === 'cargo' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cargo Waybills ({cargoCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket, name, route..."
                className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="divide-y divide-slate-800/80 overflow-x-auto">
          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching invoices or tickets found. Book a trip or dispatch cargo to generate records.
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                className="p-4 sm:p-5 hover:bg-slate-800/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      record.type === 'passenger'
                        ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    {record.type === 'passenger' ? <Bus className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {record.code}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {record.origin} → {record.destination}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        {record.paymentStatus}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1">
                      <span className="font-semibold text-white">{record.customerName}</span> ({record.customerPhone}) • {record.details}
                    </p>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1">
                      <span>Method: <span className="text-slate-300">{record.paymentMethod}</span></span>
                      <span>•</span>
                      <span>Date: <span className="text-slate-300">{record.date}</span></span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center space-x-4 self-end md:self-center">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Amount Billed</span>
                    <span className="text-base font-black text-white font-mono">
                      {convertCurrency(record.amountUSD, currency).formatted}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onTrackCode(record.code)}
                      className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow flex items-center space-x-1.5 transition"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Live Track</span>
                    </button>

                    <button
                      onClick={() => onOpenReceipt(record)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 p-2 rounded-xl text-xs transition"
                      title="View & Print Digital Receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

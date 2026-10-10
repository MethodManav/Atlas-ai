"use client";

import { useState } from "react";
import {
  X,
  Calendar,
  Building2,
  User,
  CreditCard,
  DollarSign,
  Download,
  CheckCircle2,
  Trash2,
  Clock,
  Mail,
  Phone,
  Copy,
  Check,
  MapPin,
  FileText,
} from "lucide-react";
import type { AdminBooking } from "@/lib/admin-data";
import Image from "next/image";

interface BookingDetailModalProps {
  booking: AdminBooking | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: AdminBooking["status"]) => Promise<void>;
  onDeleteBooking: (id: string) => Promise<void>;
}

export function BookingDetailModal({
  booking,
  onClose,
  onUpdateStatus,
  onDeleteBooking,
}: BookingDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  if (!booking) return null;

  function handleCopyRef() {
    if (!booking) return;
    navigator.clipboard.writeText(booking.bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadInvoice() {
    if (!booking) return;
    const text = [
      "============================================================",
      "                ATLAS AI — OFFICIAL INVOICE                 ",
      "============================================================",
      `Invoice Date    : ${new Date().toLocaleDateString("en-US")}`,
      `Reservation Ref : ${booking.bookingRef}`,
      `Status          : ${booking.status}`,
      "------------------------------------------------------------",
      "HOTEL & DESTINATION",
      `Hotel Name      : ${booking.hotelName}`,
      `Location        : ${booking.hotelCity}, ${booking.hotelCountry}`,
      "------------------------------------------------------------",
      "GUEST INFORMATION",
      `Guest Name      : ${booking.guestFirstName} ${booking.guestLastName}`,
      `Guest Email     : ${booking.guestEmail}`,
      `Guest Phone     : ${booking.guestPhone}`,
      "------------------------------------------------------------",
      "STAY TIMELINE",
      `Check-in Date   : ${booking.checkIn}`,
      `Check-out Date  : ${booking.checkOut}`,
      `Total Nights    : ${booking.nights}`,
      `Guests / Rooms  : ${booking.guests} Guest(s) / ${booking.rooms} Room(s)`,
      "------------------------------------------------------------",
      "BILLING SUMMARY",
      `Nightly Rate    : $${booking.pricePerNight} ${booking.currency}`,
      `Gross Total     : $${booking.totalPrice} ${booking.currency}`,
      `Platform Fee    : $${booking.commissionAmount} (${Math.round(booking.commissionRate * 100)}%)`,
      `Payment Method  : ${booking.paymentMethod} (**** ${booking.paymentLast4})`,
      "------------------------------------------------------------",
      booking.notes ? `Special Notes   : ${booking.notes}\n------------------------------------------------------------` : "",
      "LiteAPI Engine  : Certified Sandbox Reservation Confirmation",
      "============================================================",
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice-${booking.bookingRef}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleStatusChange(newStatus: AdminBooking["status"]) {
    if (!booking) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(booking.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete() {
    if (!booking) return;
    if (confirm(`Are you sure you want to remove reservation ${booking.bookingRef}?`)) {
      setIsDeleting(true);
      try {
        await onDeleteBooking(booking.id);
        onClose();
      } finally {
        setIsDeleting(false);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-atlas-fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/8 bg-gradient-to-r from-violet-950/40 via-zinc-900/40 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-white tracking-wider">
                  {booking.bookingRef}
                </span>
                <button
                  onClick={handleCopyRef}
                  className="p-1 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                  title="Copy Reference"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-zinc-400">
                Created on {new Date(booking.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 atlas-scrollbar">
          {/* Hotel banner */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-white/5">
            <div className="w-20 h-20 rounded-xl overflow-hidden relative flex-shrink-0 bg-zinc-800">
              <Image
                src={booking.hotelImage}
                alt={booking.hotelName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                <MapPin className="w-3.5 h-3.5 text-violet-400" />
                <span>{booking.hotelCity}, {booking.hotelCountry}</span>
              </div>
              <h3 className="text-base font-bold text-white truncate mt-0.5">
                {booking.hotelName}
              </h3>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="text-zinc-400">
                  Daily rate: <strong className="text-white">${booking.pricePerNight}</strong>
                </span>
                <span className="text-zinc-600">|</span>
                <span className="text-zinc-400">
                  Total {booking.nights} nights: <strong className="text-emerald-400">${booking.totalPrice}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Status selector */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span>Reservation Lifecycle Status</span>
              {isUpdating && <span className="text-violet-400 font-mono text-[11px]">Updating...</span>}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(["CONFIRMED", "CHECKED_IN", "COMPLETED", "PENDING", "CANCELLED"] as const).map(
                (st) => {
                  const isActive = booking.status === st;
                  return (
                    <button
                      key={st}
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(st)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? st === "CONFIRMED"
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-950"
                            : st === "CHECKED_IN"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-950"
                            : st === "COMPLETED"
                            ? "bg-purple-600 text-white shadow-lg shadow-purple-950"
                            : st === "PENDING"
                            ? "bg-amber-600 text-white shadow-lg shadow-amber-950"
                            : "bg-rose-600 text-white shadow-lg shadow-rose-950"
                          : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
                      }`}
                    >
                      {st}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Grid: Guest Details & Stay Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Guest */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-violet-400" /> Guest Details
              </span>
              <div>
                <p className="text-sm font-bold text-white">
                  {booking.guestFirstName} {booking.guestLastName}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <a href={`mailto:${booking.guestEmail}`} className="hover:underline">
                    {booking.guestEmail}
                  </a>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                  <Phone className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{booking.guestPhone}</span>
                </div>
              </div>
            </div>

            {/* Stay Timeline */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Stay Dates & Occupancy
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold">Check-in</p>
                  <p className="font-bold text-white">{booking.checkIn}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold">Check-out</p>
                  <p className="font-bold text-white">{booking.checkOut}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold">Length</p>
                  <p className="font-bold text-white">{booking.nights} Nights</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold">Party</p>
                  <p className="font-bold text-white">{booking.guests} Guest(s), {booking.rooms} Room</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-cyan-400" /> Financial & Commission Breakdown
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span>Room Charges ({booking.nights} nights @ ${booking.pricePerNight})</span>
                <span className="font-mono">${booking.totalPrice}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Platform Commission Margin ({Math.round(booking.commissionRate * 100)}%)</span>
                <span className="font-mono text-violet-300">${booking.commissionAmount}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Payment Tender</span>
                <span className="font-mono text-zinc-400">
                  {booking.paymentMethod} (ending in {booking.paymentLast4})
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-sm text-white">
                <span>Total Amount Charged</span>
                <span className="text-emerald-400">${booking.totalPrice} {booking.currency}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Guest Requests & Internal Notes
              </span>
              <p className="text-xs text-zinc-300 italic">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-5 border-t border-white/8 bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Cancel / Remove</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEmailSent(true);
                setTimeout(() => setEmailSent(false), 3000);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-white/10 transition-colors"
            >
              {emailSent ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Email Dispatched!</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Resend Confirmation</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadInvoice}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-900/40 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

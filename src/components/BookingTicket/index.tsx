"use client";

import { Download, CheckCircle2, /* Mail */ } from "lucide-react";
import type { BookingConfirmation } from "@/lib/hotels";

interface BookingTicketProps extends BookingConfirmation {
  onDismiss?: () => void;
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

export function BookingTicket({
  bookingId,
  hotelName,
  checkIn,
  checkOut,
  guestName,
  totalPrice,
  currency,
  status,
  onDismiss,
}: BookingTicketProps) {
  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000,
    ),
  );

  const currencySymbol = currency === "USD" ? "$" : currency + " ";

  function handleDownload() {
    const text = [
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "       ATLAS AI — BOOKING TICKET      ",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `Hotel   : ${hotelName}`,
      `Guest   : ${guestName}`,
      `Check-in: ${checkIn}`,
      `Check-out: ${checkOut}`,
      `Nights  : ${nights}`,
      `Total   : ${currencySymbol}${totalPrice}`,
      `Status  : ${status}`,
      "────────────────────────────────",
      `Ref #   : ${bookingId}`,
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Thank you for booking with Atlas AI!",
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atlas-booking-${bookingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full max-w-[320px] select-none">
      {/* ── Ticket card ──────────────────────────────────────── */}
      <div className="rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/50 bg-white">

        {/* Top: gradient header */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 px-5 pt-5 pb-6 relative overflow-hidden">
          {/* decorative circles */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-indigo-500/40" />

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                  {status === "CONFIRMED" ? "Confirmed" : status}
                </span>
              </div>
              <h2 className="font-bold text-white text-base leading-snug line-clamp-2">
                {hotelName}
              </h2>
              <p className="text-blue-200 text-xs mt-1">{guestName}</p>
            </div>
            {/* Price badge */}
            <div className="flex-shrink-0 text-right">
              <p className="text-2xl font-extrabold text-white leading-none">
                {currencySymbol}{totalPrice}
              </p>
              <p className="text-[11px] text-blue-200 mt-0.5">
                {nights} night{nights !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Tear line */}
        <div className="relative flex items-center h-0">
          <div className="absolute -left-3 w-6 h-6 rounded-full bg-slate-100 z-10" />
          <div className="absolute -right-3 w-6 h-6 rounded-full bg-slate-100 z-10" />
          <div className="w-full border-t-2 border-dashed border-slate-200 mx-3" />
        </div>

        {/* Bottom: details */}
        <div className="bg-slate-50 px-5 pt-5 pb-4">
          {/* Dates */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="text-center flex-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Check-in</p>
              <p className="font-bold text-slate-800 text-sm leading-tight">{formatDate(checkIn)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">From 14:00</p>
            </div>
            <div className="flex flex-col items-center gap-1 text-slate-300">
              <div className="w-px h-3 bg-slate-200" />
              <span className="text-lg">🏨</span>
              <div className="w-px h-3 bg-slate-200" />
            </div>
            <div className="text-center flex-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Check-out</p>
              <p className="font-bold text-slate-800 text-sm leading-tight">{formatDate(checkOut)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Until 12:00</p>
            </div>
          </div>

          {/* Booking ref + barcode decoration */}
          <div className="bg-white rounded-2xl px-4 py-3 border border-slate-100 mb-3">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
              Booking Reference
            </p>
            <p className="font-mono font-bold text-blue-600 text-sm tracking-widest break-all">
              {bookingId}
            </p>
            {/* Fake barcode lines */}
            <div className="flex gap-[2px] mt-2.5 h-6 items-end">
              {Array.from({ length: 36 }, (_, i) => (
                <div
                  key={i}
                  className="bg-slate-800 rounded-[1px]"
                  style={{
                    width: i % 3 === 0 ? "3px" : "1.5px",
                    height: `${50 + ((i * 17 + 7) % 50)}%`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>

            {/* Resend email — wired up once email service is ready */}
            {/* <button
              onClick={() => {}}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              Resend Email
            </button> */}

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex-1 flex items-center justify-center h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-center text-slate-400 mt-2">
        A confirmation has been sent to your email
      </p>
    </div>
  );
}

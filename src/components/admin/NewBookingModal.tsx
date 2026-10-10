"use client";

import { useState } from "react";
import { X, Calendar, User, Building2, CreditCard, Plus, Loader2 } from "lucide-react";
import type { AdminHotel } from "@/lib/admin-data";

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotels: AdminHotel[];
  onCreateBooking: (bookingData: any) => Promise<void>;
}

export function NewBookingModal({
  isOpen,
  onClose,
  hotels,
  onCreateBooking,
}: NewBookingModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];

  const [selectedHotelId, setSelectedHotelId] = useState(hotels[0]?.id || "");
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(nextWeek);
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentHotel = hotels.find((h) => h.id === selectedHotelId) || hotels[0];
  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
    )
  );
  const pricePerNight = currentHotel ? currentHotel.price : 350;
  const totalPrice = pricePerNight * nights * rooms;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guestFirstName || !guestLastName || !guestEmail) {
      alert("Please fill in all required guest fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateBooking({
        hotelId: currentHotel.id,
        hotelName: currentHotel.name,
        hotelCity: currentHotel.city,
        hotelCountry: currentHotel.country,
        hotelImage: currentHotel.imageUrl,
        guestFirstName,
        guestLastName,
        guestEmail,
        guestPhone: guestPhone || "+1 555 0100",
        checkIn,
        checkOut,
        nights,
        guests,
        rooms,
        pricePerNight,
        totalPrice,
        currency: currentHotel.currency || "USD",
        status: "CONFIRMED",
        paymentMethod,
        paymentLast4: "4242",
        notes,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-atlas-fade-in">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/8 bg-gradient-to-r from-violet-950/40 via-zinc-900/40 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Create Direct Reservation
              </h2>
              <p className="text-xs text-zinc-400">
                Manually record a telephone, VIP, or corporate booking
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 atlas-scrollbar">
          {/* Hotel Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-violet-400" />
              Select Property
            </label>
            <select
              value={selectedHotelId}
              onChange={(e) => setSelectedHotelId(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.city}, {h.country}) — ${h.price}/night
                </option>
              ))}
            </select>
          </div>

          {/* Guest Information */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Guest Contact Details
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First Name *"
                required
                value={guestFirstName}
                onChange={(e) => setGuestFirstName(e.target.value)}
                className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              />
              <input
                type="text"
                placeholder="Last Name *"
                required
                value={guestLastName}
                onChange={(e) => setGuestLastName(e.target.value)}
                className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="email"
                placeholder="Email Address *"
                required
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Stay Dates & Occupancy */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Reservation Timeline
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-zinc-500 block mb-1">Check-in Date</span>
                <input
                  type="date"
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block mb-1">Check-out Date</span>
                <input
                  type="date"
                  required
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] text-zinc-500 block mb-1">Adult Guests</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block mb-1">Number of Rooms</span>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={rooms}
                  onChange={(e) => setRooms(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Payment Tender
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              >
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="CORPORATE">Corporate Account</option>
                <option value="LITEAPI_SANDBOX">LiteAPI Sandbox</option>
                <option value="APPLE_PAY">Apple Pay</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Estimated Total
              </label>
              <div className="h-9 rounded-xl bg-zinc-900/90 border border-emerald-500/30 px-3 flex items-center justify-between text-xs">
                <span className="text-zinc-400">{nights}n × ${pricePerNight}</span>
                <span className="text-emerald-400 font-extrabold text-sm">${totalPrice}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Special Requests or Concierge Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. VIP guest, airport transfer requested, anniversary bottle..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-900/40 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Confirm Reservation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

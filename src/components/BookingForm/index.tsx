"use client";

import { useMemo, useState } from "react";
import { CreditCard, User, Mail, Phone, CalendarDays, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAtlasStore } from "@/lib/store";
import { normalizeHotel, type Hotel, type HotelInput } from "@/lib/hotels";

interface BookingFormProps {
  hotel: HotelInput;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

type Step = "details" | "payment" | "confirming";

export function BookingForm({
  hotel: hotelProp,
  checkIn: checkInProp = "",
  checkOut: checkOutProp = "",
  guests = 1,
}: BookingFormProps) {
  const hotel = useMemo(() => normalizeHotel(hotelProp), [hotelProp]);
  const checkIn = checkInProp;
  const checkOut = checkOutProp;
  const { setBookingHotel } = useAtlasStore();
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    cardHolder: "",
  });

  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
    )
  );
  const total = hotel.price * nights;

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleBook() {
    setLoading(true);
    setStep("confirming");
    try {
      const res = await fetch("/api/hotels/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId: hotel.id,
          offerId: hotel.offerId,
          guestFirstName: form.firstName,
          guestLastName: form.lastName,
          guestEmail: form.email,
          guestPhone: form.phone,
          cardNumber: form.cardNumber,
          cardExpiry: form.cardExpiry,
          cardCvv: form.cardCvv,
          cardHolderName: form.cardHolder,
        }),
      });

      if (!res.ok) throw new Error("Booking failed");
      const confirmation = await res.json();

      // Clear booking form from store — confirmation will be shown by AI
      setBookingHotel(null);

      // Dispatch a custom event so the chat can react
      window.dispatchEvent(
        new CustomEvent("hotel-booked", { detail: confirmation })
      );
    } catch (err) {
      console.error(err);
      setStep("payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
      {/* Hotel summary */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate text-white">{hotel.name}</p>
          <p className="text-xs text-blue-200 mt-0.5">
            {checkIn} → {checkOut}
          </p>
          <div className="flex gap-1.5 mt-1.5">
            <Badge className="text-[10px] bg-white/20 text-white border-0 hover:bg-white/30">
              {nights} night{nights !== 1 ? "s" : ""}
            </Badge>
            <Badge className="text-[10px] bg-white/20 text-white border-0 hover:bg-white/30">
              {guests} guest{guests !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-lg text-white">${total}</p>
          <p className="text-[10px] text-blue-200 font-medium">total</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Steps */}
        <div className="flex items-center gap-2 text-xs">
          <span className={step === "details" ? "font-semibold text-blue-600" : "text-muted-foreground"}>
            1. Guest Info
          </span>
          <div className="flex-1 h-px bg-border" />
          <span className={step === "payment" || step === "confirming" ? "font-semibold text-blue-600" : "text-muted-foreground"}>
            2. Payment
          </span>
        </div>

        {step === "details" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-1">
                  <User className="w-3 h-3" /> First Name
                </label>
                <Input
                  placeholder="John"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Last Name</label>
                <Input
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email
              </label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1">
                <Phone className="w-3 h-3" /> Phone (optional)
              </label>
              <Input
                type="tel"
                placeholder="+1 234 567 8900"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-blue-300/50 transition-all atlas-btn-shine"
              disabled={!form.firstName || !form.lastName || !form.email}
              onClick={() => setStep("payment")}
            >
              Continue to Payment
            </Button>
          </div>
        )}

        {(step === "payment" || step === "confirming") && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1">
                <User className="w-3 h-3" /> Cardholder Name
              </label>
              <Input
                placeholder="John Doe"
                value={form.cardHolder}
                onChange={(e) => update("cardHolder", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1">
                <CreditCard className="w-3 h-3" /> Card Number
              </label>
              <Input
                placeholder="4242 4242 4242 4242"
                value={form.cardNumber}
                onChange={(e) =>
                  update(
                    "cardNumber",
                    e.target.value.replace(/\D/g, "").slice(0, 16)
                  )
                }
                className="h-8 text-sm font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" /> Expiry
                </label>
                <Input
                  placeholder="MM/YY"
                  value={form.cardExpiry}
                  onChange={(e) => update("cardExpiry", e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" /> CVV
                </label>
                <Input
                  placeholder="123"
                  type="password"
                  value={form.cardCvv}
                  onChange={(e) =>
                    update("cardCvv", e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-sm font-semibold">
              <span>Total charge</span>
              <span className="text-blue-600">${total} {hotel.currency}</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-8 text-xs"
                onClick={() => setStep("details")}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-8 text-xs shadow-md hover:shadow-blue-300/40 transition-all atlas-btn-shine"
                disabled={
                  !form.cardNumber ||
                  !form.cardExpiry ||
                  !form.cardCvv ||
                  !form.cardHolder ||
                  loading
                }
                onClick={handleBook}
              >
                {loading ? "Booking…" : `Confirm & Pay $${total}`}
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              Secure · Encrypted · Instant confirmation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

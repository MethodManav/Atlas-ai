"use client";

import { useState } from "react";
import { CreditCard, User, Mail, Phone, CalendarDays, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAtlasStore } from "@/lib/store";
import type { Hotel } from "@/lib/amadeus";

interface BookingFormProps {
  hotel: Hotel;
  checkIn: string;
  checkOut: string;
  guests?: number;
}

type Step = "details" | "payment" | "confirming";

export function BookingForm({ hotel, checkIn, checkOut, guests = 1 }: BookingFormProps) {
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
    <div className="w-full max-w-sm rounded-xl border bg-background shadow-sm overflow-hidden">
      {/* Hotel summary */}
      <div className="bg-blue-50 dark:bg-blue-950 px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{hotel.name}</p>
          <p className="text-xs text-muted-foreground">
            {checkIn} → {checkOut}
          </p>
          <div className="flex gap-1.5 mt-1">
            <Badge variant="secondary" className="text-xs">
              {nights} night{nights !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {guests} guest{guests !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-blue-600">${total}</p>
          <p className="text-xs text-muted-foreground">total</p>
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
              className="w-full bg-blue-600 hover:bg-blue-700"
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
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-8 text-xs"
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

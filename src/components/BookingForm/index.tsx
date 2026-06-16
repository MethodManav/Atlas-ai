"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  CreditCard, User, Mail, Phone, Lock, Loader2,
  CheckCircle2, Shield, Zap, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAtlasStore } from "@/lib/store";
import { normalizeHotel, isValidImageUrl, type HotelInput } from "@/lib/hotels";
import { cn } from "@/lib/utils";

interface BookingFormProps {
  hotel: HotelInput;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

type Step = "details" | "payment" | "confirming";

function formatCardDisplay(raw: string): string {
  return raw.replace(/(.{4})/g, "$1 ").trim();
}

type CardBrand = "visa" | "mastercard" | "amex" | "unknown";
function detectCardBrand(raw: string): CardBrand {
  if (!raw) return "unknown";
  if (raw[0] === "4") return "visa";
  if (raw[0] === "5") return "mastercard";
  if (raw[0] === "3") return "amex";
  return "unknown";
}

// Input with an icon pinned to the left
function IconInput({
  icon: Icon,
  className,
  rightSlot,
  ...props
}: React.ComponentProps<"input"> & {
  icon: React.ElementType;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center z-10">
        <Icon className="w-3.5 h-3.5" />
      </span>
      <Input
        {...props}
        className={cn("pl-9", rightSlot ? "pr-14" : "", className)}
      />
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
          {rightSlot}
        </div>
      )}
    </div>
  );
}

export function BookingForm({
  hotel: hotelProp,
  checkIn: checkInProp = "",
  checkOut: checkOutProp = "",
  guests = 1,
}: BookingFormProps) {
  const hotel = useMemo(() => normalizeHotel(hotelProp), [hotelProp]);
  const checkIn = checkInProp;
  const checkOut = checkOutProp;
  const { setBookingHotel, setBookingConfirmation } = useAtlasStore();
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
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000,
    ),
  );
  const total = hotel.price * nights;
  const brand = detectCardBrand(form.cardNumber);
  const hasImage = isValidImageUrl(hotel.imageUrl);

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

      setBookingHotel(null);
      setBookingConfirmation(confirmation);
    } catch (err) {
      console.error(err);
      setStep("payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/8 bg-zinc-900 shadow-2xl shadow-black/50 overflow-hidden relative">
      {/* Booking loader overlay */}
      {step === "confirming" && (
        <div className="absolute inset-0 bg-zinc-900/95 backdrop-blur-sm flex flex-col items-center justify-center gap-5 z-20 rounded-2xl">
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-14 h-14 animate-spin text-blue-500" />
            <div className="absolute w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="text-center px-6">
            <p className="font-bold text-zinc-100 text-base">Processing your booking</p>
            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
              Securing your reservation · Please don&apos;t close this window
            </p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                style={{ animationDelay: `${i * 140}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Hotel summary header */}
      <div className="bg-gradient-to-r from-violet-700 via-violet-600 to-indigo-600 px-4 py-3.5 flex items-start gap-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        {hasImage && (
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-white/30 shadow-md">
            <Image
              src={hotel.imageUrl}
              alt={hotel.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
        )}
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
        {/* Step indicator — animated circles */}
        <div className="flex items-start">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300",
                step === "details"
                  ? "border-violet-500 bg-violet-600 text-white"
                  : "border-violet-500 bg-zinc-900 text-violet-400 animate-atlas-step-complete",
              )}
            >
              {step !== "details" ? <Check className="w-3.5 h-3.5" /> : "1"}
            </div>
            <span
              className={cn(
                "text-[10px] font-medium whitespace-nowrap",
                step === "details" ? "text-violet-400" : "text-zinc-600",
              )}
            >
              Guest Info
            </span>
          </div>

          {/* Connecting progress line */}
          <div className="flex-1 h-0.5 mx-2 mt-3.5 relative overflow-hidden rounded-full bg-white/10">
            <div
              className={cn(
                "absolute inset-y-0 left-0 bg-violet-500 transition-all duration-500 ease-out",
                step !== "details" ? "w-full" : "w-0",
              )}
            />
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300",
                step === "payment" || step === "confirming"
                  ? "border-violet-500 bg-violet-600 text-white"
                  : "border-white/15 bg-zinc-900 text-zinc-600",
              )}
            >
              2
            </div>
            <span
              className={cn(
                "text-[10px] font-medium whitespace-nowrap",
                step === "payment" || step === "confirming"
                  ? "text-violet-400"
                  : "text-zinc-600",
              )}
            >
              Payment
            </span>
          </div>
        </div>

        {/* Guest details step */}
        {step === "details" && (
          <div className="space-y-3">
            {/* First + Last name on one row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500">First Name</label>
                <Input
                  placeholder="John"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  className="h-10 text-sm rounded-xl w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500">Last Name</label>
                <Input
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  className="h-10 text-sm rounded-xl w-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Email</label>
              <IconInput
                icon={Mail}
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="h-10 text-sm rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">
                Phone <span className="text-slate-400">(optional)</span>
              </label>
              <IconInput
                icon={Phone}
                type="tel"
                placeholder="+1 234 567 8900"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="h-10 text-sm rounded-xl"
              />
            </div>

            <Button
              className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md hover:shadow-violet-700/40 transition-all atlas-btn-shine rounded-xl"
              disabled={!form.firstName || !form.lastName || !form.email}
              onClick={() => setStep("payment")}
            >
              Continue to Payment →
            </Button>
          </div>
        )}

        {/* Payment step */}
        {(step === "payment" || step === "confirming") && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Cardholder Name</label>
              <IconInput
                icon={User}
                placeholder="John Doe"
                value={form.cardHolder}
                onChange={(e) => update("cardHolder", e.target.value)}
                className="h-10 text-sm rounded-xl"
              />
            </div>

            {/* Card number with brand badge */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Card Number</label>
              <IconInput
                icon={CreditCard}
                placeholder="4242 4242 4242 4242"
                value={formatCardDisplay(form.cardNumber)}
                onChange={(e) =>
                  update("cardNumber", e.target.value.replace(/\D/g, "").slice(0, 16))
                }
                className="h-10 text-sm rounded-xl font-mono"
                inputMode="numeric"
                rightSlot={
                  brand === "visa" ? (
                    <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 text-[10px] font-bold">
                      VISA
                    </span>
                  ) : brand === "mastercard" ? (
                    <span className="text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 text-[10px] font-bold">
                      MC
                    </span>
                  ) : brand === "amex" ? (
                    <span className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100 text-[10px] font-bold">
                      AMEX
                    </span>
                  ) : null
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500">Expiry</label>
                <Input
                  placeholder="MM/YY"
                  value={form.cardExpiry}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                    if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                    update("cardExpiry", v);
                  }}
                  className="h-10 text-sm rounded-xl"
                  inputMode="numeric"
                  maxLength={5}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> CVV
                </label>
                <Input
                  placeholder="123"
                  type="password"
                  value={form.cardCvv}
                  onChange={(e) =>
                    update("cardCvv", e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  className="h-10 text-sm rounded-xl"
                  inputMode="numeric"
                />
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-zinc-400">Total charge</span>
              <span className="text-violet-400 text-base">
                ${total} {hotel.currency}
              </span>
            </div>

            {/* CTA buttons — stacked */}
            <div className="space-y-2 pt-1">
              <Button
                variant="outline"
                className="w-full h-9 text-xs rounded-xl"
                onClick={() => setStep("details")}
                disabled={loading}
              >
                ← Back to Guest Info
              </Button>
              <Button
                className={cn(
                  "w-full h-12 text-sm font-semibold rounded-xl",
                  "bg-gradient-to-r from-violet-600 to-indigo-600",
                  "hover:from-violet-500 hover:to-indigo-500",
                  "shadow-lg shadow-violet-900/40 hover:shadow-violet-700/50",
                  "transition-all duration-200 atlas-btn-shine",
                )}
                disabled={
                  !form.cardNumber ||
                  !form.cardExpiry ||
                  !form.cardCvv ||
                  !form.cardHolder ||
                  loading
                }
                onClick={handleBook}
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {loading ? "Processing…" : `Confirm & Pay $${total}`}
                </span>
              </Button>
            </div>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 pt-1">
              {[
                { Icon: Lock, label: "Encrypted" },
                { Icon: Shield, label: "Secure" },
                { Icon: Zap, label: "Instant" },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <Icon className="w-3 h-3" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

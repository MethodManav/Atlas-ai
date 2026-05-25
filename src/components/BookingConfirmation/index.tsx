"use client";

import { CheckCircle2, Calendar, User, Hash, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface BookingConfirmationProps {
  bookingId: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  totalPrice: number;
  currency: string;
  status: "CONFIRMED" | "PENDING" | "FAILED";
}

export function BookingConfirmation({
  bookingId,
  hotelName,
  checkIn,
  checkOut,
  guestName,
  totalPrice,
  currency,
  status,
}: BookingConfirmationProps) {
  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
    )
  );

  const statusColor =
    status === "CONFIRMED"
      ? "bg-emerald-500"
      : status === "PENDING"
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <div className="w-full max-w-sm rounded-xl border bg-background shadow-sm overflow-hidden">
      {/* Success header */}
      <div className="bg-emerald-50 dark:bg-emerald-950 px-4 py-4 flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-base">Booking Confirmed! 🎉</h3>
          <p className="text-xs text-muted-foreground">
            Your hotel has been successfully reserved
          </p>
        </div>
        <Badge className={`${statusColor} text-white text-xs`}>
          {status}
        </Badge>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Hash className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Booking Reference</p>
              <p className="font-mono font-bold text-blue-600">{bookingId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Guest</p>
              <p className="font-medium">{guestName}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm">
            <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Stay</p>
              <p className="font-medium">{hotelName}</p>
              <p className="text-xs text-muted-foreground">
                {checkIn} → {checkOut} · {nights} night{nights !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total Paid</span>
          <span className="font-bold text-lg text-blue-600">
            {currency === "USD" ? "$" : currency}
            {totalPrice}
          </span>
        </div>

        <Button
          variant="outline"
          className="w-full h-8 text-xs gap-1.5"
          onClick={() => {
            const details = `
ATLAS AI - BOOKING CONFIRMATION
================================
Booking ID: ${bookingId}
Hotel: ${hotelName}
Guest: ${guestName}
Check-in: ${checkIn}
Check-out: ${checkOut}
Nights: ${nights}
Total: ${currency} ${totalPrice}
Status: ${status}
================================
Thank you for booking with Atlas AI!
            `.trim();
            const blob = new Blob([details], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `booking-${bookingId}.txt`;
            a.click();
          }}
        >
          <Download className="w-3.5 h-3.5" />
          Download Confirmation
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          A confirmation email will be sent to your email address.
        </p>
      </div>
    </div>
  );
}

"use client";

import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAtlasStore } from "@/lib/store";
import { BookingForm } from "@/components/BookingForm";

export function BookingDrawer() {
  const { bookingHotel, setBookingHotel, searchContext } = useAtlasStore();

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  return (
    <Sheet open={!!bookingHotel} onOpenChange={(open) => !open && setBookingHotel(null)}>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[90vh] rounded-t-2xl px-4 pt-4 pb-6 overflow-y-auto"
      >
        <SheetHeader className="flex flex-row items-center justify-between mb-4">
          <SheetTitle className="text-base">Book your stay</SheetTitle>
          <button
            onClick={() => setBookingHotel(null)}
            className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
          >
            <X className="w-4 h-4" />
          </button>
        </SheetHeader>

        {bookingHotel && (
          <div className="flex justify-center">
            <BookingForm
              hotel={bookingHotel}
              checkIn={searchContext.checkIn ?? today}
              checkOut={searchContext.checkOut ?? tomorrow}
              guests={searchContext.guests ?? 1}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

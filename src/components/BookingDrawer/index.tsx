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
    <Sheet
      open={!!bookingHotel}
      onOpenChange={(open) => !open && setBookingHotel(null)}
    >
      <SheetContent
        side="bottom"
        className="h-auto max-h-[92vh] rounded-t-3xl px-4 pt-0 pb-6 overflow-y-auto border-0 shadow-2xl"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>

        <SheetHeader className="flex flex-row items-center justify-between mb-4 px-1">
          <div>
            <SheetTitle className="text-base font-bold text-zinc-100">
              Book your stay
            </SheetTitle>
            {bookingHotel && (
              <p className="text-xs text-zinc-500 mt-0.5 font-medium truncate max-w-[220px]">
                {bookingHotel.name}
              </p>
            )}
          </div>
          <button
            onClick={() => setBookingHotel(null)}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </SheetHeader>

        {bookingHotel && (
          <div className="flex justify-center animate-atlas-slide-up">
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

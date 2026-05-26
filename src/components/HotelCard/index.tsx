"use client";

import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAtlasStore } from "@/lib/store";
import { getReviewScore, isValidImageUrl, type Hotel } from "@/lib/hotels";
import { cn } from "@/lib/utils";

interface HotelCardProps {
  hotel: Hotel;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  compact?: boolean;
}

function formatPrice(amount: number, currency: string): string {
  if (currency === "USD") return `$${amount}`;
  return `${currency} ${amount}`;
}

function ratingColor(score: number): string {
  if (score >= 9) return "bg-gradient-to-br from-amber-400 to-orange-500";
  if (score >= 8) return "bg-gradient-to-br from-emerald-500 to-teal-600";
  return "bg-gradient-to-br from-blue-500 to-blue-600";
}

export function HotelCard({
  hotel,
  checkIn,
  checkOut,
  guests = 1,
  compact = false,
}: HotelCardProps) {
  const {
    setSelectedHotelId,
    setBookingHotel,
    setSearchContext,
    selectedHotelId,
  } = useAtlasStore();

  const isSelected = selectedHotelId === hotel.id;
  const reviewScore = getReviewScore(hotel);
  const imageSrc = isValidImageUrl(hotel.imageUrl) ? hotel.imageUrl : null;

  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            86400000,
        )
      : 1;

  const totalPrice = hotel.price * nights;

  function handleBook() {
    if (checkIn && checkOut) {
      setSearchContext({ checkIn, checkOut, guests });
    }
    setBookingHotel(hotel);
  }

  return (
    <div
      className={cn(
        "group overflow-hidden rounded-2xl bg-white border transition-all duration-300 cursor-pointer",
        "shadow-sm hover:shadow-xl hover:shadow-slate-200/80",
        "hover:-translate-y-1.5",
        isSelected
          ? "ring-2 ring-blue-500 shadow-xl shadow-blue-100/70 -translate-y-1.5 border-blue-200"
          : "border-slate-200/80 hover:border-slate-300/60",
      )}
      onMouseEnter={() => setSelectedHotelId(hotel.id)}
      onMouseLeave={() => setSelectedHotelId(null)}
    >
      <div className={cn("flex", compact ? "flex-row" : "flex-col")}>
        {/* ── Image ─────────────────────────────────────────────── */}
        <div
          className={cn(
            "relative overflow-hidden bg-slate-100 flex-shrink-0",
            compact ? "w-28 h-full min-h-[90px]" : "w-full h-40",
          )}
        >
          {imageSrc ? (
            <>
              <Image
                src={imageSrc}
                alt={hotel.name}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                unoptimized
              />
              {/* Gradient overlay — bottom fade for text contrast */}
              {!compact && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-slate-100 to-slate-200">
              <div className="w-10 h-10 rounded-xl bg-slate-300/60 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-slate-400" />
              </div>
              <span className="text-xs text-slate-400 font-medium">No photo</span>
            </div>
          )}

          {/* Rating badge */}
          {reviewScore != null && (
            <div className="absolute top-2 left-2 animate-atlas-badge-pop">
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-white shadow-lg",
                  ratingColor(reviewScore),
                )}
              >
                <Star className="w-2.5 h-2.5 fill-white text-white" />
                <span className="text-[11px] font-bold tracking-tight">
                  {reviewScore.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Content ───────────────────────────────────────────── */}
        <div className="p-3 flex-1 flex flex-col gap-1.5">
          <div>
            <h3 className="font-semibold text-sm leading-tight line-clamp-1 text-slate-800 group-hover:text-blue-700 transition-colors duration-200">
              {hotel.name}
            </h3>
            <div className="flex items-center gap-1 text-slate-400 mt-0.5">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs line-clamp-1">
                {hotel.address || hotel.city}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
            <div>
              <div className="flex items-baseline gap-0.5">
                <span className="font-bold text-base text-blue-600">
                  {formatPrice(hotel.price, hotel.currency)}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">/night</span>
              </div>
              {nights > 1 && (
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {formatPrice(totalPrice, hotel.currency)} · {nights} nights
                </div>
              )}
            </div>
            <Button
              size="sm"
              className={cn(
                "h-7 px-3 text-xs rounded-xl",
                "bg-gradient-to-br from-blue-600 to-indigo-600",
                "hover:from-blue-700 hover:to-indigo-700",
                "text-white shadow-sm hover:shadow-blue-300/50",
                "transition-all duration-200 atlas-btn-shine",
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleBook();
              }}
            >
              Book
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  return "bg-gradient-to-br from-violet-500 to-indigo-600";
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
    setMapState,
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
        "group overflow-hidden rounded-2xl bg-zinc-900 border transition-all duration-300 cursor-pointer",
        "shadow-sm hover:shadow-xl hover:shadow-black/40",
        "hover:-translate-y-1.5",
        isSelected
          ? "ring-2 ring-violet-500 shadow-xl shadow-violet-950/40 -translate-y-1.5 border-violet-500/30"
          : "border-white/8 hover:border-white/14",
      )}
      onMouseEnter={() => setSelectedHotelId(hotel.id)}
      onMouseLeave={() => setSelectedHotelId(null)}
      onClick={() => {
        setSelectedHotelId(hotel.id);
        if (hotel.lat && hotel.lng) {
          setMapState({ center: [hotel.lng, hotel.lat], zoom: 15 });
        }
      }}
    >
      <div className={cn("flex", compact ? "flex-row" : "flex-col")}>
        {/* ── Image ─────────────────────────────────────────────── */}
        <div
          className={cn(
            "relative overflow-hidden bg-zinc-800 flex-shrink-0",
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
              {!compact && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-zinc-800 to-zinc-900">
              <div className="w-10 h-10 rounded-xl bg-zinc-700/60 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-zinc-500" />
              </div>
              <span className="text-xs text-zinc-600 font-medium">No photo</span>
            </div>
          )}

          {/* Rating badge + review count */}
          {reviewScore != null && (
            <div className="absolute top-2 left-2 animate-atlas-badge-pop flex items-center gap-1">
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
              {hotel.reviewCount > 0 && (
                <span className="text-[10px] font-medium text-white/80 bg-black/50 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                  {hotel.reviewCount >= 1000
                    ? `${(hotel.reviewCount / 1000).toFixed(1)}k`
                    : hotel.reviewCount}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Content ───────────────────────────────────────────── */}
        <div className="p-3 flex-1 flex flex-col gap-1.5">
          <div>
            <h3 className="font-semibold text-sm leading-tight line-clamp-1 text-zinc-100 group-hover:text-violet-300 transition-colors duration-200">
              {hotel.name}
            </h3>
            <div className="flex items-center gap-1 text-zinc-600 mt-0.5">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs line-clamp-1">
                {hotel.address || hotel.city}
              </span>
            </div>
          </div>

          {/* Amenity chips */}
          {!compact && hotel.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {hotel.amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-zinc-800 text-zinc-500"
                >
                  {amenity}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/6">
            <div>
              <div className="flex items-baseline gap-0.5">
                <span className="font-bold text-base text-violet-400">
                  {formatPrice(hotel.price, hotel.currency)}
                </span>
                <span className="text-[11px] text-zinc-600 font-medium">/night</span>
              </div>
              {nights > 1 && (
                <div className="text-[10px] text-zinc-600 mt-0.5">
                  {formatPrice(totalPrice, hotel.currency)} · {nights} nights
                </div>
              )}
            </div>
            <Button
              size="sm"
              className={cn(
                "h-7 px-3 text-xs rounded-xl",
                "bg-gradient-to-br from-violet-600 to-indigo-600",
                "hover:from-violet-500 hover:to-indigo-500",
                "text-white shadow-sm hover:shadow-violet-700/40",
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

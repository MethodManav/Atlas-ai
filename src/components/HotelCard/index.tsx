"use client";

import Image from "next/image";
import { Star, MapPin, Wifi, Car, Utensils, Dumbbell, Waves, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAtlasStore } from "@/lib/store";
import type { Hotel } from "@/lib/amadeus";
import { cn } from "@/lib/utils";

interface HotelCardProps {
  hotel: Hotel;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  compact?: boolean;
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-3 h-3" />,
  Parking: <Car className="w-3 h-3" />,
  Restaurant: <Utensils className="w-3 h-3" />,
  Gym: <Dumbbell className="w-3 h-3" />,
  Pool: <Waves className="w-3 h-3" />,
  Spa: <Sparkles className="w-3 h-3" />,
};

function StarRating({ rating, score }: { rating: number; score: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-3.5 h-3.5",
              i < rating
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted"
            )}
          />
        ))}
      </div>
      <span className="text-xs font-semibold bg-emerald-500 text-white px-1.5 py-0.5 rounded">
        {score.toFixed(1)}
      </span>
    </div>
  );
}

export function HotelCard({
  hotel,
  checkIn,
  checkOut,
  guests = 1,
  compact = false,
}: HotelCardProps) {
  const { setSelectedHotelId, setBookingHotel, setSearchContext, selectedHotelId } =
    useAtlasStore();

  const isSelected = selectedHotelId === hotel.id;

  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            86400000
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
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200 cursor-pointer border",
        isSelected
          ? "ring-2 ring-blue-500 shadow-lg shadow-blue-100"
          : "hover:shadow-md hover:border-blue-200"
      )}
      onMouseEnter={() => setSelectedHotelId(hotel.id)}
      onMouseLeave={() => setSelectedHotelId(null)}
    >
      <div className={cn("flex", compact ? "flex-row" : "flex-col")}>
        {/* Image */}
        <div
          className={cn(
            "relative overflow-hidden bg-muted flex-shrink-0",
            compact ? "w-28 h-full min-h-[90px]" : "w-full h-40"
          )}
        >
          <Image
            src={hotel.imageUrl}
            alt={hotel.name}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute top-2 left-2">
            <Badge
              className={cn(
                "text-xs font-semibold",
                hotel.rating >= 5
                  ? "bg-amber-500 text-white"
                  : hotel.rating >= 4
                  ? "bg-blue-500 text-white"
                  : "bg-slate-500 text-white"
              )}
            >
              {hotel.rating}★
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-3 flex-1 flex flex-col gap-1.5">
          <div>
            <h3 className="font-semibold text-sm leading-tight line-clamp-1">
              {hotel.name}
            </h3>
            <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs line-clamp-1">{hotel.address || hotel.city}</span>
            </div>
          </div>

          <StarRating rating={hotel.rating} score={hotel.reviewScore} />

          {!compact && hotel.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hotel.amenities.slice(0, 4).map((amenity) => (
                <Badge
                  key={amenity}
                  variant="secondary"
                  className="text-xs px-1.5 py-0 h-5 gap-1"
                >
                  {AMENITY_ICONS[amenity]}
                  {amenity}
                </Badge>
              ))}
              {hotel.amenities.length > 4 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                  +{hotel.amenities.length - 4}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-auto pt-1">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-base text-blue-600">
                  ${hotel.price}
                </span>
                <span className="text-xs text-muted-foreground">/night</span>
              </div>
              {nights > 1 && (
                <div className="text-xs text-muted-foreground">
                  ${totalPrice} total · {nights} nights
                </div>
              )}
            </div>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleBook();
              }}
            >
              Book
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

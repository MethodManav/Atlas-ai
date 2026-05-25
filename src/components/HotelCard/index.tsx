"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

function GuestRating({ score }: { score: number | null }) {
  if (score == null) return null;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-semibold bg-emerald-500 text-white px-1.5 py-0.5 rounded">
        {score.toFixed(1)}
      </span>
      <span className="text-xs text-muted-foreground">Guest rating</span>
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
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200 cursor-pointer border",
        isSelected
          ? "ring-2 ring-blue-500 shadow-lg shadow-blue-100"
          : "hover:shadow-md hover:border-blue-200",
      )}
      onMouseEnter={() => setSelectedHotelId(hotel.id)}
      onMouseLeave={() => setSelectedHotelId(null)}
    >
      <div className={cn("flex", compact ? "flex-row" : "flex-col")}>
        {/* Image */}
        <div
          className={cn(
            "relative overflow-hidden bg-muted flex-shrink-0",
            compact ? "w-28 h-full min-h-[90px]" : "w-full h-40",
          )}
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={hotel.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
              No photo
            </div>
          )}
          {reviewScore != null && (
            <div className="absolute top-2 left-2">
              <Badge
                className={cn(
                  "text-xs font-semibold",
                  reviewScore >= 9
                    ? "bg-amber-500 text-white"
                    : reviewScore >= 8
                      ? "bg-blue-500 text-white"
                      : "bg-slate-500 text-white",
                )}
              >
                {reviewScore.toFixed(1)}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-3 flex-1 flex flex-col gap-1.5">
          <div>
            <h3 className="font-semibold text-sm leading-tight line-clamp-1">
              {hotel.name}
            </h3>
            <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs line-clamp-1">
                {hotel.address || hotel.city}
              </span>
            </div>
          </div>

          <GuestRating score={reviewScore} />

          {/* {!compact && hotel.amenities.length > 0 && (
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
          )} */}

          <div className="flex items-center justify-between mt-auto pt-1">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-base text-blue-600">
                  {formatPrice(hotel.price, hotel.currency)}
                </span>
                <span className="text-xs text-muted-foreground">/night</span>
              </div>
              {nights > 1 && (
                <div className="text-xs text-muted-foreground">
                  {formatPrice(totalPrice, hotel.currency)} total · {nights}{" "}
                  nights
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

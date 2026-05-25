"use client";

import { useEffect } from "react";
import { MapPin, Search } from "lucide-react";
import { HotelCard } from "@/components/HotelCard";
import { useAtlasStore } from "@/lib/store";
import type { Hotel } from "@/lib/amadeus";

interface HotelResultsListProps {
  hotels: Hotel[];
  city: string;
  checkIn: string;
  checkOut: string;
  totalFound: number;
}

export function HotelResultsList({
  hotels,
  city,
  checkIn,
  checkOut,
  totalFound,
}: HotelResultsListProps) {
  const { setHotels, setMapState, setSearchContext } = useAtlasStore();

  // Sync hotels to map whenever this component renders
  useEffect(() => {
    if (hotels.length > 0) {
      setHotels(hotels);
      setSearchContext({ city, checkIn, checkOut });

      // Fly map to first hotel
      const first = hotels[0];
      if (first.lat && first.lng) {
        setMapState({ center: [first.lng, first.lat], zoom: 13 });
      }
    }
  }, [hotels, city, checkIn, checkOut, setHotels, setMapState, setSearchContext]);

  if (!hotels.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
        <Search className="w-8 h-8" />
        <p className="text-sm">No hotels found for your criteria.</p>
        <p className="text-xs">Try adjusting the dates or filters.</p>
      </div>
    );
  }

  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
        )
      : 1;

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center gap-2 pb-1 border-b">
        <MapPin className="w-4 h-4 text-blue-500" />
        <div>
          <p className="text-sm font-semibold">
            {totalFound} hotel{totalFound !== 1 ? "s" : ""} in {city}
          </p>
          <p className="text-xs text-muted-foreground">
            {checkIn} → {checkOut} · {nights} night{nights !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Hotel cards */}
      <div className="flex flex-col gap-2">
        {hotels.map((hotel) => (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
            checkIn={checkIn}
            checkOut={checkOut}
          />
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Prices shown per night · Click <strong>Book</strong> to reserve
      </p>
    </div>
  );
}

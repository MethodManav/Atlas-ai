"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapPin, Search } from "lucide-react";
import { HotelCard } from "@/components/HotelCard";
import { useAtlasStore } from "@/lib/store";
import { normalizeHotel, type Hotel, type HotelInput } from "@/lib/hotels";

interface HotelResultsListProps {
  hotels?: HotelInput[];
  city?: string;
  checkIn?: string;
  checkOut?: string;
  totalFound?: number;
}

export function HotelResultsList({
  hotels: hotelsProp,
  city: cityProp,
  checkIn: checkInProp,
  checkOut: checkOutProp,
  totalFound: totalFoundProp,
}: HotelResultsListProps) {
  const hotels = useMemo(
    () =>
      (Array.isArray(hotelsProp) ? hotelsProp : [])
        .filter((h) => h?.id && h?.name)
        .map((h) => normalizeHotel(h))
        .filter((hotel, index, list) => {
          const key = hotel.offerId ?? hotel.id;
          if (!key) return false;
          return (
            list.findIndex((h) => (h.offerId ?? h.id) === key) === index
          );
        }),
    [hotelsProp],
  );

  const city = cityProp ?? "";
  const checkIn = checkInProp ?? "";
  const checkOut = checkOutProp ?? "";
  const totalFound = totalFoundProp ?? hotels.length;

  const { setHotels, setMapState, setSearchContext } = useAtlasStore();

  const syncKey = useMemo(
    () =>
      `${city}|${checkIn}|${checkOut}|${hotels.map((h) => h.offerId ?? h.id).join(",")}`,
    [city, checkIn, checkOut, hotels],
  );
  const lastSyncKey = useRef<string | null>(null);

  // Sync to map store once per search result set (avoid infinite update loop)
  useEffect(() => {
    if (hotels.length === 0) return;
    if (lastSyncKey.current === syncKey) return;
    lastSyncKey.current = syncKey;

    setHotels(hotels);
    setSearchContext({ city, checkIn, checkOut });

    const first = hotels.find((h) => h.lat && h.lng) ?? hotels[0];
    if (first?.lat && first?.lng) {
      setMapState({ center: [first.lng, first.lat], zoom: 13 });
    }
  }, [syncKey, hotels, city, checkIn, checkOut, setHotels, setMapState, setSearchContext]);

  if (!hotels.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
        <Search className="w-8 h-8" />
        <p className="text-sm">
          {city
            ? `No hotels found in ${city}.`
            : "No hotels to display yet."}
        </p>
        <p className="text-xs">
          Try another city, different dates, or run a new search.
        </p>
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
        {hotels.map((hotel, index) => (
          <HotelCard
            key={hotel.offerId ?? `${hotel.id}-${index}`}
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

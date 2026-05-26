"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Loader2, MapPin, Search } from "lucide-react";
import { HotelCard } from "@/components/HotelCard";
import { useAtlasStore } from "@/lib/store";
import { normalizeHotel, type Hotel, type HotelInput } from "@/lib/hotels";

interface HotelResultsListProps {
  hotels?: HotelInput[];
  city?: string;
  checkIn?: string;
  checkOut?: string;
  totalFound?: number | null;
  nextCursor?: number | null;
}

export function HotelResultsList({
  hotels: hotelsProp,
  city: cityProp,
  checkIn: checkInProp,
  checkOut: checkOutProp,
  totalFound: totalFoundProp,
  nextCursor: nextCursorProp,
}: HotelResultsListProps) {
  const initialHotels = useMemo(
    () =>
      (Array.isArray(hotelsProp) ? hotelsProp : [])
        .filter((h) => h?.id && h?.name)
        .map((h) => normalizeHotel(h))
        .filter((hotel, index, list) => {
          const key = hotel.offerId ?? hotel.id;
          if (!key) return false;
          return list.findIndex((h) => (h.offerId ?? h.id) === key) === index;
        }),
    [hotelsProp],
  );

  const city = cityProp ?? "";
  const checkIn = checkInProp ?? "";
  const checkOut = checkOutProp ?? "";
  const totalFound = totalFoundProp ?? initialHotels.length;

  const { setHotels, setMapState, setSearchContext } = useAtlasStore();

  const syncKey = useMemo(
    () =>
      `${city}|${checkIn}|${checkOut}|${initialHotels.map((h) => h.offerId ?? h.id).join(",")}`,
    [city, checkIn, checkOut, initialHotels],
  );
  const lastSyncKey = useRef<string | null>(null);

  // ── Local pagination state ──────────────────────────────────────────────
  const [allHotels, setAllHotels] = useState<Hotel[]>(initialHotels);
  const [cursor, setCursor] = useState<number | null>(nextCursorProp ?? null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    setAllHotels(initialHotels);
    setCursor(nextCursorProp ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncKey]);

  useEffect(() => {
    if (initialHotels.length === 0) return;
    if (lastSyncKey.current === syncKey) return;
    lastSyncKey.current = syncKey;

    setHotels(initialHotels);
    setSearchContext({ city, checkIn, checkOut });

    const first = initialHotels.find((h) => h.lat && h.lng) ?? initialHotels[0];
    if (first?.lat && first?.lng) {
      setMapState({ center: [first.lng, first.lat], zoom: 13 });
    }
  }, [syncKey, initialHotels, city, checkIn, checkOut, setHotels, setMapState, setSearchContext]);

  async function loadMore() {
    if (cursor == null || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await fetch("/api/hotels/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, checkIn, checkOut, cursor }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load more hotels");

      const moreHotels = (Array.isArray(data.hotels) ? data.hotels : [])
        .filter((h: HotelInput) => h?.id && h?.name)
        .map((h: HotelInput) => normalizeHotel(h));

      setAllHotels((prev) => {
        const merged = [...prev, ...moreHotels];
        setHotels(merged);
        return merged;
      });
      setCursor(typeof data.nextCursor === "number" ? data.nextCursor : null);
    } catch (err) {
      console.error("Load more failed:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }

  if (!allHotels.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center animate-atlas-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Search className="w-6 h-6 text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-600">
            {city ? `No hotels found in ${city}` : "No hotels to display yet"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try another city, different dates, or run a new search.
          </p>
        </div>
      </div>
    );
  }

  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            86400000,
        )
      : 1;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* ── Header chip ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 animate-atlas-fade-in">
        <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-3.5 h-3.5 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 leading-tight">
            {totalFound} hotel{totalFound !== 1 ? "s" : ""} in{" "}
            <span className="text-blue-600">{city}</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {checkIn} → {checkOut} · {nights} night{nights !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ── Horizontal scrolling cards ────────────────────────── */}
      <div className="flex flex-row gap-3 overflow-x-auto pb-2 snap-x snap-mandatory atlas-scrollbar">
        {allHotels.map((hotel, index) => (
          <div
            key={hotel.offerId ?? `${hotel.id}-${index}`}
            className="w-52 flex-shrink-0 snap-center animate-atlas-scale-in"
            style={{ animationDelay: `${index * 55}ms` }}
          >
            <HotelCard hotel={hotel} checkIn={checkIn} checkOut={checkOut} />
          </div>
        ))}

        {/* Load More card */}
        {cursor !== null && (
          <div className="w-52 flex-shrink-0 snap-center animate-atlas-scale-in">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-400 text-blue-500 hover:text-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 w-full h-full min-h-[200px] bg-blue-50/30 hover:bg-blue-50 hover:-translate-y-1 hover:shadow-md"
            >
              {isLoadingMore ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <ChevronRight className="w-5 h-5" />
                </div>
              )}
              <span className="text-xs font-semibold text-center">
                {isLoadingMore ? "Loading…" : "Load more hotels"}
              </span>
            </button>
          </div>
        )}
      </div>

      <p className="text-[10px] text-center text-slate-400 font-medium">
        Prices shown per night · Tap <strong className="text-slate-500">Book</strong> to reserve
      </p>
    </div>
  );
}

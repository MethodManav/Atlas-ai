"use client";

import { useState } from "react";
import type { ComponentProps } from "react";
import { Search, MapPin, Users, SlidersHorizontal, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePickerButton } from "@/components/ui/date-picker-button";
import { HotelResultsList } from "@/components/HotelResultsList";
import { cn } from "@/lib/utils";
import type { HotelInput } from "@/lib/hotels";

interface HotelSearchFormProps {
  city?: string;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}
function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

interface SearchResult {
  hotels: HotelInput[];
  city: string;
  checkIn: string;
  checkOut: string;
  totalFound: number;
  nextCursor: number | null;
}

function IconInput({ icon: Icon, className, ...props }: ComponentProps<"input"> & { icon: React.ElementType }) {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 flex items-center z-10">
        <Icon className="w-4 h-4" />
      </span>
      <Input {...props} className={cn("pl-10", className)} />
    </div>
  );
}

export function HotelSearchForm({ city: cityProp }: HotelSearchFormProps) {
  const [city, setCity] = useState(cityProp ?? "");
  const [checkIn, setCheckIn] = useState(todayStr());
  const [checkOut, setCheckOut] = useState(tomorrowStr());
  const [guests, setGuests] = useState(1);
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState<number | "">("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!city.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const body: Record<string, unknown> = { city: city.trim(), checkIn, checkOut, guests };
      if (maxPrice) body.maxPrice = Number(maxPrice);
      if (minRating !== "") body.minRating = minRating;

      const res = await fetch("/api/hotels/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="w-full space-y-2">
        <button
          onClick={() => setResult(null)}
          className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 transition-colors"
        >
          ← Modify search
        </button>
        <HotelResultsList
          hotels={result.hotels}
          city={result.city}
          checkIn={result.checkIn}
          checkOut={result.checkOut}
          totalFound={result.totalFound}
          nextCursor={result.nextCursor}
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSearch}
      className="w-full rounded-2xl border border-white/8 bg-zinc-900/80 shadow-xl shadow-black/30 overflow-hidden"
    >
      {/* Header */}
      <div className="relative px-4 py-3 flex items-center gap-2 bg-gradient-to-r from-violet-700 via-violet-600 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <Search className="w-4 h-4 text-white/80 relative" />
        <span className="font-semibold text-sm text-white relative">Find Hotels</span>
      </div>

      <div className="p-5 space-y-4">
        {/* Destination */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
            Destination
          </label>
          <IconInput
            icon={MapPin}
            placeholder="e.g. Surat, Paris, Dubai"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-10 text-sm rounded-xl"
            required
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
              Check-in
            </label>
            <DatePickerButton
              value={checkIn}
              onChange={(date) => {
                setCheckIn(date);
                if (date >= checkOut) {
                  const d = new Date(date + "T00:00:00");
                  d.setDate(d.getDate() + 1);
                  setCheckOut(d.toISOString().split("T")[0]);
                }
              }}
              minDate={todayStr()}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
              Check-out
            </label>
            <DatePickerButton
              value={checkOut}
              onChange={setCheckOut}
              minDate={checkIn}
            />
          </div>
        </div>

        {/* Guests */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
            Guests
          </label>
          <div className="flex items-center justify-between h-12 px-3 rounded-xl border border-white/8 bg-zinc-800/50 hover:border-white/14 transition-colors">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-zinc-300">
                {guests === 1 ? "1 guest" : `${guests} guests`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                disabled={guests <= 1}
                className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all duration-150",
                  guests <= 1
                    ? "border-white/8 text-zinc-700 cursor-not-allowed"
                    : "border-white/15 text-zinc-400 hover:border-violet-500/50 hover:text-violet-400 hover:bg-violet-950/40",
                )}
              >
                −
              </button>
              <span className="w-5 text-center text-base font-bold text-zinc-100 tabular-nums">
                {guests}
              </span>
              <button
                type="button"
                onClick={() => setGuests((g) => Math.min(10, g + 1))}
                disabled={guests >= 10}
                className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all duration-150",
                  guests >= 10
                    ? "border-white/8 text-zinc-700 cursor-not-allowed"
                    : "border-white/15 text-zinc-400 hover:border-violet-500/50 hover:text-violet-400 hover:bg-violet-950/40",
                )}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Filter toggle */}
        <button
          type="button"
          onClick={() => setShowFilters((f) => !f)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
            showFilters
              ? "border-violet-500/40 bg-violet-950/50 text-violet-300"
              : "border-white/10 bg-zinc-800/50 text-zinc-500 hover:border-white/20 hover:text-zinc-300",
          )}
        >
          <SlidersHorizontal className="w-3 h-3" />
          {showFilters ? "Hide filters" : "Filters"}
          <span className={cn("transition-transform duration-200 inline-block leading-none", showFilters ? "rotate-180" : "")}>
            ▾
          </span>
        </button>

        {showFilters && (
          <div className="grid grid-cols-2 gap-3 animate-atlas-fade-in">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
                Max price/night ($)
              </label>
              <Input
                type="number"
                placeholder="e.g. 200"
                value={maxPrice}
                min={1}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-10 text-sm rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
                Min stars
              </label>
              <div className="flex gap-0.5 h-10 items-center px-1 rounded-xl border border-white/8 bg-zinc-800/50">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setMinRating(minRating === s ? "" : s)}
                    className="atlas-star-btn flex-1 h-8 rounded-lg flex items-center justify-center"
                    aria-label={`${s} star${s > 1 ? "s" : ""} minimum`}
                  >
                    <Star
                      className={cn(
                        "w-4 h-4 transition-colors duration-150",
                        typeof minRating === "number" && s <= minRating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-none text-zinc-600",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-400 font-medium bg-red-950/40 px-3 py-2 rounded-lg border border-red-800/40">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={!city.trim() || loading}
          className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/30 hover:shadow-violet-700/40 transition-all atlas-btn-shine rounded-xl"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Searching…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" /> Search Hotels
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}

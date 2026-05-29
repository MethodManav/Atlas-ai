"use client";

import { useState } from "react";
import { Search, MapPin, CalendarDays, Users, SlidersHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HotelResultsList } from "@/components/HotelResultsList";
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
          className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
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
      className="w-full rounded-2xl border border-slate-100 bg-white shadow-lg shadow-slate-200/40 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center gap-2">
        <Search className="w-4 h-4 text-white/80" />
        <span className="font-semibold text-sm text-white">Find Hotels</span>
      </div>

      <div className="p-4 space-y-3">
        {/* City */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> City
          </label>
          <Input
            placeholder="e.g. Surat, Paris, Dubai"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-9 text-sm"
            required
          />
        </div>

        {/* Dates row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
              <CalendarDays className="w-3 h-3" /> Check-in
            </label>
            <Input
              type="date"
              value={checkIn}
              min={todayStr()}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (e.target.value >= checkOut) {
                  const d = new Date(e.target.value);
                  d.setDate(d.getDate() + 1);
                  setCheckOut(d.toISOString().split("T")[0]);
                }
              }}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
              <CalendarDays className="w-3 h-3" /> Check-out
            </label>
            <Input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
            <Users className="w-3 h-3" /> Guests
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              className="w-8 h-8 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-lg flex items-center justify-center transition-colors"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-semibold text-slate-800">{guests}</span>
            <button
              type="button"
              onClick={() => setGuests((g) => Math.min(10, g + 1))}
              className="w-8 h-8 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-lg flex items-center justify-center transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Optional filters toggle */}
        <button
          type="button"
          onClick={() => setShowFilters((f) => !f)}
          className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
        >
          <SlidersHorizontal className="w-3 h-3" />
          {showFilters ? "Hide filters" : "Add filters (price, rating)"}
        </button>

        {showFilters && (
          <div className="grid grid-cols-2 gap-2 animate-atlas-fade-in">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Max price/night ($)</label>
              <Input
                type="number"
                placeholder="e.g. 200"
                value={maxPrice}
                min={1}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Min stars</label>
              <div className="flex gap-1 pt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setMinRating(minRating === s ? "" : s)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                      minRating !== "" && s <= minRating
                        ? "bg-amber-400 text-white"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {s}★
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}

        <Button
          type="submit"
          disabled={!city.trim() || loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-blue-300/40 transition-all atlas-btn-shine"
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

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Loader2, MapPin } from "lucide-react";
import { useAtlasStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface GeocodingSuggestion {
  id: string;
  place_name: string; // full label: "Paris, France"
  text: string;       // short city name: "Paris"
  center: [number, number]; // [lng, lat]
}

export function MapSearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingSuggestion[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false); // autocomplete in flight
  const [isLocating, setIsLocating] = useState(false); // final geocode on submit
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Geocoding autocomplete ──────────────────────────────────────────────────

  const fetchSuggestions = useCallback(async (value: string) => {
    if (!MAPBOX_TOKEN || value.trim().length < 2) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }
    setIsFetching(true);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        value.trim()
      )}.json?access_token=${MAPBOX_TOKEN}&types=place&limit=5`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Geocoding failed");
      const data = await res.json();
      const features: GeocodingSuggestion[] = (data.features ?? []).map(
        (f: { id: string; place_name: string; text: string; center: [number, number] }) => ({
          id: f.id,
          place_name: f.place_name,
          text: f.text,
          center: f.center,
        })
      );
      setSuggestions(features);
      setIsDropdownOpen(features.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setIsFetching(false);
    }
  }, []);

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  // ── Fly to location + drop a pin (hotels come from the chat only) ──────────

  function flyTo(center: [number, number], name: string) {
    const store = useAtlasStore.getState();
    store.setMapState({ center, zoom: 13 });
    store.setSearchedLocation({ center, name });
    setIsDropdownOpen(false);
  }

  /** When the user submits a free-text query with no selected suggestion,
   *  geocode it once to get coordinates, then fly and drop a pin. */
  async function geocodeAndFly(cityName: string) {
    if (!MAPBOX_TOKEN) return;
    setIsLocating(true);
    setError(null);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        cityName.trim()
      )}.json?access_token=${MAPBOX_TOKEN}&types=place&limit=1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Location not found");
      const data = await res.json();
      const feature = data.features?.[0];
      if (feature?.center) {
        flyTo(feature.center as [number, number], feature.place_name ?? cityName);
      } else {
        setError("Location not found — try a different city name.");
      }
    } catch {
      setError("Could not locate that place. Try again.");
    } finally {
      setIsLocating(false);
    }
  }

  function handleSuggestionSelect(suggestion: GeocodingSuggestion) {
    setQuery(suggestion.text);
    setSuggestions([]);
    // Coordinates already known — fly immediately, no extra network call
    flyTo(suggestion.center, suggestion.place_name);
  }

  function handleSubmit(e?: React.SyntheticEvent) {
    e?.preventDefault();
    if (!query.trim() || isLocating) return;
    setIsDropdownOpen(false);
    // If exactly one suggestion is visible, treat Enter as selecting it
    if (suggestions.length === 1) {
      handleSuggestionSelect(suggestions[0]);
    } else {
      geocodeAndFly(query.trim());
    }
  }

  function handleClear() {
    setQuery("");
    setSuggestions([]);
    setIsDropdownOpen(false);
    setError(null);
    inputRef.current?.focus();
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const isBusy = isFetching || isLocating;

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "relative flex items-center rounded-full h-11 px-4 gap-2",
            "atlas-glass",
            "shadow-[0_4px_24px_rgba(0,0,0,0.20)] ring-1 ring-black/5",
            "transition-all duration-200 focus-within:shadow-[0_4px_28px_rgba(37,99,235,0.22)] focus-within:ring-blue-300/40"
          )}
        >
          {/* Left icon: spinner while locating/fetching, magnifier otherwise */}
          <div className="flex-shrink-0 text-slate-400">
            {isBusy ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => suggestions.length > 0 && setIsDropdownOpen(true)}
            onKeyDown={(e) => e.key === "Escape" && setIsDropdownOpen(false)}
            placeholder="Search location…"
            disabled={isLocating}
            className={cn(
              "flex-1 min-w-0 h-full bg-transparent outline-none",
              "text-sm text-slate-800 placeholder-slate-400",
              "disabled:opacity-60"
            )}
            autoComplete="off"
            spellCheck={false}
          />

          {/* Clear button — only when input has text */}
          {query && !isLocating && (
            <button
              type="button"
              onClick={handleClear}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-full hover:bg-slate-100"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLocating || !query.trim()}
            className={cn(
              "flex-shrink-0 flex items-center justify-center",
              "w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
              "text-white transition-colors",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
            aria-label="Go to location"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Autocomplete dropdown */}
      {isDropdownOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 atlas-glass rounded-2xl shadow-2xl shadow-slate-900/12 ring-1 ring-black/5 overflow-hidden z-50 animate-atlas-scale-in">
          {suggestions.map((suggestion, i) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSuggestionSelect(suggestion)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-left",
                "hover:bg-slate-50 active:bg-slate-100 transition-colors",
                i < suggestions.length - 1 && "border-b border-slate-50"
              )}
            >
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="block text-sm font-medium text-slate-800 truncate">
                  {suggestion.text}
                </span>
                <span className="block text-xs text-slate-500 truncate">
                  {suggestion.place_name}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-full left-0 mt-1.5 bg-white text-xs text-red-500 rounded-xl px-3 py-2 shadow-lg ring-1 ring-black/5">
          {error}
        </div>
      )}
    </div>
  );
}

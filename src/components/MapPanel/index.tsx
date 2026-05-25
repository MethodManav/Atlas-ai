"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAtlasStore } from "@/lib/store";
import { getReviewScore, type Hotel } from "@/lib/hotels";
import { MapSearchBar } from "@/components/MapSearchBar";

// Set Mapbox token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

function createPinEl(hotel: Hotel, isSelected: boolean): HTMLElement {
  const el = document.createElement("div");
  el.className = "hotel-pin";
  el.style.cssText = `
    background: ${isSelected ? "#2563eb" : "#ffffff"};
    color: ${isSelected ? "#ffffff" : "#2563eb"};
    border: 2px solid #2563eb;
    border-radius: 20px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 700;
    font-family: system-ui, sans-serif;
    cursor: pointer;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0,0,0,0.18);
    transition: all 0.2s;
    transform: ${isSelected ? "scale(1.15)" : "scale(1)"};
    z-index: ${isSelected ? "10" : "1"};
    position: relative;
  `;
  el.textContent = `$${hotel.price}`;
  return el;
}

export function MapPanel() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const locationPinRef = useRef<mapboxgl.Marker | null>(null);

  const { hotels, selectedHotelId, mapState, setSelectedHotelId, setBookingHotel, searchContext, searchedLocation } =
    useAtlasStore();

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    if (!MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: mapState.center,
      zoom: mapState.zoom,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new mapboxgl.FullscreenControl(), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to location when map state changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: mapState.center,
      zoom: mapState.zoom,
      duration: 1200,
      essential: true,
    });
  }, [mapState]);

  // Drop / remove the location pin when searchedLocation changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove previous pin
    locationPinRef.current?.remove();
    locationPinRef.current = null;

    if (!searchedLocation) return;

    // Build a custom teardrop pin element
    const el = document.createElement("div");
    el.style.cssText = `
      width: 28px;
      height: 28px;
      cursor: default;
    `;
    el.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="28" height="28">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5" fill="white"/>
      </svg>
    `;

    locationPinRef.current = new mapboxgl.Marker({ element: el, anchor: "bottom" })
      .setLngLat(searchedLocation.center)
      .setPopup(
        new mapboxgl.Popup({ offset: 28, closeButton: false, className: "atlas-popup" }).setHTML(
          `<div style="font-family:system-ui,sans-serif;padding:4px 2px;font-size:12px;font-weight:600;color:#1e293b">
            📍 ${searchedLocation.name}
          </div>`
        )
      )
      .addTo(mapRef.current);

    // Show the popup immediately
    locationPinRef.current.getPopup()?.addTo(mapRef.current);
  }, [searchedLocation]);

  // Render hotel markers
  const renderMarkers = useCallback(() => {
    if (!mapRef.current) return;

    // Remove old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    hotels.forEach((hotel) => {
      if (!hotel.lat || !hotel.lng) return;

      const isSelected = selectedHotelId === hotel.id;
      const reviewScore = getReviewScore(hotel);
      const ratingLine =
        reviewScore != null
          ? `⭐ ${reviewScore.toFixed(1)} guest rating`
          : "";
      const el = createPinEl(hotel, isSelected);

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([hotel.lng, hotel.lat])
        .addTo(mapRef.current!);

      // Hover popup
      el.addEventListener("mouseenter", () => {
        popupRef.current?.remove();
        popupRef.current = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          className: "atlas-popup",
        })
          .setLngLat([hotel.lng, hotel.lat])
          .setHTML(
            `<div style="font-family:system-ui,sans-serif;padding:6px 2px;min-width:160px">
              <div style="font-weight:700;font-size:13px;margin-bottom:2px">${hotel.name}</div>
              <div style="font-size:11px;color:#6b7280">${ratingLine}</div>
              <div style="font-size:12px;font-weight:600;color:#2563eb;margin-top:4px">$${hotel.price}/night</div>
            </div>`
          )
          .addTo(mapRef.current!);
        setSelectedHotelId(hotel.id);
      });

      el.addEventListener("mouseleave", () => {
        setTimeout(() => {
          if (selectedHotelId !== hotel.id) {
            popupRef.current?.remove();
            setSelectedHotelId(null);
          }
        }, 200);
      });

      el.addEventListener("click", () => {
        setBookingHotel(hotel);
      });

      markersRef.current.set(hotel.id, marker);
    });
  }, [hotels, selectedHotelId, setSelectedHotelId, setBookingHotel]);

  useEffect(() => {
    renderMarkers();
  }, [renderMarkers]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100 flex flex-col items-center justify-center gap-4 p-8 text-center">
        {/* Search bar overlay — works even without a Mapbox token */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-32px)] max-w-[420px]">
          <MapSearchBar />
        </div>
        <div className="text-6xl">🗺️</div>
        <div>
          <h2 className="text-xl font-bold text-slate-700">Map Preview</h2>
          <p className="text-sm text-slate-500 mt-1">
            Add your <code className="bg-slate-200 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> to{" "}
            <code className="bg-slate-200 px-1 rounded">.env.local</code> to enable the live map.
          </p>
        </div>
        {hotels.length > 0 && (
          <div className="w-full max-w-xs">
            <p className="text-sm font-medium text-slate-600 mb-2">
              Found {hotels.length} hotels — map will show pins here:
            </p>
            <div className="space-y-1">
              {hotels.map((h) => (
                <div
                  key={h.id}
                  className="flex justify-between items-center text-xs bg-white rounded px-3 py-2 border cursor-pointer hover:border-blue-400"
                  onClick={() => setBookingHotel(h)}
                >
                  <span className="font-medium truncate">{h.name}</span>
                  <span className="text-blue-600 font-bold ml-2">${h.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {hotels.length === 0 && (
          <p className="text-sm text-slate-400">
            Hotel pins will appear here after you search in the chat →
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating search bar — centered at top, above map canvas */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-160px)] max-w-[420px]">
        <MapSearchBar />
      </div>

      {/* Search context overlay */}
      {searchContext.city && (
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-lg px-3 py-2 shadow text-xs font-medium text-slate-700">
          📍 {searchContext.city}
          {searchContext.checkIn && ` · ${searchContext.checkIn}`}
          {searchContext.checkOut && ` → ${searchContext.checkOut}`}
        </div>
      )}

      {/* Hotel count badge */}
      {hotels.length > 0 && (
        <div className="absolute bottom-8 left-3 bg-blue-600 text-white text-xs font-bold rounded-full px-3 py-1 shadow">
          {hotels.length} hotel{hotels.length !== 1 ? "s" : ""} shown
        </div>
      )}
    </div>
  );
}

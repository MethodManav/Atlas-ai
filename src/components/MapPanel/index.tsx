"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAtlasStore } from "@/lib/store";
import { getReviewScore, type Hotel } from "@/lib/hotels";
import { MapSearchBar } from "@/components/MapSearchBar";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

function createPinEl(hotel: Hotel, isSelected: boolean): HTMLElement {
  const el = document.createElement("div");
  el.className = "hotel-pin";

  const bg = isSelected
    ? "linear-gradient(135deg,#2563eb,#4f46e5)"
    : "#ffffff";
  const color = isSelected ? "#ffffff" : "#2563eb";
  const border = isSelected ? "#4f46e5" : "#2563eb";
  const shadow = isSelected
    ? "0 4px 18px rgba(37,99,235,0.50)"
    : "0 2px 10px rgba(0,0,0,0.16)";
  const scale = isSelected ? "1.18" : "1";

  el.style.cssText = `
    background: ${bg};
    color: ${color};
    border: 2px solid ${border};
    border-radius: 22px;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 700;
    font-family: system-ui, -apple-system, sans-serif;
    cursor: pointer;
    white-space: nowrap;
    box-shadow: ${shadow};
    transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s ease;
    transform: scale(${scale});
    z-index: ${isSelected ? "10" : "1"};
    position: relative;
    letter-spacing: -0.01em;
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

  const {
    hotels,
    selectedHotelId,
    mapState,
    setSelectedHotelId,
    setBookingHotel,
    searchContext,
    searchedLocation,
  } = useAtlasStore();

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

    map.on("load", () => {
      map.resize();
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

  // Fly to new location
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: mapState.center,
      zoom: mapState.zoom,
      duration: 1400,
      essential: true,
    });
  }, [mapState]);

  // Drop / remove location pin
  useEffect(() => {
    if (!mapRef.current) return;

    locationPinRef.current?.remove();
    locationPinRef.current = null;

    if (!searchedLocation) return;

    const el = document.createElement("div");
    el.style.cssText = `width:32px;height:32px;cursor:default;filter:drop-shadow(0 4px 8px rgba(37,99,235,0.45));`;
    el.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
        <defs>
          <linearGradient id="pinGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#2563eb"/>
            <stop offset="100%" stop-color="#4f46e5"/>
          </linearGradient>
        </defs>
        <path fill="url(%23pinGrad)" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.8" fill="white" opacity="0.95"/>
      </svg>
    `;

    locationPinRef.current = new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat(searchedLocation.center)
      .setPopup(
        new mapboxgl.Popup({
          offset: 32,
          closeButton: false,
          className: "atlas-popup",
        }).setHTML(
          `<div style="font-family:system-ui,sans-serif;font-size:13px;font-weight:600;color:#1e293b;">
            📍 ${searchedLocation.name}
          </div>`,
        ),
      )
      .addTo(mapRef.current);

    locationPinRef.current.getPopup()?.addTo(mapRef.current);
  }, [searchedLocation]);

  // Render hotel markers
  const renderMarkers = useCallback(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    hotels.forEach((hotel) => {
      if (!hotel.lat || !hotel.lng) return;

      const isSelected = selectedHotelId === hotel.id;
      const reviewScore = getReviewScore(hotel);
      const ratingLine =
        reviewScore != null ? `⭐ ${reviewScore.toFixed(1)}` : "";
      const el = createPinEl(hotel, isSelected);

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([hotel.lng, hotel.lat])
        .addTo(mapRef.current!);

      el.addEventListener("mouseenter", () => {
        popupRef.current?.remove();
        popupRef.current = new mapboxgl.Popup({
          offset: 28,
          closeButton: false,
          className: "atlas-popup",
        })
          .setLngLat([hotel.lng, hotel.lat])
          .setHTML(
            `<div style="font-family:system-ui,sans-serif;min-width:170px;">
              <div style="font-weight:700;font-size:13px;color:#0f172a;line-height:1.3;margin-bottom:4px">${hotel.name}</div>
              ${ratingLine ? `<div style="font-size:11px;color:#64748b;margin-bottom:3px">${ratingLine} guest rating</div>` : ""}
              <div style="font-size:13px;font-weight:700;color:#2563eb;">$${hotel.price}<span style="font-weight:500;font-size:11px;color:#94a3b8">/night</span></div>
            </div>`,
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

  /* ── Fallback: no Mapbox token ─────────────────────────────────────── */
  if (!MAPBOX_TOKEN) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 flex flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-32px)] max-w-[420px]">
          <MapSearchBar />
        </div>
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-4xl">
          🗺️
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-700">Map Preview</h2>
          <p className="text-sm text-slate-500 mt-1.5">
            Add your{" "}
            <code className="bg-slate-200 px-1.5 py-0.5 rounded-md text-xs">
              NEXT_PUBLIC_MAPBOX_TOKEN
            </code>{" "}
            to{" "}
            <code className="bg-slate-200 px-1.5 py-0.5 rounded-md text-xs">
              .env.local
            </code>{" "}
            to enable the live map.
          </p>
        </div>
        {hotels.length > 0 && (
          <div className="w-full max-w-xs space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              Found {hotels.length} hotels:
            </p>
            {hotels.map((h) => (
              <div
                key={h.id}
                className="flex justify-between items-center text-xs atlas-glass rounded-xl px-3.5 py-2.5 cursor-pointer hover:border-blue-300 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md"
                onClick={() => setBookingHotel(h)}
              >
                <span className="font-semibold truncate text-slate-700">
                  {h.name}
                </span>
                <span className="text-blue-600 font-bold ml-2">${h.price}</span>
              </div>
            ))}
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

  /* ── Live map ─────────────────────────────────────────────────────── */
  return (
    <div className="absolute inset-0">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating search bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-160px)] max-w-[440px]">
        <MapSearchBar />
      </div>

      {/* Search context chip — bottom-left */}
      {searchContext.city && (
        <div className="absolute bottom-6 left-3 z-10 animate-atlas-fade-in">
          <div className="atlas-glass rounded-2xl px-3.5 py-2 shadow-xl shadow-slate-900/10 text-xs font-semibold text-slate-700 flex items-center gap-2">
            <span className="text-base">📍</span>
            <span>
              {searchContext.city}
              {searchContext.checkIn && (
                <span className="text-slate-400 font-normal">
                  {" "}· {searchContext.checkIn}
                </span>
              )}
              {searchContext.checkOut && (
                <span className="text-slate-400 font-normal">
                  {" → "}{searchContext.checkOut}
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Hotel count badge */}
      {hotels.length > 0 && (
        <div className="absolute bottom-6 right-3 z-10 animate-atlas-badge-pop">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-2xl px-4 py-2 shadow-xl shadow-blue-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
            {hotels.length} hotel{hotels.length !== 1 ? "s" : ""} on map
          </div>
        </div>
      )}
    </div>
  );
}

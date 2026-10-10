"use client";

import { useState } from "react";
import {
  Building2,
  Search,
  Zap,
  Sparkles,
  MapPin,
  Star,
  DollarSign,
  Percent,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  Plus,
  Inbox,
} from "lucide-react";
import type { AdminHotel } from "@/lib/admin-data";
import { HotelEditModal } from "./HotelEditModal";
import Image from "next/image";

interface HotelsTabProps {
  hotels: AdminHotel[];
  onUpdateHotel: (id: string, updates: Partial<AdminHotel>) => Promise<void>;
  onRefresh?: () => void;
}

export function HotelsTab({ hotels, onUpdateHotel, onRefresh }: HotelsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingHotel, setEditingHotel] = useState<AdminHotel | null>(null);

  // Live LiteAPI Test tool state
  const [testCity, setTestCity] = useState("Paris");
  const [isTesting, setIsTesting] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    durationMs: number;
    totalFound?: number;
    sampleHotels?: any[];
    error?: string;
  } | null>(null);

  const filteredHotels = hotels.filter((h) => {
    if (statusFilter !== "ALL" && h.status !== statusFilter) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      h.country.toLowerCase().includes(q)
    );
  });

  async function handleTestLiteApi(e: React.FormEvent) {
    e.preventDefault();
    if (!testCity.trim()) return;
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test-liteapi",
          city: testCity.trim(),
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({
        success: false,
        durationMs: 0,
        error: msg,
      });
    } finally {
      setIsTesting(false);
    }
  }

  async function handleImportHotel(sample: any) {
    setImportingId(sample.id);
    try {
      const res = await fetch("/api/admin/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sample.name,
          city: sample.city || testCity,
          country: sample.country || "Global",
          address: sample.address || `${sample.city || testCity} City Center`,
          rating: sample.rating || 5,
          reviewScore: sample.reviewScore || 9.0,
          reviewCount: sample.reviewCount || 100,
          price: sample.price || 250,
          currency: sample.currency || "USD",
          imageUrl: sample.imageUrl,
          status: "ACTIVE",
          commissionRate: 0.12,
          lat: sample.lat || 0,
          lng: sample.lng || 0,
          amenities: sample.amenities || ["WiFi", "Room Service"],
        }),
      });
      if (res.ok) {
        if (onRefresh) onRefresh();
      }
    } finally {
      setImportingId(null);
    }
  }

  return (
    <div className="space-y-8 animate-atlas-fade-in pb-12">
      {/* ── Live LiteAPI Diagnostic Console ───────────────────────── */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/40 via-zinc-900/80 to-slate-950 border border-violet-500/20 shadow-xl backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Zap className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                LiteAPI Live Inventory Diagnostic
                <span className="text-[10px] font-mono bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/30">
                  SANDBOX
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Directly ping the LiteAPI inventory provider for live room availability and latency benchmarks
              </p>
            </div>
          </div>

          <form onSubmit={handleTestLiteApi} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter city (e.g. Tokyo, Paris, Dubai)..."
              value={testCity}
              onChange={(e) => setTestCity(e.target.value)}
              className="bg-zinc-950/90 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 w-48 sm:w-60"
            />
            <button
              type="submit"
              disabled={isTesting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-900/40 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Probing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Probe API</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Diagnostic Results Banner */}
        {testResult && (
          <div className="mt-3 space-y-3 animate-atlas-slide-up">
            <div
              className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                testResult.success
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                  : "bg-rose-950/30 border-rose-500/30 text-rose-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                )}
                <span>
                  {testResult.success ? (
                    <>
                      LiteAPI responded in <strong>{testResult.durationMs}ms</strong>. Retrieved{" "}
                      <strong>{testResult.totalFound} properties</strong> with live sandbox offers in{" "}
                      <strong>{testCity}</strong>.
                    </>
                  ) : (
                    <>
                      LiteAPI probe check failed ({testResult.durationMs}ms): {testResult.error}
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* If sample hotels returned from LiteAPI, show quick import buttons */}
            {testResult.sampleHotels && testResult.sampleHotels.length > 0 && (
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Discovered Live Properties in {testCity} (Click to add to catalog):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {testResult.sampleHotels.map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{s.name}</p>
                        <p className="text-[11px] text-zinc-400 font-mono">${s.price}/night</p>
                      </div>
                      <button
                        onClick={() => handleImportHotel(s)}
                        disabled={importingId === s.id}
                        className="px-2 py-1 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold flex items-center gap-1 flex-shrink-0 disabled:opacity-50"
                      >
                        {importingId === s.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                        <span>Add</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Catalog Filter Bar ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/70 border border-white/8 backdrop-blur-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search hotel catalog by name, city, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
          >
            <option value="ALL">All Listings ({hotels.length})</option>
            <option value="ACTIVE">Active Only</option>
            <option value="FEATURED">Featured Properties</option>
            <option value="MAINTENANCE">Maintenance / Paused</option>
          </select>
        </div>
      </div>

      {/* ── Hotel Cards Grid or Empty State ───────────────────────── */}
      {filteredHotels.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-900/30 flex flex-col items-center justify-center gap-3">
          <Inbox className="w-8 h-8 text-zinc-600" />
          <div>
            <h3 className="text-sm font-bold text-white">No hotels in catalog yet</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              Hotels are automatically added whenever users make reservations, or you can probe destinations above using the LiteAPI diagnostic tool to discover and add properties.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredHotels.map((h) => (
            <div
              key={h.id}
              className="rounded-2xl bg-zinc-900/80 border border-white/8 shadow-xl overflow-hidden flex flex-col group hover:border-violet-500/40 transition-all hover:shadow-2xl hover:shadow-violet-950/30"
            >
              {/* Image Header with Badge */}
              <div className="h-44 relative bg-zinc-800 overflow-hidden">
                <Image
                  src={h.imageUrl}
                  alt={h.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-md ${
                      h.status === "FEATURED"
                        ? "bg-amber-500/90 text-white"
                        : h.status === "ACTIVE"
                        ? "bg-emerald-600/90 text-white"
                        : "bg-zinc-800/90 text-zinc-300"
                    }`}
                  >
                    {h.status}
                  </span>
                </div>

                {/* Review Score */}
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md rounded-xl px-2 py-1 text-[11px] font-bold text-white flex items-center gap-1 border border-white/10">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{h.reviewScore}</span>
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-3 left-3 text-white">
                  <span className="text-xl font-black">${h.price}</span>
                  <span className="text-xs text-zinc-300"> / night</span>
                </div>
              </div>

              {/* Hotel Details Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-violet-300 transition-colors">
                    {h.name}
                  </h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1 truncate">
                    <MapPin className="w-3 h-3 text-violet-400 flex-shrink-0" />
                    <span>{h.city}, {h.country}</span>
                  </p>
                </div>

                {/* Meta stats */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                  <span>Commission Margin:</span>
                  <span className="font-mono font-bold text-violet-300">
                    {Math.round(h.commissionRate * 100)}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Bookings Generated:</span>
                  <span className="font-mono font-bold text-white">
                    {h.totalBookings} stays
                  </span>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setEditingHotel(h)}
                  className="w-full mt-2 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Edit Listing & Margin</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingHotel && (
        <HotelEditModal
          hotel={editingHotel}
          onClose={() => setEditingHotel(null)}
          onSave={onUpdateHotel}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { X, Building2, DollarSign, Percent, ShieldCheck, Check } from "lucide-react";
import type { AdminHotel } from "@/lib/admin-data";
import Image from "next/image";

interface HotelEditModalProps {
  hotel: AdminHotel | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<AdminHotel>) => Promise<void>;
}

export function HotelEditModal({
  hotel,
  onClose,
  onSave,
}: HotelEditModalProps) {
  const [status, setStatus] = useState<AdminHotel["status"]>(
    hotel?.status || "ACTIVE"
  );
  const [price, setPrice] = useState(hotel?.price || 250);
  const [commissionPercent, setCommissionPercent] = useState(
    Math.round((hotel?.commissionRate || 0.12) * 100)
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!hotel) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hotel) return;
    setIsSaving(true);
    try {
      await onSave(hotel.id, {
        status,
        price: Number(price),
        commissionRate: Number(commissionPercent) / 100,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-atlas-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/8 bg-gradient-to-r from-violet-950/40 via-zinc-900/40 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Modify Hotel Listing
              </h2>
              <p className="text-xs text-zinc-400 truncate max-w-[260px]">
                {hotel.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Hotel preview */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/70 border border-white/5">
            <div className="w-14 h-14 rounded-xl overflow-hidden relative flex-shrink-0 bg-zinc-800">
              <Image
                src={hotel.imageUrl}
                alt={hotel.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{hotel.name}</h4>
              <p className="text-[11px] text-zinc-400">{hotel.city}, {hotel.country}</p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-amber-400 font-bold">
                <span>{hotel.reviewScore}/10 Guest Rating</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-400 font-normal">{hotel.reviewCount} reviews</span>
              </div>
            </div>
          </div>

          {/* Status radio selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Listing Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["ACTIVE", "FEATURED", "MAINTENANCE"] as const).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    status === st
                      ? st === "FEATURED"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                        : st === "ACTIVE"
                        ? "bg-emerald-600 text-white shadow-lg"
                        : "bg-zinc-700 text-white shadow-lg"
                      : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/5"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Price & Commission Margin */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Base Nightly Rate ($)
              </label>
              <input
                type="number"
                min="20"
                max="5000"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-violet-400" />
                Commission Cut (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-white/10 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-900/40 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

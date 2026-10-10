"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Award,
  DollarSign,
  Mail,
  Phone,
  Calendar,
  Sliders,
  MapPin,
  ExternalLink,
} from "lucide-react";
import type { AdminGuest } from "@/lib/admin-data";
import { GuestDetailModal } from "./GuestDetailModal";

interface GuestsTabProps {
  guests: AdminGuest[];
  onUpdateGuest: (id: string, updates: Partial<AdminGuest>) => Promise<void>;
}

export function GuestsTab({ guests, onUpdateGuest }: GuestsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [selectedGuest, setSelectedGuest] = useState<AdminGuest | null>(null);

  const filteredGuests = guests.filter((g) => {
    if (tierFilter !== "ALL" && g.tier !== tierFilter) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      g.firstName.toLowerCase().includes(q) ||
      g.lastName.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      g.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-atlas-fade-in pb-12">
      {/* ── Control Bar ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/70 border border-white/8 backdrop-blur-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search guests by name, email, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-zinc-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
          >
            <option value="ALL">All Loyalty Tiers ({guests.length})</option>
            <option value="PLATINUM">Platinum Tier</option>
            <option value="GOLD">Gold Tier</option>
            <option value="SILVER">Silver Tier</option>
            <option value="BRONZE">Bronze Tier</option>
          </select>
        </div>
      </div>

      {/* ── Guest Directory Grid or Empty State ─────────────────── */}
      {filteredGuests.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-900/30 flex flex-col items-center justify-center gap-3">
          <Users className="w-8 h-8 text-zinc-600" />
          <div>
            <h3 className="text-sm font-bold text-white">No guest profiles yet</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              Guest profiles and loyalty records are automatically established as customers place reservations through the concierge app or when direct reservations are recorded.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuests.map((g) => (
          <div
            key={g.id}
            onClick={() => setSelectedGuest(g)}
            className="rounded-2xl bg-zinc-900/80 border border-white/8 p-5 shadow-xl hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-950/30 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              {/* Header row: Avatar + Name + Tier */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white/10 ${
                      g.tier === "PLATINUM"
                        ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
                        : g.tier === "GOLD"
                        ? "bg-gradient-to-br from-amber-400 to-yellow-600 text-black"
                        : g.tier === "SILVER"
                        ? "bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900"
                        : "bg-gradient-to-br from-amber-700 to-amber-900 text-white"
                    }`}
                  >
                    {g.firstName[0]}
                    {g.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-violet-400 transition-colors">
                      {g.firstName} {g.lastName}
                    </h3>
                    <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-zinc-500" />
                      <span>{g.city}</span>
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    g.tier === "PLATINUM"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      : g.tier === "GOLD"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : g.tier === "SILVER"
                      ? "bg-slate-400/20 text-slate-300 border border-slate-400/40"
                      : "bg-amber-800/20 text-amber-400 border border-amber-700/40"
                  }`}
                >
                  {g.tier}
                </span>
              </div>

              {/* Contact info */}
              <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs text-zinc-400">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                  <span className="truncate">{g.email}</span>
                </div>
                {g.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    <span>{g.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Metrics footer */}
            <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                  Completed Stays
                </span>
                <span className="font-bold text-white font-mono">
                  {g.totalStays} Stays
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                  Total Spend
                </span>
                <span className="font-bold text-emerald-400 font-mono">
                  ${g.totalSpent.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedGuest && (
        <GuestDetailModal
          guest={selectedGuest}
          onClose={() => setSelectedGuest(null)}
          onSave={onUpdateGuest}
        />
      )}
    </div>
  );
}

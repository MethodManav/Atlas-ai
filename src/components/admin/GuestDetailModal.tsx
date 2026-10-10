"use client";

import { useState } from "react";
import { X, User, Mail, Phone, Award, DollarSign, Calendar, Check } from "lucide-react";
import type { AdminGuest } from "@/lib/admin-data";

interface GuestDetailModalProps {
  guest: AdminGuest | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<AdminGuest>) => Promise<void>;
}

export function GuestDetailModal({
  guest,
  onClose,
  onSave,
}: GuestDetailModalProps) {
  const [tier, setTier] = useState<AdminGuest["tier"]>(guest?.tier || "BRONZE");
  const [notes, setNotes] = useState(guest?.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  if (!guest) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guest) return;
    setIsSaving(true);
    try {
      await onSave(guest.id, { tier, notes });
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
            <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 font-bold text-sm">
              {guest.firstName[0]}
              {guest.lastName[0]}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {guest.firstName} {guest.lastName}
              </h2>
              <p className="text-xs text-zinc-400">
                Customer Profile · Member since {guest.joinedDate}
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
          {/* Spend stats strip */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-900/70 border border-white/5">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                Lifetime Spend
              </span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                ${guest.totalSpent.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                Total Stays Completed
              </span>
              <span className="text-lg font-black text-white font-mono">
                {guest.totalStays} Stays
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <Mail className="w-3.5 h-3.5 text-zinc-500" />
              <span>{guest.email}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <Phone className="w-3.5 h-3.5 text-zinc-500" />
              <span>{guest.phone || "No phone on record"}</span>
            </div>
          </div>

          {/* Loyalty Tier selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Loyalty VIP Tier
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["PLATINUM", "GOLD", "SILVER", "BRONZE"] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTier(t)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                    tier === t
                      ? t === "PLATINUM"
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                        : t === "GOLD"
                        ? "bg-amber-500 text-black shadow-lg"
                        : t === "SILVER"
                        ? "bg-slate-300 text-slate-900 shadow-lg"
                        : "bg-amber-800 text-white shadow-lg"
                      : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/5"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Concierge Preferences & Internal Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. VIP client, preferred high floor suites, allergic to feathers..."
              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Footer buttons */}
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
              <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

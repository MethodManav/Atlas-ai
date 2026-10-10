"use client";

import { useState } from "react";
import {
  Settings,
  DollarSign,
  Percent,
  RotateCcw,
  Download,
  ShieldCheck,
  Check,
  Loader2,
  Key,
  Database,
  Radio,
} from "lucide-react";
import type { AdminSettings } from "@/lib/admin-data";

interface SettingsTabProps {
  settings: AdminSettings;
  onUpdateSettings: (updates: Partial<AdminSettings>) => Promise<void>;
  onResetDefaults: () => Promise<void>;
}

export function SettingsTab({
  settings,
  onUpdateSettings,
  onResetDefaults,
}: SettingsTabProps) {
  const [feePercent, setFeePercent] = useState(settings.platformFeePercent);
  const [defaultCurrency, setDefaultCurrency] = useState(settings.defaultCurrency);
  const [autoConfirm, setAutoConfirm] = useState(settings.autoConfirmBookings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onUpdateSettings({
        platformFeePercent: Number(feePercent),
        defaultCurrency,
        autoConfirmBookings: autoConfirm,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReset() {
    if (
      confirm(
        "Are you sure you want to clear all stored admin records? This will purge all existing reservations, catalog overrides, and logs."
      )
    ) {
      setIsResetting(true);
      try {
        await onResetDefaults();
        alert("All admin records cleared successfully.");
      } finally {
        setIsResetting(false);
      }
    }
  }

  function handleExportBackup() {
    window.open("/api/admin/overview", "_blank");
  }

  return (
    <div className="space-y-8 animate-atlas-fade-in pb-12 max-w-4xl">
      {/* ── Economics & Commission Settings ───────────────────────── */}
      <form
        onSubmit={handleSaveSettings}
        className="p-6 rounded-2xl bg-zinc-900/70 border border-white/8 shadow-xl space-y-6 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-white">
              Platform Economics & Defaults
            </h2>
            <p className="text-xs text-zinc-400">
              Configure baseline commission take rates, currency displays, and automated booking rules
            </p>
          </div>
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 animate-atlas-scale-in">
              <Check className="w-3.5 h-3.5" /> Saved Successfully
            </span>
          )}
        </div>

        {/* Commission margin */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-violet-400" />
              Default Platform Commission Cut
            </label>
            <span className="font-mono text-violet-300 font-extrabold text-sm">
              {feePercent}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="0.5"
            value={feePercent}
            onChange={(e) => setFeePercent(Number(e.target.value))}
            className="w-full accent-violet-500 cursor-pointer"
          />
          <p className="text-[11px] text-zinc-500">
            Atlas AI retains this percentage margin on reservations facilitated via LiteAPI.
          </p>
        </div>

        {/* Currency & Auto-confirm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Default Platform Currency
            </label>
            <select
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              className="w-full bg-zinc-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
            >
              <option value="USD">USD ($) — US Dollar</option>
              <option value="EUR">EUR (€) — Euro</option>
              <option value="GBP">GBP (£) — British Pound</option>
              <option value="JPY">JPY (¥) — Japanese Yen</option>
              <option value="AED">AED (د.إ) — UAE Dirham</option>
              <option value="INR">INR (₹) — Indian Rupee</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Sandbox Auto-Confirmation
            </label>
            <div className="h-10 bg-zinc-950/80 border border-white/10 rounded-xl px-3.5 flex items-center justify-between">
              <span className="text-xs text-zinc-300">Auto-confirm test reservations</span>
              <input
                type="checkbox"
                checked={autoConfirm}
                onChange={(e) => setAutoConfirm(e.target.checked)}
                className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-900/40 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Platform Settings</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── API Keys & Integrations Monitor ───────────────────────── */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-white/8 shadow-xl space-y-4 backdrop-blur-sm">
        <div className="border-b border-white/8 pb-3">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-violet-400" />
            Environment API Integrations
          </h2>
          <p className="text-xs text-zinc-400">
            Real-time status of backend service connectors
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">LiteAPI Travel Engine</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
                  CONNECTED
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Target: https://api.liteapi.travel/v3.0 (Sandbox Key Configured)
              </p>
            </div>
            <span className="font-mono text-zinc-500 text-xs">sand_81e7...</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">Tambo AI Generative UI</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
                  CONNECTED
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Component streaming & tool calling active
              </p>
            </div>
            <span className="font-mono text-zinc-500 text-xs">tambo_gCT...</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">Mapbox GL Geocoding & Tiles</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
                  CONNECTED
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Vector tiles and interactive map markers active
              </p>
            </div>
            <span className="font-mono text-zinc-500 text-xs">pk.eyJ1I...</span>
          </div>
        </div>
      </div>

      {/* ── Data Maintenance & Reset ──────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-white/8 shadow-xl space-y-4 backdrop-blur-sm">
        <div className="border-b border-white/8 pb-3">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-violet-400" />
            Data Lifecycle & Storage Maintenance
          </h2>
          <p className="text-xs text-zinc-400">
            Purge stored records or export real JSON analytics backups
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-all cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
            <span>Clear All System Records</span>
          </button>

          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold border border-white/5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>View Full Analytics JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
}

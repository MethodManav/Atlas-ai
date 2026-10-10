"use client";

import {
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  SlidersHorizontal,
  Bell,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { type AdminTab } from "./AdminSidebar";

interface AdminHeaderProps {
  activeTab: AdminTab;
  onNewBookingClick: () => void;
  onRefreshClick: () => void;
  isRefreshing?: boolean;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}

const TAB_TITLES: Record<AdminTab, { title: string; subtitle: string }> = {
  overview: {
    title: "Executive Dashboard",
    subtitle: "Real-time reservation metrics, gross revenue, and AI concierge activity",
  },
  bookings: {
    title: "Reservations Management",
    subtitle: "Manage, filter, and modify live guest bookings and room confirmations",
  },
  hotels: {
    title: "Hotels & Inventory Catalog",
    subtitle: "Connected LiteAPI properties, custom rate markups, and live availability tests",
  },
  guests: {
    title: "Guest CRM & Loyalty",
    subtitle: "Customer profiles, repeat stay history, VIP tier status, and lifetime spend",
  },
  "ai-analytics": {
    title: "AI Concierge & Telemetry",
    subtitle: "Tambo AI intent mapping, tool invocations, latency monitors, and search logs",
  },
  settings: {
    title: "Platform Configuration",
    subtitle: "Manage commission margins, currency defaults, and LiteAPI integration options",
  },
};

export function AdminHeader({
  activeTab,
  onNewBookingClick,
  onRefreshClick,
  isRefreshing = false,
  searchTerm,
  onSearchChange,
}: AdminHeaderProps) {
  const current = TAB_TITLES[activeTab];

  return (
    <header className="h-20 px-8 border-b border-white/8 bg-slate-950/70 backdrop-blur-xl flex items-center justify-between flex-shrink-0 z-10 select-none">
      {/* ── Left: Title & Subtitle ──────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            {current.title}
          </h1>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-0.5 max-w-xl truncate">
          {current.subtitle}
        </p>
      </div>

      {/* ── Right: Search + Action Buttons + Admin Pill ─────────── */}
      <div className="flex items-center gap-3">
        {onSearchChange && (
          <div className="relative w-64 hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Quick search..."
              value={searchTerm || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-zinc-900/80 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        )}

        {/* Refresh button */}
        <button
          onClick={onRefreshClick}
          disabled={isRefreshing}
          title="Refresh Data"
          className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin text-violet-400" : ""}`}
          />
        </button>

        {/* Create Booking Button */}
        <button
          onClick={onNewBookingClick}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-900/40 hover:shadow-violet-700/50 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </button>

        {/* Return to Map Concierge App */}
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900/90 border border-white/10 hover:border-violet-500/50 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-all"
        >
          <span>Concierge App</span>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
        </Link>

        {/* Admin profile badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-xs font-bold text-white shadow-md ring-2 ring-white/10">
              AD
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 absolute -bottom-0.5 -right-0.5" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-white leading-tight">Admin Console</p>
            <p className="text-[10px] text-zinc-400 font-mono">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

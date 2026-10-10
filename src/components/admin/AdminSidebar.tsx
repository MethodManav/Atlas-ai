"use client";

import {
  LayoutDashboard,
  CalendarCheck,
  Building2,
  Users,
  Cpu,
  Settings,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type AdminTab =
  | "overview"
  | "bookings"
  | "hotels"
  | "guests"
  | "ai-analytics"
  | "settings";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  bookingCount?: number;
  hotelCount?: number;
  guestCount?: number;
}

export function AdminSidebar({
  activeTab,
  onTabChange,
  bookingCount = 0,
  hotelCount = 0,
  guestCount = 0,
}: AdminSidebarProps) {
  const navItems = [
    {
      id: "overview" as AdminTab,
      label: "Overview",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "bookings" as AdminTab,
      label: "Reservations",
      icon: CalendarCheck,
      badge: bookingCount > 0 ? bookingCount : null,
    },
    {
      id: "hotels" as AdminTab,
      label: "Hotels & Rates",
      icon: Building2,
      badge: hotelCount > 0 ? hotelCount : null,
    },
    {
      id: "guests" as AdminTab,
      label: "Guests & CRM",
      icon: Users,
      badge: guestCount > 0 ? guestCount : null,
    },
    {
      id: "ai-analytics" as AdminTab,
      label: "AI Concierge Logs",
      icon: Cpu,
      badge: "LIVE",
    },
    {
      id: "settings" as AdminTab,
      label: "Platform Settings",
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 h-full flex flex-col bg-slate-950/90 border-r border-white/8 backdrop-blur-xl flex-shrink-0 select-none relative z-20">
      {/* ── Brand Header ─────────────────────────────────────────── */}
      <div className="p-5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-violet-900/40">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-base tracking-tight">
                Atlas
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">
              Operations & Admin
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Navigation ──────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto atlas-scrollbar">
        <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative",
                isActive
                  ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-white border border-violet-500/30 shadow-lg shadow-violet-950/50"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-transparent"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-violet-500 shadow-[0_0_10px_#8b5cf6]" />
              )}
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-violet-400"
                      : "text-zinc-400 group-hover:text-zinc-200"
                  )}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== null && (
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors",
                    item.badge === "LIVE"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"
                      : isActive
                      ? "bg-violet-500/30 text-violet-200"
                      : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-200"
                  )}
                >
                  {item.badge === "LIVE" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          Concierge Portal
        </div>

        <Link
          href="/"
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent transition-all group"
        >
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Live Guest App</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
        </Link>
      </nav>

      {/* ── System Telemetry Widget ──────────────────────────────── */}
      <div className="p-3 border-t border-white/8 m-3 rounded-2xl bg-zinc-900/60 border border-white/5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            System Status
          </span>
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Operational
          </span>
        </div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-zinc-400">
            <span>LiteAPI Engine</span>
            <span className="text-zinc-200 font-mono text-[10px] bg-zinc-800/80 px-1.5 py-0.5 rounded">
              SANDBOX
            </span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span>Tambo Generative UI</span>
            <span className="text-emerald-400 font-mono text-[10px]">99.9%</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span>Mapbox GL Vector</span>
            <span className="text-emerald-400 font-mono text-[10px]">ACTIVE</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

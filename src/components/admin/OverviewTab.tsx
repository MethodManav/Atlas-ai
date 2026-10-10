"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  CalendarCheck,
  Building2,
  Users,
  Cpu,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  Inbox,
} from "lucide-react";
import type { AdminBooking, AdminAiQuery } from "@/lib/admin-data";
import { type AdminTab } from "./AdminSidebar";
import Image from "next/image";

interface OverviewTabProps {
  metrics: {
    grossRevenue: number;
    totalCommission: number;
    totalStays: number;
    averageDailyRate: number;
    conversionRate: number;
    activeHotelsCount: number;
    totalGuestsCount: number;
    revenueChartData: { month: string; revenue: number; bookings: number }[];
    topDestinations: { city: string; bookings: number; revenue: number; percentage: number }[];
    statusCounts: {
      CONFIRMED: number;
      CHECKED_IN: number;
      COMPLETED: number;
      PENDING: number;
      CANCELLED: number;
    };
    recentBookings: AdminBooking[];
    recentQueries: AdminAiQuery[];
    apiHealth: {
      liteApi: string;
      tamboAi: string;
      mapbox: string;
      sandboxMode: boolean;
    };
  };
  onNavigateTab: (tab: AdminTab) => void;
  onSelectBooking: (booking: AdminBooking) => void;
}

export function OverviewTab({
  metrics,
  onNavigateTab,
  onSelectBooking,
}: OverviewTabProps) {
  const [chartMode, setChartMode] = useState<"revenue" | "bookings">("revenue");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const chartData = metrics.revenueChartData || [];
  const maxValue = Math.max(
    ...chartData.map((d) => (chartMode === "revenue" ? d.revenue : d.bookings)),
    0
  );

  return (
    <div className="space-y-8 animate-atlas-fade-in pb-12">
      {/* ── Metric KPI Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Gross Revenue */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-white/8 p-5 shadow-xl group hover:border-violet-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl group-hover:bg-violet-600/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">
              Gross Platform Volume
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight">
              ${metrics.grossRevenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {metrics.totalStays > 0
                ? `${metrics.totalStays} booked stays processed`
                : "Awaiting incoming reservations"}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Net Commission Cut</span>
            <span className="text-violet-300 font-bold">
              ${metrics.totalCommission.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Metric 2: Total Bookings */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-white/8 p-5 shadow-xl group hover:border-indigo-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-600/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">
              Active Reservations
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight">
              {metrics.totalStays} <span className="text-sm font-medium text-zinc-400">stays</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {metrics.statusCounts.CONFIRMED} confirmed · {metrics.statusCounts.CHECKED_IN} checked in
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Pending Authorization</span>
            <span className="text-indigo-300 font-bold">
              {metrics.statusCounts.PENDING}
            </span>
          </div>
        </div>

        {/* Metric 3: Average Daily Rate (ADR) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-white/8 p-5 shadow-xl group hover:border-cyan-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl group-hover:bg-cyan-600/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">
              Average Daily Rate (ADR)
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight">
              ${metrics.averageDailyRate} <span className="text-sm font-medium text-zinc-400">/ night</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Calculated across all completed nights
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Properties in Catalog</span>
            <span className="text-cyan-300 font-bold">
              {metrics.activeHotelsCount} listed
            </span>
          </div>
        </div>

        {/* Metric 4: AI Concierge Conversion */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-white/8 p-5 shadow-xl group hover:border-pink-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/10 rounded-full blur-2xl group-hover:bg-pink-600/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">
              AI Chat-to-Booking
            </span>
            <div className="w-8 h-8 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight">
              {metrics.conversionRate}%
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Real conversational yield rate
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Guest CRM Profiles</span>
            <span className="text-pink-300 font-bold">
              {metrics.totalGuestsCount} guests
            </span>
          </div>
        </div>
      </div>

      {/* ── Revenue Chart & Top Destinations ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Revenue & Bookings Timeline */}
        <div className="lg:col-span-2 rounded-2xl bg-zinc-900/70 border border-white/8 p-6 shadow-xl relative backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-extrabold text-white">
                Platform Performance Trajectory
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Monthly trends for gross transaction volume and completed stays
              </p>
            </div>
            <div className="flex items-center bg-zinc-950/80 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setChartMode("revenue")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartMode === "revenue"
                    ? "bg-violet-600 text-white shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Gross Volume ($)
              </button>
              <button
                onClick={() => setChartMode("bookings")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartMode === "bookings"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Stays Count
              </button>
            </div>
          </div>

          {/* SVG Area Chart or Empty State */}
          {maxValue === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-xl">
              <Inbox className="w-8 h-8 text-zinc-600 mb-2" />
              <p className="text-sm font-semibold text-zinc-300">
                No reservation volume recorded yet
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                As guest reservations are completed through the AI concierge or created manually, monthly performance will chart here automatically.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full relative pt-4">
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 600 200"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>

                {[0, 50, 100, 150].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="600"
                    y2={y}
                    stroke="rgba(255,255,255,0.05)"
                    strokeDasharray="4 4"
                  />
                ))}

                {(() => {
                  const step = 600 / Math.max(1, chartData.length - 1);
                  const points = chartData.map((d, i) => {
                    const val = chartMode === "revenue" ? d.revenue : d.bookings;
                    const normalizedY = 175 - (val / (maxValue || 1)) * 140;
                    return { x: i * step, y: normalizedY, data: d };
                  });

                  const pathD = points
                    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                    .join(" ");

                  const areaD = `${pathD} L ${points[points.length - 1].x} 190 L 0 190 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#areaGradient)" />
                      <path
                        d={pathD}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {points.map((p, idx) => (
                        <g key={idx} className="cursor-pointer">
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={hoveredPoint === idx ? "7" : "4.5"}
                            className="fill-white stroke-violet-500 transition-all duration-150"
                            strokeWidth="3"
                            onMouseEnter={() => setHoveredPoint(idx)}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>

              <div className="flex justify-between items-center text-[11px] text-zinc-500 mt-2 font-mono">
                {chartData.map((d, idx) => (
                  <span
                    key={d.month}
                    className={hoveredPoint === idx ? "text-violet-400 font-bold" : ""}
                  >
                    {d.month}
                  </span>
                ))}
              </div>

              {hoveredPoint !== null && (
                <div
                  className="absolute -top-3 bg-zinc-950/95 border border-violet-500/50 rounded-xl px-3 py-1.5 shadow-2xl pointer-events-none transform -translate-x-1/2 transition-all"
                  style={{
                    left: `${(hoveredPoint / (chartData.length - 1)) * 95 + 2.5}%`,
                  }}
                >
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {chartData[hoveredPoint].month}
                  </div>
                  <div className="text-xs font-black text-white">
                    {chartMode === "revenue"
                      ? `$${chartData[hoveredPoint].revenue.toLocaleString()}`
                      : `${chartData[hoveredPoint].bookings} Stays`}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Top Destinations Breakdown */}
        <div className="rounded-2xl bg-zinc-900/70 border border-white/8 p-6 shadow-xl flex flex-col justify-between backdrop-blur-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-violet-400" />
                Top Destinations
              </h2>
              <span className="text-[10px] font-mono text-zinc-400">By Revenue</span>
            </div>

            {metrics.topDestinations.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                No destination reservations recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {metrics.topDestinations.slice(0, 5).map((dest) => (
                  <div key={dest.city} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-200">
                        {dest.city}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-[11px]">
                          {dest.bookings} stays
                        </span>
                        <span className="font-bold text-white">
                          ${dest.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, dest.percentage * 2.2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateTab("hotels")}
            className="w-full mt-6 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 border border-white/5 hover:border-violet-500/30 text-xs font-semibold text-zinc-200 hover:text-white flex items-center justify-center gap-2 transition-all"
          >
            <span>View All Destinations in Catalog</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Status Breakdown Bar ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Confirmed", count: metrics.statusCounts.CONFIRMED, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25" },
          { label: "Checked-In", count: metrics.statusCounts.CHECKED_IN, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/25" },
          { label: "Completed", count: metrics.statusCounts.COMPLETED, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/25" },
          { label: "Pending", count: metrics.statusCounts.PENDING, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/25" },
          { label: "Cancelled", count: metrics.statusCounts.CANCELLED, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/25" },
        ].map((s) => (
          <div
            key={s.label}
            className={`p-3.5 rounded-xl border flex items-center justify-between ${s.bg}`}
          >
            <span className="text-xs font-semibold text-zinc-300">{s.label}</span>
            <span className={`text-base font-extrabold ${s.color}`}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* ── Dual Activity Feed: Recent Bookings & AI Queries ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Bookings Stream */}
        <div className="rounded-2xl bg-zinc-900/70 border border-white/8 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-white">
                Live Reservation Feed
              </h2>
              <p className="text-xs text-zinc-400">
                Latest customer reservations through AI concierge
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("bookings")}
              className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {metrics.recentBookings.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 border border-dashed border-white/5 rounded-xl">
              No reservations recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {metrics.recentBookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => onSelectBooking(b)}
                  className="py-3.5 flex items-center justify-between gap-3 group cursor-pointer hover:bg-white/5 px-2 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 relative bg-zinc-800">
                      <Image
                        src={b.hotelImage}
                        alt={b.hotelName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate group-hover:text-violet-400 transition-colors">
                        {b.hotelName}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {b.guestFirstName} {b.guestLastName} · {b.nights} night
                        {b.nights !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-extrabold text-white">
                      ${b.totalPrice.toLocaleString()}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                        b.status === "CONFIRMED"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : b.status === "CHECKED_IN"
                          ? "bg-blue-500/15 text-blue-400"
                          : b.status === "PENDING"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Real-time AI Query Stream */}
        <div className="rounded-2xl bg-zinc-900/70 border border-white/8 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                Live AI Concierge Queries
              </h2>
              <p className="text-xs text-zinc-400">
                User inquiries parsed by Tambo agent into LiteAPI search
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("ai-analytics")}
              className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              <span>Telemetry</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {metrics.recentQueries.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 border border-dashed border-white/5 rounded-xl">
              No AI concierge queries logged yet. Live conversations will stream here.
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.recentQueries.map((q) => (
                <div
                  key={q.id}
                  className="p-3 rounded-xl bg-zinc-950/60 border border-white/5 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(q.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">
                        {q.intent}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {q.latencyMs}ms
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-200 line-clamp-1 italic">
                    &ldquo;{q.prompt}&rdquo;
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                    <span>Destination: <strong className="text-zinc-300 font-semibold">{q.destination}</strong></span>
                    {q.convertedToBooking ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Converted to Stay
                      </span>
                    ) : (
                      <span className="text-zinc-500">Exploratory</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

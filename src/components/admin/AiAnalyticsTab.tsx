"use client";

import { useState } from "react";
import {
  Cpu,
  Sparkles,
  Zap,
  TrendingUp,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Inbox,
} from "lucide-react";
import type { AdminAiQuery } from "@/lib/admin-data";

interface AiAnalyticsTabProps {
  queries: AdminAiQuery[];
}

export function AiAnalyticsTab({ queries }: AiAnalyticsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [intentFilter, setIntentFilter] = useState("ALL");

  const filteredQueries = queries.filter((q) => {
    if (intentFilter !== "ALL" && q.intent !== intentFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      q.prompt.toLowerCase().includes(term) ||
      q.destination.toLowerCase().includes(term)
    );
  });

  const avgLatency =
    queries.length > 0
      ? Math.round(
          queries.reduce((acc, q) => acc + q.latencyMs, 0) / queries.length
        )
      : 0;

  const successfulQueries = queries.filter((q) => q.status === "SUCCESS").length;
  const toolAccuracy =
    queries.length > 0
      ? Math.round((successfulQueries / queries.length) * 100)
      : 0;

  const convertedCount = queries.filter((q) => q.convertedToBooking).length;
  const convRate =
    queries.length > 0
      ? Math.round((convertedCount / queries.length) * 100)
      : 0;

  // Compute real intent breakdown
  const intentMap: Record<string, number> = {};
  for (const q of queries) {
    intentMap[q.intent] = (intentMap[q.intent] || 0) + 1;
  }
  const intentBreakdown = Object.entries(intentMap).map(([intent, count]) => ({
    intent,
    count,
    percentage: queries.length > 0 ? Math.round((count / queries.length) * 100) : 0,
  }));

  return (
    <div className="space-y-8 animate-atlas-fade-in pb-12">
      {/* ── KPI Telemetry Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total AI Requests */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-white/8 shadow-xl">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Tambo Conversations</span>
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {queries.length}{" "}
            <span className="text-xs font-normal text-zinc-400">sessions</span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            {queries.length > 0
              ? `${queries.length} real user chat interactions`
              : "No chat sessions recorded yet"}
          </p>
        </div>

        {/* Metric 2: Mean Latency */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-white/8 shadow-xl">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Mean Response Latency</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-cyan-400 font-mono">
            {avgLatency}ms
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            {queries.length > 0
              ? "Calculated from live agent responses"
              : "Awaiting live interactions"}
          </p>
        </div>

        {/* Metric 3: Tool Accuracy */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-white/8 shadow-xl">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>LiteAPI Tool Success</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {toolAccuracy}%
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            {successfulQueries} of {queries.length} executions successful
          </p>
        </div>

        {/* Metric 4: Direct Stay Yield */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-white/8 shadow-xl">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Conversion to Stay</span>
            <TrendingUp className="w-4 h-4 text-pink-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-pink-400 font-mono">
            {convRate}%
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            {convertedCount} converted to confirmed reservation
          </p>
        </div>
      </div>

      {/* ── Intent Distribution Breakdown ──────────────────────────── */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-white/8 shadow-xl backdrop-blur-sm">
        <h3 className="text-base font-extrabold text-white mb-1">
          Travel Intent Classification
        </h3>
        <p className="text-xs text-zinc-400 mb-5">
          Breakdown of user travel motives categorized by Tambo natural language understanding
        </p>

        {intentBreakdown.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-white/5 rounded-xl">
            No intent data available yet. Inquiries processed by the AI concierge will populate here.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {intentBreakdown.map((item) => (
              <div key={item.intent} className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-white">
                  <span className="truncate">{item.intent}</span>
                  <span className="font-mono text-zinc-400">{item.percentage}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">{item.count} query(s)</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Live AI Concierge Query Log ────────────────────────────── */}
      <div className="rounded-2xl bg-zinc-900/70 border border-white/8 shadow-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search prompts by keyword or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <select
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value)}
            className="bg-zinc-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
          >
            <option value="ALL">All Categories ({queries.length})</option>
            <option value="Luxury">Luxury</option>
            <option value="Romantic">Romantic</option>
            <option value="Business">Business</option>
            <option value="Family">Family</option>
            <option value="Budget">Budget</option>
          </select>
        </div>

        {filteredQueries.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
            <Inbox className="w-6 h-6 text-zinc-600" />
            <p>No AI concierge queries logged yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/8 bg-zinc-950/70 text-zinc-400 uppercase font-mono text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-semibold">Time</th>
                  <th className="py-3 px-4 font-semibold">User Query / Prompt</th>
                  <th className="py-3 px-4 font-semibold">Destination</th>
                  <th className="py-3 px-4 font-semibold">Intent</th>
                  <th className="py-3 px-4 font-semibold">Latency</th>
                  <th className="py-3 px-4 font-semibold text-right">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredQueries.map((q) => (
                  <tr key={q.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-zinc-500 text-[11px] whitespace-nowrap">
                      {new Date(q.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="text-zinc-200 font-medium line-clamp-1 italic">
                        &ldquo;{q.prompt}&rdquo;
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {q.destination}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {q.intent}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400">
                      <span
                        className={
                          q.latencyMs < 400
                            ? "text-emerald-400 font-bold"
                            : "text-zinc-300"
                        }
                      >
                        {q.latencyMs}ms
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {q.convertedToBooking ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Stay Booked
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-500">Browsing</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

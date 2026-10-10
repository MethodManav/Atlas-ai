"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Download,
  Plus,
  Filter,
  Eye,
  MoreVertical,
  CheckCircle2,
  Clock,
  Trash2,
  Calendar,
  Building2,
  User,
  CreditCard,
  MapPin,
  FileSpreadsheet,
} from "lucide-react";
import type { AdminBooking } from "@/lib/admin-data";
import Image from "next/image";

interface BookingsTabProps {
  bookings: AdminBooking[];
  onSelectBooking: (booking: AdminBooking) => void;
  onNewBookingClick: () => void;
  onUpdateStatus: (id: string, status: AdminBooking["status"]) => Promise<void>;
  onDeleteBooking: (id: string) => Promise<void>;
}

export function BookingsTab({
  bookings,
  onSelectBooking,
  onNewBookingClick,
  onUpdateStatus,
  onDeleteBooking,
}: BookingsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price-high" | "price-low">("newest");

  // Filtering and sorting
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
          b.bookingRef.toLowerCase().includes(q) ||
          b.guestFirstName.toLowerCase().includes(q) ||
          b.guestLastName.toLowerCase().includes(q) ||
          b.guestEmail.toLowerCase().includes(q) ||
          b.hotelName.toLowerCase().includes(q) ||
          b.hotelCity.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "price-high") {
          return b.totalPrice - a.totalPrice;
        }
        if (sortBy === "price-low") {
          return a.totalPrice - b.totalPrice;
        }
        return 0;
      });
  }, [bookings, searchTerm, statusFilter, sortBy]);

  function handleExportCsv() {
    const headers = [
      "Booking Reference",
      "Hotel",
      "City",
      "Country",
      "Guest Name",
      "Guest Email",
      "Guest Phone",
      "Check-in",
      "Check-out",
      "Nights",
      "Total Price (USD)",
      "Commission (USD)",
      "Status",
      "Payment Method",
      "Created At",
    ];

    const rows = filteredBookings.map((b) => [
      `"${b.bookingRef}"`,
      `"${b.hotelName.replace(/"/g, '""')}"`,
      `"${b.hotelCity}"`,
      `"${b.hotelCountry}"`,
      `"${b.guestFirstName} ${b.guestLastName}"`,
      `"${b.guestEmail}"`,
      `"${b.guestPhone}"`,
      `"${b.checkIn}"`,
      `"${b.checkOut}"`,
      b.nights,
      b.totalPrice,
      b.commissionAmount,
      `"${b.status}"`,
      `"${b.paymentMethod}"`,
      `"${b.createdAt}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Atlas-Reservations-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6 animate-atlas-fade-in pb-12">
      {/* ── Control Bar ───────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/70 border border-white/8 backdrop-blur-sm">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by reservation #, guest name, email, or hotel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* Filter pills & action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
          >
            <option value="ALL">All Statuses ({bookings.length})</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked-In</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-zinc-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
          </select>

          {/* Export CSV button */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-white/5 transition-all"
            title="Export filtered records as CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {/* New Reservation button */}
          <button
            onClick={onNewBookingClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-900/40 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* ── Table & List View ─────────────────────────────────────── */}
      <div className="rounded-2xl bg-zinc-900/70 border border-white/8 shadow-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/8 bg-zinc-950/70 text-zinc-400 uppercase font-mono text-[10px] tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Ref #</th>
                <th className="py-3.5 px-4 font-semibold">Hotel / Destination</th>
                <th className="py-3.5 px-4 font-semibold">Guest</th>
                <th className="py-3.5 px-4 font-semibold">Dates & Nights</th>
                <th className="py-3.5 px-4 font-semibold">Amount & Cut</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No reservations found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Ref # */}
                    <td className="py-3.5 px-4 font-mono font-bold text-violet-300">
                      <button
                        onClick={() => onSelectBooking(b)}
                        className="hover:underline flex items-center gap-1"
                      >
                        {b.bookingRef}
                      </button>
                    </td>

                    {/* Hotel */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden relative flex-shrink-0 bg-zinc-800">
                          <Image
                            src={b.hotelImage}
                            alt={b.hotelName}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0 max-w-[200px]">
                          <p className="font-bold text-white truncate">{b.hotelName}</p>
                          <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-zinc-500" />
                            {b.hotelCity}, {b.hotelCountry}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Guest */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-zinc-200">
                          {b.guestFirstName} {b.guestLastName}
                        </p>
                        <p className="text-[11px] text-zinc-400 font-mono truncate max-w-[160px]">
                          {b.guestEmail}
                        </p>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-medium text-zinc-200 block">
                          {b.checkIn} → {b.checkOut}
                        </span>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 font-mono">
                          {b.nights} night{b.nights !== 1 ? "s" : ""} · {b.guests} guest{b.guests !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-white text-sm">
                        ${b.totalPrice.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-violet-400">
                        +${b.commissionAmount} cut
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : b.status === "CHECKED_IN"
                            ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                            : b.status === "COMPLETED"
                            ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                            : b.status === "PENDING"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {b.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectBooking(b)}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Inspect Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info strip */}
        <div className="p-4 border-t border-white/8 bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Showing <strong className="text-zinc-300">{filteredBookings.length}</strong> of{" "}
            <strong className="text-zinc-300">{bookings.length}</strong> total records
          </span>
          <span className="font-mono text-[11px]">
            Filtered Volume: $
            {filteredBookings
              .reduce((acc, b) => acc + (b.status !== "CANCELLED" ? b.totalPrice : 0), 0)
              .toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

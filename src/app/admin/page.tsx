"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminSidebar, type AdminTab } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { OverviewTab } from "@/components/admin/OverviewTab";
import { BookingsTab } from "@/components/admin/BookingsTab";
import { HotelsTab } from "@/components/admin/HotelsTab";
import { GuestsTab } from "@/components/admin/GuestsTab";
import { AiAnalyticsTab } from "@/components/admin/AiAnalyticsTab";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { BookingDetailModal } from "@/components/admin/BookingDetailModal";
import { NewBookingModal } from "@/components/admin/NewBookingModal";
import type {
  AdminBooking,
  AdminHotel,
  AdminGuest,
  AdminAiQuery,
  AdminSettings,
} from "@/lib/admin-data";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data states
  const [metrics, setMetrics] = useState<any>(null);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [hotels, setHotels] = useState<AdminHotel[]>([]);
  const [guests, setGuests] = useState<AdminGuest[]>([]);
  const [queries, setQueries] = useState<AdminAiQuery[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);

  // Modals
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const [
        overviewRes,
        bookingsRes,
        hotelsRes,
        guestsRes,
        queriesRes,
        settingsRes,
      ] = await Promise.all([
        fetch("/api/admin/overview"),
        fetch("/api/admin/bookings"),
        fetch("/api/admin/hotels"),
        fetch("/api/admin/guests"),
        fetch("/api/admin/queries"),
        fetch("/api/admin/settings"),
      ]);

      const [
        overviewData,
        bookingsData,
        hotelsData,
        guestsData,
        queriesData,
        settingsData,
      ] = await Promise.all([
        overviewRes.json(),
        bookingsRes.json(),
        hotelsRes.json(),
        guestsRes.json(),
        queriesRes.json(),
        settingsRes.json(),
      ]);

      setMetrics(overviewData);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setHotels(Array.isArray(hotelsData) ? hotelsData : []);
      setGuests(Array.isArray(guestsData) ? guestsData : []);
      setQueries(Array.isArray(queriesData) ? queriesData : []);
      setSettings(settingsData);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  async function handleCreateBooking(bookingData: any) {
    const res = await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });
    if (!res.ok) throw new Error("Failed to create booking");
    await loadData(true);
  }

  async function handleUpdateBookingStatus(
    id: string,
    status: AdminBooking["status"]
  ) {
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    const updated = await res.json();
    setSelectedBooking(updated);
    await loadData(true);
  }

  async function handleDeleteBooking(id: string) {
    const res = await fetch(`/api/admin/bookings?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete booking");
    await loadData(true);
  }

  async function handleUpdateHotel(id: string, updates: Partial<AdminHotel>) {
    const res = await fetch("/api/admin/hotels", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) throw new Error("Failed to update hotel");
    await loadData(true);
  }

  async function handleUpdateGuest(id: string, updates: Partial<AdminGuest>) {
    const res = await fetch("/api/admin/guests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) throw new Error("Failed to update guest");
    await loadData(true);
  }

  async function handleUpdateSettings(updates: Partial<AdminSettings>) {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update settings");
    await loadData(true);
  }

  async function handleResetDefaults() {
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset-defaults" }),
    });
    if (!res.ok) throw new Error("Failed to reset defaults");
    await loadData(true);
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-zinc-100 antialiased selection:bg-violet-600 selection:text-white">
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setHeaderSearch("");
        }}
        bookingCount={bookings.length}
        hotelCount={hotels.length}
        guestCount={guests.length}
      />

      {/* ── Main View Container ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-gradient-to-br from-slate-950 via-zinc-950 to-slate-900">
        {/* Ambient background glow accents */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Global Header */}
        <AdminHeader
          activeTab={activeTab}
          onNewBookingClick={() => setIsNewBookingOpen(true)}
          onRefreshClick={() => loadData(true)}
          isRefreshing={isRefreshing}
          searchTerm={headerSearch}
          onSearchChange={setHeaderSearch}
        />

        {/* Scrollable Workspace Content */}
        <main className="flex-1 overflow-y-auto px-8 py-8 atlas-scrollbar relative z-10">
          {isLoading && !metrics ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              <p className="text-xs text-zinc-400 font-medium">
                Loading Atlas AI operational intelligence...
              </p>
            </div>
          ) : (
            <>
              {activeTab === "overview" && metrics && (
                <OverviewTab
                  metrics={metrics}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onSelectBooking={(b) => setSelectedBooking(b)}
                />
              )}

              {activeTab === "bookings" && (
                <BookingsTab
                  bookings={bookings}
                  onSelectBooking={(b) => setSelectedBooking(b)}
                  onNewBookingClick={() => setIsNewBookingOpen(true)}
                  onUpdateStatus={handleUpdateBookingStatus}
                  onDeleteBooking={handleDeleteBooking}
                />
              )}

              {activeTab === "hotels" && (
                <HotelsTab
                  hotels={hotels}
                  onUpdateHotel={handleUpdateHotel}
                  onRefresh={() => loadData(true)}
                />
              )}

              {activeTab === "guests" && (
                <GuestsTab
                  guests={guests}
                  onUpdateGuest={handleUpdateGuest}
                />
              )}

              {activeTab === "ai-analytics" && (
                <AiAnalyticsTab queries={queries} />
              )}

              {activeTab === "settings" && settings && (
                <SettingsTab
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onResetDefaults={handleResetDefaults}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Modals & Drawers ───────────────────────────────────────── */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={handleUpdateBookingStatus}
          onDeleteBooking={handleDeleteBooking}
        />
      )}

      {isNewBookingOpen && (
        <NewBookingModal
          isOpen={isNewBookingOpen}
          onClose={() => setIsNewBookingOpen(false)}
          hotels={hotels}
          onCreateBooking={handleCreateBooking}
        />
      )}
    </div>
  );
}

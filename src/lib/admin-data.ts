// In-memory & persisted repository for Atlas AI Admin Panel (Real data only)
import fs from "fs";
import path from "path";

export interface AdminBooking {
  id: string;
  bookingRef: string;
  hotelId: string;
  hotelName: string;
  hotelCity: string;
  hotelCountry: string;
  hotelImage: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  guests: number;
  rooms: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  commissionRate: number;
  commissionAmount: number;
  status: "CONFIRMED" | "PENDING" | "CHECKED_IN" | "COMPLETED" | "CANCELLED";
  paymentMethod: "CREDIT_CARD" | "APPLE_PAY" | "CORPORATE" | "LITEAPI_SANDBOX";
  paymentLast4: string;
  createdAt: string; // ISO string
  notes?: string;
  offerId?: string;
}

export interface AdminHotel {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  rating: number;
  reviewScore: number;
  reviewCount: number;
  price: number;
  currency: string;
  imageUrl: string;
  status: "ACTIVE" | "FEATURED" | "MAINTENANCE";
  commissionRate: number;
  totalBookings: number;
  lat: number;
  lng: number;
  amenities: string[];
}

export interface AdminGuest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  totalStays: number;
  totalSpent: number;
  tier: "PLATINUM" | "GOLD" | "SILVER" | "BRONZE";
  lastBookingDate: string;
  joinedDate: string;
  notes?: string;
}

export interface AdminAiQuery {
  id: string;
  timestamp: string;
  prompt: string;
  intent: "Luxury" | "Budget" | "Romantic" | "Family" | "Business" | "General Search";
  destination: string;
  toolsInvoked: string[];
  latencyMs: number;
  status: "SUCCESS" | "FALLBACK" | "ERROR";
  convertedToBooking: boolean;
}

export interface AdminSettings {
  platformFeePercent: number;
  defaultCurrency: string;
  autoConfirmBookings: boolean;
  sandboxMode: boolean;
  emailAlerts: boolean;
  maintenanceMode: boolean;
  liteApiStatus: "ONLINE" | "DEGRADED" | "OFFLINE";
  tamboStatus: "ONLINE" | "DEGRADED" | "OFFLINE";
  mapboxStatus: "ONLINE" | "DEGRADED" | "OFFLINE";
}

const DEFAULT_SETTINGS: AdminSettings = {
  platformFeePercent: 12.5,
  defaultCurrency: "USD",
  autoConfirmBookings: true,
  sandboxMode: true,
  emailAlerts: true,
  maintenanceMode: false,
  liteApiStatus: "ONLINE",
  tamboStatus: "ONLINE",
  mapboxStatus: "ONLINE",
};

// ─── Store State Singleton ───────────────────────────────────────────────────

interface StoreState {
  bookings: AdminBooking[];
  hotels: AdminHotel[];
  guests: AdminGuest[];
  queries: AdminAiQuery[];
  settings: AdminSettings;
}

declare global {
  // eslint-disable-next-line no-var
  var __atlasAdminStore: StoreState | undefined;
}

const STORAGE_FILE = path.join(process.cwd(), ".atlas-admin-data.json");

function loadFromDisk(): StoreState | null {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("[AdminStore] Could not read .atlas-admin-data.json:", err);
  }
  return null;
}

function saveToDisk(state: StoreState) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.warn("[AdminStore] Could not write .atlas-admin-data.json:", err);
  }
}

function getStore(): StoreState {
  if (!global.__atlasAdminStore) {
    const disk = loadFromDisk();
    if (disk && Array.isArray(disk.bookings)) {
      global.__atlasAdminStore = disk;
    } else {
      // Start completely clean without dummy data
      global.__atlasAdminStore = {
        bookings: [],
        hotels: [],
        guests: [],
        queries: [],
        settings: DEFAULT_SETTINGS,
      };
      saveToDisk(global.__atlasAdminStore);
    }
  }
  return global.__atlasAdminStore;
}

// ─── Public CRUD Methods ─────────────────────────────────────────────────────

export function getAdminBookings(): AdminBooking[] {
  return getStore().bookings;
}

export function addAdminBooking(
  booking: Omit<AdminBooking, "id" | "bookingRef" | "createdAt" | "commissionAmount"> & {
    bookingRef?: string;
  },
): AdminBooking {
  const store = getStore();
  const id = `bk_${Date.now()}`;
  const bookingRef =
    booking.bookingRef || `ATL-${Math.floor(10000 + Math.random() * 90000)}`;
  const commissionRate = booking.commissionRate ?? store.settings.platformFeePercent / 100;
  const commissionAmount = Math.round(booking.totalPrice * commissionRate * 100) / 100;

  const newBooking: AdminBooking = {
    ...booking,
    id,
    bookingRef,
    commissionRate,
    commissionAmount,
    createdAt: new Date().toISOString(),
  };

  store.bookings.unshift(newBooking);

  // Update or insert guest record
  const existingGuest = store.guests.find(
    (g) => g.email.toLowerCase() === newBooking.guestEmail.toLowerCase(),
  );
  if (existingGuest) {
    existingGuest.totalStays += 1;
    existingGuest.totalSpent += newBooking.totalPrice;
    existingGuest.lastBookingDate = newBooking.createdAt.split("T")[0];
    if (existingGuest.totalSpent > 25000) existingGuest.tier = "PLATINUM";
    else if (existingGuest.totalSpent > 10000) existingGuest.tier = "GOLD";
    else if (existingGuest.totalSpent > 3000) existingGuest.tier = "SILVER";
  } else {
    store.guests.push({
      id: `gst_${Date.now()}`,
      firstName: newBooking.guestFirstName,
      lastName: newBooking.guestLastName,
      email: newBooking.guestEmail,
      phone: newBooking.guestPhone || "",
      city: newBooking.hotelCity,
      totalStays: 1,
      totalSpent: newBooking.totalPrice,
      tier: newBooking.totalPrice > 5000 ? "GOLD" : "BRONZE",
      lastBookingDate: newBooking.createdAt.split("T")[0],
      joinedDate: new Date().toISOString().split("T")[0],
    });
  }

  // Update hotel booking count if exists
  const hotel = store.hotels.find((h) => h.id === newBooking.hotelId);
  if (hotel) {
    hotel.totalBookings += 1;
  } else if (newBooking.hotelName) {
    // Automatically record hotel to catalog if not present
    store.hotels.push({
      id: newBooking.hotelId,
      name: newBooking.hotelName,
      city: newBooking.hotelCity,
      country: newBooking.hotelCountry,
      address: `${newBooking.hotelCity} City Center`,
      rating: 5,
      reviewScore: 9.0,
      reviewCount: 1,
      price: newBooking.pricePerNight,
      currency: newBooking.currency,
      imageUrl: newBooking.hotelImage,
      status: "ACTIVE",
      commissionRate: newBooking.commissionRate,
      totalBookings: 1,
      lat: 0,
      lng: 0,
      amenities: ["WiFi", "Room Service"],
    });
  }

  saveToDisk(store);
  return newBooking;
}

export function updateAdminBooking(
  id: string,
  updates: Partial<AdminBooking>,
): AdminBooking | null {
  const store = getStore();
  const idx = store.bookings.findIndex((b) => b.id === id);
  if (idx === -1) return null;

  store.bookings[idx] = {
    ...store.bookings[idx],
    ...updates,
  };
  saveToDisk(store);
  return store.bookings[idx];
}

export function deleteAdminBooking(id: string): boolean {
  const store = getStore();
  const initialLen = store.bookings.length;
  store.bookings = store.bookings.filter((b) => b.id !== id);
  const deleted = store.bookings.length < initialLen;
  if (deleted) saveToDisk(store);
  return deleted;
}

export function getAdminHotels(): AdminHotel[] {
  return getStore().hotels;
}

export function updateAdminHotel(
  id: string,
  updates: Partial<AdminHotel>,
): AdminHotel | null {
  const store = getStore();
  const idx = store.hotels.findIndex((h) => h.id === id);
  if (idx === -1) return null;

  store.hotels[idx] = {
    ...store.hotels[idx],
    ...updates,
  };
  saveToDisk(store);
  return store.hotels[idx];
}

export function addAdminHotel(hotel: Omit<AdminHotel, "id" | "totalBookings">): AdminHotel {
  const store = getStore();
  const id = `ht_${Date.now()}`;
  const newHotel: AdminHotel = {
    ...hotel,
    id,
    totalBookings: 0,
  };
  store.hotels.unshift(newHotel);
  saveToDisk(store);
  return newHotel;
}

export function getAdminGuests(): AdminGuest[] {
  return getStore().guests;
}

export function updateAdminGuest(
  id: string,
  updates: Partial<AdminGuest>,
): AdminGuest | null {
  const store = getStore();
  const idx = store.guests.findIndex((g) => g.id === id);
  if (idx === -1) return null;

  store.guests[idx] = {
    ...store.guests[idx],
    ...updates,
  };
  saveToDisk(store);
  return store.guests[idx];
}

export function getAdminAiQueries(): AdminAiQuery[] {
  return getStore().queries;
}

export function addAdminAiQuery(query: Omit<AdminAiQuery, "id" | "timestamp">): AdminAiQuery {
  const store = getStore();
  const newQuery: AdminAiQuery = {
    ...query,
    id: `qry_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  store.queries.unshift(newQuery);
  if (store.queries.length > 100) store.queries.pop();
  saveToDisk(store);
  return newQuery;
}

export function getAdminSettings(): AdminSettings {
  return getStore().settings;
}

export function updateAdminSettings(updates: Partial<AdminSettings>): AdminSettings {
  const store = getStore();
  store.settings = {
    ...store.settings,
    ...updates,
  };
  saveToDisk(store);
  return store.settings;
}

export function clearAllAdminData(): StoreState {
  global.__atlasAdminStore = {
    bookings: [],
    hotels: [],
    guests: [],
    queries: [],
    settings: DEFAULT_SETTINGS,
  };
  saveToDisk(global.__atlasAdminStore);
  return global.__atlasAdminStore;
}

// ─── Real Analytics Calculations ─────────────────────────────────────────────

export function getAdminMetricsSummary() {
  const store = getStore();
  const activeBookings = store.bookings.filter((b) => b.status !== "CANCELLED");

  const grossRevenue = activeBookings.reduce((acc, b) => acc + b.totalPrice, 0);
  const totalCommission = activeBookings.reduce((acc, b) => acc + b.commissionAmount, 0);
  const totalStays = activeBookings.length;
  const totalNights = activeBookings.reduce((acc, b) => acc + b.nights, 0);
  const averageDailyRate = totalNights > 0 ? Math.round(grossRevenue / totalNights) : 0;

  const totalQueries = store.queries.length;
  const convertedQueries = store.queries.filter((q) => q.convertedToBooking).length;
  const conversionRate =
    totalQueries > 0 ? Math.round((convertedQueries / totalQueries) * 100) : 0;

  // Build actual monthly revenue data from real bookings
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIdx = new Date().getMonth();
  // Last 6 months
  const past6MonthIndices: number[] = [];
  for (let i = 5; i >= 0; i--) {
    past6MonthIndices.push((currentMonthIdx - i + 12) % 12);
  }

  const revenueByMonth: Record<string, { revenue: number; bookings: number }> = {};
  for (const idx of past6MonthIndices) {
    revenueByMonth[monthNames[idx]] = { revenue: 0, bookings: 0 };
  }

  for (const b of activeBookings) {
    const bookingDate = new Date(b.createdAt);
    const mName = monthNames[bookingDate.getMonth()];
    if (revenueByMonth[mName]) {
      revenueByMonth[mName].revenue += b.totalPrice;
      revenueByMonth[mName].bookings += 1;
    }
  }

  const revenueChartData = past6MonthIndices.map((idx) => {
    const m = monthNames[idx];
    return {
      month: m,
      revenue: revenueByMonth[m]?.revenue ?? 0,
      bookings: revenueByMonth[m]?.bookings ?? 0,
    };
  });

  // Real destination distribution
  const cityCounts: Record<string, { count: number; revenue: number }> = {};
  for (const b of activeBookings) {
    if (b.hotelCity) {
      if (!cityCounts[b.hotelCity]) {
        cityCounts[b.hotelCity] = { count: 0, revenue: 0 };
      }
      cityCounts[b.hotelCity].count += 1;
      cityCounts[b.hotelCity].revenue += b.totalPrice;
    }
  }

  const topDestinations = Object.entries(cityCounts)
    .map(([city, data]) => ({
      city,
      bookings: data.count,
      revenue: data.revenue,
      percentage: totalStays > 0 ? Math.round((data.count / totalStays) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Real status breakdown
  const statusCounts = {
    CONFIRMED: store.bookings.filter((b) => b.status === "CONFIRMED").length,
    CHECKED_IN: store.bookings.filter((b) => b.status === "CHECKED_IN").length,
    COMPLETED: store.bookings.filter((b) => b.status === "COMPLETED").length,
    PENDING: store.bookings.filter((b) => b.status === "PENDING").length,
    CANCELLED: store.bookings.filter((b) => b.status === "CANCELLED").length,
  };

  return {
    grossRevenue,
    totalCommission,
    totalStays,
    averageDailyRate,
    conversionRate,
    activeHotelsCount: store.hotels.length,
    totalGuestsCount: store.guests.length,
    revenueChartData,
    topDestinations,
    statusCounts,
    recentBookings: store.bookings.slice(0, 5),
    recentQueries: store.queries.slice(0, 5),
    apiHealth: {
      liteApi: store.settings.liteApiStatus,
      tamboAi: store.settings.tamboStatus,
      mapbox: store.settings.mapboxStatus,
      sandboxMode: store.settings.sandboxMode,
    },
  };
}

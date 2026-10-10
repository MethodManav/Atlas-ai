import { create } from "zustand";
import type { Hotel, BookingConfirmation } from "@/lib/hotels";

export interface UserProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface MapState {
  center: [number, number]; // [lng, lat]
  zoom: number;
}

interface AtlasStore {
  // Current authenticated user (null if not logged in)
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  // Auth modal open/close
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;

  // Hotel queued for booking once login completes
  pendingBookingHotel: Hotel | null;
  setPendingBookingHotel: (hotel: Hotel | null) => void;

  // Hotels visible on the map / in results
  hotels: Hotel[];
  setHotels: (hotels: Hotel[]) => void;

  // Currently highlighted hotel (hover / click)
  selectedHotelId: string | null;
  setSelectedHotelId: (id: string | null) => void;

  // Hotel open in the booking drawer
  bookingHotel: Hotel | null;
  setBookingHotel: (hotel: Hotel | null) => void;

  // Map viewport
  mapState: MapState;
  setMapState: (state: Partial<MapState>) => void;

  // Current search context (populated from chat)
  searchContext: {
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
  setSearchContext: (ctx: Partial<AtlasStore["searchContext"]>) => void;

  // Location pin dropped by the map search bar
  searchedLocation: { center: [number, number]; name: string } | null;
  setSearchedLocation: (loc: { center: [number, number]; name: string } | null) => void;

  // Completed booking — shown as a ticket in chat
  bookingConfirmation: BookingConfirmation | null;
  setBookingConfirmation: (data: BookingConfirmation | null) => void;
}

function getInitialUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("atlas_auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const useAtlasStore = create<AtlasStore>((set) => ({
  user: getInitialUser(),
  setUser: (user) => {
    if (typeof window !== "undefined") {
      try {
        if (user) localStorage.setItem("atlas_auth_user", JSON.stringify(user));
        else localStorage.removeItem("atlas_auth_user");
      } catch (err) {
        console.warn("Could not persist user to localStorage:", err);
      }
    }
    set({ user });
  },

  isAuthModalOpen: false,
  setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),

  pendingBookingHotel: null,
  setPendingBookingHotel: (hotel) => set({ pendingBookingHotel: hotel }),

  hotels: [],
  setHotels: (hotels) => set({ hotels }),

  selectedHotelId: null,
  setSelectedHotelId: (id) => set({ selectedHotelId: id }),

  bookingHotel: null,
  setBookingHotel: (hotel) => set({ bookingHotel: hotel }),

  // Default location: Surat, India
  mapState: { center: [72.8311, 21.1702], zoom: 12 },
  setMapState: (s) =>
    set((state) => ({ mapState: { ...state.mapState, ...s } })),

  searchContext: {},
  setSearchContext: (ctx) =>
    set((state) => ({ searchContext: { ...state.searchContext, ...ctx } })),

  searchedLocation: null,
  setSearchedLocation: (loc) => set({ searchedLocation: loc }),

  bookingConfirmation: null,
  setBookingConfirmation: (data) => set({ bookingConfirmation: data }),
}));

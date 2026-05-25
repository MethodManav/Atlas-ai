import { create } from "zustand";
import type { Hotel } from "@/lib/hotels";

interface MapState {
  center: [number, number]; // [lng, lat]
  zoom: number;
}

interface AtlasStore {
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
}

export const useAtlasStore = create<AtlasStore>((set) => ({
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
}));

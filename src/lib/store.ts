import { create } from "zustand";
import type { Hotel } from "@/lib/amadeus";

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
}

export const useAtlasStore = create<AtlasStore>((set) => ({
  hotels: [],
  setHotels: (hotels) => set({ hotels }),

  selectedHotelId: null,
  setSelectedHotelId: (id) => set({ selectedHotelId: id }),

  bookingHotel: null,
  setBookingHotel: (hotel) => set({ bookingHotel: hotel }),

  mapState: { center: [2.3522, 48.8566], zoom: 12 },
  setMapState: (s) =>
    set((state) => ({ mapState: { ...state.mapState, ...s } })),

  searchContext: {},
  setSearchContext: (ctx) =>
    set((state) => ({ searchContext: { ...state.searchContext, ...ctx } })),
}));

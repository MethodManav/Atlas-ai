import { z } from "zod";
import type { TamboComponent, TamboTool } from "@tambo-ai/react";
import { HotelResultsList } from "@/components/HotelResultsList";
import { BookingForm } from "@/components/BookingForm";
import { BookingConfirmation } from "@/components/BookingConfirmation";

// ─── Zod Schemas (plain only — no transform/preprocess; Tambo converts to JSON Schema) ─

/** Lenient hotel shape the AI may pass; components call normalizeHotel(). */
export const TamboHotelSchema = z.object({
  id: z.string().describe("Hotel ID"),
  name: z.string().describe("Hotel name"),
  rating: z.number().nullish().describe("Star rating 1–5"),
  reviewScore: z
    .number()
    .nullish()
    .describe("Guest review score 0–10"),
  reviewCount: z.number().nullish(),
  price: z.number().nullish().describe("Price per night"),
  currency: z.string().nullish(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  country: z.string().nullish(),
  lat: z.number().nullish(),
  lng: z.number().nullish(),
  latitude: z.number().nullish().describe("Same as lat"),
  longitude: z.number().nullish().describe("Same as lng"),
  amenities: z.array(z.string()).nullish(),
  imageUrl: z.string().nullish(),
  main_photo: z.string().nullish().describe("Photo URL from LiteAPI"),
  thumbnail: z.string().nullish(),
  description: z.string().nullish(),
  available: z.boolean().nullish(),
  offerId: z
    .string()
    .nullish()
    .describe("LiteAPI offer ID — required for booking"),
});

export const HotelSchema = TamboHotelSchema;

export const SearchParamsSchema = z.object({
  city: z.string().describe("Name of the city to search hotels in"),
  checkIn: z
    .string()
    .describe("Check-in date in YYYY-MM-DD format. Use today's date if not specified."),
  checkOut: z
    .string()
    .describe("Check-out date in YYYY-MM-DD format. Default to checkIn + 1 day."),
  guests: z.number().optional().describe("Number of guests (default 1)"),
  rooms: z.number().optional().describe("Number of rooms (default 1)"),
  maxPrice: z
    .number()
    .optional()
    .describe("Maximum price per night in USD"),
  minRating: z
    .number()
    .min(1)
    .max(5)
    .optional()
    .describe("Minimum star rating (1-5)"),
});

// ─── Tools ────────────────────────────────────────────────────────────────────

const searchHotelsTool: TamboTool = {
  name: "searchHotels",
  description:
    "Search for available hotels in a city with optional filters for price, rating, guests, and dates. Always call this when the user wants to find or browse hotels.",
  tool: async (params: z.infer<typeof SearchParamsSchema>) => {
    const res = await fetch("/api/hotels/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Hotel search failed");
    }
    return {
      hotels: Array.isArray(data.hotels) ? data.hotels : [],
      city: data.city ?? params.city,
      checkIn: data.checkIn ?? params.checkIn,
      checkOut: data.checkOut ?? params.checkOut,
      totalFound: data.totalFound ?? 0,
      nextCursor: data.nextCursor ?? null,
    };
  },
  inputSchema: SearchParamsSchema,
  outputSchema: z.object({
    hotels: z.array(HotelSchema),
    city: z.string(),
    checkIn: z.string(),
    checkOut: z.string(),
    totalFound: z.number(),
    nextCursor: z.number().nullable(),
  }),
};

const getHotelDetailsTool: TamboTool = {
  name: "getHotelDetails",
  description:
    "Get detailed information about a specific hotel including amenities, photos, and pricing.",
  tool: async (params: { hotelId: string }) => {
    const res = await fetch(`/api/hotels/${params.hotelId}`);
    if (!res.ok) throw new Error("Hotel details fetch failed");
    return res.json();
  },
  inputSchema: z.object({
    hotelId: z.string().describe("The hotel ID to get details for"),
  }),
  outputSchema: HotelSchema,
};

// ─── Generative UI Components ─────────────────────────────────────────────────

const hotelResultsComponent: TamboComponent = {
  name: "HotelResults",
  description:
    "Displays a list of hotel search results with prices, ratings, amenities and a Book button. Use this whenever showing hotel search results to the user.",
  component: HotelResultsList,
  propsSchema: z.object({
    hotels: z
      .array(TamboHotelSchema)
      .default([])
      .describe(
        "Hotels from searchHotels — pass the tool result hotels array unchanged",
      ),
    city: z.string().nullish().default("").describe("City name for the search"),
    checkIn: z.string().nullish().default("").describe("Check-in date YYYY-MM-DD"),
    checkOut: z.string().nullish().default("").describe("Check-out date YYYY-MM-DD"),
    totalFound: z.number().nullish().default(0).describe("Total number of hotels found"),
    nextCursor: z
      .number()
      .nullable()
      .default(null)
      .describe("Cursor for next page of results — null if no more pages"),
  }),
};

const bookingFormComponent: TamboComponent = {
  name: "BookingForm",
  description:
    "Shows a booking form for a specific hotel. Use this when the user wants to book a hotel or says 'book', 'reserve', 'I'll take it', etc.",
  component: BookingForm,
  propsSchema: z.object({
    hotel: TamboHotelSchema.describe("The hotel to book"),
    checkIn: z.string().default("").describe("Check-in date (YYYY-MM-DD)"),
    checkOut: z.string().default("").describe("Check-out date (YYYY-MM-DD)"),
    guests: z.number().default(1).describe("Number of guests"),
  }),
};

const bookingConfirmationComponent: TamboComponent = {
  name: "BookingConfirmation",
  description:
    "Shows a booking confirmation with the booking ID and details after a successful booking.",
  component: BookingConfirmation,
  propsSchema: z.object({
    bookingId: z.string(),
    hotelName: z.string(),
    checkIn: z.string(),
    checkOut: z.string(),
    guestName: z.string(),
    totalPrice: z.number(),
    currency: z.string(),
    status: z.enum(["CONFIRMED", "PENDING", "FAILED"]),
  }),
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export const tamboComponents: TamboComponent[] = [
  hotelResultsComponent,
  bookingFormComponent,
  bookingConfirmationComponent,
];

export const tamboTools: TamboTool[] = [
  searchHotelsTool,
  getHotelDetailsTool,
];

// System prompt — configure this in the Tambo dashboard under "Custom Instructions"
// https://app.tambo.co → Project Settings → Agent → Custom Instructions
export const tamboSystemPrompt = `You are Atlas, a friendly and knowledgeable hotel concierge AI assistant.
You help users find and book the perfect hotel by understanding their needs and preferences.

## Your Capabilities
- Search hotels in any city worldwide with filters (price, rating, dates, guests)
- Show interactive hotel cards with prices, amenities, and photos
- Help users compare hotels and make decisions
- Process hotel bookings seamlessly

## How to Respond
- When users ask about hotels in a city → call searchHotels tool, then render HotelResults component
- When users want to book a specific hotel → render BookingForm component
- After successful booking → render BookingConfirmation component
- Be conversational, warm, and helpful
- If the user does not specify dates, use today + tomorrow as defaults
- Highlight key features (price, rating, location, amenities) in your text alongside the UI components

## Important
Always call the searchHotels tool before rendering HotelResults — never fabricate hotel data.
When the user mentions a city, proactively search for hotels even if they haven't given full details.`;

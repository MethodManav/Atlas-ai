import { z } from "zod";
import type { TamboComponent, TamboTool } from "@tambo-ai/react";
import { HotelResultsList } from "@/components/HotelResultsList";
import { BookingForm } from "@/components/BookingForm";
import { BookingConfirmation } from "@/components/BookingConfirmation";

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const HotelSchema = z.object({
  id: z.string(),
  name: z.string(),
  rating: z.number().min(1).max(5),
  reviewScore: z.number().min(0).max(10),
  reviewCount: z.number(),
  price: z.number(),
  currency: z.string(),
  address: z.string(),
  city: z.string(),
  country: z.string(),
  lat: z.number(),
  lng: z.number(),
  amenities: z.array(z.string()),
  imageUrl: z.string(),
  description: z.string(),
  available: z.boolean(),
});

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
    if (!res.ok) throw new Error("Hotel search failed");
    return res.json();
  },
  inputSchema: SearchParamsSchema,
  outputSchema: z.object({
    hotels: z.array(HotelSchema),
    city: z.string(),
    checkIn: z.string(),
    checkOut: z.string(),
    totalFound: z.number(),
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
    hotels: z.array(HotelSchema).describe("List of hotels to display"),
    city: z.string().describe("City name for the search"),
    checkIn: z.string().describe("Check-in date"),
    checkOut: z.string().describe("Check-out date"),
    totalFound: z.number().describe("Total number of hotels found"),
  }),
};

const bookingFormComponent: TamboComponent = {
  name: "BookingForm",
  description:
    "Shows a booking form for a specific hotel. Use this when the user wants to book a hotel or says 'book', 'reserve', 'I'll take it', etc.",
  component: BookingForm,
  propsSchema: z.object({
    hotel: HotelSchema.describe("The hotel to book"),
    checkIn: z.string().describe("Check-in date (YYYY-MM-DD)"),
    checkOut: z.string().describe("Check-out date (YYYY-MM-DD)"),
    guests: z.number().describe("Number of guests"),
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

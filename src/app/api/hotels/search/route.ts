import { NextRequest, NextResponse } from "next/server";
import { searchHotels, getMockHotels } from "@/lib/amadeus";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { city, checkIn, checkOut, guests, rooms, maxPrice, minRating } = body;

    if (!city) {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }

    // Default dates if not provided
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const params = {
      city,
      checkIn: checkIn || today,
      checkOut: checkOut || tomorrow,
      guests: guests || 1,
      rooms: rooms || 1,
      maxPrice,
      minRating,
    };

    // Try Amadeus first, fall back to mock data
    let hotels;
    if (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
      hotels = await searchHotels(params);
    } else {
      // Use mock data in development
      hotels = getMockHotels(params);
    }

    return NextResponse.json({
      hotels,
      city,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      totalFound: hotels.length,
    });
  } catch (error) {
    console.error("Hotel search error:", error);
    // Return mock data as fallback
    const body = await req.text().catch(() => "{}");
    const parsed = JSON.parse(body || "{}");
    const hotels = getMockHotels({ city: parsed.city });
    return NextResponse.json({
      hotels,
      city: parsed.city || "Unknown",
      checkIn: parsed.checkIn || "",
      checkOut: parsed.checkOut || "",
      totalFound: hotels.length,
    });
  }
}

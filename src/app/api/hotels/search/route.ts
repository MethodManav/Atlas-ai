import { NextRequest, NextResponse } from "next/server";
import { searchHotels } from "@/lib/liteapi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received hotel search request", body);
    const { city, checkIn, checkOut, guests, rooms, maxPrice, minRating, cursor } =
      body;

    if (!city) {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0];

    const params = {
      city,
      checkIn: checkIn || today,
      checkOut: checkOut || tomorrow,
      guests: guests || 1,
      rooms: rooms || 1,
      maxPrice,
      minRating,
      cursor: typeof cursor === "number" ? cursor : undefined,
    };

    const result = await searchHotels(params);

    return NextResponse.json({
      hotels: result.hotels,
      city,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      totalFound: result.totalFound,
      nextCursor: result.nextCursor,
    });
  } catch (error) {
    console.error("Hotel search error:", error);
    const message =
      error instanceof Error ? error.message : "Hotel search failed";
    const status = message.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

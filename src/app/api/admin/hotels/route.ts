import { NextRequest, NextResponse } from "next/server";
import {
  getAdminHotels,
  updateAdminHotel,
  addAdminHotel,
} from "@/lib/admin-data";
import { searchHotels } from "@/lib/liteapi";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const status = searchParams.get("status");

    let hotels = getAdminHotels();

    if (status && status !== "ALL") {
      hotels = hotels.filter((h) => h.status === status);
    }

    if (search) {
      hotels = hotels.filter(
        (h) =>
          h.name.toLowerCase().includes(search) ||
          h.city.toLowerCase().includes(search) ||
          h.country.toLowerCase().includes(search)
      );
    }

    return NextResponse.json(hotels);
  } catch (error) {
    console.error("Admin hotels error:", error);
    return NextResponse.json(
      { error: "Failed to fetch hotels" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Hotel ID is required" },
        { status: 400 }
      );
    }

    const updated = updateAdminHotel(id, updates);
    if (!updated) {
      return NextResponse.json(
        { error: "Hotel not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update hotel error:", error);
    return NextResponse.json(
      { error: "Failed to update hotel" },
      { status: 500 }
    );
  }
}

// POST supports two modes:
// 1) action: "test-liteapi" - queries LiteAPI live for a city to test inventory and latency
// 2) standard add hotel
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "test-liteapi") {
      const city = body.city || "Paris";
      const startTime = Date.now();
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

      try {
        const result = await searchHotels({
          city,
          checkIn: today,
          checkOut: tomorrow,
          guests: 2,
          rooms: 1,
        });
        const durationMs = Date.now() - startTime;

        return NextResponse.json({
          success: true,
          city,
          durationMs,
          totalFound: result.hotels.length,
          sampleHotels: result.hotels.slice(0, 5),
        });
      } catch (err: unknown) {
        const durationMs = Date.now() - startTime;
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json(
          {
            success: false,
            city,
            durationMs,
            error: msg,
          },
          { status: 200 }
        );
      }
    }

    const {
      name,
      city,
      country,
      address,
      rating,
      reviewScore,
      reviewCount,
      price,
      currency,
      imageUrl,
      status,
      commissionRate,
      lat,
      lng,
      amenities,
    } = body;

    if (!name || !city) {
      return NextResponse.json(
        { error: "Name and city are required" },
        { status: 400 }
      );
    }

    const created = addAdminHotel({
      name,
      city,
      country: country || "Unknown",
      address: address || `${city} City Center`,
      rating: rating || 5,
      reviewScore: reviewScore || 9.0,
      reviewCount: reviewCount || 100,
      price: price || 250,
      currency: currency || "USD",
      imageUrl:
        imageUrl ||
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
      status: status || "ACTIVE",
      commissionRate: commissionRate || 0.12,
      lat: lat || 0,
      lng: lng || 0,
      amenities: amenities || ["WiFi", "Breakfast", "Air Conditioning"],
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Hotel POST error:", error);
    return NextResponse.json(
      { error: "Failed to process hotel request" },
      { status: 500 }
    );
  }
}

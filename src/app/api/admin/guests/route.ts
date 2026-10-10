import { NextRequest, NextResponse } from "next/server";
import { getAdminGuests, updateAdminGuest } from "@/lib/admin-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const tier = searchParams.get("tier");

    let guests = getAdminGuests();

    if (tier && tier !== "ALL") {
      guests = guests.filter((g) => g.tier === tier);
    }

    if (search) {
      guests = guests.filter(
        (g) =>
          g.firstName.toLowerCase().includes(search) ||
          g.lastName.toLowerCase().includes(search) ||
          g.email.toLowerCase().includes(search) ||
          g.city.toLowerCase().includes(search)
      );
    }

    return NextResponse.json(guests);
  } catch (error) {
    console.error("Admin guests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch guests" },
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
        { error: "Guest ID is required" },
        { status: 400 }
      );
    }

    const updated = updateAdminGuest(id, updates);
    if (!updated) {
      return NextResponse.json(
        { error: "Guest not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update guest error:", error);
    return NextResponse.json(
      { error: "Failed to update guest" },
      { status: 500 }
    );
  }
}

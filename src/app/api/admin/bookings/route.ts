import { NextRequest, NextResponse } from "next/server";
import {
  getAdminBookings,
  addAdminBooking,
  updateAdminBooking,
  deleteAdminBooking,
} from "@/lib/admin-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const status = searchParams.get("status");

    let bookings = getAdminBookings();

    if (status && status !== "ALL") {
      bookings = bookings.filter((b) => b.status === status);
    }

    if (search) {
      bookings = bookings.filter(
        (b) =>
          b.bookingRef.toLowerCase().includes(search) ||
          b.guestFirstName.toLowerCase().includes(search) ||
          b.guestLastName.toLowerCase().includes(search) ||
          b.guestEmail.toLowerCase().includes(search) ||
          b.hotelName.toLowerCase().includes(search) ||
          b.hotelCity.toLowerCase().includes(search)
      );
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Admin bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      hotelId,
      hotelName,
      hotelCity,
      hotelCountry,
      hotelImage,
      guestFirstName,
      guestLastName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      guests,
      rooms,
      pricePerNight,
      totalPrice,
      currency,
      status,
      paymentMethod,
      paymentLast4,
      notes,
    } = body;

    if (!hotelName || !guestFirstName || !guestLastName || !guestEmail || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Missing required booking fields" },
        { status: 400 }
      );
    }

    const nights = Math.max(
      1,
      Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
      )
    );
    const calculatedTotal = totalPrice || (pricePerNight || 250) * nights;

    const created = addAdminBooking({
      hotelId: hotelId || `ht_custom_${Date.now()}`,
      hotelName,
      hotelCity: hotelCity || "Paris",
      hotelCountry: hotelCountry || "France",
      hotelImage:
        hotelImage ||
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
      guestFirstName,
      guestLastName,
      guestEmail,
      guestPhone: guestPhone || "+1 555 0100",
      checkIn,
      checkOut,
      nights,
      guests: Number(guests) || 1,
      rooms: Number(rooms) || 1,
      pricePerNight: pricePerNight || Math.round(calculatedTotal / nights),
      totalPrice: calculatedTotal,
      currency: currency || "USD",
      commissionRate: 0.12,
      status: status || "CONFIRMED",
      paymentMethod: paymentMethod || "CREDIT_CARD",
      paymentLast4: paymentLast4 || "4242",
      notes: notes || "Manually created via Atlas Admin Panel",
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
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
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const updated = updateAdminBooking(id, updates);
    if (!updated) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const success = deleteAdminBooking(id);
    if (!success) {
      return NextResponse.json(
        { error: "Booking not found or could not be deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Delete booking error:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}

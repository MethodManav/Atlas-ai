import { NextRequest, NextResponse } from "next/server";
import { bookHotel } from "@/lib/liteapi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      hotelId,
      offerId,
      guestFirstName,
      guestLastName,
      guestEmail,
      guestPhone,
      cardNumber,
      cardExpiry,
      cardCvv,
      cardHolderName,
    } = body;

    if (!hotelId || !offerId || !guestFirstName || !guestLastName || !guestEmail) {
      return NextResponse.json(
        { error: "Missing required booking fields (hotelId, offerId, guest details)" },
        { status: 400 }
      );
    }

    const confirmation = await bookHotel({
      hotelId,
      offerId,
      guestFirstName,
      guestLastName,
      guestEmail,
      guestPhone: guestPhone || "",
      cardNumber: cardNumber || "",
      cardExpiry: cardExpiry || "",
      cardCvv: cardCvv || "",
      cardHolderName: cardHolderName || `${guestFirstName} ${guestLastName}`,
    });

    try {
      const { addAdminBooking } = await import("@/lib/admin-data");
      const nights = Math.max(
        1,
        Math.ceil(
          (new Date(confirmation.checkOut).getTime() -
            new Date(confirmation.checkIn).getTime()) /
            86400000
        )
      );
      addAdminBooking({
        bookingRef: confirmation.bookingId,
        hotelId,
        hotelName: confirmation.hotelName,
        hotelCity: "Destination",
        hotelCountry: "Global",
        hotelImage:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
        guestFirstName,
        guestLastName,
        guestEmail,
        guestPhone: guestPhone || "",
        checkIn: confirmation.checkIn,
        checkOut: confirmation.checkOut,
        nights,
        guests: 1,
        rooms: 1,
        pricePerNight: Math.round(confirmation.totalPrice / nights),
        totalPrice: confirmation.totalPrice,
        currency: confirmation.currency,
        commissionRate: 0.12,
        status: confirmation.status === "CONFIRMED" ? "CONFIRMED" : "PENDING",
        paymentMethod: "LITEAPI_SANDBOX",
        paymentLast4: cardNumber ? cardNumber.slice(-4) : "4242",
        offerId,
        notes: "Booked via Atlas AI live chat concierge",
      });
    } catch (adminErr) {
      console.warn("Failed to log booking to admin store:", adminErr);
    }

    return NextResponse.json(confirmation);
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Booking failed. Please try again." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { bookHotel } from "@/lib/amadeus";

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

    if (!hotelId || !guestFirstName || !guestLastName || !guestEmail) {
      return NextResponse.json(
        { error: "Missing required booking fields" },
        { status: 400 }
      );
    }

    const confirmation = await bookHotel({
      hotelId,
      offerId: offerId || "mock-offer",
      guestFirstName,
      guestLastName,
      guestEmail,
      guestPhone: guestPhone || "",
      cardNumber: cardNumber || "",
      cardExpiry: cardExpiry || "",
      cardCvv: cardCvv || "",
      cardHolderName: cardHolderName || `${guestFirstName} ${guestLastName}`,
    });

    return NextResponse.json(confirmation);
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Booking failed. Please try again." },
      { status: 500 }
    );
  }
}

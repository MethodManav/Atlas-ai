// Amadeus Hotel API wrapper
// Docs: https://developers.amadeus.com/self-service/category/hotels

export interface Hotel {
  id: string;
  name: string;
  rating: number; // stars 1-5
  reviewScore: number; // 0-10
  reviewCount: number;
  price: number;
  currency: string;
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  amenities: string[];
  imageUrl: string;
  description: string;
  available: boolean;
}

export interface SearchParams {
  city: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests?: number;
  rooms?: number;
  maxPrice?: number;
  minRating?: number; // stars
}

export interface BookingParams {
  hotelId: string;
  offerId: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardHolderName: string;
}

export interface BookingConfirmation {
  bookingId: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  totalPrice: number;
  currency: string;
  status: "CONFIRMED" | "PENDING" | "FAILED";
}

// ─── Auth ────────────────────────────────────────────────────────────────────

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  const res = await fetch(
    "https://test.api.amadeus.com/v1/security/oauth2/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AMADEUS_CLIENT_ID!,
        client_secret: process.env.AMADEUS_CLIENT_SECRET!,
      }),
    }
  );

  if (!res.ok) throw new Error("Failed to authenticate with Amadeus");

  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60_000; // 1 min buffer
  return accessToken!;
}

// ─── City → IATA code lookup ─────────────────────────────────────────────────

async function getCityCode(city: string): Promise<string> {
  const token = await getAccessToken();
  const res = await fetch(
    `https://test.api.amadeus.com/v1/reference-data/locations?keyword=${encodeURIComponent(city)}&subType=CITY&view=LIGHT&page[limit]=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) throw new Error(`City lookup failed for "${city}"`);
  const data = await res.json();

  if (!data.data?.length) throw new Error(`City not found: "${city}"`);
  return data.data[0].iataCode;
}

// ─── Hotel Search ─────────────────────────────────────────────────────────────

export async function searchHotels(params: SearchParams): Promise<Hotel[]> {
  try {
    const token = await getAccessToken();
    const cityCode = await getCityCode(params.city);

    // Step 1: Get hotel IDs in the city
    const hotelsRes = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}&radius=5&radiusUnit=KM&hotelSource=ALL`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!hotelsRes.ok) throw new Error("Hotel list fetch failed");
    const hotelsData = await hotelsRes.json();
    const hotelIds: string[] = (hotelsData.data || [])
      .slice(0, 20)
      .map((h: { hotelId: string }) => h.hotelId);

    if (!hotelIds.length) return getMockHotels(params);

    // Step 2: Get offers/prices
    const offersUrl = new URL(
      "https://test.api.amadeus.com/v3/shopping/hotel-offers"
    );
    offersUrl.searchParams.set("hotelIds", hotelIds.join(","));
    offersUrl.searchParams.set("checkInDate", params.checkIn);
    offersUrl.searchParams.set("checkOutDate", params.checkOut);
    offersUrl.searchParams.set("adults", String(params.guests ?? 1));
    offersUrl.searchParams.set("roomQuantity", String(params.rooms ?? 1));
    offersUrl.searchParams.set("currency", "USD");
    offersUrl.searchParams.set("bestRateOnly", "true");

    const offersRes = await fetch(offersUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!offersRes.ok) return getMockHotels(params);
    const offersData = await offersRes.json();

    const hotels: Hotel[] = (offersData.data || [])
      .map((item: AmadeusOffer) => mapAmadeusOffer(item))
      .filter((h: Hotel) => {
        if (params.maxPrice && h.price > params.maxPrice) return false;
        if (params.minRating && h.rating < params.minRating) return false;
        return true;
      });

    return hotels.length ? hotels : getMockHotels(params);
  } catch (err) {
    console.error("Amadeus searchHotels error:", err);
    return getMockHotels(params);
  }
}

// ─── Hotel Booking ────────────────────────────────────────────────────────────

export async function bookHotel(
  params: BookingParams
): Promise<BookingConfirmation> {
  // In production: POST to /v1/booking/hotel-orders
  // For now we simulate a successful booking
  await new Promise((r) => setTimeout(r, 1500));

  return {
    bookingId: `BK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    hotelName: "Selected Hotel",
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: new Date(Date.now() + 86400000 * 2)
      .toISOString()
      .split("T")[0],
    guestName: `${params.guestFirstName} ${params.guestLastName}`,
    totalPrice: 240,
    currency: "USD",
    status: "CONFIRMED",
  };
}

// ─── Type helpers ─────────────────────────────────────────────────────────────

interface AmadeusOffer {
  hotel: {
    hotelId: string;
    name: string;
    rating?: string;
    latitude?: number;
    longitude?: number;
    address?: { lines?: string[]; cityName?: string; countryCode?: string };
    amenities?: string[];
    media?: { uri: string }[];
    description?: { text: string };
  };
  offers?: {
    price?: { total?: string; currency?: string };
    room?: { description?: { text?: string } };
  }[];
}

function mapAmadeusOffer(item: AmadeusOffer): Hotel {
  const hotel = item.hotel;
  const offer = item.offers?.[0];

  return {
    id: hotel.hotelId,
    name: hotel.name,
    rating: parseInt(hotel.rating ?? "3", 10),
    reviewScore: +(Math.random() * 2 + 7.5).toFixed(1), // Amadeus test env lacks reviews
    reviewCount: Math.floor(Math.random() * 1800 + 200),
    price: parseFloat(offer?.price?.total ?? "120"),
    currency: offer?.price?.currency ?? "USD",
    address: hotel.address?.lines?.join(", ") ?? "",
    city: hotel.address?.cityName ?? "",
    country: hotel.address?.countryCode ?? "",
    lat: hotel.latitude ?? 0,
    lng: hotel.longitude ?? 0,
    amenities: (hotel.amenities ?? []).slice(0, 6),
    imageUrl: hotel.media?.[0]?.uri ?? getPlaceholderImage(hotel.name),
    description:
      offer?.room?.description?.text ??
      hotel.description?.text ??
      "Comfortable accommodation in a great location.",
    available: true,
  };
}

function getPlaceholderImage(name: string): string {
  const seed = encodeURIComponent(name);
  return `https://source.unsplash.com/400x300/?hotel,${seed}`;
}

// ─── Mock data (used as fallback / dev mode) ──────────────────────────────────

export function getMockHotels(params: Partial<SearchParams> = {}): Hotel[] {
  const city = params.city ?? "Paris";
  const cityCoords: Record<string, [number, number]> = {
    Paris: [48.8566, 2.3522],
    London: [51.5074, -0.1278],
    "New York": [40.7128, -74.006],
    Tokyo: [35.6762, 139.6503],
    Dubai: [25.2048, 55.2708],
    Barcelona: [41.3851, 2.1734],
    Rome: [41.9028, 12.4964],
    Amsterdam: [52.3676, 4.9041],
  };

  const [baseLat, baseLng] =
    cityCoords[city] ?? cityCoords["Paris"];

  const mockHotels: Hotel[] = [
    {
      id: "mock-1",
      name: `${city} Grand Palace Hotel`,
      rating: 5,
      reviewScore: 9.2,
      reviewCount: 1842,
      price: 289,
      currency: "USD",
      address: "12 Royal Boulevard",
      city,
      country: "FR",
      lat: baseLat + 0.005,
      lng: baseLng + 0.008,
      amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Parking"],
      imageUrl: `https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop`,
      description:
        "A magnificent 5-star hotel in the heart of the city, offering luxurious rooms with stunning views.",
      available: true,
    },
    {
      id: "mock-2",
      name: `${city} Boutique Inn`,
      rating: 4,
      reviewScore: 8.7,
      reviewCount: 923,
      price: 156,
      currency: "USD",
      address: "47 Garden Street",
      city,
      country: "FR",
      lat: baseLat - 0.007,
      lng: baseLng + 0.003,
      amenities: ["WiFi", "Breakfast", "Bar", "Rooftop"],
      imageUrl: `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop`,
      description:
        "A charming boutique hotel with personalized service and stylish interiors.",
      available: true,
    },
    {
      id: "mock-3",
      name: `${city} Central Suites`,
      rating: 4,
      reviewScore: 8.4,
      reviewCount: 654,
      price: 199,
      currency: "USD",
      address: "88 Market Square",
      city,
      country: "FR",
      lat: baseLat + 0.003,
      lng: baseLng - 0.006,
      amenities: ["WiFi", "Kitchen", "Gym", "Concierge"],
      imageUrl: `https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop`,
      description:
        "Spacious suites in a prime central location, ideal for both business and leisure.",
      available: true,
    },
    {
      id: "mock-4",
      name: `${city} Economy Stay`,
      rating: 3,
      reviewScore: 7.8,
      reviewCount: 412,
      price: 89,
      currency: "USD",
      address: "23 Station Road",
      city,
      country: "FR",
      lat: baseLat - 0.004,
      lng: baseLng - 0.009,
      amenities: ["WiFi", "Breakfast", "24h Reception"],
      imageUrl: `https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=400&h=300&fit=crop`,
      description:
        "Clean, comfortable rooms at great value — perfect for budget-conscious travelers.",
      available: true,
    },
    {
      id: "mock-5",
      name: `${city} Riverside Retreat`,
      rating: 5,
      reviewScore: 9.5,
      reviewCount: 2103,
      price: 420,
      currency: "USD",
      address: "1 Riverside Drive",
      city,
      country: "FR",
      lat: baseLat + 0.009,
      lng: baseLng - 0.002,
      amenities: ["WiFi", "Pool", "Spa", "Fine Dining", "Valet", "Gym", "Bar"],
      imageUrl: `https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop`,
      description:
        "An iconic luxury hotel with breathtaking river views and world-class amenities.",
      available: true,
    },
  ].filter((h) => {
    if (params.maxPrice && h.price > params.maxPrice) return false;
    if (params.minRating && h.rating < params.minRating) return false;
    return true;
  });

  return mockHotels;
}

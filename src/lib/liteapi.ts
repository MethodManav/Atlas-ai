// LiteAPI Hotel API wrapper
// Docs: https://docs.liteapi.travel/

import {
  type Hotel,
  type SearchParams,
  type SearchResult,
  type BookingParams,
  type BookingConfirmation,
  hotelPlaceholderImage,
  isValidImageUrl,
} from "@/lib/hotels";

const API_BASE = "https://api.liteapi.travel/v3.0";
const BOOK_BASE = "https://book.liteapi.travel/v3.0";

const CITY_COUNTRY_MAP: Record<string, string> = {
  paris: "FR",
  london: "GB",
  "new york": "US",
  tokyo: "JP",
  dubai: "AE",
  barcelona: "ES",
  rome: "IT",
  amsterdam: "NL",
  berlin: "DE",
  madrid: "ES",
  singapore: "SG",
  sydney: "AU",
  "los angeles": "US",
  "san francisco": "US",
  chicago: "US",
  miami: "US",
  boston: "US",
  toronto: "CA",
  vancouver: "CA",
  bangkok: "TH",
  "hong kong": "HK",
  seoul: "KR",
  istanbul: "TR",
  lisbon: "PT",
  vienna: "AT",
  prague: "CZ",
  athens: "GR",
  zurich: "CH",
  geneva: "CH",
  montreal: "CA",
  melbourne: "AU",
};

function getApiKey(): string {
  const key = process.env.NEXT_PUBLIC_LITEAPI_API_KEY;
  if (!key) {
    throw new Error("NEXT_PUBLIC_LITEAPI_API_KEY is not configured");
  }
  return key;
}

function liteApiHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-API-Key": getApiKey()!,
  };
}

function resolveCountryCode(
  city: string,
  override?: string,
): string | undefined {
  if (override) return override.toUpperCase();
  const key = city.trim().toLowerCase();
  return CITY_COUNTRY_MAP[key];
}

/** LiteAPI can return the same hotelId more than once; keep first offer per id. */
function dedupeHotels(hotels: Hotel[]): Hotel[] {
  const seen = new Set<string>();
  return hotels.filter((hotel) => {
    const key = hotel.offerId || hotel.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.ceil(ms / 86400000));
}

// ─── LiteAPI types ────────────────────────────────────────────────────────────

interface LiteHotelMeta {
  id: string;
  name: string;
  hotelDescription?: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  address?: string;
  main_photo?: string;
  stars?: number;
  rating?: number;
  reviewCount?: number;
}

interface LiteRateOffer {
  offerId?: string;
  name?: string;
  offerRetailRate?: { amount: number; currency: string };
  rates?: {
    name?: string;
    boardName?: string;
    retailRate?: { total?: { amount: number; currency: string }[] };
  }[];
}

interface LiteRateHotel {
  hotelId: string;
  hotel?: LiteHotelMeta;
  roomTypes?: LiteRateOffer[];
}

/** Hotel metadata returned at the root of POST /hotels/rates when includeHotelData is set */
interface LiteRatesHotelMeta {
  id: string;
  name: string;
  main_photo?: string;
  thumbnail?: string;
  address?: string;
  country_code?: string;
  city_name?: string;
  rating?: number;
  stars?: number;
  latitude?: number;
  longitude?: number;
}

interface LiteRatesResponse {
  data?: LiteRateHotel[];
  hotels?: LiteRatesHotelMeta[];
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchHotelList(
  countryCode: string,
  cityName: string,
  limit = 100,
): Promise<LiteHotelMeta[]> {
  const url = new URL(`${API_BASE}/data/hotels`);
  url.searchParams.set("countryCode", countryCode);
  url.searchParams.set("cityName", cityName);
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), { headers: liteApiHeaders() });
  if (!res.ok) throw new Error(`Hotel list failed: ${res.status}`);
  const json = await res.json();
  console.log(json, "fetchHotelList response");
  return json.data ?? [];
}

async function fetchRates(
  body: Record<string, unknown>,
): Promise<{ rateHotels: LiteRateHotel[]; hotelsMeta: LiteRatesHotelMeta[] }> {
  const res = await fetch(`${API_BASE}/hotels/rates`, {
    method: "POST",
    headers: liteApiHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Rates search failed: ${res.status}`);
  const json = (await res.json()) as LiteRatesResponse;
  return {
    rateHotels: json.data ?? [],
    hotelsMeta: json.hotels ?? [],
  };
}

function ratesMetaById(
  hotelsMeta: LiteRatesHotelMeta[],
): Map<string, LiteRatesHotelMeta> {
  return new Map(hotelsMeta.map((h) => [h.id, h]));
}

function mergeHotelMeta(
  listMeta: LiteHotelMeta | undefined,
  ratesMeta: LiteRatesHotelMeta | undefined,
): LiteHotelMeta | undefined {
  if (!listMeta && !ratesMeta) return undefined;
  return {
    id: listMeta?.id ?? ratesMeta?.id ?? "",
    name: listMeta?.name ?? ratesMeta?.name ?? "Hotel",
    country: listMeta?.country ?? ratesMeta?.country_code?.toUpperCase() ?? "",
    city: listMeta?.city ?? ratesMeta?.city_name ?? "",
    latitude: listMeta?.latitude ?? ratesMeta?.latitude ?? 0,
    longitude: listMeta?.longitude ?? ratesMeta?.longitude ?? 0,
    address: listMeta?.address ?? ratesMeta?.address,
    main_photo:
      listMeta?.main_photo ?? ratesMeta?.main_photo ?? ratesMeta?.thumbnail,
    stars: listMeta?.stars ?? ratesMeta?.stars,
    rating: listMeta?.rating ?? ratesMeta?.rating,
    reviewCount: listMeta?.reviewCount ?? 0,
    hotelDescription: listMeta?.hotelDescription,
  };
}

function getOfferPrice(offer: LiteRateOffer): {
  total: number;
  currency: string;
} | null {
  if (offer.offerRetailRate?.amount != null) {
    return {
      total: offer.offerRetailRate.amount,
      currency: offer.offerRetailRate.currency ?? "USD",
    };
  }
  const rateTotal = offer.rates?.[0]?.retailRate?.total?.[0];
  if (rateTotal?.amount != null) {
    return {
      total: rateTotal.amount,
      currency: rateTotal.currency ?? "USD",
    };
  }
  return null;
}

function buildRatesBody(
  params: SearchParams,
  extra: Record<string, unknown> = {},
) {
  const guests = params.guests ?? 1;
  const rooms = params.rooms ?? 1;
  const occupancies = Array.from({ length: rooms }, () => ({
    adults: Math.max(1, Math.ceil(guests / rooms)),
  }));

  return {
    checkin: params.checkIn,
    checkout: params.checkOut,
    currency: "USD",
    guestNationality: "US",
    occupancies,
    maxRatesPerHotel: 1,
    limit: 20,
    timeout: 10,
    starRating: params.minRating
      ? Array.from(
          { length: 5 - params.minRating + 1 },
          (_, i) => params.minRating! + i,
        )
      : undefined,
    ...extra,
  };
}

function mapRateToHotel(
  rateHotel: LiteRateHotel,
  meta: LiteHotelMeta | undefined,
  params: SearchParams,
): Hotel | null {
  const offer = rateHotel.roomTypes?.[0];
  if (!offer?.offerId) return null;

  const priceInfo = getOfferPrice(offer);
  if (!priceInfo) return null;

  const nights = nightsBetween(params.checkIn, params.checkOut);
  const pricePerNight = Math.round((priceInfo.total / nights) * 100) / 100;

  const hotel = meta ?? rateHotel.hotel;
  if (!hotel) return null;

  const name = hotel.name ?? "Hotel";
  const reviewScore = hotel.rating ?? 8.0;
  const stars =
    hotel.stars ?? Math.min(5, Math.max(1, Math.round(reviewScore / 2)));

  const mapped: Hotel = {
    id: rateHotel.hotelId,
    name,
    rating: stars,
    reviewScore,
    reviewCount: hotel.reviewCount ?? 0,
    price: pricePerNight,
    currency: priceInfo.currency,
    address: hotel.address ?? "",
    city: hotel.city ?? params.city,
    country: hotel.country ?? "",
    lat: hotel.latitude ?? 0,
    lng: hotel.longitude ?? 0,
    amenities: [],
    imageUrl: isValidImageUrl(hotel.main_photo)
      ? hotel.main_photo!
      : hotelPlaceholderImage(name),
    description:
      hotel.hotelDescription?.slice(0, 200) ??
      offer.rates?.[0]?.boardName ??
      offer.name ??
      offer.rates?.[0]?.name ??
      "Comfortable accommodation in a great location.",
    available: true,
    offerId: offer.offerId,
  };

  if (params.maxPrice && mapped.price > params.maxPrice) return null;
  if (params.minRating && mapped.rating < params.minRating) return null;

  return mapped;
}

async function searchByCity(
  params: SearchParams,
  countryCode: string,
): Promise<SearchResult> {
  const PAGE = params.limit ?? 20;
  const cursor = params.cursor ?? 0;

  const hotelList = await fetchHotelList(countryCode, params.city, 100);
  if (!hotelList.length) return { hotels: [], nextCursor: null, totalFound: 0 };

  const pageList = hotelList.slice(cursor, cursor + PAGE);
  if (!pageList.length) return { hotels: [], nextCursor: null, totalFound: hotelList.length };

  const hotelIds = pageList.map((h) => h.id);
  const metaById = new Map(pageList.map((h) => [h.id, h]));

  const { rateHotels, hotelsMeta } = await fetchRates(
    buildRatesBody(params, { hotelIds, includeHotelData: true }),
  );
  const ratesMetaByIdMap = ratesMetaById(hotelsMeta);

  const hotels: Hotel[] = [];
  for (const rateHotel of rateHotels) {
    const meta = mergeHotelMeta(
      metaById.get(rateHotel.hotelId),
      ratesMetaByIdMap.get(rateHotel.hotelId),
    );
    const mapped = mapRateToHotel(rateHotel, meta, params);
    if (mapped) hotels.push(mapped);
  }

  const nextCursor = cursor + PAGE < hotelList.length ? cursor + PAGE : null;
  return { hotels: dedupeHotels(hotels), nextCursor, totalFound: hotelList.length };
}

async function searchByAi(params: SearchParams): Promise<SearchResult> {
  const { rateHotels, hotelsMeta } = await fetchRates(
    buildRatesBody(params, {
      aiSearch: `hotels in ${params.city}`,
    }),
  );
  const ratesMetaByIdMap = ratesMetaById(hotelsMeta);

  const hotels = rateHotels
    .map((r) =>
      mapRateToHotel(
        r,
        mergeHotelMeta(r.hotel, ratesMetaByIdMap.get(r.hotelId)),
        params,
      ),
    )
    .filter((h): h is Hotel => h !== null);
  const deduped = dedupeHotels(hotels);
  return { hotels: deduped, nextCursor: null, totalFound: deduped.length };
}

// ─── Hotel Search ─────────────────────────────────────────────────────────────

export async function searchHotels(params: SearchParams): Promise<SearchResult> {
  getApiKey(); // validate env is set

  const countryCode = resolveCountryCode(params.city, params.countryCode);
  const cursor = params.cursor ?? 0;

  if (countryCode) {
    const result = await searchByCity(params, countryCode);
    // If page 1 returns hotels, use them. On subsequent pages skip AI fallback.
    if (result.hotels.length > 0 || cursor > 0) {
      console.log(result.hotels, "searchHotels (city) results");
      return result;
    }
  }

  // AI fallback — no predictable ID list, so no pagination support
  const aiResult = await searchByAi(params);
  console.log(aiResult.hotels, "searchHotels (ai) results");
  return aiResult;
}

// ─── Hotel Booking ────────────────────────────────────────────────────────────

export async function bookHotel(
  params: BookingParams,
): Promise<BookingConfirmation> {
  getApiKey();

  if (!params.offerId) {
    throw new Error("offerId is required for booking");
  }

  const headers = liteApiHeaders();

  // Step 1: Prebook
  const prebookRes = await fetch(`${BOOK_BASE}/rates/prebook`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      offerId: params.offerId,
      usePaymentSdk: false,
    }),
  });

  if (!prebookRes.ok) {
    const err = await prebookRes.text();
    throw new Error(`Prebook failed: ${err}`);
  }

  const prebookData = await prebookRes.json();
  const prebookId = prebookData.data?.prebookId;
  if (!prebookId) throw new Error("No prebookId returned");

  // Step 2: Book (sandbox: ACC_CREDIT_CARD simulates payment)
  const bookRes = await fetch(`${BOOK_BASE}/rates/book`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      prebookId,
      holder: {
        firstName: params.guestFirstName,
        lastName: params.guestLastName,
        email: params.guestEmail,
        phone: params.guestPhone || "0000000000",
      },
      guests: [
        {
          occupancyNumber: 1,
          firstName: params.guestFirstName,
          lastName: params.guestLastName,
          email: params.guestEmail,
        },
      ],
      payment: { method: "ACC_CREDIT_CARD" },
    }),
  });

  if (!bookRes.ok) {
    const err = await bookRes.text();
    throw new Error(`Booking failed: ${err}`);
  }

  const bookData = await bookRes.json();
  const booking = bookData.data;

  return {
    bookingId: booking.bookingId,
    hotelName: booking.hotel?.name ?? "Hotel",
    checkIn: booking.checkin,
    checkOut: booking.checkout,
    guestName: `${params.guestFirstName} ${params.guestLastName}`,
    totalPrice: booking.price ?? 0,
    currency: booking.currency ?? "USD",
    status: booking.status === "CONFIRMED" ? "CONFIRMED" : "PENDING",
  };
}

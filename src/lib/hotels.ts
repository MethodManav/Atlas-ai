// Shared hotel types

const DEFAULT_HOTEL_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop";

export function isValidImageUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function hotelPlaceholderImage(_name?: string): string {
  return DEFAULT_HOTEL_IMAGE;
}

/** Pick the first absolute http(s) image URL from known fields. */
export function resolveImageUrl(hotel: HotelInput): string {
  for (const candidate of [
    hotel.imageUrl,
    hotel.main_photo,
    hotel.thumbnail,
  ]) {
    if (isValidImageUrl(candidate)) return candidate.trim();
  }
  return hotelPlaceholderImage(hotel.name);
}

export type HotelInput = Partial<Hotel> &
  Pick<Hotel, "id" | "name"> & {
    main_photo?: string;
    thumbnail?: string;
    latitude?: number;
    longitude?: number;
  };

/** Guest review score (0–10). Tambo may omit reviewScore or put it in `rating`. */
export function getReviewScore(hotel: Partial<Hotel>): number | null {
  if (typeof hotel.reviewScore === "number" && !Number.isNaN(hotel.reviewScore)) {
    return hotel.reviewScore;
  }
  const rating = hotel.rating;
  if (typeof rating === "number" && !Number.isNaN(rating)) {
    if (rating > 5) return rating;
    return Math.min(10, Math.max(0, rating * 2));
  }
  return null;
}

/** Fill defaults for props passed from Tambo or partial API payloads. */
export function normalizeHotel(hotel: HotelInput): Hotel {
  const reviewScore = getReviewScore(hotel) ?? 8;
  const rating =
    typeof hotel.rating === "number" && hotel.rating <= 5
      ? hotel.rating
      : Math.min(5, Math.max(1, Math.round(reviewScore / 2)));

  const imageUrl = resolveImageUrl(hotel);

  return {
    id: hotel.id,
    name: hotel.name,
    rating,
    reviewScore,
    reviewCount: hotel.reviewCount ?? 0,
    price: hotel.price ?? 0,
    currency: hotel.currency ?? "USD",
    address: hotel.address ?? "",
    city: hotel.city ?? "",
    country: hotel.country ?? "",
    lat: hotel.lat ?? hotel.latitude ?? 0,
    lng: hotel.lng ?? hotel.longitude ?? 0,
    amenities: hotel.amenities ?? [],
    imageUrl,
    description: hotel.description ?? "",
    available: hotel.available ?? true,
    offerId: hotel.offerId,
  };
}

export interface Hotel {
  id: string;
  name: string;
  rating: number; // stars 1-5
  reviewScore: number; // 0-10
  reviewCount: number;
  price: number; // per night
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
  /** LiteAPI offer ID — required for booking */
  offerId?: string;
}

export interface SearchParams {
  city: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests?: number;
  rooms?: number;
  maxPrice?: number;
  minRating?: number; // stars
  countryCode?: string; // ISO-2, optional override
  cursor?: number; // offset into hotel ID list for pagination (default 0)
  limit?: number; // page size (default 20)
}

export interface SearchResult {
  hotels: Hotel[];
  nextCursor: number | null; // null = no more pages
  totalFound: number; // total hotel IDs available (city list size)
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

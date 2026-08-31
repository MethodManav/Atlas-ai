# Atlas-AI — System Architecture

End-to-end trace of a user query, from the chat input box to the AI's tool call, LiteAPI, the Zustand store, and the rendered UI (chat bubble + map pins).

## 1. High-level flow

```
┌──────────────┐   1. types + submits    ┌───────────────────────┐
│  ChatPanel    │ ──────────────────────▶ │  useTamboThreadInput   │
│ (user input)  │                         │  .submit()             │
└──────────────┘                         └───────────┬───────────┘
                                                       │ 2. sends thread message
                                                       ▼
                                          ┌───────────────────────┐
                                          │   Tambo runtime        │
                                          │ (TamboProvider, cloud) │
                                          │  - reads system prompt │
                                          │  - reads registered    │
                                          │    tools + components  │
                                          └───────────┬───────────┘
                                                       │ 3. decides to call tool
                                                       ▼
                                          ┌───────────────────────┐
                                          │ searchHotelsTool.tool()│
                                          │ (src/lib/tambo.ts)     │
                                          └───────────┬───────────┘
                                                       │ 4. POST
                                                       ▼
                                    /api/hotels/search (route.ts)
                                                       │ 5. validate + defaults
                                                       ▼
                                          ┌───────────────────────┐
                                          │ searchHotels()         │
                                          │ (src/lib/liteapi.ts)   │
                                          └───────────┬───────────┘
                     6a. city→country (map or Nominatim)          6b. /data/hotels, /hotels/rates
                                                       │
                                                       ▼
                                          LiteAPI (api.liteapi.travel)
                                                       │ 7. hotel list + rates
                                                       ▼
                                          map → Hotel[] (src/lib/hotels.ts)
                                                       │ 8. JSON response bubbles back up
                                                       ▼
                                          Tool result fed back into Tambo thread
                                                       │ 9. model picks a component
                                                       ▼
                                    <HotelResultsList hotels=... /> (registered
                                    Tambo component, rendered as message.content
                                    block with type:"component")
                                                       │ 10. ChatPanel renders
                                                       │     block.renderedComponent
                                                       ▼
                                          ┌───────────────────────┐
                                          │ HotelResultsList        │
                                          │ useEffect → setHotels() │
                                          │ + setMapState()         │
                                          │ (src/lib/store.ts)      │
                                          └───────────┬───────────┘
                                                       │ 11. Zustand notifies subscribers
                                                       ▼
                                          ┌───────────────────────┐
                                          │ MapPanel                │
                                          │ - flyTo(mapState)       │
                                          │ - renders hotel pins    │
                                          └───────────────────────┘
```

## 2. Step-by-step

### Step 1 — User input (`src/components/ChatPanel/index.tsx`)
- `useTambo()` exposes `messages`, `startNewThread`.
- `useTamboThreadInput()` exposes `value`, `setValue`, `submit`, `isPending`.
- `handleSubmit` calls `submit()` when `value` is non-empty and not already pending.
- Suggestion chips call `setValue(text)`, then auto-submit via a `pendingSuggestion` effect.
- On error, `handleSubmitError` detects `"invalid_previous_run"` and recovers by calling `startNewThread()`.

### Step 2–3 — Tambo runtime
- `TamboProvider` is set up in `src/app/providers.tsx`, wrapping the app in `src/app/layout.tsx`.
- Config passed to the provider: `apiKey` (`NEXT_PUBLIC_TAMBO_API_KEY`), `userKey` (a UUID persisted in `localStorage` under `atlas_user_key` so threads survive reloads), `components={tamboComponents}`, `tools={tamboTools}`, `contextHelpers={{currentTime: currentTimeContextHelper}}`.
- The **system prompt** (`tamboSystemPrompt`, documented in `src/lib/tambo.ts` but pasted manually into the Tambo dashboard — it is *not* passed as a provider prop) tells the model "Atlas":
  - If city + dates are known → call `searchHotels`, then render `HotelResults`.
  - If only a city/area is known → render `HotelSearchForm` pre-filled, never ask for dates in plain text.
  - Booking intent → render `BookingForm`.
  - After a successful booking → render `BookingConfirmation`.
  - Never fabricate hotel data — a tool call is mandatory before showing hotels.

### Step 4 — Tool call (`src/lib/tambo.ts`)
Two tools are registered (`tamboTools`):
- **`searchHotelsTool`** — `inputSchema = SearchParamsSchema` (`city` required; `checkIn`/`checkOut` required YYYY-MM-DD; optional `guests`, `rooms`, `maxPrice`, `minRating`). Its `tool()` function does `fetch("/api/hotels/search", { method: "POST", body: JSON.stringify(params) })`, throws using `data.error` on failure, and returns `{ hotels, city, checkIn, checkOut, totalFound, nextCursor }`.
- **`getHotelDetailsTool`** — `GET /api/hotels/${hotelId}`, returns a single hotel matching `HotelSchema`.

Four components are registered (`tamboComponents`), each with a `description` (tells the model *when* to render it) and a Zod `propsSchema` (tells the model *what props* to populate):

| Component | Maps to | Key props |
|---|---|---|
| `HotelResults` | `HotelResultsList` | `hotels[]`, `city`, `checkIn`, `checkOut`, `totalFound`, `nextCursor` |
| `HotelSearchForm` | `HotelSearchForm` | `city` |
| `BookingForm` | `BookingForm` | `hotel`, `checkIn`, `checkOut`, `guests` |
| `BookingConfirmation` | `BookingConfirmation` | `bookingId`, `hotelName`, `checkIn`, `checkOut`, `guestName`, `totalPrice`, `currency`, `status` |

### Step 5 — API route (`src/app/api/hotels/search/route.ts`)
- Parses the JSON body, requires `city` (400 if missing).
- Defaults `checkIn`/`checkOut` to today/tomorrow if omitted, `guests`/`rooms` to `1`.
- Calls `searchHotels(params)` and returns `{ hotels, city, checkIn, checkOut, totalFound, nextCursor }`.
- On error: `503` if the message mentions "not configured" (missing API key), else `500`.

### Step 6–8 — LiteAPI integration (`src/lib/liteapi.ts`)
`searchHotels(params)`:
1. `getApiKey()` validates `NEXT_PUBLIC_LITEAPI_API_KEY` is set.
2. `resolveCountryCode(city)` — looks up a static `CITY_COUNTRY_MAP` (~30 major cities); if not found, falls back to `resolveCountryCodeFromNominatim(city)` (OpenStreetMap Nominatim geocoding).
3. If a country code resolves → `searchByCity`:
   - `GET /data/hotels?countryCode&cityName&limit=100` → hotel ID/metadata list.
   - Paginate locally via `cursor` (page size 20).
   - `POST /hotels/rates` with `{checkin, checkout, currency, guestNationality, occupancies, hotelIds, includeHotelData, starRating?, maxRatesPerHotel:1}`.
   - Merge list-metadata + rate-metadata per hotel, map to the app's `Hotel` shape (`mapRateToHotel`), filter by `maxPrice`/`minRating`, dedupe by `offerId`/`id`.
4. If page 1 returns zero hotels → **AI fallback** (`searchByAi`): `POST /hotels/rates` with `aiSearch: "hotels in {city}"` instead of `hotelIds` (no pagination support).
5. Returns `{ hotels, nextCursor, totalFound }`.

`bookHotel(params)` (used later by the booking flow):
1. **Prebook**: `POST {book-base}/rates/prebook` with `{offerId, usePaymentSdk:false}` → `prebookId`.
2. **Book**: `POST {book-base}/rates/book` with `{prebookId, holder, guests, payment:{method:"ACC_CREDIT_CARD"}}` (sandbox simulates payment).
3. Returns `BookingConfirmation`.

Shared types live in `src/lib/hotels.ts`, including `normalizeHotel()` — the single place where lenient, AI-supplied hotel data (nullish everything) is coerced into the strict `Hotel` shape the UI expects.

### Step 9–10 — Response rendering in chat
- The tool result is fed back into the Tambo thread; the model picks `HotelResults` and populates its props from the tool output.
- Tambo pre-renders that component and attaches it to the assistant message as a content block with `type: "component"` and a `renderedComponent` field.
- `ChatPanel` iterates `message.content`: text blocks (`type: "text"`) render via `ReactMarkdown`; component blocks render `block.renderedComponent` directly inside an animated wrapper.
- The concrete component mounted here is `HotelResultsList` (`src/components/HotelResultsList/index.tsx`).

### Step 11 — Shared state bridge (`src/lib/store.ts`, Zustand `useAtlasStore`)
`HotelResultsList` normalizes/dedupes its `hotels` prop, then — guarded so it only fires once per unique search (`syncKey` = `city|checkIn|checkOut|offerIds`) — calls:
- `setHotels(hotels)`
- `setSearchContext({ city, checkIn, checkOut })`
- `setMapState({ center: [lng, lat], zoom: 13 })` (from the first hotel with valid coordinates)

Store shape:
```
hotels: Hotel[]
selectedHotelId: string | null
bookingHotel: Hotel | null
mapState: { center: [lng, lat], zoom }
searchContext: { city?, checkIn?, checkOut?, guests? }
searchedLocation: { center: [lng, lat], name } | null
bookingConfirmation: BookingConfirmation | null
```

`HotelResultsList` also renders a horizontally scrolling list of `HotelCard`s and a "Load more" card that POSTs `/api/hotels/search` again with a `cursor`, appending results and re-calling `setHotels`.

### Step 12 — Map render (`src/components/MapPanel/index.tsx`)
Subscribes to `hotels`, `selectedHotelId`, `mapState`, `searchContext`, `searchedLocation` from the store.
- Map is initialized once (`mapboxgl.Map`, style `satellite-streets-v12`); if `NEXT_PUBLIC_MAPBOX_TOKEN` is empty, renders a fallback list view instead (with a `MapSearchBar` and clickable hotel rows).
- A `mapState` change triggers `map.flyTo({ center, zoom, duration: 1400 })`.
- On every `hotels`/`selectedHotelId` change, all markers are torn down and recreated: each hotel with valid `lat`/`lng` gets a pin (bigger/highlighted if `selectedHotelId` matches), with `mouseenter`/`mouseleave` handlers that show a popup and sync `selectedHotelId` (so hovering a `HotelCard` in chat highlights its pin, and vice versa), and a `click` handler that calls `setBookingHotel(hotel)`.

## 3. Booking sub-flow

`setBookingHotel(hotel)` (from a map pin click or a `HotelCard` click) opens `BookingDrawer` (a bottom sheet), which renders `BookingForm` with `hotel`, `checkIn`/`checkOut`/`guests` pulled from `searchContext`.

```
BookingForm (steps: details → payment → confirming)
   │ handleBook()
   ▼
POST /api/hotels/book  { hotelId, offerId, guest*, card* }
   │
   ▼
bookHotel() in liteapi.ts  →  prebook → book (LiteAPI)
   │
   ▼
BookingConfirmation JSON
   │
   ├─ setBookingHotel(null)         → closes the drawer
   └─ setBookingConfirmation(data)  → ChatPanel renders <BookingTicket> inline
```

Note there are **two independent paths** to a booking-confirmation UI:
1. **Model-driven**: the AI calls no tool for booking; it renders the `BookingConfirmation` Tambo component directly with props it infers from context (used when the conversation itself narrates a completed booking).
2. **Imperative**: the actual `BookingForm` → `/api/hotels/book` → LiteAPI flow above, which writes to `bookingConfirmation` in the store and is rendered by `ChatPanel` as `<BookingTicket>`, entirely outside of Tambo's component-rendering pipeline.

## 4. Top-level composition

- `src/app/layout.tsx` → wraps `{children}` in `<Providers>`.
- `src/app/providers.tsx` → `<Providers>` sets up `<TamboProvider>` (config as in §2).
- `src/app/page.tsx` → two-panel layout: `<MapPanel />` (flex-1, left) and a width-animated `<ChatPanel />` (390px, right, collapsible).

## 5. Key files reference

| Concern | File |
|---|---|
| Tambo tools/components/system prompt | `src/lib/tambo.ts` |
| Provider setup | `src/app/providers.tsx` |
| App shell / panel layout | `src/app/page.tsx`, `src/app/layout.tsx` |
| Chat UI + message rendering | `src/components/ChatPanel/index.tsx` |
| Search API route | `src/app/api/hotels/search/route.ts` |
| Booking API route | `src/app/api/hotels/book/route.ts` |
| LiteAPI client | `src/lib/liteapi.ts` |
| Shared hotel types/normalization | `src/lib/hotels.ts` |
| Zustand store (chat ↔ map bridge) | `src/lib/store.ts` |
| Search results UI | `src/components/HotelResultsList/index.tsx` |
| Map + markers | `src/components/MapPanel/index.tsx` |
| Booking UI | `src/components/BookingDrawer/`, `src/components/BookingForm/` |

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Also see `AGENTS.md` — this project runs Next.js 16 (Turbopack), which has breaking changes from older versions. Check `node_modules/next/dist/docs/` before using any Next.js API you are unsure about.

## Commands

```bash
npm run dev       # Start dev server (Turbopack)
npm run build     # Production build + type check
npm run lint      # ESLint
npx tsc --noEmit  # Type-check without building
```

There are no tests yet. The build (`npm run build`) is the canonical correctness check — it runs both Turbopack compilation and `tsc`.

## Architecture

This is a **map + AI chat** hotel search and booking app. The two panels — a Tambo-powered chat on the left and a Mapbox map on the right — share state through a single Zustand store.

### Request flow

```
User types in chat
  → Tambo AI calls searchHotels tool (src/lib/tambo.ts)
  → Tool POSTs to /api/hotels/search (src/app/api/hotels/search/route.ts)
  → Route calls LiteAPI (src/lib/liteapi.ts)
  → Tool result returned to Tambo
  → Tambo renders <HotelResultsList> component inside the chat bubble
  → HotelResultsList useEffect calls setHotels() + setMapState()
  → MapPanel re-renders with new pins via Zustand subscription
```

### Shared state (`src/lib/store.ts`)

`useAtlasStore` (Zustand) is the bridge between chat and map:
- `hotels` — current search results, drives map pins
- `selectedHotelId` — synced on hover (chat card ↔ map pin highlight)
- `bookingHotel` — non-null opens the `BookingDrawer` sheet
- `mapState` — `center: [lng, lat]` + `zoom`; set by `HotelResultsList` on each search
- `searchContext` — city/checkIn/checkOut/guests passed to `BookingForm`

### Tambo generative UI (`src/lib/tambo.ts`)

Tambo is the AI layer. It auto-selects and renders registered React components based on conversation. The key concepts:

- **Tools** (`tamboTools`) — functions the AI can call. `searchHotels` hits `/api/hotels/search`; result is fed back to the AI before it picks a component to render.
- **Components** (`tamboComponents`) — React components the AI renders inside chat bubbles. Each has a `description` (tells the AI when to use it) and a `propsSchema` (Zod, tells the AI what props to populate).
- **Message content types** — Tambo messages have typed content blocks. Text blocks use `type: "text"`; rendered components use `type: "component"` (not `"tambo_component"`). Access `renderedComponent` on blocks with `type === "component"` to render them.
- **Hooks** — `useTambo()` exposes `messages`, `isStreaming`; `useTamboThreadInput()` exposes `value`, `setValue`, `submit`, `isPending`. `isPending` lives on `useTamboThreadInput`, not `useTambo`.
- **System prompt** — `tamboSystemPrompt` in `tambo.ts` documents the intended prompt. Paste it into the Tambo dashboard at `app.tambo.co → Project Settings → Agent → Custom Instructions`. It is not passed via `TamboProvider` props (no such prop exists).

### LiteAPI integration (`src/lib/liteapi.ts`)

- Authenticates with `X-API-Key` header (`NEXT_PUBLIC_LITEAPI_API_KEY`). Sandbox keys start with `sand_`; production keys with `prod_`.
- `searchHotels()` resolves city → country code, fetches hotel IDs via `/data/hotels`, then loads rates via `POST /hotels/rates`. Falls back to `aiSearch` when country is unknown.
- `bookHotel()` runs the two-step LiteAPI flow: `POST /rates/prebook` (offerId) → `POST /rates/book` (prebookId + `ACC_CREDIT_CARD` for sandbox).
- Shared types live in `src/lib/hotels.ts`. `NEXT_PUBLIC_LITEAPI_API_KEY` is required for search and booking.
- API bases: search/data `https://api.liteapi.travel/v3.0`, booking `https://book.liteapi.travel/v3.0`.

### MapPanel (`src/components/MapPanel/index.tsx`)

- Uses `mapbox-gl` directly (not `react-map-gl`). The map is initialized once in a `useEffect` with an empty dep array and stored in a `useRef`.
- Hotel markers are price-label `HTMLElement` pins created imperatively. They are fully torn down and re-created on every `hotels` or `selectedHotelId` change.
- If `NEXT_PUBLIC_MAPBOX_TOKEN` is empty, the component renders a fallback list view instead of crashing.

### Adding a new generative component

1. Build the React component in `src/components/`.
2. Define a `TamboComponent` entry in `src/lib/tambo.ts` with a clear `description` (the AI reads this to decide when to render it) and a Zod `propsSchema`.
3. Add it to the `tamboComponents` array.
4. The AI will start using it automatically — no routing or wiring needed.

## Environment variables

```
NEXT_PUBLIC_TAMBO_API_KEY      # Required for AI chat (get from app.tambo.co)
NEXT_PUBLIC_MAPBOX_TOKEN       # Required for live map (get from account.mapbox.com)
NEXT_PUBLIC_LITEAPI_API_KEY    # Required for hotel search/booking (get from dashboard.liteapi.travel)
```

Copy `.env.local.example` to `.env.local` and fill in values.

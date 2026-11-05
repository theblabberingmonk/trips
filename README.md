# Trips ↗

A simple, responsive personal travel journal. The home page lists journeys; **New Year 2027 [Aus & NZ]** includes the outbound Delhi–Guangzhou–Christchurch flight option and saved 11-day itinerary, daily route maps, photos, target schedules, transport and accommodation plans, booking priorities, and a browser-local journal with text export.

## Run locally

Run `npm start` (requires Python 3), then open the URL printed in your terminal. The server starts at http://localhost:5173 and automatically tries the next port if it is occupied. To select a starting port, run `npm start -- --port 5200`. No installation or build is required. `npm run check` checks JavaScript syntax.

## Edit or add trips

- `index.html`: shared page shell.
- `app.js`: home, trip page, filters, and local journal.
- `trip-data.json`: editable daily itinerary and photo attribution.
- `style.css`: responsive styling.
- `assets/`: local destination photos and route maps.

To add a journey, add its data and a route in `app.js`, then add a home-page card. Hash routing works on static hosting, including GitHub Pages under a repository subpath. Publish the repository root with any static host. Pushing source does not itself configure hosting.

## Content & privacy

The content comes from the existing Australia / New Zealand planning project. It is a saved planning snapshot, not live travel advice: dates, prices, access rules, roads, and bookings need reconfirmation. All bookings remain unconfirmed. Detailed daily guide schedules take precedence over the earlier rough outline.

Journal notes use localStorage in the current browser and origin. They are not committed, synced, or sent to a server. Each flight/day block also has its own Things to do text box, saved independently in the same browser. Use Export notes for a backup of the journal and all block tasks. Clearing browser data removes saved notes.

Passport scans, visa files, employer correspondence, and other private documents are intentionally excluded. Public repositories and static sites expose their bundled content.

Destination photos retain their original Creative Commons licences; source, author, and licence links appear beside photos and in the trip page credits. Maps credit OpenStreetMap contributors and OSRM. Google Fonts are optional remote styling resources with local font fallbacks.

Day 01 includes rental suppliers and an explicitly provisional NZD budget, not live supplier quotes. Exact Christmas availability and prices remain to be obtained.

## Interactive maps

Daily maps use locally bundled Leaflet 1.9.4 (licence in `assets/vendor/leaflet/LICENSE`), numbered stops, and saved route geometry in `trip-data.json`. OpenStreetMap provides online map tiles, loaded only when a day is opened; internet access is required for the basemap. Change `mapTiles` in the data file to use another compatible tile provider, retaining its required attribution. Follow the provider’s usage policy; no offline tile downloading is implemented.

New Zealand days include a whole-country overview; Australian days include an Australia overview. Grey lines show earlier days in the same country. Stop selection opens a popup with target time and a Google Maps link. “Show whole route” resets the view. Ferry, walking and airport-transfer connections marked schematic are not turn-by-turn routes.

New Zealand daily cards include sourced optional activities, estimated time windows and explicit fit / substitution notes. Lettered optional pins are colour-coded by Adventure, Fun & relaxation, Nature and Extra place, with per-category visibility controls. These locations do not change the saved driving route. Main numbered stops have persistent on-map name labels. Activity / trail-access pins are approximate planning locations; use operator / DOC directions for actual access and reconfirm Christmas availability.

## Australian options, currency and budget

Australian daily cards use the same optional-activity categories and coloured map pins. NYE options are alternative managed viewing areas, not additions to an occupied site. Departure-day options stay at the airport.

`money.js` displays an INR equivalent beside NZD, AUD and CNY amounts, and labels rupee prices as INR. `exchangeRates` in `trip-data.json` stores rounded, dated planning rates; there is no live rate API. All native currencies remain visible.

The bottom budget box shows per-person costs assuming two adults share rooms and cars. It covers the Delhi–NZ–Australia–Delhi journey, ten nights, food, rentals, fuel, Milford, visas/processing and insurance allowances, plus 10% contingency. Only the supplied Delhi fare is a saved quote; other amounts are explicitly estimates. Optional paid-activity reserves and the conditional Guangzhou outing are selectable; the city outing replaces airport-layover spending in the calculation. Canada positioning flights, India work stays, shopping and refundable bonds are excluded. Edit numeric budget rows to replace assumptions with quotes.

## Oamaru overnight revision

24 Dec now keeps Christchurch → Tekapo → Pukaki → Twizel and continues via the Waitaki Valley to Oamaru. 25 Dec begins in Oamaru, returns via Twizel to Mount Cook, then keeps Lindis Pass and Queenstown. Both route geometries were recomputed with OSRM; driving allowances include buffers beyond the routing baseline. No original main destination or optional activity was removed.

Oamaru is the selected overnight town; no hotel is booked. The first-night room cap is NZ$200 total for two, with saved Booking.com candidates and a late-check-in warning. The budget separates that night from the two unverified Queenstown room allowances and increases NZ fuel / parking for the detour. New optional places include the heritage precinct, dated evening penguin viewing (late finish possible), and Elephant Rocks. Steampunk HQ is not scheduled: it closes before the expected 24 Dec arrival and is closed Christmas Day.

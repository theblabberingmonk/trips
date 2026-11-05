# Trips ↗

A simple, responsive personal travel journal. The home page lists journeys; **New Year 2027 [Aus & NZ]** includes the outbound Delhi–Guangzhou–Christchurch flight option and saved 11-day itinerary, daily route maps, photos, target schedules, transport and accommodation plans, booking priorities, and a browser-local journal with text export.

## Run locally

Run `npm start` (requires Python 3), then open http://localhost:5173. No installation or build is required. `npm run check` checks JavaScript syntax.

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

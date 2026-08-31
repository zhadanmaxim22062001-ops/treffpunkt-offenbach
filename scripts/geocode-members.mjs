// Geocodes member addresses via Nominatim (OpenStreetMap) and fetches the
// OSM raster tiles needed to render a small local map crop, then writes
// everything to disk:
//   - data/members.geocode.json   { slug: {lat, lon} | null }
//   - data/members.mapmeta.json   { slug: {xPct, yPct} }  (marker position
//     within the tile grid, as a percentage — lets StaticMap position the
//     marker with plain CSS)
//   - public/maps/<slug>/<row>-<col>.png   the 3x3 tile grid itself
//
// This is the ONLY place that talks to Nominatim or the OSM tile server.
// Nothing in the site fetches either at request time — StaticMap only ever
// reads the local files this script produced, so a visitor's browser never
// makes a third-party request and never hands anyone their IP. Re-running
// this script is safe and cheap: it skips any member that's already fully
// cached.
//
// Usage: npm run geocode  [-- --retry-failed]
//
// Policy compliance (read before changing the throttle or User-Agent):
//   Nominatim: https://operations.osmfoundation.org/policies/nominatim/
//   Tile usage: https://operations.osmfoundation.org/policies/tiles/
//   Both require a descriptive User-Agent with contact info, forbid bulk
//   scraping, and require heavy client-side caching — this script fetches
//   each address and each tile at most once, ever, and pauses 1.1s between
//   every single HTTP request to Nominatim or the tile server combined.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const MEMBERS_PATH = `${ROOT}data/members.json`;
const GEOCODE_PATH = `${ROOT}data/members.geocode.json`;
const MAPMETA_PATH = `${ROOT}data/members.mapmeta.json`;
const MAPS_DIR = `${ROOT}public/maps`;
const USER_AGENT = "TreffpunktOffenbachWebsite/1.0 (info@treffpunkt-offenbach.com)";
const DEFAULT_CITY = "Offenbach am Main";
const ZOOM = 16;
const GRID = 3; // 3x3 tiles, point tile always in the centre — see tileGrid()

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function throttledFetch(url, afterFirst) {
  if (afterFirst) await sleep(1100);
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return res;
}

let requestCount = 0;
async function request(url) {
  const res = await throttledFetch(url, requestCount > 0);
  requestCount += 1;
  return res;
}

async function geocode(query) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  const res = await request(url);
  const results = await res.json();
  if (!results.length) return null;
  return { lat: Number(results[0].lat), lon: Number(results[0].lon) };
}

/** Web Mercator tile coordinates (fractional — the fractional part is the pixel offset within the tile). */
function tileCoords(lat, lon, zoom) {
  const x = ((lon + 180) / 360) * 2 ** zoom;
  const rad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** zoom;
  return { x, y };
}

/** Origin tile for a GRID x GRID square with the point's tile always in the centre cell. */
function tileGrid(lat, lon, zoom) {
  const { x, y } = tileCoords(lat, lon, zoom);
  const originX = Math.floor(x) - Math.floor(GRID / 2);
  const originY = Math.floor(y) - Math.floor(GRID / 2);
  const xPct = ((x - originX) / GRID) * 100;
  const yPct = ((y - originY) / GRID) * 100;
  return { originX, originY, xPct, yPct };
}

async function fetchTileGrid(slug, lat, lon) {
  const { originX, originY, xPct, yPct } = tileGrid(lat, lon, ZOOM);
  const dir = `${MAPS_DIR}/${slug}`;
  await mkdir(dir, { recursive: true });

  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const dest = `${dir}/${row}-${col}.png`;
      if (existsSync(dest)) continue;
      const tileX = originX + col;
      const tileY = originY + row;
      const res = await request(`https://tile.openstreetmap.org/${ZOOM}/${tileX}/${tileY}.png`);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(dest, buf);
    }
  }

  return { xPct, yPct };
}

async function main() {
  const { members } = await readJson(MEMBERS_PATH, { members: [] });
  const geocodeCache = await readJson(GEOCODE_PATH, {});
  const mapMeta = await readJson(MAPMETA_PATH, {});
  const retryFailed = process.argv.includes("--retry-failed");

  for (const member of members) {
    const needsGeocode = !(member.slug in geocodeCache) || (geocodeCache[member.slug] === null && retryFailed);
    if (needsGeocode) {
      const city = member.city ?? DEFAULT_CITY;
      const query = [
        member.houseNumber ? `${member.street} ${member.houseNumber}` : member.street,
        member.plz ? `${member.plz} ${city}` : city,
        "Deutschland",
      ].join(", ");
      try {
        const point = await geocode(query);
        geocodeCache[member.slug] = point;
        console.log(point ? `geocode ok    ${member.slug}  (${point.lat}, ${point.lon})` : `geocode none  ${member.slug}  — "${query}" had no match`);
      } catch (err) {
        geocodeCache[member.slug] = null;
        console.error(`geocode fail  ${member.slug}  — ${err.message}`);
      }
    }

    const point = geocodeCache[member.slug];
    if (point && !(member.slug in mapMeta)) {
      try {
        const meta = await fetchTileGrid(member.slug, point.lat, point.lon);
        mapMeta[member.slug] = meta;
        console.log(`map tiles ok  ${member.slug}`);
      } catch (err) {
        console.error(`map tiles fail  ${member.slug}  — ${err.message}`);
      }
    }
  }

  await writeFile(GEOCODE_PATH, JSON.stringify(geocodeCache, null, 2) + "\n");
  await writeFile(MAPMETA_PATH, JSON.stringify(mapMeta, null, 2) + "\n");
  console.log(`\nWrote ${GEOCODE_PATH}, ${MAPMETA_PATH}, and tiles under ${MAPS_DIR}`);
  console.log(`Made ${requestCount} request(s) to Nominatim / OpenStreetMap tiles this run.`);
}

main();

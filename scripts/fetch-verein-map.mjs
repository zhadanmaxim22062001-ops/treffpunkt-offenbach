// Geocodes the association's own address and fetches the 3x3 OSM tile grid
// for it, once — the one map the site renders locally, on /kontakt. Unlike
// member addresses, this is always exactly one address, so it doesn't scale
// with the member count and stays well inside the OSMF tile usage policy's
// "harmless" territory (see scripts/geocode-members.mjs for why member pages
// don't get a rendered map at all).
//
// Usage: npm run map:verein

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { VEREIN } from "../data/verein.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT_PATH = `${ROOT}data/verein-map.json`;
const MAPS_DIR = `${ROOT}public/maps/verein`;
const USER_AGENT = "TreffpunktOffenbachWebsite/1.0 (info@treffpunkt-offenbach.com)";
const ZOOM = 16;
const GRID = 3;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let requestCount = 0;
async function request(url) {
  if (requestCount > 0) await sleep(1100);
  requestCount += 1;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return res;
}

async function geocode(query) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  const res = await request(url);
  const results = await res.json();
  if (!results.length) throw new Error(`No geocode match for "${query}"`);
  return { lat: Number(results[0].lat), lon: Number(results[0].lon) };
}

function tileCoords(lat, lon, zoom) {
  const x = ((lon + 180) / 360) * 2 ** zoom;
  const rad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** zoom;
  return { x, y };
}

async function main() {
  const query = [`${VEREIN.street}`, `${VEREIN.zip} ${VEREIN.city}`, "Deutschland"].join(", ");
  const { lat, lon } = await geocode(query);
  console.log(`geocoded verein address: (${lat}, ${lon})`);

  const { x, y } = tileCoords(lat, lon, ZOOM);
  const originX = Math.floor(x) - Math.floor(GRID / 2);
  const originY = Math.floor(y) - Math.floor(GRID / 2);
  const xPct = ((x - originX) / GRID) * 100;
  const yPct = ((y - originY) / GRID) * 100;

  await mkdir(MAPS_DIR, { recursive: true });
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const dest = `${MAPS_DIR}/${row}-${col}.png`;
      if (existsSync(dest)) continue;
      const res = await request(`https://tile.openstreetmap.org/${ZOOM}/${originX + col}/${originY + row}.png`);
      await writeFile(dest, Buffer.from(await res.arrayBuffer()));
    }
  }

  await writeFile(OUT_PATH, JSON.stringify({ lat, lon, xPct, yPct }, null, 2) + "\n");
  console.log(`Wrote ${OUT_PATH} and tiles under ${MAPS_DIR}`);
}

main();

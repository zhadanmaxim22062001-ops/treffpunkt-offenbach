// Geocodes member addresses via Nominatim (OpenStreetMap) and writes the
// result to data/members.geocode.json. This is the ONLY place that talks to
// Nominatim — nothing in the site fetches it at request time.
//
// Member pages do NOT get a rendered map image. Earlier this script also
// fetched a small OSM tile crop per member, but the OSMF tile usage policy
// names bulk downloading as prohibited and points heavy or commercial
// third-party use at a paid provider instead — fine for a dozen placeholders,
// not fine for the real list of 100+ members (roughly 900 tiles, committed
// into the repo, re-fetched on every re-geocode). Member pages instead link
// out to OpenStreetMap directly (see components StaticMap is no longer used
// there); scripts/fetch-verein-map.mjs handles the one map the site does
// render locally, for the association's own address on /kontakt — a single
// address that doesn't scale with the member count.
//
// The geocode lookup itself is unaffected by that policy note: Nominatim's
// own usage policy is about lookup rate and caching, not volume, and this
// script already does both correctly (see below). The lat/lon it produces
// still feeds LocalBusiness JSON-LD's `geo` field and the "open in
// OpenStreetMap" link on each member page.
//
// Usage: npm run geocode  [-- --retry-failed]
//
// Policy: https://operations.osmfoundation.org/policies/nominatim/
// Requires a descriptive User-Agent with contact info, forbids bulk
// scraping, and requires heavy client-side caching — this script geocodes
// each address at most once, ever, and pauses 1.1s between every request.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const MEMBERS_PATH = `${ROOT}data/members.json`;
const GEOCODE_PATH = `${ROOT}data/members.geocode.json`;
const USER_AGENT = "TreffpunktOffenbachWebsite/1.0 (info@treffpunkt-offenbach.com)";
const DEFAULT_CITY = "Offenbach am Main";

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

async function geocode(query) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Nominatim responded ${res.status}`);
  const results = await res.json();
  if (!results.length) return null;
  return { lat: Number(results[0].lat), lon: Number(results[0].lon) };
}

async function main() {
  const { members } = await readJson(MEMBERS_PATH, { members: [] });
  const cache = await readJson(GEOCODE_PATH, {});
  const retryFailed = process.argv.includes("--retry-failed");
  let requested = 0;

  for (const member of members) {
    if (member.slug in cache && cache[member.slug] !== null) continue;
    if (member.slug in cache && cache[member.slug] === null && !retryFailed) continue;

    const city = member.city ?? DEFAULT_CITY;
    const query = [
      member.houseNumber ? `${member.street} ${member.houseNumber}` : member.street,
      member.plz ? `${member.plz} ${city}` : city,
      "Deutschland",
    ].join(", ");

    if (requested > 0) await sleep(1100);
    requested += 1;

    try {
      const point = await geocode(query);
      cache[member.slug] = point;
      console.log(point ? `ok    ${member.slug}  (${point.lat}, ${point.lon})` : `none  ${member.slug}  — "${query}" had no match`);
    } catch (err) {
      cache[member.slug] = null;
      console.error(`fail  ${member.slug}  — ${err.message}`);
    }
  }

  if (requested === 0) {
    console.log("Nothing to do — every member already has a cached geocode result. Pass --retry-failed to retry misses.");
    return;
  }

  await writeFile(GEOCODE_PATH, JSON.stringify(cache, null, 2) + "\n");
  console.log(`\nWrote ${GEOCODE_PATH}`);
}

main();

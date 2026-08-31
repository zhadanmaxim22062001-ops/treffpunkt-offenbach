// Geocodes member addresses via Nominatim (OpenStreetMap) and writes the
// result to data/members.geocode.json. Run manually after importing new
// member data — never called during `next build`, so the production build
// has no network dependency and can't be slowed down or broken by an
// upstream outage.
//
// Usage: npm run geocode
//
// Respects Nominatim's usage policy: max 1 request/second, descriptive
// User-Agent. https://operations.osmfoundation.org/policies/nominatim/

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
    const addressParts = [
      member.houseNumber ? `${member.street} ${member.houseNumber}` : member.street,
      member.plz ? `${member.plz} ${city}` : city,
      "Deutschland",
    ];
    const query = addressParts.join(", ");

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

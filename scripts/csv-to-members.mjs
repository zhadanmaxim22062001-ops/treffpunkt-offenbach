// Converts a member CSV (the format in data/member-template.csv) back into
// data/members.json. Meant for the list that comes back from the Vorstand:
// most rows will be missing several optional columns, and that's fine —
// they're simply omitted from the resulting record, which the site already
// renders gracefully.
//
// Usage: npm run csv:import -- path/to/returned-file.csv
// (defaults to data/member-template.csv if no path is given)

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const MEMBERS_PATH = `${ROOT}data/members.json`;
const BRANCHEN = ["Einzelhandel", "Gastronomie", "Handwerk", "Dienstleistung", "Gesundheit", "Bildung"];

const COLUMN_MAP = {
  "Name": "name",
  "Branche": "branche",
  "Straße": "street",
  "Hausnummer": "houseNumber",
  "PLZ": "plz",
  "Ort": "city",
  "Telefon": "phone",
  "E-Mail": "email",
  "Website": "website",
  "Öffnungszeiten": "hoursRaw",
  "Kurzbeschreibung": "teaser",
  "Beschreibung": "description",
  "Logo-Datei": "logo",
};

/** Minimal RFC4180 CSV line splitter: handles quoted fields, embedded commas, and "" escapes. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  const lines = text.split(/\r\n|\n/);
  for (const rawLine of lines) {
    if (!inQuotes && (rawLine.startsWith("#") || rawLine.trim() === "")) continue;
    const line = inQuotes ? "\n" + rawLine : rawLine;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
      } else {
        field += ch;
      }
    }
    if (!inQuotes) {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    }
  }
  return rows;
}

function slugify(name) {
  return name
    .toLowerCase()
    .replaceAll("ä", "ae").replaceAll("ö", "oe").replaceAll("ü", "ue").replaceAll("ß", "ss")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "Mo–Fr 09:00–18:00; Sa 10:00–14:00" -> [{days:"Mo–Fr",hours:"09:00–18:00"}, {days:"Sa",hours:"10:00–14:00"}] */
function parseHours(raw) {
  if (!raw?.trim()) return undefined;
  const lines = raw.split(";").map((s) => s.trim()).filter(Boolean);
  return lines.map((line) => {
    const match = line.match(/^(.*?)\s+([\d:–\-,\s]+)$/);
    if (match) return { days: match[1].trim(), hours: match[2].trim() };
    return { days: "", hours: line };
  });
}

async function main() {
  const inputPath = process.argv[2] ?? `${ROOT}data/member-template.csv`;
  const csvText = await readFile(inputPath, "utf8");
  const rows = parseCsv(csvText);
  const [header, ...dataRows] = rows;

  const fieldOrder = header.map((col) => COLUMN_MAP[col.trim()]);
  const unknownColumns = header.filter((col) => !COLUMN_MAP[col.trim()]);
  if (unknownColumns.length) {
    console.warn(`Warning: unrecognised columns, ignored: ${unknownColumns.join(", ")}`);
  }

  const existing = JSON.parse(await readFile(MEMBERS_PATH, "utf8"));
  const usedSlugs = new Set();
  const members = [];
  let skipped = 0;

  for (const [i, cells] of dataRows.entries()) {
    const record = {};
    fieldOrder.forEach((field, idx) => {
      if (field) record[field] = cells[idx]?.trim() || undefined;
    });

    if (!record.name) {
      console.warn(`Row ${i + 2}: no Name, skipped.`);
      skipped++;
      continue;
    }
    if (!record.branche || !BRANCHEN.includes(record.branche)) {
      console.warn(`Row ${i + 2} (${record.name}): Branche "${record.branche ?? ""}" is not one of ${BRANCHEN.join(", ")} — skipped.`);
      skipped++;
      continue;
    }
    if (!record.street) {
      console.warn(`Row ${i + 2} (${record.name}): no Straße, skipped.`);
      skipped++;
      continue;
    }

    let slug = slugify(record.name);
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${slugify(record.name)}-${suffix}`;
      suffix++;
    }
    usedSlugs.add(slug);

    members.push({
      slug,
      name: record.name,
      branche: record.branche,
      street: record.street,
      houseNumber: record.houseNumber,
      plz: record.plz,
      city: record.city && record.city !== "Offenbach am Main" ? record.city : undefined,
      phone: record.phone,
      email: record.email,
      website: record.website,
      hours: parseHours(record.hoursRaw),
      teaser: record.teaser,
      description: record.description,
      logo: record.logo,
    });
  }

  const output = { ...existing, members };
  await writeFile(MEMBERS_PATH, JSON.stringify(output, null, 2) + "\n");
  console.log(`\nImported ${members.length} members, skipped ${skipped}, wrote ${MEMBERS_PATH}`);
  console.log("Run `npm run geocode` next to fetch map tiles for any new addresses.");
  if (typeof output._note === "string" && output._note.includes("TODO-COPY")) {
    console.log(
      "\nNote: data/members.json still carries its TODO-COPY marker, so the site will keep showing\n" +
        '"Verzeichnis im Aufbau" instead of this data. Once the list is confirmed real and every\n' +
        "business has consented to publication, remove that note from data/members.json by hand.",
    );
  }
}

main();

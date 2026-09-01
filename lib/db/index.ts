import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * Neon project must be created in the EU (Frankfurt / eu-central-1) region —
 * see README's OF-Radar section. Getting that wrong at project-creation time
 * means personal data (digest subscriber emails, radar item text that may
 * reference identifiable people) leaves the EU, which the Datenschutz page
 * would then be lying about. Nothing here can enforce that; it's a checkbox
 * in the Neon console when the project is created, not a connection option.
 */
function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return drizzle(neon(url), { schema });
}

export { db };
export * from "./schema";

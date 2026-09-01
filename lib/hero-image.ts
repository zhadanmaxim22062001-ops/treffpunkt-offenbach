import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Optional real-photo slot for the hero. Unset by default — see README for
 * why: we have no rights to stock photography of Offenbach, so the hero
 * uses a generated brand backdrop (components/BrandBackdrop.tsx) until the
 * association supplies their own photo. Drop a JPEG at public/hero/innenstadt.jpg
 * and the homepage picks it up automatically on the next build; no code change.
 */
export function getHeroImagePath(): string | null {
  const filePath = path.join(process.cwd(), "public/hero/innenstadt.jpg");
  return existsSync(filePath) ? "/hero/innenstadt.jpg" : null;
}

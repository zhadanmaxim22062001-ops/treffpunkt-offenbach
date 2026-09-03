import { existsSync } from "node:fs";
import path from "node:path";
import { HERO_PHOTO_CREDIT, isMediaCreditComplete } from "@/data/media";

const HERO_PHOTO_PATH = "/hero/offenbach-innenstadt.jpg";

/**
 * Optional real-photo slot for the hero. Renders only when BOTH the file
 * exists AND its credit (data/media.ts) is fully filled in — Commons photos
 * are almost always CC BY/CC BY-SA, so crediting is a licence obligation,
 * not a courtesy, and this makes it impossible to ship the image without
 * one by accident. Missing either one falls back to the generated
 * BrandBackdrop, which is the correct state, not a placeholder.
 */
export function getHeroImagePath(): string | null {
  if (!isMediaCreditComplete(HERO_PHOTO_CREDIT)) return null;
  const filePath = path.join(process.cwd(), "public", HERO_PHOTO_PATH);
  return existsSync(filePath) ? HERO_PHOTO_PATH : null;
}

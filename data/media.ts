/**
 * Photo credits — one record per non-generated image the site uses. Almost
 * everything on Wikimedia Commons is CC BY or CC BY-SA, which makes credit a
 * licence obligation, not a courtesy. The guard below (isMediaCreditComplete)
 * is what makes it impossible to ship a photo uncredited by accident: a
 * consumer checks completeness before rendering the image at all, exactly
 * like MEMBERS_ARE_PLACEHOLDER / RADAR_ITEMS_ARE_PLACEHOLDER gate their data.
 * No credit, no photo — see lib/hero-image.ts and README's "Hero photo
 * licensing" section for how this is used and why.
 */

export type MediaCredit = {
  /** What the image shows, for the Impressum's Bildnachweise list. */
  description: string;
  author: string;
  licenceName: string;
  licenceUrl: string;
  filePageUrl: string;
  /** Required whenever the file was cropped/recompressed/otherwise changed
   *  from the original — CC BY and CC BY-SA both require indicating changes. */
  modifications: string;
};

export function isMediaCreditComplete(credit: MediaCredit): boolean {
  return Object.values(credit).every((value) => value.trim().length > 0);
}

/**
 * The homepage hero photo. Filled in with the details the association
 * received for this specific file — see the commit that added them. Until
 * every field here is real, lib/hero-image.ts falls back to the geometric
 * BrandBackdrop automatically; that fallback is the correct state, not a
 * placeholder to feel bad about.
 */
export const HERO_PHOTO_CREDIT: MediaCredit = {
  description: "Luftbild Offenbach am Main (Startseite)",
  author: "Adrianflamind",
  licenceName: "CC BY-SA 4.0",
  licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.de",
  filePageUrl: "https://commons.wikimedia.org/w/index.php?curid=85650871",
  modifications: "verkleinert und komprimiert",
};

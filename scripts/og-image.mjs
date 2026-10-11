// Renders public/og-image.png (1200x630): the association's logo-1200.png
// centred on --c-paper with generous margin. Run: node scripts/og-image.mjs
// The background is read from the --c-paper token in app/globals.css (the
// light theme's value, first :root block) so it can't drift from the site.
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(path.join(root, "app/globals.css"), "utf8");
const paper = css.match(/:root\s*\{[^}]*?--c-paper:\s*(#[0-9a-fA-F]{3,8})/s)?.[1];
if (!paper) throw new Error("--c-paper not found in globals.css");
// Inlined as a data URI: a page created with setContent() is about:blank and
// can't load file:// images.
const logo = "data:image/png;base64," + readFileSync(path.join(root, "public/brand/logo-1200.png")).toString("base64");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(
  `<body style="margin:0;width:1200px;height:630px;background:${paper};display:flex;align-items:center;justify-content:center">
     <img src="${logo}" style="width:620px;height:auto">
   </body>`,
);
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(root, "public/og-image.png") });
await browser.close();
console.log("wrote public/og-image.png on", paper);

import { test, expect } from "@playwright/test";

/**
 * Behavioural coverage for the shared ContactForm (components/ContactForm.tsx)
 * across both /kontakt and /mitglied-werden. Deliberately never performs a
 * genuinely well-formed, non-spam submission here: that would attempt a real
 * SMTP send, and this suite has to stay safe to run repeatedly (locally,
 * and in CI, wherever SMTP might actually be configured and working) without
 * ever risking a real email to the association's mailbox. Every "submission
 * succeeds" case below uses the same instant-submit timing the server-side
 * spam guard is built to catch (MIN_SUBMIT_MS in lib/forms.ts) — a bot gets
 * an identical-looking success response to a real one, which is exactly
 * what lets this suite exercise the real success UI without a real send.
 * The deeper server-side behaviour (honeypot, timing, the rate limit shared
 * across both forms, the SMTP-down fallback, subject-line differentiation,
 * and no-JS redirect targets per context) was verified manually against the
 * running dev server instead — see the session's own report for the exact
 * requests and results.
 */

test("mitglied-werden's form carries Betrieb/Branche (both optional); kontakt's does not", async ({ page }) => {
  await page.goto("/mitglied-werden");
  await expect(page.getByLabel("Betrieb")).toBeVisible();
  await expect(page.getByLabel("Betrieb")).toHaveJSProperty("required", false);
  await expect(page.getByLabel("Branche")).toBeVisible();
  await expect(page.getByLabel("Branche")).toHaveJSProperty("required", false);

  await page.goto("/kontakt");
  await expect(page.getByLabel("Betrieb")).toHaveCount(0);
  await expect(page.getByLabel("Branche")).toHaveCount(0);
});

test("mitglied-werden shows the membership-specific heading, intro and button label", async ({ page }) => {
  await page.goto("/mitglied-werden");
  await expect(page.getByRole("heading", { name: "Interesse? Schreiben Sie uns." })).toBeVisible();
  await expect(page.getByText("Erzählen Sie kurz, wer Sie sind und wo Sie arbeiten")).toBeVisible();
  await expect(page.getByRole("button", { name: "Anfrage senden" })).toBeVisible();
});

test("kontakt keeps its own heading and button label unchanged", async ({ page }) => {
  await page.goto("/kontakt");
  await expect(page.getByRole("heading", { name: "Schreiben oder rufen Sie uns an." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Nachricht senden" })).toBeVisible();
});

test("each form sends the correct kontext as a hidden field", async ({ page }) => {
  await page.goto("/kontakt");
  await expect(page.locator('input[name="kontext"]')).toHaveValue("kontakt");

  await page.goto("/mitglied-werden");
  await expect(page.locator('input[name="kontext"]')).toHaveValue("mitgliedschaft");
});

test("client-side validation flags an empty required field without submitting", async ({ page }) => {
  await page.goto("/kontakt");
  await page.getByLabel("E-Mail").fill("test@example.com");
  await page.getByLabel("Nachricht").fill("Eine ausreichend lange Testnachricht.");
  await page.getByLabel(/Ich habe die/).check();
  await page.getByRole("button", { name: "Nachricht senden" }).click();
  await expect(page.getByText("Bitte geben Sie Ihren Namen an.")).toBeVisible();
});

test("a fast (bot-timing) submission still renders the real success state, both forms", async ({ page }) => {
  for (const { path, button } of [
    { path: "/kontakt", button: "Nachricht senden" },
    { path: "/mitglied-werden", button: "Anfrage senden" },
  ]) {
    await page.goto(path);
    await page.getByLabel("Name").fill("Playwright Test");
    await page.getByLabel("E-Mail").fill("test@example.com");
    await page.getByLabel("Nachricht").fill("Eine ausreichend lange Testnachricht für den Ablauf.");
    await page.getByLabel(/Ich habe die/).check();
    // No wait here — submitting well within MIN_SUBMIT_MS is exactly what
    // marks this as bot-like server-side, so it can never send a real email.
    await page.getByRole("button", { name: button }).click();
    await expect(page.getByText("Danke, Ihre Nachricht ist angekommen.")).toBeVisible();
  }
});

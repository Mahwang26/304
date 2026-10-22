import { test, expect } from "@playwright/test";

test.describe("Catálogo", () => {
  test("la pantalla de inicio muestra las dos familias de tanques", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/304/);
    await expect(page.getByRole("heading", { name: "Tanques de Acero Inoxidable" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tanques de Plástico" })).toBeVisible();
    // One card per line, each opening its page.
    await expect(page.locator('#acero a.model-card[href="/acero/classic"]')).toBeVisible();
    await expect(page.locator('#plastico a.model-card[href="/plastico/plast3"]')).toBeVisible();
  });

  test("la página de una línea lista sus modelos con precio", async ({ page }) => {
    await page.goto("/acero/classic");
    await expect(page.getByRole("heading", { level: 1, name: "Modelo Classic" })).toBeVisible();
    const rows = page.locator("table.steel-table tbody tr");
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeGreaterThan(3);
    await expect(rows.first().locator(".price-cell")).toHaveText(/^\$\s?[\d.]+$/);
  });

  test("una línea que no existe da 404", async ({ page }) => {
    const res = await page.goto("/acero/no-existe");
    expect(res?.status()).toBe(404);
  });

  test("las pestañas llevan de una línea a otra", async ({ page }) => {
    await page.goto("/acero/classic");
    await page.getByRole("link", { name: "Horizonte", exact: true }).click();
    await expect(page).toHaveURL(/\/acero\/horizonte$/);
    await expect(page.getByRole("heading", { level: 1, name: "Modelo Horizonte" })).toBeVisible();
  });
});

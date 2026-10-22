import { test, expect } from "@playwright/test";

// Reads a price like "$ 1.560.000" as a number.
const pesos = (text) => Number(text.replace(/[^\d]/g, ""));

test.describe("Carrito", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/acero/classic");
    await page.evaluate(() => localStorage.removeItem("304-cart"));
    await page.reload();
  });

  test("elegir una cantidad y agregar suma esa cantidad al carrito", async ({ page }) => {
    const row = page.locator("table.steel-table tbody tr").first();
    const name = (await row.locator("td").first().textContent()).trim();

    await row.getByRole("button", { name: `Sumar un ${name}` }).click();
    await row.getByRole("button", { name: `Sumar un ${name}` }).click();
    await row.getByRole("button", { name: `Agregar 3 ${name} al carrito` }).click();

    await expect(page.getByRole("button", { name: /Abrir el carrito, 3 productos/ })).toBeVisible();
    // The picker goes back to 1 for the next time.
    await expect(row.locator(".qty-stepper-value")).toHaveText("1");
  });

  test("el carrito se mantiene al recargar y muestra el total", async ({ page }) => {
    const row = page.locator("table.steel-table tbody tr").first();
    const name = (await row.locator("td").first().textContent()).trim();
    const price = pesos(await row.locator(".price-cell").textContent());

    await row.getByRole("button", { name: `Sumar un ${name}` }).click();
    await row.getByRole("button", { name: `Agregar 2 ${name} al carrito` }).click();
    await page.reload();

    await page.getByRole("button", { name: /Abrir el carrito, 2 productos/ }).click();
    const drawer = page.getByRole("dialog", { name: "Tu carrito" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(name, { exact: true })).toBeVisible();
    expect(pesos(await drawer.locator(".cart-total strong").textContent())).toBe(2 * price);
  });

  test("quitar el último producto deja el carrito vacío", async ({ page }) => {
    const row = page.locator("table.steel-table tbody tr").first();
    const name = (await row.locator("td").first().textContent()).trim();
    await row.getByRole("button", { name: `Agregar 1 ${name} al carrito` }).click();

    await page.getByRole("button", { name: /Abrir el carrito, 1 productos/ }).click();
    const drawer = page.getByRole("dialog", { name: "Tu carrito" });
    await drawer.getByRole("button", { name: `Quitar ${name}` }).click();
    await expect(drawer.getByText("Todavía no agregaste ningún tanque.")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(page.getByRole("button", { name: /Abrir el carrito, 0 productos/ })).toBeVisible();
  });
});

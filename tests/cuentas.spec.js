import { test, expect } from "@playwright/test";

test.describe("Cuentas y compra", () => {
  test("para confirmar una compra hay que iniciar sesión", async ({ page }) => {
    await page.goto("/acero/classic");
    await page.evaluate(() => localStorage.setItem("304-cart", "[]"));
    const row = page.locator("table.steel-table tbody tr").first();
    const name = (await row.locator("td").first().textContent()).trim();
    await row.getByRole("button", { name: `Agregar 1 ${name} al carrito` }).click();

    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "Ingresá para confirmar tu pedido" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Confirmar y pagar" })).toHaveCount(0);
    // The order summary is still there.
    await expect(page.getByRole("complementary", { name: "Resumen del pedido" }).getByText(name)).toBeVisible();
  });

  test("al crear una cuenta, las contraseñas tienen que coincidir", async ({ page }) => {
    await page.goto("/cuenta");
    await page.getByRole("button", { name: "Crear cuenta" }).first().click();
    await page.getByLabel("Email").fill("alguien@ejemplo.com.ar");
    await page.getByLabel(/^Contraseña/).fill("secreta1");
    await page.getByLabel("Repetí la contraseña").fill("secreta2");
    await page.locator(".auth-panel form").getByRole("button", { name: "Crear cuenta" }).click();
    await expect(page.locator(".auth-panel").getByRole("alert")).toHaveText("Las contraseñas no coinciden.");
  });

  test("con una contraseña incorrecta no se puede ingresar", async ({ page }) => {
    await page.goto("/cuenta");
    await page.getByLabel("Email").fill("no-existe-304@ejemplo.com.ar");
    await page.getByLabel("Contraseña").fill("incorrecta-123");
    await page.locator(".auth-panel form").getByRole("button", { name: "Ingresar" }).click();
    await expect(page.locator(".auth-panel").getByRole("alert")).toHaveText("El email o la contraseña no son correctos.");
  });
});

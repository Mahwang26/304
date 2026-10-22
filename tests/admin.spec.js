import { test, expect } from "@playwright/test";

// Roles and middleware: /admin and its API are only for administrators (proxy.js + RLS).
test.describe("Panel de administración", () => {
  test("sin sesión, /admin manda a iniciar sesión y vuelve después", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/cuenta\?next=%2Fadmin$/);
    await expect(page.getByRole("heading", { name: "Ingresá a tu cuenta" })).toBeVisible();
  });

  test("sin sesión, la API de administración responde 401", async ({ request }) => {
    const list = await request.get("/api/admin/models");
    expect(list.status()).toBe(401);
    expect(await list.json()).toEqual({ error: "Iniciá sesión." });

    const change = await request.patch("/api/admin/orders/1", { data: { status: "enviado" } });
    expect(change.status()).toBe(401);
  });

  test.describe("como administrador", () => {
    const email = process.env.E2E_ADMIN_EMAIL;
    const password = process.env.E2E_ADMIN_PASSWORD;
    test.skip(!email || !password, "Falta E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD (cuenta administradora de prueba).");

    test.beforeEach(async ({ page }) => {
      await page.goto("/cuenta?next=/admin");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Contraseña").fill(password);
      await page.locator(".auth-panel form").getByRole("button", { name: "Ingresar" }).click();
      // Once signed in, the account page sends the administrator on to /admin.
      await page.waitForURL((url) => url.pathname === "/admin");
    });

    test("ve los pedidos y el catálogo", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 1, name: "Administración" })).toBeVisible();
      await expect(page.getByText("por entregar")).toBeVisible();
      await page.getByRole("link", { name: "Catálogo" }).click();
      await expect(page.getByRole("heading", { name: /Classic/ })).toBeVisible();
    });

    test("la API rechaza un modelo con datos inválidos", async ({ page }) => {
      const res = await page.request.post("/api/admin/models", {
        data: { line_key: "classic", model: "X", capacity_l: -5, height_cm: 100, outlet: "LAT 1\"", price_ars: 1000 },
      });
      expect(res.status()).toBe(400);
      expect((await res.json()).error).toMatch(/capacidad/i);
    });

    test("crea, edita y borra un modelo de prueba", async ({ page }, testInfo) => {
      // A name of its own, so runs on several browsers at once don't collide.
      const model = `E2E-${testInfo.project.name.slice(0, 7)}-${Date.now() % 100000}`;
      const data = { line_key: "classic", model, capacity_l: 1, diameter_cm: 1, height_cm: 1, outlet: "LAT 1\"", price_ars: 1 };
      const created = await page.request.post("/api/admin/models", { data });
      expect(created.status()).toBe(201);
      const { id } = await created.json();
      try {
        const duplicate = await page.request.post("/api/admin/models", { data });
        expect(duplicate.status()).toBe(409);

        const edited = await page.request.patch(`/api/admin/models/${id}`, { data: { price_ars: 2 } });
        expect(edited.status()).toBe(200);
        expect((await edited.json()).price_ars).toBe(2);
      } finally {
        // The test model never stays in the real catalog, even if a step above failed.
        const removed = await page.request.delete(`/api/admin/models/${id}`);
        expect(removed.status()).toBe(204);
      }
      expect((await page.request.delete(`/api/admin/models/${id}`)).status()).toBe(404);
    });
  });
});

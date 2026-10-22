import { test, expect } from "@playwright/test";

test.describe("Seguridad", () => {
  test("las páginas mandan los encabezados de seguridad", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["content-security-policy"]).toContain("object-src 'none'");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["permissions-policy"]).toContain("camera=()");
    expect(h["x-powered-by"]).toBeUndefined();
  });

  // The policy must not block anything the site itself uses (scripts, 3D, fonts, Supabase).
  for (const path of ["/", "/acero/classic", "/plastico/plast3", "/cuenta", "/checkout"]) {
    test(`la política de contenido no bloquea nada en ${path}`, async ({ page }) => {
      const violations = [];
      page.on("console", (m) => {
        if (/Content Security Policy|Content-Security-Policy/i.test(m.text())) violations.push(m.text());
      });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      expect(violations).toEqual([]);
    });
  }

  test("una contraseña incorrecta no revela si el email existe", async ({ page }) => {
    // Same message for an unknown account and for a wrong password.
    await page.goto("/cuenta");
    await page.getByLabel("Email").fill("prueba-304-cuenta-b@mailinator.com");
    await page.getByLabel("Contraseña").fill("no-es-la-contraseña");
    await page.locator(".auth-panel form").getByRole("button", { name: "Ingresar" }).click();
    await expect(page.locator(".auth-panel").getByRole("alert")).toHaveText("El email o la contraseña no son correctos.");
  });
});

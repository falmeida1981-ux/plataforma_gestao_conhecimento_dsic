import { expect, test } from "@playwright/test";

test("health check responde com a base de dados operacional", async ({ request }) => {
  const resposta = await request.get("/api/health");
  expect(resposta.status()).toBe(200);
  const corpo = await resposta.json();
  expect(corpo.bd).toBe("ok");
  expect(["ok", "atrasado", "sem-registo"]).toContain(corpo.worker);
});

test("páginas levam cabeçalhos de segurança e CSP com nonce", async ({ request }) => {
  const resposta = await request.get("/");
  const cabecalhos = resposta.headers();
  expect(cabecalhos["x-frame-options"]).toBe("DENY");
  expect(cabecalhos["x-content-type-options"]).toBe("nosniff");
  expect(cabecalhos["strict-transport-security"]).toContain("max-age=");
  expect(cabecalhos["content-security-policy"]).toMatch(/script-src 'self' 'nonce-[^']+'/);
  expect(cabecalhos["x-powered-by"]).toBeUndefined();
});

test("dashboard abre em português e a navegação leva às secções", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-PT");
  await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();

  if (isMobile) {
    await page.getByRole("button", { name: "Abrir menu" }).click();
  }
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .filter({ visible: true })
    .getByRole("link", { name: "Inventário" })
    .click();

  await expect(page).toHaveURL(/\/inventario$/);
  await expect(page.getByRole("heading", { level: 1, name: "Inventário" })).toBeVisible();
  await expect(page.getByText("Em construção")).toBeVisible();
});

test("criação rápida abre com o atalho de teclado", async ({ page, isMobile }) => {
  test.skip(isMobile, "atalho de teclado só se aplica ao desktop");
  await page.goto("/");
  await page.getByRole("heading", { level: 1 }).click();
  await page.keyboard.press("c");
  await expect(page.getByRole("menu")).toBeVisible();
  await expect(page.getByText("Criação rápida")).toBeVisible();
});

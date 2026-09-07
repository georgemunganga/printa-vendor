import { expect, test } from "@playwright/test";

test("loads the vendor frontend", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Printa/i);
  await expect(page.locator("#root")).toBeVisible();
});

test("shows the live public vendor plans", async ({ page }) => {
  await page.goto("/pricing");

  await expect(page.getByRole("heading", { name: "Pro", exact: true })).toBeVisible();
  await expect(page.getByText("K500", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Enterprise", exact: true })).toBeVisible();
  await expect(page.getByText("K1,500", { exact: true })).toBeVisible();
  await expect(page.getByText(/coming soon/i)).toHaveCount(0);
});

test("local-test proxy reaches the live API health endpoint", async ({ request }) => {
  const response = await request.get("/readyz");
  expect(response.ok()).toBe(true);

  const body = await response.json();
  expect(body).toMatchObject({
    database: "connected",
    environment: "production",
    service: "printa-api",
    status: "ready",
  });
});

test("protected vendor profile requires authentication", async ({ request }) => {
  const response = await request.get("/api/v1/vendor/profile");

  expect(response.status()).toBe(401);
  await expect(response.text()).resolves.toContain("missing Authorization header");
});

test("current user endpoint requires authentication", async ({ request }) => {
  const response = await request.get("/api/v1/users/me");

  expect(response.status()).toBe(401);
  await expect(response.text()).resolves.toContain("missing Authorization header");
});

import { expect, test, type Page } from "@playwright/test";

const installMockVendor = async (page: Page) => {
  const payload = Buffer.from(JSON.stringify({ user_id: "user-help", email: "owner@printa.test", role: "VENDOR" })).toString("base64url");
  const token = `header.${payload}.signature`;
  await page.addInitScript((accessToken) => {
    localStorage.setItem("printa_api_session_v1", JSON.stringify({ accessToken, tokenType: "Bearer" }));
    localStorage.removeItem("printa_active_store_id");
    localStorage.removeItem("printa_active_store_snapshot_v1");
  }, token);

  await page.route("**/api/v1/users/me", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ id: "user-help", email: "owner@printa.test", first_name: "Printa", last_name: "Owner", phone: "+260972827372", role: "VENDOR", created_at: "2026-01-01T00:00:00Z" }),
  }));
  await page.route("**/api/v1/vendor/profile", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ id: "vendor-help", user_id: "user-help", business_name: "Printa Test Vendor", status: "APPROVED", created_at: "2026-01-01T00:00:00Z" }),
  }));
  await page.route("**/api/v1/inventory/stores**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: "[]" }));
};

test("help search opens a matching operational article", async ({ page }) => {
  await installMockVendor(page);
  await page.goto("/dashboard/help");

  await expect(page.getByRole("heading", { name: "How can we help?" })).toBeVisible();
  await page.getByRole("searchbox", { name: "Search Printa help" }).fill("custom inventory");
  await expect(page.getByRole("link", { name: /Printa inventory and custom inventory/ })).toBeVisible();
  await page.getByRole("link", { name: /Printa inventory and custom inventory/ }).click();
  await expect(page).toHaveURL(/\/dashboard\/help\/inventory\/printa-and-custom-inventory$/);
  await expect(page.getByRole("heading", { name: "Printa inventory and custom inventory" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open inventory" })).toHaveAttribute("href", "/dashboard/inventory");
});

test("help topic and article sub-routes can be opened directly", async ({ page }) => {
  await installMockVendor(page);
  await page.goto("/dashboard/help/pos-and-receipts");

  await expect(page.getByRole("heading", { name: "POS and receipts" })).toBeVisible();
  await page.getByRole("link", { name: /Print or email a receipt/ }).click();
  await expect(page).toHaveURL(/\/dashboard\/help\/pos-and-receipts\/print-or-email-a-receipt$/);
  await expect(page.getByText("The email is sent through Printa", { exact: false })).toBeVisible();
});

test("support form sends an account-linked request with context", async ({ page }) => {
  await installMockVendor(page);
  let submitted: Record<string, string> | undefined;
  await page.route("**/api/v1/submissions/support", async (route) => {
    submitted = route.request().postDataJSON() as Record<string, string>;
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ id: "support-1", status: "NEW" }) });
  });
  await page.goto("/dashboard/support");

  await page.getByLabel("Topic *").selectOption("Inventory");
  await page.getByLabel("Subject *").fill("Stock is not visible");
  await page.getByLabel("Order, payment, or other reference").fill("ITEM-123");
  await page.getByLabel("What happened? *").fill("The custom item does not appear after refresh.");
  await page.getByRole("button", { name: "Submit support request" }).click();

  await expect(page.getByText("Support request submitted.")).toBeVisible();
  expect(submitted).toMatchObject({ topic: "Inventory", subject: "Stock is not visible" });
  expect(submitted?.message).toContain("Reference: ITEM-123");
  expect(submitted?.message).toContain("Store: No store selected");
});

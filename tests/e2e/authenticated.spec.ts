import { expect, test } from "@playwright/test";

const vendorToken = process.env.PLAYWRIGHT_VENDOR_TOKEN;
const vendorStoreId = process.env.PLAYWRIGHT_VENDOR_STORE_ID;

const installVendorSession = async (page: import("@playwright/test").Page) => {
  await page.addInitScript(({ token, storeId }) => {
    if (token) {
      window.localStorage.setItem("printa_api_session_v1", JSON.stringify({
        accessToken: token,
        tokenType: "Bearer",
      }));
    }
    if (storeId) window.localStorage.setItem("printa_active_store_id", storeId);
  }, { token: vendorToken, storeId: vendorStoreId });
};

test.describe("authenticated vendor session", () => {
  test.skip(!vendorToken, "Set PLAYWRIGHT_VENDOR_TOKEN to run authenticated production checks.");

  test("restores the vendor and stores after a browser refresh", async ({ page }) => {
    await installVendorSession(page);

    await page.goto("/dashboard/stores");
    await expect(page).toHaveURL(/\/dashboard\/stores$/);
    await expect(page.getByText("fastprinta", { exact: true }).first()).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/dashboard\/stores$/);
    await expect(page.getByText("fastprinta", { exact: true }).first()).toBeVisible();
  });

  test("loads core vendor operations without runtime or SQL errors", async ({ page }) => {
    test.skip(!vendorStoreId, "Set PLAYWRIGHT_VENDOR_STORE_ID to test store-scoped routes.");
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await installVendorSession(page);

    const routes = [
      ["/dashboard/store", "fastprinta"],
      ["/dashboard/inventory", "Inventory"],
      ["/dashboard/pos", "Point of Sale"],
      ["/dashboard/orders", "Order History"],
      ["/dashboard/settings", "Store Settings"],
      ["/dashboard/subscription", "Subscription"],
    ] as const;

    for (const [route, heading] of routes) {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(`${route.replaceAll("/", "\\/")}$`));
      await expect(
        page
          .locator("h1:visible, h2:visible")
          .filter({ hasText: new RegExp(`^${heading}$`, "i") })
          .first(),
      ).toBeVisible();
      await page.waitForLoadState("networkidle");
      await expect(page.getByText(/sql:|Something went wrong|is not defined/i)).toHaveCount(0);
    }

    expect(pageErrors).toEqual([]);
  });

  test("loads the remaining vendor workspace without server or runtime errors", async ({ page }) => {
    test.skip(!vendorStoreId, "Set PLAYWRIGHT_VENDOR_STORE_ID to test store-scoped routes.");
    const pageErrors: string[] = [];
    const serverErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("response", (response) => {
      if (response.url().includes("/api/") && response.status() >= 500) {
        serverErrors.push(`${response.status()} ${response.request().method()} ${response.url()}`);
      }
    });
    await installVendorSession(page);

    const routes = [
      "/dashboard/locations",
      "/dashboard/profile",
      "/dashboard/payment-methods",
      "/dashboard/support",
      "/dashboard/feedback",
      "/dashboard/tracking",
      "/dashboard/chat",
      "/dashboard/shift-management",
      "/dashboard/stores",
      "/dashboard/team",
      "/dashboard/notifications",
      "/dashboard/help",
      "/dashboard/help/faq",
    ] as const;

    for (const route of routes) {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(`${route.replaceAll("/", "\\/")}$`));
      await expect(page.locator("h1:visible").first()).toBeVisible();
      await page.waitForLoadState("networkidle");
      await expect(page.getByText(/sql:|Something went wrong|is not defined/i)).toHaveCount(0);
    }

    expect(pageErrors).toEqual([]);
    expect(serverErrors).toEqual([]);
  });

  test("shows reusable skeletons while vendor data is pending", async ({ page }) => {
    test.skip(!vendorStoreId, "Set PLAYWRIGHT_VENDOR_STORE_ID to test store-scoped routes.");
    await installVendorSession(page);

    await page.route("**/api/v1/notifications/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1_000));
      await route.continue();
    });
    await page.goto("/dashboard/notifications");
    await expect(page.getByLabel("Loading notifications…")).toBeVisible();
    await expect(page.getByLabel("Loading notifications…")).toBeHidden();

    await page.route("**/api/v1/orders/store/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1_000));
      await route.continue();
    });
    await page.goto("/dashboard/chat");
    await expect(page.getByLabel("Loading conversations…")).toBeVisible();
    await expect(page.getByLabel("Loading conversations…")).toBeHidden();
  });
});

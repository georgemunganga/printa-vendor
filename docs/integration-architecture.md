# Printa Vendor Integration Architecture

This app is the vendor operations frontend for print shops. It runs on Vercel in production and can run locally in `local-test` mode against the live Printa API through the Vite proxy.

## Runtime Shape

- Frontend: Vite, React, TypeScript, Tailwind, shadcn-style UI components.
- Data transport: `src/lib/api/client.ts`.
- Session storage: `src/lib/api/session.ts`.
- API contract types: `src/services/contracts.ts`.
- Domain services: `src/services`.
- Server state: TanStack Query keys/hooks in `src/query`.
- Local integration test runner: Playwright in `tests/e2e`.
- API base URL: `VITE_API_BASE_URL`.

Use `npm run dev:local-test` while integrating. In that mode `VITE_API_BASE_URL=/`, and Vite proxies `/api`, `/healthz`, and `/readyz` to `https://api.printa.co.zm`.

## Backend Contract

The live backend exposes `/api/v1/openapi.yaml`. It covers the vendor platform scope:

- Authentication: login, OTP request/verify, Google OAuth.
- Users: registration, current user, user detail.
- Vendors: onboarding, profile, policies, operating status, wallet.
- Inventory: stores, staff, store products, operating hours, delivery zones.
- Catalog: platform products.
- Orders and routing: online orders, store orders, status updates, route decisions.
- Production: jobs, queue depth, assignment, status updates.
- POS: in-store transactions and refunds.
- Billing and payments: tiers, subscriptions, invoices, mobile money checkout, payment verification.
- Notifications and communications: inbox, unread counts, comms logs, outbound messages.

## Current Auth Flow

Signup starts at `src/pages/auth/SignUp.tsx`.

1. The page calls `authService.requestOtp()` with `{ purpose: "signup", method: "email", first_name, last_name, role: "VENDOR" }`.
2. The user enters the code on `src/pages/auth/Otp.tsx`.
3. OTP verification calls `authService.verifyOtp()` with `{ challenge_id, code }`.
4. The returned JWT is stored by `apiSessionStore`.
5. `apiAuthSessionService.completeOtp()` decodes the JWT, fetches `/api/v1/users/{id}`, and tries `/api/v1/vendor/profile` for vendor users.
6. If local onboarding was completed before signup, `completePendingVendorOnboarding()` posts to `/api/v1/vendor/onboard`.

The reported `sql: no rows in result set` after OTP verification is most likely a backend auth/session edge case, not a visual frontend issue. The likely failing boundary is one of these:

- `/api/v1/auth/otp/verify` creates a token for a user row that was not created or cannot be found.
- `/api/v1/users/{id}` returns a raw database no-row error instead of a normal `404`.
- `/api/v1/vendor/profile` returns a raw database no-row error before vendor onboarding exists.
- `/api/v1/vendor/onboard` cannot find a required default tier/policy/vendor seed row.

The frontend should still keep user-facing errors clean, but the backend should not expose raw SQL errors for expected missing records.

## Integration Order

1. Auth: OTP signup/login, token restore, `/api/v1/users/me` or `/api/v1/users/{id}`, Google OAuth callback.
2. Vendor onboarding: policy acceptance, vendor profile, first store creation.
3. Store operations: store switcher, staff, operating hours, delivery zones.
4. Catalog and inventory: platform products, store products, stock, availability.
5. Orders and production: live job feed, accept/start/ready state, queue depth.
6. POS: in-store cart, transaction creation, receipts, refunds.
7. Billing and wallet: subscription, invoices, payment initiation, verification, wallet overview.
8. Notifications and comms: unread counts, read/dismiss, order conversations, admin/vendor messages.

Every feature should be integrated through `src/services` first, then connected to screens through query hooks or focused local state. Playwright tests should be added for each completed workflow.

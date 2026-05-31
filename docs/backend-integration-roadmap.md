# Backend Integration Roadmap

This app should move from mock-driven flows to live backend integration in phases.
Each phase must leave the app buildable, navigable, and shippable.

## Foundation

Status: done.

- Environment config via `VITE_API_BASE_URL`.
- Shared API transport in `src/lib/api`.
- Persisted API token session in `src/lib/api/session.ts`.
- Typed backend DTOs in `src/services/contracts.ts`.
- Domain services in `src/services`.
- React Query defaults, keys, and hooks in `src/query`.

Acceptance:

- `npm run build` passes.
- No page imports `fetch` for Printa backend calls.
- New backend calls go through services, not components.

## Phase 1: Auth

Goal: replace mock login/register/session with backend auth.

Scope:

- Login with `/api/v1/auth/login`.
- Register with `/api/v1/users/register`.
- Persist bearer token through `apiSessionStore`.
- Keep role and permission mapping at the app boundary.
- Add logout token cleanup.

Acceptance:

- Login errors surface cleanly.
- Protected routes depend on real session state.
- Refresh behavior is explicit. If backend has no refresh endpoint, do not fake one.

## Phase 2: Stores And Vendor Profile

Goal: replace mock store directory and active-store persistence with backend inventory/vendor data.

Scope:

- Store list/detail from `/api/v1/inventory/stores`.
- Store create/update flows through `inventoryService`.
- Vendor profile/onboarding through vendor endpoints.
- Active store remains local UI state, but source data comes from API.

Acceptance:

- Store switcher works across reloads.
- Empty, loading, and error states exist.
- Owner/manager/staff permissions are derived consistently.

## Phase 3: Catalog And Inventory

Goal: connect products, store products, stock, and availability.

Scope:

- Platform catalog from `/api/v1/catalog/products`.
- Store product listings from `/api/v1/inventory/stores/{store_id}/products`.
- Stock and availability mutations.

Acceptance:

- Product and inventory screens show API data.
- Mutations invalidate the correct query keys.
- Local mock product data is removed from integrated screens.

## Phase 4: Orders And Production

Goal: connect order intake, live job feed, and production lifecycle.

Scope:

- Store orders from `/api/v1/orders/store/{store_id}`.
- Order detail and status updates.
- Production jobs and queue depth.
- POS transactions where relevant.

Acceptance:

- Job feed is API-backed.
- Accept/start/ready actions persist after reload.
- Optimistic UI is used only where rollback is implemented.

## Phase 5: Notifications And Comms

Goal: connect inbox, unread count, and delivery audit visibility.

Scope:

- Notifications list/count/read/dismiss.
- Comms send and logs for admin/owner workflows.

Acceptance:

- Notification badge reflects backend unread count.
- Read/dismiss state persists.
- Unauthorized admin-only comms views fail closed.

## Phase 6: Billing And Payments

Goal: connect subscriptions, invoices, and payment status.

Scope:

- Vendor subscription views.
- Invoice list/detail/payment marking.
- Payment initiation and verification.

Acceptance:

- Billing screens are API-backed.
- Idempotency keys are used for payment/order creation.
- Payment error states are explicit and recoverable.

## Engineering Rules

- Add one backend domain at a time.
- Keep mock adapters until the replacement screen is verified.
- Do not mix raw `fetch` calls into pages or components.
- All server data must enter through `src/services` and `src/query`.
- Every mutation must define invalidation behavior.
- Every integrated screen needs loading, empty, error, and unauthorized states.

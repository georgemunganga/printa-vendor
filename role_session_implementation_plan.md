# Role Management + Session Switching Implementation Plan

## Goal
Align the app behavior with `deepseek_markdown_20260215_53569e.md`, `PRINTOS_USER_LAYER_UI_SPEC (1).md`, and `printing_vendor_web_app_feature_specification.md` for:
- multi-store context switching
- role/permission-based access
- consistent session lifecycle

## Current Baseline
- `AuthProvider` + `StoreProvider` exist.
- `ProtectedRoute` supports permission and store-selection gating.
- Store switching exists via Stores page and `/:storeName` entrypoint.
- Gaps remain in session persistence, logout consistency, and RBAC integration into nav/team.

## Phases

### Phase 1: Session Foundation (Start Now)
- [x] Add auth session persistence to local storage.
- [x] Rehydrate auth state on app load.
- [x] Ensure logout always clears auth + active store selection.
- [x] Unify sidebar/logout path to use `auth.logout()`.
- [x] Route post-auth flows to the root store hub (`/dashboard/stores`).

### Phase 2: Canonical RBAC Wiring
- [x] Define one canonical role model (`owner | manager | staff`) and permission map.
- [x] Wire nav rendering to `getNavItemsForUser(...)` instead of static arrays.
- [x] Ensure page routes enforce role/permission rules consistently.
- [x] Remove implicit "owner everywhere" assumptions from auth stubs.

### Phase 3: Store-Scoped Identity
- [ ] Represent role + permissions per store membership.
- [ ] Add `currentMembership` derivation from `activeStore`.
- [x] Expose `hasPermission` for current store context.
- [x] Enforce store assignment constraints for manager/staff switch targets.

### Phase 4: Team Management Integration
- [ ] Replace local Team mock state with shared source (context/service).
- [ ] Role selection should derive concrete permissions via role templates.
- [ ] Persist assigned stores and activation status.
- [ ] Reflect team changes immediately in access checks and nav.

### Phase 5: Session Management Features
- [ ] Implement idle timeout behavior tied to security settings.
- [ ] Add active sessions list UI + sign out other sessions actions.
- [ ] Add clear session metadata (`lastActiveAt`, `deviceLabel`) handling.

### Phase 6: API Integration Readiness
- [ ] Align frontend payload shape with backend contract in DeepSeek doc.
- [ ] Add fetch/refresh for store memberships on login and explicit refresh.
- [ ] Replace remaining local mocks for auth/store membership with API hooks.

## Immediate Next Step
Implement store-membership-level permissions (role/permissions per store, not one global role).

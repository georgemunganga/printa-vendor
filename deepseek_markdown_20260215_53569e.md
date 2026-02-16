# Store Context Switching & Role Management

## Overview

This document outlines the design for a multi‑store interface where a single user can manage multiple print shops without logging out. The user can switch between stores (like switching Facebook Pages) and see only the data and actions allowed by their role in that store. The two primary roles are **Owner** (full access) and **Staff** (with custom permissions defined per store). The frontend (React) manages context switching and permission checks, while the backend provides the user's stores and permissions.

---

## Core Concepts

- **User** – One account that can be associated with many stores.
- **Store** – A tenant (print shop) with its own orders, inventory, settings, etc.
- **Role** – The user's relationship to a store:
  - **Owner** – Has all permissions; can manage staff and store settings.
  - **Staff** – Has a set of permissions assigned by the Owner. Each store can have multiple staff roles (e.g., "Cashier", "Production Manager"), and each staff member is assigned a role.
- **Context** – The currently active store (or "no store" – the root user hub).
- **Permissions** – Fine‑grained abilities (e.g., `canViewOrders`, `canProcessPayments`, `canManageInventory`).

When a user logs in, the backend returns:
- User profile information.
- A list of stores the user has access to, along with their role and (for staff) the specific permissions.

---

## User Flow

1. **Login** – User lands on the **root hub** (personal dashboard). Here they see all their stores, profile settings, subscription info, and an option to add a new store (if they are an Owner somewhere).
2. **Switching to a Store** – User clicks on a store card or uses a dropdown in the header. The UI switches to that store's context.
   - The header now shows the store name and logo.
   - The navigation menu changes to store‑specific pages: Dashboard, Orders, Inventory, POS, Reports, Settings (if Owner).
   - All displayed data belongs to that store only.
3. **Working in a Store** – Based on the user's role, certain actions may be hidden or disabled.
4. **Returning to Root** – User clicks "Back to all stores" or selects the root option from the switcher. They are back to the personal hub.
5. **Logout** – Ends the session.

---

## Frontend State Management

The React app needs to keep track of two main global states:

- **Authentication state** – Who is the user, and what stores do they have access to?
- **Current store context** – Which store (if any) is active, and what permissions does the user have in that store?

These should be managed using **React Context** (or a lightweight state library like Zustand). Two contexts are recommended:

- **AuthContext** – Holds the user object and the list of stores (fetched after login). Provides functions to refresh the store list.
- **StoreContext** – Holds the currently active store and the permissions for that store. Provides a `hasPermission(permissionName)` function that returns `true`/`false` based on the role (Owner always returns `true`). Also provides a `switchStore(store)` function to change context.

When the user switches store, the app may update the URL (optional) and refetch any store‑specific data.

---

## Data Structures (from API)

After login, the backend should respond with a payload similar to:

```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "stores": [
    {
      "id": 101,
      "name": "Downtown Print",
      "role": "owner",
      "permissions": null   // Owner has all, so no explicit list needed
    },
    {
      "id": 102,
      "name": "Suburban Copy",
      "role": "staff",
      "permissions": {
        "canViewOrders": true,
        "canProcessOrders": true,
        "canManageInventory": false,
        "canUsePOS": true,
        "canViewReports": false
      }
    }
  ]
}
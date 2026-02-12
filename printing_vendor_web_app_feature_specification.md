# Printing Vendor Web App – Feature Specification

## Purpose
This document defines **features, workflows, and permissions** for the **Printing Vendor Web App**. It translates business policy into **buildable product modules** for engineering and design teams.

The vendor app is an **operations console**, not a storefront.

---

## 1. Core Design Principles (Non-Negotiable)
- Vendors do NOT set customer prices
- Vendors do NOT choose customers
- Vendors manage **capacity, execution, and reliability**
- Everything optimizes for **speed, predictability, and low cognitive load**

Think: **fast‑food kitchen screen, not e‑commerce admin**.

---

## 2. Onboarding & Vendor Setup

### 2.1 Vendor Registration
Required:
- Business name
- Primary contact (phone/email)
- Physical location (pin + zone)
- Operating hours
- Initial subscription tier (CORE default)

Optional (can be completed later):
- Logo
- Secondary contacts

### 2.2 Verification Workflow
- Admin approval required before first live job
- Upload:
  - Business ID (optional by market)
  - Sample print photos (quality proof)

Vendor state:
- Pending → Active → Suspended

---

## 3. Authentication & Access Control

### 3.1 Auth Methods
- Email + password
- Phone + OTP (preferred in African markets)

### 3.2 Role-Based Access Control (RBAC)
Roles:
- Owner
- Manager
- Staff

Permissions configurable per role:
- Accept jobs
- Mark production stages
- View reports
- Manage assets
- Manage employees

---

## 4. Live Jobs Management (CRITICAL MODULE)

### 4.1 Job Feed (Kitchen Screen)
Real-time job queue with states:
- New
- Accepted
- In Production
- Ready for Dispatch
- Dispatched
- Completed

Displayed per job:
- Product type
- Quantity
- Deadline
- SLA timer
- File preview
- Special instructions

### 4.2 Job Actions
- Accept / Reject (with reason)
- Start Production
- Mark Ready
- Flag Issue

Rules:
- Jobs auto-timeout if not accepted
- Repeated rejects affect vendor score

---

## 5. Customer Communication (Controlled Chat)

### 5.1 Chat Scope
- Job-specific chat only
- No off-platform contact details exposed

Allowed:
- Clarifications
- File questions
- ETA updates

Not allowed:
- Price negotiation
- Payment discussions

### 5.2 Platform Moderation
- Chat logged
- Admin can audit conversations

---

## 6. Store & Sales Management

### 6.1 Sales Dashboard
Metrics:
- Jobs completed (daily / weekly / monthly)
- Earnings summary
- Job success rate
- SLA compliance

### 6.2 Sales Records (Manual Bookkeeping)
- Simple ledger view
- Export CSV / PDF
- Filter by date, product, status

Note:
This is **reference accounting**, not official taxation software.

---

## 7. Employee Management

### 7.1 Employee Records
- Name
- Role
- Contact info
- Active / inactive status

### 7.2 Permissions
- Assign job actions per role
- Activity logging per employee

---

## 8. Asset Management

### 8.1 Asset Types
- Printers
- Computers
- Heat press / cutters

### 8.2 Asset Fields
- Type
- Model
- Capability (color/B&W, size)
- Status: Active / Offline / Maintenance

### 8.3 Capacity Impact
- Routing engine reads asset status
- Offline assets reduce job eligibility

---

## 9. Services & Capability Configuration

### 9.1 Product Enablement
Vendors select:
- Printable products
- Print methods supported
- Max sizes
- Materials supported

These settings:
- Control job eligibility
- Must be accurate (penalized if abused)

---

## 10. Availability & Online Status

- Go Online / Offline toggle (plus additional floating button to go offline or online any time)
- Offline vendors receive no new jobs
- Scheduled downtime supported

Rules:
- Frequent toggling affects routing trust score

---

## 11. Payment & Payout Settings

### 11.1 Payout Preferences
- Mobile money
- Bank transfer

### 11.2 Visibility
- View payout schedule
- View completed payouts

Vendors cannot change payout rules, only destinations.

---

## 12. Settings & Preferences

- Notification preferences (SMS, email, in-app)
- Language
- Password reset
- Security (logout all devices)

---

## 13. Reporting & Performance Score

### 13.1 Vendor Health Score
Visible metrics:
- On-time rate
- Reprint rate
- Acceptance rate

Score impacts:
- Routing priority
- Tier eligibility

---

## 14. Error Handling & Disputes

- Job issue reporting
- System vs vendor fault tagging
- Admin resolution workflow

---

## 15. Non-Features (Important)

The vendor app will NOT include:
- Customer browsing
- Customer price editing
- Marketing tools
- Discounting
- Direct payments

---

## 16. Mental Model for Builders

This app should feel like:
> A factory control panel

Not:
> An online shop backend

If a feature adds cognitive load without reducing uncertainty, it should not be built.


# Migration TODO Plan
This document tracks the high-level migration work required to convert the existing customer-facing React app into the **Printing Vendor Web App** described in `printing_vendor_web_app_feature_specification.md`. Dashboard layout and navigation components (`DashboardLayout`, `DashboardSidebar`, `MobileBottomNav`) remain as the base chrome; every new view should live inside that shell unless explicitly noted otherwise.

## 1. Onboarding & Access Control
- Build vendor registration pages that collect business name, primary contact, location (pin + zone), operating hours, and tier selection; include optional logo/secondary contacts and an upload step for business IDs and sample prints.
- Implement a verification workflow (Pending → Active → Suspended) with admin approval gate before a vendor can receive jobs.
- Extend `auth-context` or a new context to model Owner / Manager / Staff roles and the permissions outlined in section 3.1/3.2 (accept jobs, production stages, reports, assets, employees).

## 2. Live Job Operations
- Replace the customer job list with a job feed (kitchen screen) showing SLA timers, product/quantity/deadline info, file previews, instructions, and current state (New → Accepted → In Production → Ready for Dispatch → Dispatched → Completed).
- Implement vendor actions per spec: Accept/Reject (with mandatory reason), Start Production, Mark Ready, Dispatch, Flag Issue; enforce auto-timeout/repeated reject rules.
- Reuse `OrderCard`, job detail page, and `mockOrders` data as a foundation, but reshape the data model to include SLAs, assigned assets, flags, and dispatch metadata.
- Keep `DashboardLayout`, `DashboardSidebar`, and `MobileBottomNav` unchanged as requested.

## 3. Communication, Assets, & Employee Management
- Adapt the chat module to be job-scoped, log conversations for moderation, and prevent price/payment discussions (Sec. 5); add admin view for flagged conversations.
- Build asset management views covering printers/computers/presses with fields (type, model, capability, status) and an impact indicator for capacity/routing (Sec. 8).
- Create employee records view capturing name, role, contact, status plus per-role permissions and activity logs as described in section 7.

## 4. Services, Availability, & Payouts
- Develop a capability configuration screen so vendors can toggle supported products, methods, sizes, and materials, feeding into job eligibility.
- Add availability/online status toggle with scheduled downtime controls and a trust-score impact for frequent switching (Sec. 10).
- Replace customer payment methods UI with vendor payout settings (mobile money, bank transfer) that display schedule/completed payouts and prevent rule edits.

## 5. Reporting, Disputes, & Health
- Surface performance metrics (jobs completed, earnings, SLA compliance) as described in sections 6 and 13, and compute a vendor health score from on-time/reprint/acceptance rates.
- Implement error handling/dispute workflows with tagging (system vs vendor) and a path for admin resolution (Sec. 14).
- Capture all major QA/monitoring hooks so the migration can be validated.

## 6. Next Steps
1. Define the domain model (jobs, assets, employees, roles, payouts) and update `mock` data to match.
2. Layer the new vendor views/components inside the existing dashboard shell.
3. Run visual and behavior checks; integrate with real APIs once the MVP flow is set.

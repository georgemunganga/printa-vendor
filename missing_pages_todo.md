# Missing Pages TODO
This list tracks the **missing vendor-facing pages** we still need to build so the React app fully matches `printing_vendor_web_app_feature_specification.md`. Each entry references the spec section it satisfies.

## 1. Onboarding & Access Control (Spec Sec. 2 & 3)
- Vendor registration + verification wizard (collect business name, location/pin & zone, operating hours, subscription tier, optional logo/secondary contacts, uploads for ID/sample prints; show Pending → Active → Suspended state).  
- Role & permissions editor (Owner / Manager / Staff, toggle permissions for job actions, reports, assets, employees) so RBAC is enforced before producers touch jobs.

## 2. Live Job Operations (Spec Sec. 4 & 5)
- Kitchen job feed detail view showing SLA timers, file previews, special instructions, accept/reject with reason, start production, mark ready, dispatch, flag issues. (Currently have job feed but need richer cell view + reject/flag flows.)
- Job chat moderation audit page (displays job-scoped transcripts + moderator actions, logs no-price/payment rule enforcement).

## 3. Asset, Employee & Capability Management (Spec Sec. 7‑9)
- Asset inventory page (printers, cutters, presses) with fields for type/model/capability/status and maintenance impact on routing.  
- Employee directory + permission matrix (contacts, roles, active/inactive, activity log).  
- Capability/configuration page (supported products, print methods, max sizes, materials) that feeds into job eligibility rules.

## 4. Availability, Payouts & Reporting (Spec Sec. 10‑13)
- Availability/status scheduling screen with offline toggle, scheduled downtime, trust-score warnings for frequent toggling.  
- Payout dashboard (destinations, schedule, completed payouts, inability to edit payout rules).  
- Reporting/health score panel (on-time rate, reprint rate, acceptance rate, earnings, SLA compliance) plus exportable KPIs.

## 5. Disputes & Error Handling (Spec Sec. 14)
- Job dispute queue that tags system vs vendor faults, allows vendor notes, surfaces admin resolution stages, and links to logs.

## Next Steps
1. Prioritize this list with your team (start with Sec. 2/3 onboarding + RBAC).  
2. Build each page inside the existing dashboard shell so the global chrome stays consistent.  
3. Wire actions into `JobContext` or new contexts so each page reflects live state instead of static mocks.

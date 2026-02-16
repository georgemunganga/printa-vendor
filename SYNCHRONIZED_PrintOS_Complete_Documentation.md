# PrintOS: Vendor Operating System for Distributed Print Fulfillment

**Version**: 2.0 (Synchronized)  
**Platform Type**: Distributed Operations & Fulfillment Infrastructure (DOFI) for printing  
**Last Updated**: February 15, 2026  
**Status**: Aligned with all clarifications

---

## Table of Contents

1. [Executive Overview](#executive-overview)
2. [Platform Identity & Governance](#platform-identity--governance)
3. [Vendor Tier System](#vendor-tier-system)
4. [Vendor Pricing Model](#vendor-pricing-model)
5. [Vendor Onboarding Journey](#vendor-onboarding-journey)
6. [Core Features & Infrastructure](#core-features--infrastructure)
7. [Job Routing & Fairness](#job-routing--fairness)
8. [Vendor Performance Metrics](#vendor-performance-metrics)
9. [Order Lifecycle & Quality Control](#order-lifecycle--quality-control)
10. [Delivery Integration](#delivery-integration)
11. [Reporting & Analytics](#reporting--analytics)
12. [Admin Configuration](#admin-configuration)
13. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Overview

### What is PrintOS?

PrintOS is the **vendor-side operating system** for the Printa ecosystem. It is part of a three-component platform:

| Component | Purpose | User |
|-----------|---------|------|
| **app.printa.co.zm** | Customer app where users design, customize, and order prints | Customers |
| **printa.co.zm** | Customer web marketplace for browsing and ordering | Customers |
| **PrintOS** | Vendor dashboard for managing orders, production, and operations | Print vendors |

### The DOFI Model

PrintOS operates as a **Distributed Operations & Fulfillment Infrastructure**, not a traditional marketplace. This means:

**Platform Controls**: Order lifecycle, quality guarantees, delivery orchestration, vendor routing logic, pricing guardrails

**Vendors Control**: Their machines, their execution quality, their production capacity, **their pricing (within guardrails)**

**Vendors Are**: Capacity providers, not independent sellers. They subscribe to PrintOS to access a steady stream of orders.

### The Operating System Doctrine

> "Vendors are subscribers to an operating system. The platform replaces uncertainty. Volume and reliability create inevitability. Any feature that violates this doctrine must not be built."

This means PrintOS must optimize for:
1. **Predictability** over speed
2. **Transparency** over opacity
3. **Fairness** over optimization
4. **Reliability** over margin

---

## Platform Identity & Governance

### What the Platform Owns

The platform (Printa) exclusively controls:
- **Order Lifecycle**: All stages from upload to delivery
- **Quality Guarantees**: SLAs and quality standards
- **Delivery Orchestration**: Zone-based delivery routing
- **Vendor Routing Logic**: Deterministic algorithm based on geography, tier, capacity, quality
- **Pricing Guardrails**: Min/max price bands per product

### What Vendors Own

Vendors exclusively control:
- **Their Machines**: Equipment, maintenance, upgrades
- **Their Execution Quality**: How well they produce jobs
- **Their Staff**: Hiring, training, management
- **Their Capacity**: How many jobs they can accept
- **Their Pricing**: Price within platform guardrails
- **Their Catalog**: Which products they offer

### Vendor Autonomy

Vendors **can**:
- Set their own prices (within platform guardrails)
- Choose which products to offer
- Accept or reject orders (within tier limits)
- Customize their production workflow
- Set their working hours and capacity limits
- Manage their team and production workflow
- Maintain consistent pricing across online and walk-in channels

Vendors **cannot**:
- Price outside the platform guardrails
- Negotiate directly with customers about pricing
- Skip quality control steps
- Miss delivery handoff SLAs without penalty

---

## Vendor Tier System

PrintOS has three distinct vendor tiers, each designed for different business models and commitment levels.

### CORE Tier (Entry Level)

**Purpose**: Onboarding, quality verification, risk containment

**Subscription**: Admin-configurable monthly fee (default: K0 or low fee)

**Characteristics**:

| Feature | Details |
|---------|---------|
| **Job Volume** | Strict limits (admin-configurable, e.g., 10-20 jobs/day) |
| **Product Categories** | Limited (admin-configurable, e.g., A4 prints, basic items) |
| **Routing Priority** | Standard (lowest priority) |
| **SLA Guarantees** | None |
| **Reprint Responsibility** | Vendor bears cost |
| **Features Available** | Basic job queue, simple reporting |
| **Order Rejection Limit** | Admin-configurable (e.g., 20% of offered orders) |

**Use Case**: New vendors testing the platform, small shops with limited capacity, vendors with inconsistent quality

---

### PRO Tier (Default Operating Tier)

**Purpose**: Sustainable daily operations, reliable capacity allocation

**Subscription**: Admin-configurable monthly fee (default: K150)

**Characteristics**:

| Feature | Details |
|---------|---------|
| **Job Volume** | Higher ceiling (admin-configurable, e.g., 50-100 jobs/day) |
| **Product Categories** | Full catalog (mugs, shirts, banners, custom items) |
| **Routing Priority** | Priority (based on geography, health score) |
| **SLA Guarantees** | Yes (2-hour handoff SLA) |
| **Reprint Responsibility** | Vendor bears cost |
| **Features Available** | Advanced reporting, performance dashboard, bulk operations |
| **Order Rejection Limit** | Admin-configurable (e.g., 10% of offered orders) |

**Use Case**: Established vendors with consistent quality, medium-sized shops, vendors committed to the platform

---

### ENTERPRISE Tier (High-Capacity Partners)

**Purpose**: High-capacity industrial partners with guaranteed volumes

**Subscription**: Admin-configurable contract-based pricing

**Characteristics**:

| Feature | Details |
|---------|---------|
| **Job Volume** | Guaranteed minimum volumes (admin-configurable per contract) |
| **Product Categories** | Full catalog + custom products |
| **Routing Priority** | Dedicated routing logic (admin-configurable) |
| **SLA Guarantees** | Custom SLAs per contract |
| **Reprint Responsibility** | Vendor bears cost |
| **Features Available** | API access, batch upload, custom integrations, dedicated support |
| **Order Rejection Limit** | Admin-configurable per contract |

**Use Case**: Large print shops, industrial partners, vendors with specialized capabilities

---

### Subscription Policy

**Key Principles**:

1. **Access, Not Guarantee**: Subscriptions grant access to infrastructure and routing priority, not guaranteed job volumes
2. **Flexibility**: Vendors can upgrade/downgrade anytime without lock-in contracts
3. **Earnings Protection**: Direct customer payments are always received by vendors
4. **Fee Transparency**: Subscription fees are clearly stated and admin-configurable
5. **Anti-Churn**: CORE tier always available as a downgrade option

---

## Vendor Pricing Model

### Hybrid Pricing with Guardrails

Printa uses a **hybrid pricing model** that balances vendor autonomy with platform control.

**How It Works**:

1. **Platform Sets Guardrails**: Admin defines min/max price bands for each product
   - Example: Business cards: K35 (min) to K60 (max)
   - Guardrails prevent price gouging and unsustainable pricing

2. **Vendors Set Their Price**: Vendors choose their price within the guardrails
   - Vendor A sets: K50
   - Vendor B sets: K40
   - Both are within guardrails (K35-K60)

3. **Customer Sees Vendor Price**: When a customer orders, they see the price of the vendor who fulfills their order
   - If routed to Vendor A: Customer sees K50
   - If routed to Vendor B: Customer sees K40

4. **Vendor Receives Their Price**: Vendor receives payment at delivery/collection
   - Vendor A receives: K50
   - Vendor B receives: K40

### Why This Model Works

**For Vendors**:
- Autonomy over pricing within guardrails
- Can maintain consistent pricing across online and walk-in channels
- Protects existing customer relationships
- Allows margin management

**For Platform**:
- Control through guardrails prevents market disruption
- Transparency in pricing
- Flexibility to adjust guardrails per market

**For Customers**:
- Fair, transparent pricing
- No hidden fees
- Consistency across vendors

### Admin Configuration

**Guardrail Management**:
- Admin sets min/max prices per product
- Admin can adjust guardrails based on market conditions
- Admin can set different guardrails per tier (if needed)
- Admin can set different guardrails per geographic region (if needed)

**Vendor Pricing Constraints**:
- Vendors cannot price below minimum (K35)
- Vendors cannot price above maximum (K60)
- System enforces guardrails at point of catalog setup

---

## Vendor Onboarding Journey

Vendor onboarding is structured in four phases to ensure quality and set expectations.

### Phase 1: The Profile (Business Setup)

**Goal**: Establish vendor identity and operational structure

**Required Information**:

1. **Business Details**
   - Business name and registration number
   - Tax ID and legal structure
   - Primary contact and communication preferences
   - Business hours (with timezone)
   - Service area (geographic zones)

2. **Store Setup**
   - Physical store location(s)
   - Store-specific hours
   - Store capacity (jobs/day)
   - Store specializations (what they can print)

3. **Staff Management**
   - Add team members with role assignments
   - Define working hours and shifts
   - Set up approval workflows

4. **Equipment Registry**
   - List all machines (brand, model, year)
   - Tag capabilities (color, large-format, lamination, binding)
   - Set maintenance schedules

**Outcome**: Vendor assigned to CORE tier; ready for quality verification

---

### Phase 2: The Catalog (Product Capabilities & Pricing)

**Goal**: Define what the vendor can produce and at what price

**Required Steps**:

1. **Product Selection**
   - Select which products they offer (from platform catalog)
   - For each product, define options (sizes, materials, finishes)
   - Set production time estimates
   - Specify raw materials required

2. **Pricing Setup**
   - For each product, set vendor's price within guardrails
   - Example: Business cards (guardrail: K35-K60) → Vendor sets K50
   - System enforces guardrails (prevents pricing outside range)
   - Vendor can have different prices per store location

3. **Specialization Tags**
   - Mark specializations (e.g., "Large Format," "High-Volume," "Custom Design")
   - These tags inform the routing engine

4. **Capacity Declaration**
   - Maximum jobs per day
   - Maximum jobs per machine
   - Blackout dates (when unavailable)

**Outcome**: Vendor catalog is live with pricing; customers can see what they offer

---

### Phase 3: The Queue (Production Workflow)

**Goal**: Set up job management and quality control

**Required Setup**:

1. **Workflow Configuration**
   - Define job statuses: Received → Proof Review → Printing → Quality Check → Dispatch → Delivery
   - Set up barcode/QR scanning for tracking
   - Configure notifications

2. **Quality Checkpoints**
   - Define QC steps (after printing, after binding, before dispatch)
   - Assign QC staff
   - Create inspection checklists

3. **Approval Routing**
   - Who approves proofs
   - Who marks jobs complete
   - Who handles customer communication

**Outcome**: Vendor can receive and manage orders

---

### Phase 4: The Money (Payment Setup)

**Goal**: Set up payment processing for customer payments

**Required Steps**:

1. **Payment Processing**
   - Connect payment method for receiving customer payments
   - Verify identity and payment details
   - Set tax information

2. **Payment Preferences**
   - Select payment method (bank transfer, mobile money, etc.)
   - Understand payment processing details
   - Review fee schedule (if any)

3. **Financial Visibility**
   - Access to earnings dashboard
   - Understand payment flow
   - Tax reporting setup

**Outcome**: Vendor is ready to receive customer payments; first order can be processed

---

## Core Features & Infrastructure

### Multi-Store Dashboard

Vendors with multiple locations see a unified dashboard showing:
- All stores with key metrics (jobs today, revenue, pending tasks)
- Quick toggle between stores
- Unified notifications across all locations
- Ability to set store-specific pricing and capacity

### Role-Based Access Control (RBAC)

PrintOS supports multiple user roles within a vendor account. **Roles are admin-configurable** and may include:
- **Owner**: Full access to all features and settings
- **Manager**: Can manage orders, staff, and reporting
- **Staff**: Can accept orders and update job status
- **Accountant**: Can view financial reports and payment status

Each role has specific permissions that can be customized by the vendor.

### Job Queue Management

The production queue is a visual Kanban board showing:
- **Queue (New)**: Orders waiting to be accepted
- **Pre-Press**: Jobs being prepared
- **Printing**: Jobs on press
- **Finishing**: Jobs being finished (binding, etc.)
- **Ready for Pickup**: Jobs completed and waiting for delivery

Vendors drag and drop jobs between columns to update status. Customers are automatically notified of status changes.

### Vendor Dashboard Views

**The "Cash" View**:
- Net earnings (from customer payments)
- Pending payments
- Payment history

**The "Flow" View**:
- Orders received vs. completed (last 7 days)
- On-time completion rate
- Average turnaround time

**The "Health" View**:
- Current Health Score
- Quality metrics (reprint rate, failure rate)
- Capacity utilization

---

## Job Routing & Fairness

### Routing Algorithm

Jobs are routed using a **deterministic algorithm** that prioritizes:

1. **Geographic Proximity** (Primary Factor)
   - System finds vendors within service area
   - Prioritizes vendors closest to delivery location

2. **Vendor Tier** (Secondary Factor)
   - PRO and ENTERPRISE tiers have higher priority than CORE
   - Ensures reliable vendors get more orders

3. **Capacity Availability** (Tertiary Factor)
   - Vendor must have available capacity
   - System tracks real-time capacity

4. **Health Score / Quality** (Quaternary Factor)
   - Vendors with higher health scores get priority
   - Ensures quality vendors get more orders

5. **Machine Compatibility** (Final Check)
   - Vendor must have equipment to produce the product
   - Ensures job can be completed

**Deterministic Principle**: Same inputs always produce the same output. No randomness. Vendors can predict routing.

**Transparency**: Vendors can see the routing factors and understand why they did or didn't get an order.

---

## Vendor Performance Metrics

### Health Score

Each vendor has a continuously updated **Health Score** that affects routing priority.

**Components** (5 metrics, equal weighting):

| Metric | Target | Calculation |
|--------|--------|-------------|
| **On-Time Completion Rate** | 95%+ | % of jobs completed by SLA |
| **Reprint Rate** | <5% | % of jobs requiring reprints |
| **Failure Rate** | <2% | % of jobs marked as failed |
| **Capacity Accuracy** | 95%+ | % of capacity claims met |
| **Delivery Handoff Rate** | 98%+ | % of jobs handed off on time |

**Calculation**: Simple average of 5 metrics
- Health Score = (Metric1 + Metric2 + Metric3 + Metric4 + Metric5) / 5

**Score Ranges**:
- **90-100**: Excellent (priority routing)
- **80-89**: Good (standard routing)
- **70-79**: Fair (reduced routing priority)
- **Below 70**: Poor (restricted to CORE tier, may be suspended)

**Continuous Monitoring**: Health Score is updated daily based on jobs completed in last 30 days.

---

## Order Lifecycle & Quality Control

### Enforced Order Lifecycle

All orders follow a **single enforced lifecycle**. Vendors cannot skip stages:

| Stage | Owner | Action |
|-------|-------|--------|
| 1. **File Upload & Validation** | Platform | Customer uploads file; system validates format, resolution, fonts |
| 2. **Pricing Lock** | Platform | Customer price is locked; cannot change |
| 3. **Vendor Assignment** | Platform | Routing engine assigns to best vendor |
| 4. **Production** | Vendor | Vendor produces the job |
| 5. **Quality Check** | Vendor | Vendor inspects and approves |
| 6. **Dispatch** | Vendor | Vendor packages and hands off to delivery |
| 7. **Delivery Confirmation** | Delivery | Delivery partner confirms delivery to customer |
| 8. **Settlement** | Platform | Customer payment is processed |

**Key Rule**: Vendors cannot skip stages. If a job fails QC, it must be reprinted or marked as failed.

### Quality Control Workflow

**QC Checkpoints**:
- After printing (color accuracy, alignment)
- After binding (if applicable)
- Before dispatch (final inspection)

**QC Process**:
1. Vendor inspects job against checklist
2. Takes photo of completed job
3. Marks as "Pass" or "Fail"
4. If fail: logs defect reason (machine jam, color mismatch, etc.)
5. If fail: reprints or marks as failed job

**Defect Tracking**:
- Logged by reason (jam, color, alignment, etc.)
- Tracked per machine
- Tracked per staff member
- Analyzed for trends

**Photo Requirement**:
- Mandatory photo of completed job before dispatch
- Protects vendor from false claims
- Visible to customer before pickup
- Stored for dispute resolution

**Reprint Responsibility**:
- **Vendor Error**: Vendor bears cost of reprints
- **System Error**: Platform absorbs cost
- **Customer Satisfaction**: Vendor responsible for quality

---

## Delivery Integration

### Zone-Based Delivery Pricing

**Key Principle**: Delivery pricing is **zone-based**, not distance-based.

The platform divides the service area into zones (e.g., Central, North, South, East, West). Each zone has a fixed delivery fee set by the platform.

**Vendor Constraints**:
- Vendors do NOT negotiate delivery fees
- Vendors do NOT set delivery pricing
- Vendors must package jobs per platform standards
- Vendors must handoff orders within SLA

### Delivery Handoff SLA

**SLA Requirement**: Vendors must hand off completed orders within **2 hours** of completion.

**Applies To**: All tiers, all product types

**Penalty for Missing SLA**: 
- Vendor receives warning
- Vendor may not receive similar orders in future
- Affects Health Score

### Delivery Failure Categorization

Delivery failures are categorized to determine responsibility:

| Category | Cause | Resolution |
|----------|-------|-----------|
| **Vendor-Caused** | Vendor packaged wrong, late handoff, wrong address | Vendor bears cost |
| **Rider-Caused** | Delivery partner lost package, damaged goods | Delivery partner bears cost |
| **Platform-Caused** | Wrong address in system, pricing error | Platform absorbs cost |

---

## Reporting & Analytics

### Essential Reports

#### Financial Reports

**Sales Summary** (Daily/Weekly/Monthly):
- Total revenue from jobs
- Number of jobs completed
- Average job value
- Trend vs. previous period

**Payment Status**:
- Gross job revenue
- Subscription fee (if applicable)
- Payment processing fees (if applicable)
- Net earnings
- Payment status

#### Operational Reports

**Order Status Funnel**:
- Visual breakdown: Received → Proof → Printing → QC → Ready
- Identifies bottlenecks (e.g., "10 jobs stuck in Proof Review")

**Turnaround Time**:
- Average time from order to ready
- By product type
- Trend over time

**Peak Hours**:
- Heatmap of when orders arrive
- Helps with staff scheduling

#### Quality Reports

**Defect Analysis**:
- Defects by reason (jam, color, alignment)
- Defects by machine
- Defects by staff member
- Trend analysis

**Reprint Rate**:
- Percentage of jobs requiring reprints
- Reasons for reprints
- Cost of reprints

#### Customer Reports

**Top Customers**:
- Repeat customers and lifetime value
- New vs. returning customer split
- Customer acquisition source

**Order Rejection Report**:
- Why vendor rejected orders
- Percentage of orders rejected
- Trend

---

## Admin Configuration

### Admin Dashboard

PrintOS includes an **Admin Dashboard** for platform administrators to configure business rules. **Most business rules are admin-configurable**, not hardcoded.

### Configurable Settings

| Setting | Description | Example |
|---------|-------------|---------|
| **Pricing Guardrails** | Min/max price per product | Business cards: K35-K60 |
| **Subscription Fees** | Monthly fee per tier | PRO: K150 |
| **Tier Definitions** | Features and limits per tier | CORE: 10-20 jobs/day |
| **Job Volume Limits** | Max jobs per day per tier | PRO: 50-100 jobs/day |
| **Order Rejection Limits** | Max rejection % per tier | PRO: 10% of offered orders |
| **Health Score Targets** | Target metrics for health | On-time: 95%+ |
| **Delivery SLA** | Handoff time requirement | 2 hours |
| **Routing Weights** | Priority order for routing | Geography → Tier → Capacity |
| **Product Catalog** | Available products and categories | Mugs, shirts, banners, etc. |
| **Delivery Zones** | Geographic zones and fees | Central, North, South, etc. |

### Why Admin Configuration Matters

- **Flexibility**: Business rules can be adjusted without code changes
- **Market Adaptation**: Different rules for different markets/regions
- **A/B Testing**: Test different configurations
- **Scalability**: Add new tiers, products, zones without development

---

## Implementation Roadmap

### Phase 1: MVP (Months 1-3)

**Goal**: Get vendors onboarded and receiving orders

**Features**:
- Vendor registration and tier assignment (CORE only)
- Multi-store dashboard
- RBAC (4 roles, admin-configurable)
- Job queue management (Kanban board)
- Hybrid pricing with guardrails
- Order acceptance/rejection
- Basic routing (geography + capacity)
- Quality control workflow with photo capture
- Essential reports (sales, top customers)
- Admin dashboard for basic configuration

**Success Metrics**:
- 50 vendors onboarded
- 1,000 orders/week
- 95%+ on-time completion

---

### Phase 2: Operational Excellence (Months 4-6)

**Goal**: Add features that help vendors operate efficiently

**Features**:
- Production scheduling and capacity planning
- Machine/equipment management
- Health Score system
- PRO tier launch
- Advanced routing (quality score + geography)
- Defect tracking and analysis
- Customer communication hub
- Inventory tracking (raw materials)

**Success Metrics**:
- 150 vendors (50% in PRO tier)
- 5,000 orders/week
- 20% improvement in on-time completion
- 15% improvement in quality scores

---

### Phase 3: Financial Intelligence (Months 7-9)

**Goal**: Help vendors understand profitability

**Features**:
- Detailed cost tracking (materials + labor + overhead)
- Profitability analysis by product/customer
- Supplier management and PO integration
- Advanced financial reports
- Accounting software integrations (QuickBooks, Xero)

**Success Metrics**:
- 250 vendors
- 10,000 orders/week
- Vendors report 25% better understanding of profitability

---

### Phase 4: Scale & Optimization (Months 10-12)

**Goal**: Optimize for growth and handle edge cases

**Features**:
- ENTERPRISE tier launch
- API access for bulk uploads
- Custom quote workflow
- Multi-location resource sharing
- Advanced analytics (predictive, ML-based)
- Dispute resolution system
- Vendor rating system
- Rush/priority order handling

**Success Metrics**:
- 500+ vendors
- 50,000+ orders/week
- 4.5+ star vendor rating
- 98%+ platform uptime

---

## Critical Features (Aligned with Business Model)

Based on the DOFI model, the following features are **critical** and must be built:

### 1. Health Score System
A continuously updated metric affecting routing priority. Must include: on-time rate, reprint rate, failure rate, capacity accuracy, delivery handoff rate (simple average, equal weighting).

### 2. Deterministic Routing Algorithm
The routing engine must be deterministic, auditable, and vendor-visible. Must consider: geography (primary), tier, capacity, quality, machine compatibility.

### 3. Vendor Tier Management
System to manage CORE, PRO, and ENTERPRISE tiers with different features, pricing, and routing priority.

### 4. Hybrid Pricing with Guardrails
Vendors set their own prices within platform-defined min/max guardrails. Admin controls guardrails, not individual prices.

### 5. Quality Control Workflows
Mandatory QC checkpoints with photo capture, defect logging, and vendor responsibility for reprints.

### 6. Machine/Equipment Management
Vendors register equipment with capabilities; system uses this for routing decisions.

### 7. Production Scheduling
Visual calendar showing job timeline, capacity, and bottlenecks.

### 8. Admin Configuration Dashboard
System for admins to configure pricing guardrails, subscription fees, tier definitions, routing weights, and other business rules.

---

## Engineering Principles

All features must optimize for:

1. **Predictability over Speed**: Vendors need to know what to expect, not surprise changes
2. **Transparency over Opacity**: Routing logic, pricing, and operations must be visible
3. **Fairness over Optimization**: Don't optimize for platform margin at vendor expense
4. **Reliability over Margin**: System uptime and vendor protection matter more than profit

---

## Conclusion

PrintOS is a **vendor operating system** that replaces uncertainty with predictability. By combining a fair tier system, deterministic routing, transparent pricing, and continuous performance feedback, PrintOS creates an environment where vendors can reliably grow their business.

The key to success is making vendors love the platform because:
1. It gives them a steady stream of orders (volume)
2. It lets them control their pricing (autonomy)
3. It helps them operate efficiently (tools)
4. It rewards quality and performance (fairness)

---

**Document Version**: 2.0 (Synchronized - Hybrid Pricing, No Payouts, Admin Configuration)  
**Last Updated**: February 15, 2026  
**Status**: Ready for Development Planning

# PrintOS User Layer - UI/UX Specification
## Vendor Account Level Interface (Ready for Development)

**Version**: 1.0  
**Last Updated**: February 15, 2026  
**Status**: Ready for UI/UX Development

---

## OVERVIEW

The **User Layer** is the account-level interface vendors see after login, before selecting a store. This document provides complete UI/UX specifications for building the user layer interface.

---

## SECTION 1: LOGIN & AUTHENTICATION

### 1.1 Login Page

#### Layout
```
┌─────────────────────────────────────────┐
│                                         │
│         PRINTOS VENDOR PORTAL          │
│                                         │
│         [Logo/Branding]                │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Email Address                     │ │
│  │ [____________________]            │ │
│  │                                   │ │
│  │ Password                          │ │
│  │ [____________________]            │ │
│  │                                   │ │
│  │ ☐ Remember Me                    │ │
│  │                                   │ │
│  │ [LOGIN BUTTON]                   │ │
│  │                                   │ │
│  │ [Forgot Password?]  [Sign Up]    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  © 2026 Printa. All rights reserved.   │
│                                         │
└─────────────────────────────────────────┘
```

#### Components
- **Email Input Field**
  - Placeholder: "you@example.com"
  - Validation: Email format
  - Error: "Invalid email address"

- **Password Input Field**
  - Placeholder: "••••••••••"
  - Validation: Required
  - Error: "Password is required"

- **Remember Me Checkbox**
  - Label: "Remember Me"
  - Default: Unchecked

- **Login Button**
  - Text: "LOGIN"
  - State: Enabled/Disabled (disabled if form invalid)
  - Loading: Show spinner on click

- **Forgot Password Link**
  - Text: "Forgot Password?"
  - Action: Navigate to password reset

- **Sign Up Link**
  - Text: "Don't have an account? Sign Up"
  - Action: Navigate to registration

#### Interactions
- Email validation on blur
- Password validation on blur
- Login button disabled until form valid
- Show loading spinner on submit
- Show error message if login fails
- Redirect to User Dashboard on success

---

### 1.2 Password Reset Page

#### Layout
```
┌─────────────────────────────────────────┐
│                                         │
│      RESET YOUR PASSWORD               │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Email Address                     │ │
│  │ [____________________]            │ │
│  │                                   │ │
│  │ [SEND RESET LINK]                │ │
│  │                                   │ │
│  │ [Back to Login]                  │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

#### Components
- **Email Input Field**
  - Placeholder: "you@example.com"
  - Validation: Email format

- **Send Reset Link Button**
  - Text: "SEND RESET LINK"
  - Action: Send password reset email

- **Back to Login Link**
  - Text: "Back to Login"
  - Action: Navigate back to login

---

### 1.3 Account Registration Page

#### Layout
```
┌─────────────────────────────────────────┐
│                                         │
│      CREATE YOUR VENDOR ACCOUNT        │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Business Name                     │ │
│  │ [____________________]            │ │
│  │                                   │ │
│  │ First Name                        │ │
│  │ [____________________]            │ │
│  │                                   │ │
│  │ Last Name                         │ │
│  │ [____________________]            │ │
│  │                                   │ │
│  │ Email Address                     │ │
│  │ [____________________]            │ │
│  │                                   │ │
│  │ Password                          │ │
│  │ [____________________]            │ │
│  │                                   │ │
│  │ Confirm Password                  │ │
│  │ [____________________]            │ │
│  │                                   │ │
│  │ ☐ I agree to Terms & Conditions │ │
│  │                                   │ │
│  │ [CREATE ACCOUNT]                 │ │
│  │                                   │ │
│  │ Already have an account? [Login] │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

#### Components
- **Business Name Input**
  - Placeholder: "ABC Print Shop"
  - Validation: Required, min 3 chars

- **First Name Input**
  - Placeholder: "John"
  - Validation: Required

- **Last Name Input**
  - Placeholder: "Banda"
  - Validation: Required

- **Email Input**
  - Placeholder: "you@example.com"
  - Validation: Email format, unique

- **Password Input**
  - Placeholder: "••••••••••"
  - Validation: Min 8 chars, 1 uppercase, 1 number

- **Confirm Password Input**
  - Placeholder: "••••••••••"
  - Validation: Must match password

- **Terms & Conditions Checkbox**
  - Label: "I agree to Terms & Conditions"
  - Required: Yes

- **Create Account Button**
  - Text: "CREATE ACCOUNT"
  - Disabled until all fields valid

---

## SECTION 2: STORE SELECTION (PRIMARY AFTER LOGIN)

### 2.1 Store Selection Page (Direct After Login)

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ PRINTOS VENDOR PORTAL                    [Profile] [Logout] │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│ 🏪 STORES (PRIMARY)  │ ← Highlighted/Active
│   • My Stores        │
│   • Add New Store    │
│   • Store Settings   │
│   • Multi-Store View │
├──────────────────────┤
│ 👤 ACCOUNT           │
│   • Profile          │
│   • Business Details │
│   • Contact Info     │
│   • Password & Sec   │
├──────────────────────┤
│ 💳 SUBSCRIPTION      │
│   • Current Tier     │
│   • Upgrade/Downgrade│
│   • Billing History  │
│   • Payment Methods  │
├──────────────────────┤
│ 👥 TEAM              │
│   • Team Members     │
│   • Invite Member    │
│   • Manage Roles     │
│   • Working Hours    │
├──────────────────────┤
│ 📊 DASHBOARD         │
│   • Account Overview │
│   • Business Summary │
│   • Cross-Store View │
│   • Tier Status      │
├──────────────────────┤
│ ⚙️ SETTINGS          │
│   • Notifications    │
│   • Email Settings   │
│   • API Keys         │
│   • Integrations     │
├──────────────────────┤
│ ❓ HELP              │
│   • Documentation    │
│   • Tutorials        │
│   • Support          │
│   • FAQ              │
├──────────────────────┤
│ 🚪 LOGOUT            │
└──────────────────────┘
```

#### Main Content Area (Store Selection)
```
┌─────────────────────────────────────────────────────────────┐
│ SELECT A STORE TO CONTINUE                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [+ ADD NEW STORE]                                           │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ STORE 1: LUSAKA MAIN                                    │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Status: Active ✓                                        │ │
│ │ Address: Plot 123, Cairo Road, Lusaka                   │ │
│ │ Phone: +260 123 456 789                                 │ │
│ │ Manager: John Banda                                     │ │
│ │                                                         │ │
│ │ Today's Orders: 12                                      │ │
│ │ Health Score: 92/100 (Excellent)                        │ │
│ │ Capacity Used: 60% (12/20 jobs)                         │ │
│ │                                                         │ │
│ │ [ENTER STORE]  [Edit]  [Settings]                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ STORE 2: LUSAKA NORTH                                   │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Status: Active ✓                                        │ │
│ │ Address: Plot 456, Kabulonga Road, Lusaka               │ │
│ │ Phone: +260 987 654 321                                 │ │
│ │ Manager: Jane Smith                                     │ │
│ │                                                         │ │
│ │ Today's Orders: 8                                       │ │
│ │ Health Score: 88/100 (Good)                             │ │
│ │ Capacity Used: 40% (8/20 jobs)                          │ │
│ │                                                         │ │
│ │ [ENTER STORE]  [Edit]  [Settings]                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ STORE 3: KITWE BRANCH                                   │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Status: Inactive                                        │ │
│ │ Address: Plot 789, Nkana Road, Kitwe                    │ │
│ │ Phone: +260 555 666 777                                 │ │
│ │ Manager: Not Assigned                                   │ │
│ │                                                         │ │
│ │ Last Active: 2 weeks ago                                │ │
│ │                                                         │ │
│ │ [ACTIVATE]  [Edit]  [Delete]                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components
- **Add New Store Button**
  - Text: "+ ADD NEW STORE"
  - Action: Navigate to add store form
  - Position: Top of page

- **Store Card (Primary Action)**
  - Store Name (bold, large)
  - Status badge (Active/Inactive)
  - Address
  - Phone
  - Manager Name
  - Today's Orders (if active)
  - Health Score (if active)
  - Capacity Used (if active)
  - **[ENTER STORE]** button (Primary - large, prominent)
  - [Edit] button (Secondary)
  - [Settings] button (Secondary)
  - Or [Activate], [Edit], [Delete] if inactive

#### Interactions
- **[ENTER STORE]** button: Navigate to Store Layer (Shop Dashboard)
- **[Edit]** button: Edit store details
- **[Settings]** button: Store-specific settings
- **[Activate]** button: Activate inactive store
- **[Delete]** button: Delete inactive store
- Click on store card: Highlight the store
- Double-click on store card: Enter store (same as [ENTER STORE])

---

## SECTION 3: USER LAYER DASHBOARD (SECONDARY)

### 3.1 Main Dashboard Layout

#### Header
```
┌─────────────────────────────────────────────────────────────┐
│ PRINTOS VENDOR PORTAL                    [Profile] [Logout] │
└─────────────────────────────────────────────────────────────┘
```

#### Left Sidebar Navigation
```
┌──────────────────────┐
│ 🏪 STORES            │
│   • My Stores        │
│   • Add New Store    │
│   • Store Settings   │
│   • Multi-Store View │
├──────────────────────┤
│ 👤 ACCOUNT           │
│   • Profile          │
│   • Business Details │
│   • Contact Info     │
│   • Password & Sec   │
├──────────────────────┤
│ 💳 SUBSCRIPTION      │
│   • Current Tier     │
│   • Upgrade/Downgrade│
│   • Billing History  │
│   • Payment Methods  │
├──────────────────────┤
│ 👥 TEAM              │
│   • Team Members     │
│   • Invite Member    │
│   • Manage Roles     │
│   • Working Hours    │
├──────────────────────┤
│ 📊 DASHBOARD         │ ← Highlighted/Active
│   • Account Overview │
│   • Business Summary │
│   • Cross-Store View │
│   • Tier Status      │
├──────────────────────┤
│ ⚙️ SETTINGS          │
│   • Notifications    │
│   • Email Settings   │
│   • API Keys         │
│   • Integrations     │
├──────────────────────┤
│ ❓ HELP              │
│   • Documentation    │
│   • Tutorials        │
│   • Support          │
│   • FAQ              │
├──────────────────────┤
│ 🚪 LOGOUT            │
└──────────────────────┘
```

#### Main Content Area (Dashboard)
```
┌─────────────────────────────────────────────────────────────┐
│ ACCOUNT OVERVIEW                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────┐  ┌─────────────────────┐           │
│ │ ACCOUNT SUMMARY     │  │ SUBSCRIPTION STATUS │           │
│ ├─────────────────────┤  ├─────────────────────┤           │
│ │ Business: ABC Print │  │ Tier: PRO           │           │
│ │ ID: VND-12345       │  │ Fee: K150/month     │           │
│ │ Status: Active ✓    │  │ Renewal: Mar 15     │           │
│ │ Member: Jan 2024    │  │ Status: Active ✓    │           │
│ │                     │  │ [Upgrade] [Change]  │           │
│ └─────────────────────┘  └─────────────────────┘           │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ MY STORES (Quick Access)                                │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Store 1: Lusaka Main                                    │ │
│ │   Status: Active | Orders: 12 | Health: 92 | [Go]     │ │
│ │                                                         │ │
│ │ Store 2: Lusaka North                                   │ │
│ │   Status: Active | Orders: 8 | Health: 88 | [Go]      │ │
│ │                                                         │ │
│ │ Store 3: Kitwe Branch                                   │ │
│ │   Status: Inactive | [Activate]                        │ │
│ │                                                         │ │
│ │ [+ Add New Store]  [View All Stores]                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ BUSINESS PERFORMANCE (All Stores)                       │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Revenue (Month): K45,320 | Jobs: 287 | Health: 90    │ │
│ │ On-Time: 96% | Reprint: 3.2% | Failure: 1.1%         │ │
│ │ Capacity: 94% | Handoff: 98%                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ QUICK ACTIONS                                           │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ [Enter Store] [Manage Pricing] [View Orders]           │ │
│ │ [Download Reports] [Invite Team] [Upgrade Tier]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## SECTION 4: ACCOUNT MANAGEMENT

### 3.1 Profile Page

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ ACCOUNT > PROFILE                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ PERSONAL INFORMATION                                        │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Profile Picture                                         │ │
│ │ [Profile Image]  [Change Photo]  [Remove Photo]        │ │
│ │                                                         │ │
│ │ First Name                                              │ │
│ │ [John_____________________]                            │ │
│ │                                                         │ │
│ │ Last Name                                               │ │
│ │ [Banda____________________]                            │ │
│ │                                                         │ │
│ │ Email Address                                           │ │
│ │ [john@example.com_________]                            │ │
│ │                                                         │ │
│ │ Phone Number                                            │ │
│ │ [+260 123 456 789_________]                            │ │
│ │                                                         │ │
│ │ [SAVE CHANGES]                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components
- **Profile Picture**
  - Display current photo (or placeholder)
  - [Change Photo] button: Upload new image
  - [Remove Photo] button: Delete current photo

- **First Name Input**
  - Current value: "John"
  - Validation: Required, min 2 chars

- **Last Name Input**
  - Current value: "Banda"
  - Validation: Required, min 2 chars

- **Email Input**
  - Current value: "john@example.com"
  - Validation: Email format, unique
  - Note: Changing email requires verification

- **Phone Input**
  - Current value: "+260 123 456 789"
  - Validation: Phone format
  - Placeholder: "+260 XXX XXX XXX"

- **Save Changes Button**
  - Text: "SAVE CHANGES"
  - Action: Save profile updates
  - Show success message

---

### 3.2 Business Details Page

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ ACCOUNT > BUSINESS DETAILS                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ BUSINESS INFORMATION                                        │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Business Name                                           │ │
│ │ [ABC Print Shop_____________________]                  │ │
│ │                                                         │ │
│ │ Business Type                                           │ │
│ │ [Sole Proprietor ▼]                                    │ │
│ │   • Sole Proprietor                                    │ │
│ │   • Partnership                                         │ │
│ │   • Limited Company                                     │ │
│ │   • Other                                               │ │
│ │                                                         │ │
│ │ Industry Category                                       │ │
│ │ [Printing & Publishing ▼]                              │ │
│ │   • Printing & Publishing                              │ │
│ │   • Graphic Design                                      │ │
│ │   • Other                                               │ │
│ │                                                         │ │
│ │ Business Registration Number                           │ │
│ │ [REG-2024-001234_________________]                     │ │
│ │                                                         │ │
│ │ Tax ID / VAT Number                                     │ │
│ │ [TAX-2024-001234_________________]                     │ │
│ │                                                         │ │
│ │ Years in Business                                       │ │
│ │ [5 ▼]                                                  │ │
│ │                                                         │ │
│ │ Number of Employees                                     │ │
│ │ [12 ▼]                                                 │ │
│ │                                                         │ │
│ │ [SAVE CHANGES]                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components
- **Business Name Input**
  - Current value: "ABC Print Shop"
  - Validation: Required, min 3 chars

- **Business Type Dropdown**
  - Options: Sole Proprietor, Partnership, Limited Company, Other
  - Current: "Sole Proprietor"

- **Industry Category Dropdown**
  - Options: Printing & Publishing, Graphic Design, Other
  - Current: "Printing & Publishing"

- **Business Registration Number Input**
  - Current value: "REG-2024-001234"
  - Validation: Required

- **Tax ID / VAT Number Input**
  - Current value: "TAX-2024-001234"
  - Validation: Required

- **Years in Business Dropdown**
  - Options: 0-1, 1-5, 5-10, 10+
  - Current: "5"

- **Number of Employees Dropdown**
  - Options: 1-5, 5-10, 10-20, 20-50, 50+
  - Current: "12"

- **Save Changes Button**
  - Text: "SAVE CHANGES"
  - Action: Save business details

---

### 3.3 Contact Information Page

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ ACCOUNT > CONTACT INFORMATION                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ PRIMARY CONTACT                                             │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Contact Name                                            │ │
│ │ [John Banda_____________________]                      │ │
│ │                                                         │ │
│ │ Contact Email                                           │ │
│ │ [john@example.com_________________]                    │ │
│ │                                                         │ │
│ │ Contact Phone                                           │ │
│ │ [+260 123 456 789_________________]                    │ │
│ │                                                         │ │
│ │ Contact Role                                            │ │
│ │ [Owner ▼]                                              │ │
│ │   • Owner                                               │ │
│ │   • Manager                                             │ │
│ │   • Accountant                                          │ │
│ │   • Other                                               │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ COMMUNICATION PREFERENCES                                   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☑ Email Notifications                                  │ │
│ │ ☑ SMS Alerts                                           │ │
│ │ ☑ Push Notifications                                   │ │
│ │ ☐ Marketing Emails                                     │ │
│ │                                                         │ │
│ │ [SAVE CHANGES]                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components
- **Contact Name Input**
  - Current value: "John Banda"
  - Validation: Required

- **Contact Email Input**
  - Current value: "john@example.com"
  - Validation: Email format

- **Contact Phone Input**
  - Current value: "+260 123 456 789"
  - Validation: Phone format

- **Contact Role Dropdown**
  - Options: Owner, Manager, Accountant, Other
  - Current: "Owner"

- **Email Notifications Checkbox**
  - Label: "Email Notifications"
  - Default: Checked

- **SMS Alerts Checkbox**
  - Label: "SMS Alerts"
  - Default: Checked

- **Push Notifications Checkbox**
  - Label: "Push Notifications"
  - Default: Checked

- **Marketing Emails Checkbox**
  - Label: "Marketing Emails"
  - Default: Unchecked

---

### 3.4 Password & Security Page

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ ACCOUNT > PASSWORD & SECURITY                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ CHANGE PASSWORD                                             │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Current Password                                        │ │
│ │ [••••••••••••••••••]                                   │ │
│ │                                                         │ │
│ │ New Password                                            │ │
│ │ [••••••••••••••••••]                                   │ │
│ │ Password must be at least 8 characters                 │ │
│ │ Must contain uppercase, lowercase, and numbers         │ │
│ │                                                         │ │
│ │ Confirm New Password                                    │ │
│ │ [••••••••••••••••••]                                   │ │
│ │                                                         │ │
│ │ [UPDATE PASSWORD]                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ TWO-FACTOR AUTHENTICATION                                   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Status: Disabled                                        │ │
│ │ [Enable Two-Factor Authentication]                      │ │
│ │                                                         │ │
│ │ Two-factor authentication adds extra security by       │ │
│ │ requiring a code from your phone when you log in.      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ACTIVE SESSIONS                                             │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Current Session                                         │ │
│ │ Chrome on Windows | 192.168.1.100 | Last Active: Now  │ │
│ │                                                         │ │
│ │ Other Sessions                                          │ │
│ │ Safari on iPhone | 192.168.1.101 | Last Active: 2h ago│ │
│ │ [Sign Out]                                              │ │
│ │                                                         │ │
│ │ Firefox on Mac | 192.168.1.102 | Last Active: 1d ago  │ │
│ │ [Sign Out]                                              │ │
│ │                                                         │ │
│ │ [Sign Out All Other Sessions]                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components
- **Current Password Input**
  - Placeholder: "••••••••••"
  - Validation: Required

- **New Password Input**
  - Placeholder: "••••••••••"
  - Validation: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
  - Show password strength indicator

- **Confirm New Password Input**
  - Placeholder: "••••••••••"
  - Validation: Must match new password

- **Update Password Button**
  - Text: "UPDATE PASSWORD"
  - Action: Update password

- **Two-Factor Authentication Toggle**
  - Current: Disabled
  - Action: Enable/Disable 2FA

- **Active Sessions List**
  - Show current session (highlighted)
  - Show other active sessions
  - [Sign Out] button for each session
  - [Sign Out All Other Sessions] button

---

## SECTION 5: STORES MANAGEMENT

### 5.1 My Stores Page

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ STORES > MY STORES                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [+ ADD NEW STORE]                                           │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ STORE 1: LUSAKA MAIN                                    │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Status: Active ✓                                        │ │
│ │ Address: Plot 123, Cairo Road, Lusaka                   │ │
│ │ Phone: +260 123 456 789                                 │ │
│ │ Manager: John Banda                                     │ │
│ │                                                         │ │
│ │ Today's Orders: 12                                      │ │
│ │ Health Score: 92/100 (Excellent)                        │ │
│ │ Capacity Used: 60% (12/20 jobs)                         │ │
│ │                                                         │ │
│ │ [Go to Store] [Edit] [Settings]                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ STORE 2: LUSAKA NORTH                                   │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Status: Active ✓                                        │ │
│ │ Address: Plot 456, Kabulonga Road, Lusaka               │ │
│ │ Phone: +260 987 654 321                                 │ │
│ │ Manager: Jane Smith                                     │ │
│ │                                                         │ │
│ │ Today's Orders: 8                                       │ │
│ │ Health Score: 88/100 (Good)                             │ │
│ │ Capacity Used: 40% (8/20 jobs)                          │ │
│ │                                                         │ │
│ │ [Go to Store] [Edit] [Settings]                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ STORE 3: KITWE BRANCH                                   │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Status: Inactive                                        │ │
│ │ Address: Plot 789, Nkana Road, Kitwe                    │ │
│ │ Phone: +260 555 666 777                                 │ │
│ │ Manager: Not Assigned                                   │ │
│ │                                                         │ │
│ │ Last Active: 2 weeks ago                                │ │
│ │                                                         │ │
│ │ [Activate] [Edit] [Delete]                             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components
- **Add New Store Button**
  - Text: "+ ADD NEW STORE"
  - Action: Navigate to add store form

- **Store Card**
  - Store Name (bold, large)
  - Status badge (Active/Inactive)
  - Address
  - Phone
  - Manager Name
  - Today's Orders (if active)
  - Health Score (if active)
  - Capacity Used (if active)
  - Action buttons: [Go to Store], [Edit], [Settings] (or [Activate], [Edit], [Delete] if inactive)

---

### 5.2 Add New Store Page

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ STORES > ADD NEW STORE                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ STORE INFORMATION                                           │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Store Name                                              │ │
│ │ [____________________________]                          │ │
│ │                                                         │ │
│ │ Store Address                                           │ │
│ │ [____________________________]                          │ │
│ │                                                         │ │
│ │ City                                                    │ │
│ │ [Lusaka ▼]                                             │ │
│ │                                                         │ │
│ │ Phone Number                                            │ │
│ │ [+260 ________________________]                         │ │
│ │                                                         │ │
│ │ Email Address                                           │ │
│ │ [____________________________]                          │ │
│ │                                                         │ │
│ │ Store Manager Name                                      │ │
│ │ [____________________________]                          │ │
│ │                                                         │ │
│ │ Store Manager Phone                                     │ │
│ │ [+260 ________________________]                         │ │
│ │                                                         │ │
│ │ [SAVE STORE]  [CANCEL]                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components
- **Store Name Input**
  - Placeholder: "e.g., Lusaka Main"
  - Validation: Required, min 3 chars

- **Store Address Input**
  - Placeholder: "e.g., Plot 123, Cairo Road"
  - Validation: Required

- **City Dropdown**
  - Options: Lusaka, Kitwe, Ndola, Livingstone, etc.
  - Validation: Required

- **Phone Number Input**
  - Placeholder: "+260 XXX XXX XXX"
  - Validation: Phone format

- **Email Address Input**
  - Placeholder: "store@example.com"
  - Validation: Email format

- **Store Manager Name Input**
  - Placeholder: "e.g., John Banda"
  - Validation: Required

- **Store Manager Phone Input**
  - Placeholder: "+260 XXX XXX XXX"
  - Validation: Phone format

- **Save Store Button**
  - Text: "SAVE STORE"
  - Action: Create new store

- **Cancel Button**
  - Text: "CANCEL"
  - Action: Go back to My Stores

---

### 5.3 Multi-Store Overview Page

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ STORES > MULTI-STORE OVERVIEW                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ PERFORMANCE ACROSS ALL STORES                               │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Total Revenue (This Month): K45,320                     │ │
│ │ Total Jobs Completed: 287                               │ │
│ │ Average Health Score: 90/100                            │ │
│ │ Total Capacity Used: 55%                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ STORE COMPARISON TABLE                                      │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Store Name    │ Status │ Orders │ Health │ Capacity    │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Lusaka Main   │ Active │ 12     │ 92     │ 60%         │ │
│ │ Lusaka North  │ Active │ 8      │ 88     │ 40%         │ │
│ │ Kitwe Branch  │ Inact. │ -      │ -      │ -           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ CHARTS                                                      │
│                                                             │
│ ┌──────────────────────────┐  ┌──────────────────────────┐ │
│ │ Revenue by Store         │  │ Health Score by Store    │ │
│ │ [Bar Chart]              │  │ [Bar Chart]              │ │
│ │ Lusaka Main: K28,500     │  │ Lusaka Main: 92         │ │
│ │ Lusaka North: K16,820    │  │ Lusaka North: 88        │ │
│ └──────────────────────────┘  └──────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components
- **Performance Summary Cards**
  - Total Revenue (This Month)
  - Total Jobs Completed
  - Average Health Score
  - Total Capacity Used

- **Store Comparison Table**
  - Columns: Store Name, Status, Orders, Health Score, Capacity
  - Sortable by any column
  - Clickable rows to go to store

- **Charts**
  - Revenue by Store (Bar Chart)
  - Health Score by Store (Bar Chart)
  - Jobs by Store (Pie Chart)

---

## SECTION 6: SUBSCRIPTION & BILLING

### 6.1 Current Tier Page

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ SUBSCRIPTION > CURRENT TIER                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ YOUR CURRENT TIER                                           │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │ ┌──────────────────────────────────────────────────┐   │ │
│ │ │ PRO TIER                                         │   │ │
│ │ ├──────────────────────────────────────────────────┤   │ │
│ │ │ Monthly Fee: K150                                │   │ │
│ │ │ Renewal Date: Mar 15, 2026                       │   │ │
│ │ │ Status: Active ✓                                 │   │ │
│ │ │ Auto-Renewal: Enabled                           │   │ │
│ │ │                                                  │   │ │
│ │ │ FEATURES INCLUDED:                              │   │ │
│ │ │ ✓ Job Volume: 50-100 jobs/day                   │   │ │
│ │ │ ✓ Full Product Catalog                          │   │ │
│ │ │ ✓ Priority Routing                              │   │ │
│ │ │ ✓ 2-Hour Handoff SLA                            │   │ │
│ │ │ ✓ Advanced Reporting                            │   │ │
│ │ │ ✓ Bulk Price Updates                            │   │ │
│ │ │ ✓ Team Management (Up to 10 members)            │   │ │
│ │ │                                                  │   │ │
│ │ │ [UPGRADE TO ENTERPRISE]  [DOWNGRADE TO CORE]   │   │ │
│ │ └──────────────────────────────────────────────────┘   │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ TIER COMPARISON                                             │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Feature              │ CORE    │ PRO (Current) │ ENTERP. │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Monthly Fee          │ K0      │ K150          │ Custom  │ │
│ │ Job Volume/Day       │ 10-20   │ 50-100        │ Unlim.  │ │
│ │ Product Categories   │ Limited │ Full          │ Full    │ │
│ │ Routing Priority     │ Standard│ Priority      │ Highest │ │
│ │ SLA Guarantees       │ None    │ Yes (2h)      │ Custom  │ │
│ │ Team Members         │ 3       │ 10            │ Unlim.  │ │
│ │ Rejection Limit      │ 20%     │ 10%           │ Custom  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components
- **Current Tier Card**
  - Tier name (large, prominent)
  - Monthly fee
  - Renewal date
  - Status badge
  - Auto-renewal toggle
  - Features list (checkmarks)
  - [Upgrade] and [Downgrade] buttons

- **Tier Comparison Table**
  - Columns: Feature, CORE, PRO (Current), ENTERPRISE
  - Rows: All tier features
  - Current tier highlighted

---

### 6.2 Upgrade/Downgrade Page

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ SUBSCRIPTION > UPGRADE TO ENTERPRISE                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ UPGRADE YOUR TIER                                           │
│                                                             │
│ Current Tier: PRO (K150/month)                              │
│ New Tier: ENTERPRISE (Custom pricing)                       │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ENTERPRISE TIER BENEFITS                                │ │
│ │                                                         │ │
│ │ ✓ Unlimited Job Volume                                 │ │
│ │ ✓ Full Product Catalog                                 │ │
│ │ ✓ Highest Routing Priority                             │ │
│ │ ✓ Custom SLA Guarantees                                │ │
│ │ ✓ Unlimited Team Members                               │ │
│ │ ✓ Dedicated Account Manager                            │ │
│ │ ✓ Custom Pricing                                       │ │
│ │ ✓ Priority Support                                     │ │
│ │                                                         │ │
│ │ Estimated Cost: K500-1000/month (custom)               │ │
│ │                                                         │ │
│ │ [REQUEST ENTERPRISE UPGRADE]                           │ │
│ │                                                         │ │
│ │ A Printa representative will contact you within 24h    │ │
│ │ to discuss pricing and terms.                          │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [CANCEL]                                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components
- **Current Tier Display**
  - Current tier name and fee
  - New tier name and fee

- **New Tier Benefits Card**
  - List of benefits (checkmarks)
  - Estimated cost
  - [Request Upgrade] button
  - Note about account manager contact

- **Cancel Button**
  - Text: "CANCEL"
  - Action: Go back to Current Tier page

---

### 6.3 Billing History Page

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ SUBSCRIPTION > BILLING HISTORY                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ SUBSCRIPTION PAYMENTS                                       │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Date       │ Tier    │ Amount  │ Status    │ Invoice   │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Feb 15,26  │ PRO     │ K150    │ Paid ✓    │ [View]    │ │
│ │ Jan 15,26  │ PRO     │ K150    │ Paid ✓    │ [View]    │ │
│ │ Dec 15,25  │ PRO     │ K150    │ Paid ✓    │ [View]    │ │
│ │ Nov 15,25  │ PRO     │ K150    │ Paid ✓    │ [View]    │ │
│ │ Oct 15,25  │ CORE    │ K0      │ Free      │ [View]    │ │
│ │ Sep 15,25  │ CORE    │ K0      │ Free      │ [View]    │ │
│ │ Aug 15,25  │ CORE    │ K0      │ Free      │ [View]    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [DOWNLOAD ALL INVOICES]                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components
- **Billing History Table**
  - Columns: Date, Tier, Amount, Status, Invoice
  - Sortable by date (newest first)
  - [View] button for each invoice (opens PDF)

- **Download All Invoices Button**
  - Text: "[DOWNLOAD ALL INVOICES]"
  - Action: Download all invoices as ZIP

---

### 6.4 Payment Methods Page

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ SUBSCRIPTION > PAYMENT METHODS                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ SAVED PAYMENT METHODS                                       │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ VISA ending in 4242                                     │ │
│ │ Expiry: 12/28                                           │ │
│ │ Default Payment Method ✓                                │ │
│ │ [Edit] [Remove] [Set as Default]                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ MASTERCARD ending in 8765                               │ │
│ │ Expiry: 06/27                                           │ │
│ │ [Edit] [Remove] [Set as Default]                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [+ ADD NEW PAYMENT METHOD]                                  │
│                                                             │
│ BILLING ADDRESS                                             │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Address: Plot 123, Cairo Road, Lusaka                   │ │
│ │ City: Lusaka                                            │ │
│ │ Country: Zambia                                         │ │
│ │ Postal Code: 10101                                      │ │
│ │                                                         │ │
│ │ [EDIT BILLING ADDRESS]                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components
- **Payment Method Card**
  - Card type and last 4 digits
  - Expiry date
  - Default indicator
  - [Edit], [Remove], [Set as Default] buttons

- **Add New Payment Method Button**
  - Text: "+ ADD NEW PAYMENT METHOD"
  - Action: Open payment form

- **Billing Address Card**
  - Address, City, Country, Postal Code
  - [Edit Billing Address] button

---

## SECTION 7: TEAM MANAGEMENT

### 7.1 Team Members Page

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ TEAM > TEAM MEMBERS                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [+ INVITE NEW MEMBER]                                       │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Name          │ Email              │ Role      │ Status │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ John Banda    │ john@example.com   │ Owner     │ Active │ │
│ │ Jane Smith    │ jane@example.com   │ Manager   │ Active │ │
│ │ Bob Johnson   │ bob@example.com    │ Staff     │ Active │ │
│ │ Alice Brown   │ alice@example.com  │ Staff     │ Invite │ │
│ │ Charlie Davis │ charlie@example.com│ Accountant│ Active │ │
│ │                                                         │ │
│ │ [Edit] [Deactivate] [Resend Invite] [Delete]          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Total Members: 5 (4 Active, 1 Pending Invite)              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components
- **Invite New Member Button**
  - Text: "+ INVITE NEW MEMBER"
  - Action: Open invite form

- **Team Members Table**
  - Columns: Name, Email, Role, Status
  - Sortable by any column
  - Action buttons: [Edit], [Deactivate], [Resend Invite], [Delete]

- **Summary**
  - Total Members
  - Active Members
  - Pending Invites

---

### 7.2 Invite New Member Page

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ TEAM > INVITE NEW MEMBER                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ First Name                                              │ │
│ │ [____________________________]                          │ │
│ │                                                         │ │
│ │ Last Name                                               │ │
│ │ [____________________________]                          │ │
│ │                                                         │ │
│ │ Email Address                                           │ │
│ │ [____________________________]                          │ │
│ │                                                         │ │
│ │ Role                                                    │ │
│ │ [Manager ▼]                                            │ │
│ │   • Manager                                             │ │
│ │   • Staff                                               │ │
│ │   • Accountant                                          │ │
│ │                                                         │ │
│ │ Assigned Store(s)                                       │ │
│ │ ☑ Lusaka Main                                          │ │
│ │ ☑ Lusaka North                                         │ │
│ │ ☐ Kitwe Branch                                         │ │
│ │                                                         │ │
│ │ [SEND INVITE]  [CANCEL]                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components
- **First Name Input**
  - Placeholder: "John"
  - Validation: Required

- **Last Name Input**
  - Placeholder: "Banda"
  - Validation: Required

- **Email Address Input**
  - Placeholder: "john@example.com"
  - Validation: Email format, unique

- **Role Dropdown**
  - Options: Manager, Staff, Accountant
  - Default: Manager

- **Assigned Store(s) Checkboxes**
  - Checkbox for each store
  - Allow multiple selection

- **Send Invite Button**
  - Text: "SEND INVITE"
  - Action: Send invitation email

- **Cancel Button**
  - Text: "CANCEL"
  - Action: Go back to Team Members

---

## SECTION 8: BUSINESS ANALYTICS

### 8.1 Cross-Store Analytics Page

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ ANALYTICS > BUSINESS PERFORMANCE                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ PERFORMANCE SUMMARY (All Stores)                            │
│                                                             │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│ │ REVENUE      │  │ JOBS         │  │ HEALTH SCORE │       │
│ ├──────────────┤  ├──────────────┤  ├──────────────┤       │
│ │ K45,320      │  │ 287          │  │ 90/100       │       │
│ │ This Month   │  │ This Month   │  │ Excellent    │       │
│ │ ↑ 12% vs avg │  │ ↑ 8% vs avg  │  │ ↑ 2 pts      │       │
│ └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                             │
│ DETAILED METRICS                                            │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ On-Time Rate: 96%                                       │ │
│ │ Reprint Rate: 3.2%                                      │ │
│ │ Failure Rate: 1.1%                                      │ │
│ │ Capacity Accuracy: 94%                                  │ │
│ │ Delivery Handoff Rate: 98%                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ CHARTS                                                      │
│                                                             │
│ ┌──────────────────────────┐  ┌──────────────────────────┐ │
│ │ Revenue Trend            │  │ Health Score Trend       │ │
│ │ (Last 12 Months)         │  │ (Last 12 Months)         │ │
│ │ [Line Chart]             │  │ [Line Chart]             │ │
│ └──────────────────────────┘  └──────────────────────────┘ │
│                                                             │
│ ┌──────────────────────────┐  ┌──────────────────────────┐ │
│ │ Jobs by Store            │  │ Performance Metrics      │ │
│ │ [Pie Chart]              │  │ [Bar Chart]              │ │
│ │ Lusaka Main: 60%         │  │ On-Time: 96%             │ │
│ │ Lusaka North: 40%        │  │ Reprint: 3.2%            │ │
│ └──────────────────────────┘  └──────────────────────────┘ │
│                                                             │
│ [DOWNLOAD REPORT]  [SCHEDULE REPORT]                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components
- **Performance Summary Cards**
  - Revenue (This Month)
  - Jobs (This Month)
  - Health Score

- **Detailed Metrics**
  - On-Time Rate
  - Reprint Rate
  - Failure Rate
  - Capacity Accuracy
  - Delivery Handoff Rate

- **Charts**
  - Revenue Trend (Line Chart, Last 12 Months)
  - Health Score Trend (Line Chart, Last 12 Months)
  - Jobs by Store (Pie Chart)
  - Performance Metrics (Bar Chart)

- **Action Buttons**
  - [Download Report]
  - [Schedule Report]

---

## SECTION 9: SETTINGS

### 9.1 Notification Preferences Page

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ SETTINGS > NOTIFICATION PREFERENCES                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ EMAIL NOTIFICATIONS                                         │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☑ New Orders                                            │ │
│ │ ☑ Order Status Changes                                  │ │
│ │ ☑ SLA Warnings                                          │ │
│ │ ☑ Health Score Updates                                  │ │
│ │ ☑ Weekly Reports                                        │ │
│ │ ☑ Monthly Reports                                       │ │
│ │ ☐ Marketing Updates                                     │ │
│ │ ☐ Product Announcements                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ SMS ALERTS                                                  │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☑ Urgent Orders                                         │ │
│ │ ☑ SLA Violations                                        │ │
│ │ ☑ Critical Alerts                                       │ │
│ │ ☐ Daily Summary                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ PUSH NOTIFICATIONS                                          │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☑ New Orders                                            │ │
│ │ ☑ Order Reminders                                       │ │
│ │ ☑ System Updates                                        │ │
│ │ ☐ Marketing Messages                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [SAVE PREFERENCES]                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components
- **Email Notifications Checkboxes**
  - New Orders
  - Order Status Changes
  - SLA Warnings
  - Health Score Updates
  - Weekly Reports
  - Monthly Reports
  - Marketing Updates
  - Product Announcements

- **SMS Alerts Checkboxes**
  - Urgent Orders
  - SLA Violations
  - Critical Alerts
  - Daily Summary

- **Push Notifications Checkboxes**
  - New Orders
  - Order Reminders
  - System Updates
  - Marketing Messages

- **Save Preferences Button**
  - Text: "SAVE PREFERENCES"
  - Action: Save notification settings

---

## SECTION 10: HELP & SUPPORT

### 10.1 Help Center Page

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ HELP > HELP CENTER                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ SEARCH                                                      │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Search for help...________________] [SEARCH]          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ POPULAR TOPICS                                              │
│                                                             │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│ │ Getting      │  │ Managing     │  │ Billing &    │       │
│ │ Started      │  │ Orders       │  │ Subscription │       │
│ │ [View]       │  │ [View]       │  │ [View]       │       │
│ └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                             │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│ │ Quality      │  │ Delivery &   │  │ Pricing &    │       │
│ │ Control      │  │ Handoff      │  │ Catalog      │       │
│ │ [View]       │  │ [View]       │  │ [View]       │       │
│ └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                             │
│ DOCUMENTATION                                               │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ • User Guide (PDF)                                      │ │
│ │ • API Documentation                                     │ │
│ │ • FAQ                                                   │ │
│ │ • Video Tutorials                                       │ │
│ │ • Best Practices                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ CONTACT SUPPORT                                             │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Email: support@printa.co.zm                             │ │
│ │ Phone: +260 123 456 789                                 │ │
│ │ Chat: [Start Live Chat]                                 │ │
│ │ Hours: Mon-Fri 08:00-17:00 (Zambia Time)               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components
- **Search Box**
  - Placeholder: "Search for help..."
  - Real-time search results

- **Popular Topics**
  - Getting Started
  - Managing Orders
  - Billing & Subscription
  - Quality Control
  - Delivery & Handoff
  - Pricing & Catalog

- **Documentation Links**
  - User Guide (PDF)
  - API Documentation
  - FAQ
  - Video Tutorials
  - Best Practices

- **Contact Support**
  - Email
  - Phone
  - Live Chat
  - Support Hours

---

## SECTION 11: USER PROFILE MENU

### 11.1 Profile Dropdown (Top Right)

#### Layout
```
┌──────────────────────────────────┐
│ [Profile Picture] John Banda ▼   │
├──────────────────────────────────┤
│ 👤 My Profile                    │
│ 🏪 Go to Store                   │
│ 📊 Dashboard                     │
│ ⚙️ Settings                      │
│ ❓ Help & Support                │
│ 🚪 Logout                        │
└──────────────────────────────────┘
```

#### Components
- **Profile Picture**
  - Display user's profile picture
  - Fallback to initials if no picture

- **User Name**
  - Display "John Banda"

- **Menu Items**
  - 👤 My Profile (Link to Profile page)
  - 🏪 Go to Store (Link to Store Selection)
  - 📊 Dashboard (Link to User Dashboard)
  - ⚙️ Settings (Link to Settings)
  - ❓ Help & Support (Link to Help Center)
  - 🚪 Logout (Logout action)

---

## DESIGN SPECIFICATIONS

### Colors
- **Primary**: #0066CC (Blue)
- **Secondary**: #00A86B (Green)
- **Danger**: #FF3333 (Red)
- **Warning**: #FFA500 (Orange)
- **Background**: #F5F5F5 (Light Gray)
- **Text**: #333333 (Dark Gray)
- **Border**: #CCCCCC (Medium Gray)

### Typography
- **Heading 1**: 32px, Bold
- **Heading 2**: 24px, Bold
- **Heading 3**: 18px, Bold
- **Body**: 14px, Regular
- **Small**: 12px, Regular

### Spacing
- **Padding**: 16px, 24px, 32px
- **Margin**: 16px, 24px, 32px
- **Gap**: 8px, 12px, 16px

### Buttons
- **Primary Button**: Blue background, white text, 12px padding
- **Secondary Button**: Gray background, dark text, 12px padding
- **Danger Button**: Red background, white text, 12px padding
- **Disabled Button**: Gray background, light gray text, 12px padding

### Forms
- **Input Height**: 40px
- **Border Radius**: 4px
- **Border**: 1px solid #CCCCCC
- **Focus Border**: 2px solid #0066CC

### Responsive Design
- **Desktop**: 1200px+ (Full layout)
- **Tablet**: 768px-1199px (Sidebar collapses, main content adjusts)
- **Mobile**: <768px (Sidebar becomes hamburger menu, single column layout)

---

## DEVELOPMENT CHECKLIST

### Phase 1: Authentication
- [ ] Login page
- [ ] Registration page
- [ ] Password reset page
- [ ] Session management

### Phase 2: Store Selection (Primary)
- [ ] Store selection page
- [ ] Store cards with quick access
- [ ] [ENTER STORE] primary button
- [ ] Store management buttons

### Phase 3: Dashboard & Navigation
- [ ] User layer dashboard
- [ ] Left sidebar navigation
- [ ] Top navigation bar
- [ ] Profile dropdown menu

### Phase 4: Account Management
- [ ] Profile page
- [ ] Business details page
- [ ] Contact information page
- [ ] Password & security page

### Phase 5: Stores Management
- [ ] My stores page
- [ ] Add new store page
- [ ] Multi-store overview page
- [ ] Store selection modal

### Phase 6: Subscription & Billing
- [ ] Current tier page
- [ ] Upgrade/downgrade page
- [ ] Billing history page
- [ ] Payment methods page

### Phase 7: Team Management
- [ ] Team members page
- [ ] Invite new member page
- [ ] Edit member page
- [ ] Member permissions

### Phase 8: Analytics
- [ ] Business performance page
- [ ] Cross-store analytics
- [ ] Charts and visualizations
- [ ] Report generation

### Phase 9: Settings & Help
- [ ] Notification preferences
- [ ] Email settings
- [ ] Help center page
- [ ] Support contact page

---

**Document Status**: Complete - Ready for UI Development  
**Prepared By**: Manus AI Agent  
**Date**: February 15, 2026

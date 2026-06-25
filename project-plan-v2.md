# PREMIUM VERIFIED MATRIMONY PLATFORM
## Updated Project Plan — Version 2.1
### Date: June 2026

---

## TABLE OF CONTENTS

1. Project Overview
2. DPDP Act 2023 Compliance Framework
3. User Roles & Permission-Based RBAC
4. User Registration & Profile Flow
5. KYC Verification
6. Profile Visibility & Privacy Logic
7. Matching & Interest Flow
8. Communication Flow
9. Image & Content Moderation
10. Horoscope & Matrimony Details
11. Subscription Management
12. Payment Gateway Integration
13. Group & Community Module
14. CMS & SEO Management
15. Public Pages
16. Account Management
17. Storage & Security
18. Admin Panel & Analytics
19. Notification System
20. Technology Stack
21. UI/UX Requirements
22. Future Enhancements
23. Final Deliverables
24. Open Decisions Pending Client Input
25. Important Notes

---

## 1. PROJECT OVERVIEW

The platform is a premium verified matrimony ecosystem focused on secure matchmaking, manual profile verification, controlled communication, subscription management, and community-based profile discovery. Built in full compliance with India's **Digital Personal Data Protection (DPDP) Act 2023**.

### Platform Capabilities
- Verified matrimonial profiles with admin-controlled approval workflow
- Community/group-based registrations and discovery
- Admin-controlled matchmaking and communication coordination
- Subscription-based feature access with dynamic plan management
- Advanced privacy controls with admin field-level visibility configuration
- Horoscope-based profile details collection
- SEO-optimized public discovery pages
- Secure image and KYC verification workflows
- DPDP Act 2023 compliant data handling, consent, and erasure

---

## 2. DPDP ACT 2023 COMPLIANCE FRAMEWORK

This section defines all compliance obligations under India's **Digital Personal Data Protection Act, 2023** (DPDP Act) and associated **DPDP Rules 2025** that the platform must implement.

### 2.1 Platform Role Under DPDP Act
- The platform acts as a **Data Fiduciary** — it determines the purpose and means of processing personal data of users (Data Principals).
- All user data collected (name, phone, email, horoscope, KYC documents, photos) is **personal and sensitive personal data**.

### 2.2 Consent Management
- **Explicit, informed consent** must be obtained before collecting any personal data.
- Consent must be:
  - Free (not bundled with terms acceptance)
  - Specific (each data category has separate consent)
  - Informed (user knows what is collected and why)
  - Unconditional (no coercion)
  - Unambiguous (active opt-in, no pre-ticked boxes)
- Users must be able to **withdraw consent** at any time with the same ease as giving it.
- Consent language must be available in **English and regional Indian languages** (per DPDP Act Schedule 8).
- Consent records must be stored with timestamp, version, and purpose.

**Platform Implementation:**
- Consent notice shown during registration for each data category
- Granular consent toggles for: profile data, horoscope data, KYC data, photo uploads, marketing communications
- Consent withdrawal triggers automatic data erasure workflow
- Consent version history maintained in the database

### 2.3 Notice Requirements
Every consent request must be accompanied by a Notice containing:
- What personal data is being collected
- Purpose for which it will be processed
- How the user can exercise their rights
- How the user can file a complaint with the Data Protection Board

### 2.4 Data Principal Rights (User Rights)
The platform must provide mechanisms for users to exercise all rights under Section 11–14 of the DPDP Act:

| Right | Description | Platform Implementation |
|---|---|---|
| Right to Access | Summary of personal data & processing activities | "My Data" page in user dashboard |
| Right to Correction | Correct/update inaccurate data | Profile edit with re-verification where applicable |
| Right to Erasure | Delete personal data upon withdrawal or purpose served | Account deletion flow with confirmed erasure |
| Right to Grievance Redressal | Raise complaints about data processing | In-platform grievance form + email to DPO |
| Right to Nomination | Nominate a person in case of death/incapacity | Nomination form in account settings |

**Turnaround Times:**
- Erasure request: within 30 days of withdrawal of consent
- Correction request: within 15 days
- Grievance resolution: within 30 days

### 2.5 Data Retention Policy
| Data Category | Retention Period | Action After Retention |
|---|---|---|
| Active user profile data | Duration of account + 90 days post deletion request | Hard delete |
| KYC documents | Duration of account + 1 year | Secure deletion |
| Payment records | 7 years (GST/Income Tax compliance) | Archived, not deleted |
| Audit logs | 2 years | Archived |
| Consent records | Lifetime of account + 2 years | Archived |
| Inactive accounts (no login) | 2 years inactivity | Notify user → delete if no response in 30 days |

### 2.6 Data Breach Management
- Automated breach detection alerts must be configured at the infrastructure level.
- In event of a breach:
  1. Notify the **Data Protection Board** within **72 hours** of discovery
  2. Notify all **affected users** with details of breach and remedial steps
  3. Maintain a **Data Breach Register** with breach details, impact, and remediation
- Data Breach Notification template must be pre-prepared.

### 2.7 Data Protection Officer (DPO)
- The client must designate a **Data Protection Officer (DPO)**.
- DPO contact information must be **publicly published** on the platform (Privacy Policy page, Contact page).
- DPO handles user grievances related to personal data.

### 2.8 Children's Data Protection
- The platform is restricted to users **18+ (Female) and 21+ (Male)**.
- Age validation enforced at registration via Date of Birth input.
- No data from minors must be collected or processed.
- If a minor is detected: registration is blocked and no data is stored.

### 2.9 Purpose Limitation
- Data collected for matrimony matching purposes must **not** be used for any other purpose (e.g., marketing, third-party sharing) without fresh explicit consent.
- Each data category is tagged with its collection purpose in the database.

### 2.10 Data Minimization
- Only collect data that is **necessary** for the stated purpose.
- Fields marked optional must genuinely be optional — no functional blocking if skipped.

### 2.11 Third-Party Data Processors
- Any third-party service receiving user data (Razorpay, email service, storage provider) must have a **Data Processing Agreement (DPA)** in place.
- Third parties must confirm DPDP/equivalent compliance.
- List of data processors must be maintained and disclosed in the Privacy Policy.

### 2.12 Cross-Border Data Transfer
- User personal data must be stored on **servers located in India** (Linode India region).
- No transfer of personal data to countries restricted by the Central Government notification.
- If CDN caches data outside India, ensure only non-personal, publicly visible data is cached.

### 2.13 DPDP Compliance Artifacts to be Delivered
- Privacy Policy (DPDP-compliant, published on platform)
- Terms of Service
- Cookie Policy
- Consent Notice templates
- Data Retention Policy document
- Data Breach Response Plan
- Data Processing Agreements (with all third parties)
- Record of Processing Activities (RoPA)

---

## 3. USER ROLES & PERMISSION-BASED RBAC

### 3.1 System Design
The platform uses a **Permission-Based Dynamic RBAC** system:
- Permissions are the atomic units of access control
- Roles are collections of permissions
- Default roles are pre-configured but fully editable by Super Admin
- New custom roles can be created by assigning any combination of permissions

### 3.2 Permission Master List

**User Management**
- `users.view` — View user list and profiles
- `users.approve` — Approve pending user profiles
- `users.suspend` — Suspend user accounts
- `users.delete` — Delete user accounts
- `users.edit` — Edit user profile data

**KYC Management**
- `kyc.view` — View KYC submissions
- `kyc.approve` — Approve KYC
- `kyc.reject` — Reject KYC with reason

**Image Moderation**
- `images.view` — View image moderation queue
- `images.approve` — Approve uploaded images
- `images.reject` — Reject images with reason

**Subscription Management**
- `subscriptions.view` — View subscription list
- `subscriptions.manage_plans` — Create/edit/delete subscription plans
- `subscriptions.manage_coupons` — Create/manage coupon codes
- `subscriptions.override` — Manually assign/change user subscription

**Payment Management**
- `payments.view` — View payment history
- `payments.refund` — Initiate refunds
- `payments.export` — Export payment reports

**Community Management**
- `communities.view` — View community list
- `communities.create` — Create new communities
- `communities.manage` — Edit community details
- `communities.approve_members` — Approve community join requests

**CMS Management**
- `cms.manage_pages` — Edit public pages
- `cms.manage_blogs` — Create/edit/delete blogs
- `cms.manage_faqs` — Manage FAQs
- `cms.manage_success_stories` — Manage success stories
- `cms.manage_seo` — Edit SEO metadata

**Communication & Matching**
- `matches.view` — View mutual matches
- `matches.manage` — Manage match communication tickets
- `matches.arrange_meeting` — Schedule meetings between matches

**Reports & Analytics**
- `analytics.view_dashboard` — View admin dashboard KPIs
- `analytics.export_reports` — Export analytics reports

**Notifications**
- `notifications.send` — Send manual notifications
- `notifications.manage_templates` — Edit notification templates

**Audit & System**
- `audit.view_logs` — View audit logs
- `settings.manage_roles` — Create/edit/delete roles (Super Admin only)
- `settings.system_config` — Platform configuration settings
- `settings.field_visibility` — Control profile field visibility per audience

### 3.3 Default Role — Permission Mapping

| Permission | Super Admin | Admin | Moderator | Subscription Mgr | CMS Manager | Support Exec | Community Mgr |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| users.view | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| users.approve | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| users.suspend | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| users.delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| kyc.view | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| kyc.approve | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| kyc.reject | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| images.approve | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| subscriptions.manage_plans | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| subscriptions.manage_coupons | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| payments.view | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| payments.refund | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| communities.manage | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| communities.approve_members | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| cms.manage_pages | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| cms.manage_blogs | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| cms.manage_seo | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| matches.manage | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| analytics.view_dashboard | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| audit.view_logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| settings.manage_roles | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| settings.field_visibility | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

> Super Admin is the only role that can create, edit, or delete other roles.

---

## 4. USER REGISTRATION & PROFILE FLOW

### Step 1 — Basic Registration
1. User enters **mobile number** (used as unique identifier, not for OTP)
2. User enters **email address**
3. System sends **Email OTP** (6-digit, expires in **10 minutes**)
4. OTP verification: "Resend OTP" available after 60-second cooldown, maximum 3 resend attempts
5. On successful OTP verification → account created (inactive status)
6. User selects **gender** and enters **Date of Birth**
7. Age validation enforced:
   - Female: Must be **18 years or older**
   - Male: Must be **21 years or older**
   - If underage: Registration blocked, error message shown, no data stored (DPDP compliance)

### Step 2 — Consent Notice (DPDP)
Before profile completion, user must review and accept:
- What personal data is being collected
- Purpose of data collection (matrimony matchmaking only)
- Rights under DPDP Act (access, correction, erasure, grievance)
- Link to Privacy Policy and Terms of Service
- Granular consent toggles for each data category
- Acceptance is mandatory; consent is recorded with timestamp

### Step 3 — Profile Completion
Users must complete the following sections:

**Personal Details**
- Full name, date of birth, gender
- Height, weight, complexion
- Mother tongue, religion, caste, sub-caste
- Citizenship, residential city/state
- About me (bio)

**Family Details**
- Father's name & occupation
- Mother's name & occupation
- Number of siblings
- Family type (nuclear/joint)
- Family status (middle/upper-middle/affluent)
- Family values (traditional/moderate/liberal)

**Education & Profession**
- Highest qualification
- College/university
- Occupation type
- Employer/company name
- Annual income range
- Work city/state

**Partner Preferences**
- Preferred age range
- Height range
- Religion, caste preferences
- Education preference
- Location preference
- Income preference
- Dosham preference

**Horoscope Details** (See Section 10)

**Community Details**
- Community/group association (optional)
- Community-specific fields if applicable

**Image Uploads**
- Minimum 1 profile photo mandatory
- Up to maximum count configured by admin (default: 5)

### Step 4 — KYC Verification (See Section 5)

### Step 5 — Admin Approval
Admin manually reviews:
- KYC documents and selfie
- Uploaded photos
- Profile information for accuracy
- Fraud/spam validation

### Step 6 — Public Listing
- Only fully approved profiles appear in public/registered user searches
- Unapproved, suspended, or deactivated profiles remain hidden
- User notified on approval or rejection with reason

---

## 5. KYC VERIFICATION

### 5.1 KYC Verification Modes (Admin-Configurable)
All three KYC verification methods are implemented in **Phase 1**. Admin can enable or disable each method independently from **Platform Settings → KYC Configuration**.

| Mode | Method | Admin Toggle | Notes |
|---|---|---|---|
| **Mode A** | Selfie with Handwritten Code | Always required — cannot be disabled | Identity liveness check |
| **Mode B** | Manual Government ID Upload | Enable / Disable | Admin manually reviews |
| **Mode C** | Digio API — Automated eKYC | Enable / Disable | Requires Digio account |

- Mode A is always required regardless of other settings.
- Mode B and Mode C can be toggled independently.
- At least one of Mode B or Mode C must remain active (enforced by settings validation).
- When Mode C is active, clean auto-passes skip the manual queue; borderline results route to admin review.

### 5.2 Mode A — Selfie with Handwritten Code (Always Required)
1. System generates a **unique 5-digit alphanumeric verification code** for the user
2. Code is valid for **48 hours**; user can regenerate once per 24 hours
3. User handwrites the code on a plain white paper
4. User uploads a **clear selfie holding the paper** with the code visible
5. Admin visually verifies: face is visible, code matches, paper is clearly shown

### 5.3 Mode B — Manual Government ID Upload
Accepted documents:
- PAN Card
- Voter ID (Elector's Photo Identity Card)
- Passport
- Driving License

> **Legal Note:** Direct Aadhaar collection by private platforms requires UIDAI authorization. Aadhaar is therefore **not accepted** as a standalone document under Mode B. The above IDs are legally collectible without special authorization.

User uploads a clear photo/scan of the chosen document. Admin manually verifies name, photo match, and document validity against the Mode A selfie.

### 5.4 Mode C — Digio API Automated eKYC
- Integration with **Digio** (UIDAI-authorized licensed KYC provider)
- Supports: Aadhaar-based eKYC (via Digio's licensed UIDAI access), PAN verification, face-match against selfie
- KYC result (pass/fail + confidence score) returned to platform automatically
- **High confidence passes** → auto-approved; profile moves to listing queue
- **Low confidence / flagged** → routed to admin manual review queue
- Digio API credentials (`client_id`, `client_secret`, environment) configurable from **Platform Settings → KYC Configuration**
- Client must procure a Digio account; per-verification costs billed directly by Digio

### 5.5 KYC Approval Flow
```
User submits KYC (Mode A always + Mode B or Mode C per settings) →
  Admin notified (queue alert)

  If Mode C (Digio) is active:
    Auto-verification result received
    [High Confidence → Auto-Approved] →
      Profile status: "KYC Verified"
      Profile moves to listing approval queue
      User notified: "KYC Approved"
    [Low Confidence / Flagged → Admin Queue] →
      Admin manually reviews selfie + Digio result

  Admin reviews (Mode B or flagged Mode C):
    [Approved] →
      Profile status: "KYC Verified"
      Profile moves to listing approval queue
      User notified: "KYC Approved"
    [Rejected] →
      Admin selects rejection reason:
        (Code not visible / ID unclear / Face mismatch / Suspicious / Expired document)
      User notified: "KYC Rejected — Reason: [reason]"
      New 5-digit code generated for resubmission
      Maximum 3 resubmission attempts
      4th attempt → Admin escalation flag raised on user record
```

### 5.6 KYC Data & DPDP Compliance
- KYC documents stored in **encrypted, signed-URL-only** object storage
- KYC document access restricted to admin roles with `kyc.view` permission only
- KYC documents deleted per data retention policy (account + 1 year)
- User consent for KYC data collection recorded separately
- Mode C (Digio): no raw biometric data stored on platform servers — Digio handles storage per their UIDAI compliance obligations

---

## 6. PROFILE VISIBILITY & PRIVACY LOGIC

### 6.1 Admin Field Visibility Control Panel
Admin can configure field-level visibility per audience type from a visual grid panel:

| Profile Field | Guest (Public) | Registered User | Community Member | Premium User |
|---|:---:|:---:|:---:|:---:|
| Display Name | ✅ | ✅ | ✅ | ✅ |
| Profile Photo (thumbnail) | ✅ | ✅ | ✅ | ✅ |
| Profile Photo (full) | ❌ | ✅ | ✅ | ✅ |
| Age | ✅ | ✅ | ✅ | ✅ |
| Height | ❌ | ✅ | ✅ | ✅ |
| Religion / Caste | ❌ | ✅ | ✅ | ✅ |
| Education | ❌ | ✅ | ✅ | ✅ |
| Occupation | ❌ | ✅ | ✅ | ✅ |
| Income Range | ❌ | Hidden | Hidden | ✅ |
| Location (City/State) | ❌ | ✅ | ✅ | ✅ |
| Phone Number | ❌ | ❌ | ❌ | ❌ |
| Email Address | ❌ | ❌ | ❌ | ❌ |
| Family Details | ❌ | Partial | Partial | ✅ |
| Horoscope Details | ❌ | Partial | Partial | ✅ |
| KYC Verified Badge | ✅ | ✅ | ✅ | ✅ |

> Every cell in the grid is a toggle controlled by Admin from the "Field Visibility" settings panel. Changes apply platform-wide immediately.
> Admin can also override visibility settings for individual profiles.

### 6.2 Profile View Tracking ("Who Viewed Me")
- Every profile view by a logged-in user is recorded: `viewer_id`, `viewed_profile_id`, `timestamp`
- "Who Viewed Me" feature is visible to **Premium and VIP** subscribers
- Free users see view count but not viewer identities
- If a viewer has set their profile to "browse anonymously" (Premium feature), they are excluded from the viewer list
- User can opt out of view tracking from privacy settings (DPDP consent)

### 6.3 Block User
- Any registered user can block another user
- Blocking effects:
  - Blocked user cannot view the blocker's profile
  - Blocked user cannot send interest or add to wishlist
  - Existing interest/wishlist entries from blocked user are hidden
  - Blocked user is not notified of the block
- Blocker can unblock at any time
- Admin can view block relationships in user management panel

### 6.4 Search & Filter
**Available to all Registered Users (Free):**
- Age range
- Location (state/city)
- Religion
- Caste
- Education level
- Marital status

**Available to Premium/VIP Users (Advanced Filters):**
- Height range
- Income range
- Occupation / Profession type
- Mother tongue
- Nakshatra / Rashi
- Gothram
- Dosham preference (Dosham-free / Dosham acceptable)
- Community membership
- KYC verified only filter
- Online/recently active filter

**Guest (Public) Users:**
- Can browse a limited public profile listing (no filter controls)
- Prompted to register to see full details and use filters

---

## 7. MATCHING & INTEREST FLOW

### 7.1 Wishlist
- Users can add profiles to their private Wishlist
- Wishlist is visible only to the user — not shared or visible to the wishlisted person
- Wishlist limit is subscription-based (see Section 11)

### 7.2 Interest Flow
```
User A views User B's profile →
  User A clicks "Send Interest" →
    Interest count checked against subscription limit
    If limit reached: prompt to upgrade subscription
    If within limit: Interest recorded and notification sent to User B

User B receives interest notification →
  User B can:
    [Accept] → Both users notified; system creates a Mutual Interest record
    [Decline] → User A notified (without specific reason)
    [Ignore] → Interest expires after 30 days (configurable by admin)

User A can withdraw interest at any time before User B responds
```

### 7.3 Mutual Match
```
Mutual Interest confirmed →
  Admin receives "Mutual Match Alert" in dashboard
  System creates a Match Communication Ticket
  Both users see status: "Mutual Interest — Awaiting Admin Review"
  Admin reviews both profiles and initiates communication coordination
```

### 7.4 Interest Rules
- Interest sends per month: subscription-limited (see Section 11)
- Interest expiry: 30 days if no response (admin-configurable)
- Interest withdrawal: allowed before acceptance
- Can Free users see who sent them interest? **(Pending client decision — recommended: yes for received interest, no for viewing sender profile details)**

---

## 8. COMMUNICATION FLOW

### 8.1 Direct Communication Policy
- Direct user-to-user chat and video calling are **NOT part of the platform**
- Users cannot see each other's phone numbers or email addresses at any stage
- Admin WhatsApp contact is shown on profile only **after mutual match confirmation**

### 8.2 Admin Communication Coordination (Match Ticket System)

**Match Ticket Lifecycle:**
```
1. OPEN       — Mutual match confirmed, pending admin review
2. IN REVIEW  — Admin has opened the ticket and reviewing both profiles
3. SCHEDULED  — Meeting/introduction arranged by admin
4. COMPLETED  — Introduction done; outcome recorded
5. CLOSED     — Match not proceeding (reason recorded by admin)
```

**Admin Actions per Ticket:**
- View both profiles side-by-side
- Add internal notes (not visible to users)
- Schedule a Google Meet (enter link + date/time → sent to both users via email)
- Record physical meeting arrangement
- Record assisted offline introduction
- Mark outcome: Proceeding / Not Proceeding / Engaged / Married (for success stories)
- Close ticket with reason

**User Dashboard — Match Status:**
- Users see their match ticket status (not admin notes)
- Status messages: "Under Review" / "Meeting Scheduled: [date/time]" / "Introduction Arranged" / "Closed"

### 8.3 Consent Before Meeting Arrangement
- Before admin shares any meeting details, system records that both users have consented to proceed
- Admin sees consent status per ticket before scheduling

---

## 9. IMAGE & CONTENT MODERATION

### 9.1 Moderation Queue
- All uploaded images enter a pending queue before being visible on the profile
- Admin/Moderator reviews queue: approve or reject with reason
- User notified on approval or rejection of each image

### 9.2 Admin Configuration Panel for Images
| Setting | Default Value | Configurable |
|---|---|---|
| Max images per profile | 5 | ✅ |
| Allowed file types | JPG, PNG, WEBP | ✅ |
| Max file size per image | 5 MB | ✅ |
| Minimum image dimensions | 400x400 px | ✅ |
| Enable watermarking | On | ✅ |
| Watermark text/logo | Platform name | ✅ |
| Watermark position | Bottom-right | ✅ |
| Moderation SLA target | 24 hours | ✅ |
| Alert admin if queue exceeds | 20 pending items | ✅ |

### 9.3 Image Categories
- **Profile Photo** — Primary visible photo (1 mandatory)
- **Gallery Photos** — Additional photos (up to max configured)
- **KYC Selfie** — Selfie with verification code (stored separately, restricted access)
- **KYC ID Document** — Government ID scan (stored separately, restricted access)
- **Horoscope Document** — PDF/image upload (stored separately)

### 9.4 Watermarking
- All approved profile and gallery photos are watermarked with the platform name/logo
- Watermark applied server-side before serving to users
- Original (unwatermarked) images stored securely in object storage
- Watermarking prevents photo theft and unauthorized use

---

## 10. HOROSCOPE & MATRIMONY DETAILS

### 10.1 Data Fields
| Field | Type | Required |
|---|---|---|
| Date of Birth | Date | Yes (from registration) |
| Time of Birth | Time | Optional |
| Place of Birth | Text | Optional |
| Nakshatra (Birth Star) | Dropdown (27 options) | Optional |
| Rashi (Moon Sign) | Dropdown (12 options) | Optional |
| Gothram | Text | Optional |
| Dosham | Multi-select (Mangal Dosham, Nadi Dosham, Chevvai Dosham, No Dosham) | Optional |
| Horoscope Document | File Upload (PDF/JPG/PNG, max 5MB) | Optional |
| Additional Horoscope Notes | Textarea | Optional |

### 10.2 Privacy
- Horoscope document is not visible to the public
- Horoscope details visibility controlled by Admin Field Visibility Panel (Section 6.1)
- Horoscope document download/sharing is not available to other users — only shared via admin coordination if required

### 10.3 Future Scope
- Astrology compatibility engine (Jathaka Porutham / Ashtakoota matching)
- Auto-calculation of Nakshatra/Rashi from date and time of birth

---

## 11. SUBSCRIPTION MANAGEMENT

### 11.1 Subscription Tiers

| Feature | Free | Premium | VIP |
|---|:---:|:---:|:---:|
| Profile visible in search | ✅ | ✅ Priority | ✅ Top listing |
| Wishlist limit | 5 | 25 | Unlimited |
| Interest sends per month | 3 | 20 | Unlimited |
| View received interests | ✅ | ✅ | ✅ |
| View interest sender profile | ❌ | ✅ | ✅ |
| "Who viewed me" (viewer list) | Count only | ✅ | ✅ |
| Advanced search filters | ❌ | ✅ | ✅ |
| Browse anonymously | ❌ | ✅ | ✅ |
| Horoscope details visible to matches | Partial | ✅ | ✅ |
| Income/salary visible to matches | ❌ | ✅ | ✅ |
| Premium profile badge | ❌ | ✅ | ✅ |
| Admin-assisted matchmaking priority | Standard | Standard | ✅ Priority |
| Photo gallery visible | 1 photo | ✅ | ✅ |

### 11.2 Community Subscriptions
- Each community can have a separate subscription plan in addition to or instead of the standard plans
- Community subscriptions can include community-specific features (e.g., community event invites, community-specific priority listing)
- Admin creates community subscription plans from the admin panel

### 11.3 Admin Subscription Controls
- Create, edit, activate, deactivate subscription plans
- Set pricing: INR per month / per quarter / per year
- Toggle individual features per plan
- Set subscription duration options
- Configure auto-renewal (default: ON, user can disable)
- Grace period on expiry: 7 days (configurable)
- Plan expiry notifications: 7 days, 3 days, 1 day before expiry

### 11.4 Coupon Management
| Coupon Type | Description |
|---|---|
| Percentage discount | e.g., 20% off |
| Flat INR discount | e.g., ₹500 off |
| Free days extension | e.g., +30 days free |
| First-time user offer | Only for new subscribers |
| Community-specific | Only for members of a specific community |

Coupon Settings:
- Usage limit (single-use / multi-use / user-specific)
- Validity period (start date to end date)
- Applicable plan(s)
- Minimum purchase amount (optional)

### 11.5 Subscription State Management
- **Active** — Currently subscribed and within validity
- **Expired** — Subscription ended; user on Free tier features
- **Grace Period** — Within 7-day grace after expiry
- **Cancelled** — User cancelled; active until end of billing period
- **Paused** — Admin can pause a subscription (e.g., account issue)

---

## 12. PAYMENT GATEWAY INTEGRATION

### 12.1 Gateway
- **Razorpay** (primary and only gateway)
- Supports: UPI, Debit/Credit Cards, Net Banking, Wallets
- Subscription billing via Razorpay Subscriptions API
- Razorpay `key_id` and `key_secret` stored securely and configurable from **Platform Settings → Payment Configuration** — never hardcoded in the application

### 12.2 Invoice & GST
- Auto-generate GST-compliant invoices for every transaction
- GST rate: Configurable from **Platform Settings → GST Configuration** (default: 18% for digital services — confirm exact rate with client's CA before go-live)
- Invoice must include: platform GSTIN, user details, plan details, GST breakup (CGST + SGST or IGST), invoice number, date
- Invoices stored as PDFs in object storage, accessible to user (download) and admin
- The following are all configurable from **Platform Settings → Business Information**:
  - Business / platform legal name
  - GSTIN
  - Registered business address
  - Invoice number prefix and starting sequence

### 12.3 Payment Flow
```
User selects plan →
  Coupon code entry (optional) →
  Total displayed with GST breakup →
  Razorpay payment modal opens →
    Payment Success →
      Webhook received → Subscription activated → Invoice generated → Email sent to user
    Payment Failure →
      User notified → Retry option → No subscription activated
    Webhook failure →
      Idempotency check on payment ID → Delayed activation → Alert admin
```

### 12.4 Refund & Cancellation Policy (Admin-Configurable)
The refund policy is fully dynamic and managed from **Platform Settings → Refund Policy**. Admin defines the rules; the system enforces them automatically.

**Configurable Policy Rules:**
| Setting | Options | Default |
|---|---|---|
| Free cancellation window | 0 – 72 hours (admin sets) | 24 hours |
| Refund type after free window | Full / Prorated / No Refund | Prorated |
| Admin-initiated cancellation refund | Full / Partial / No Refund | No Refund |
| Duplicate charge handling | Auto full refund | On |

**Refund Process:**
- User requests cancellation from account → system checks configured policy → eligibility displayed before user confirms
- Eligible refund initiated automatically via Razorpay Refund API
- Reflects in user's bank/UPI account within 5–7 business days (Razorpay standard)
- Admin can **override** refund eligibility per case from the individual payment detail view
- All refunds logged with: amount, reason, admin/system initiator, Razorpay refund ID, timestamp

### 12.5 Payment History & Reporting
- Full payment history accessible to user (subscription start/end, amount, invoice download)
- Admin can view all transactions, filter by date/plan/status
- Export payment report as CSV
- Failed payment tracking with retry status

---

## 13. GROUP & COMMUNITY MODULE

### 13.1 Community Creation
- **Only platform Super Admin/Admin** can create communities
- Community creation form: Name, Slug (SEO URL), Logo, Banner, Description, Category (caste/region/organization), Meta SEO fields
- Each community gets a unique public landing page: `/community/[slug]`

### 13.2 Community Membership Flow
```
User requests to join community (from community landing page or profile settings) →
  Request enters admin approval queue →
  Admin reviews and approves/rejects →
  User notified →
  On approval: User tagged as community member; community appears on their profile
```

- Only platform Admin/Moderator can approve community memberships (not Community Manager)
- A user can belong to **multiple communities**
- Community membership is shown as a badge on the user's profile

### 13.3 Community Manager Role
Community Manager (assigned per community by Admin) can:
- View the community member list
- Post community announcements (visible to members)
- Request admin to review a specific member's profile
- View community analytics (member count, active members, registrations)

Community Manager **cannot:**
- Approve or reject user profiles or community memberships
- Change subscription plans
- Access platform-wide admin features

### 13.4 Community Landing Page (Public)
Each community landing page includes:
- Community name, logo, banner
- Community description
- Member count (approximate)
- Featured success stories from the community
- Registration CTA ("Register as [Community Name] member")
- Admin-managed content via CMS

### 13.5 Community Visibility
- Community members see a filtered profile list showing only fellow community members (in addition to the main platform search)
- Community-specific subscription plans can be applied
- Non-members can view the community landing page but not the community member listing

### 13.6 Community Analytics (Admin)
- Total members per community
- New members this month
- Active profiles in community
- Interests/matches within community
- Community-specific subscription revenue

---

## 14. CMS & SEO MANAGEMENT

### 14.1 CMS Features
- WYSIWYG editor for all content pages
- Draft / Published / Archived states for all content
- Content versioning (last 10 versions per page)
- Scheduled publishing (publish at a future date/time)
- Admin manages: Public pages, Blogs, FAQs, Success Stories, SEO Landing Pages, Community pages

### 14.2 Blog Management
- Create/edit/delete blogs with WYSIWYG editor
- Blog categories and tags
- Featured image per blog
- Author name (can be a pen name / admin name)
- Published date/time
- SEO fields per blog: meta title, meta description, canonical URL, OG image

### 14.3 Success Stories
- Admin creates success stories with: couple names (optional/aliases), photo (optional), story text, community tag, date
- Featured success stories displayed on home page and community pages
- Linked to a matched couple's profile tickets (optional, for internal tracking)

### 14.4 SEO Management
Per page/blog/community/profile:
- Meta title (max 60 characters — enforced with counter)
- Meta description (max 160 characters — enforced with counter)
- OpenGraph title, description, image
- Twitter Card metadata
- Schema markup (Person schema for profiles, Organization schema for platform, Article schema for blogs)
- Canonical URL management
- Robots directives (index/noindex, follow/nofollow)

### 14.5 Technical SEO
- Auto-generated XML sitemap (static + dynamic profiles) — updated on content change
- `robots.txt` management from admin panel
- SEO-friendly URLs for all pages (slugs, no query-param-based URLs)
- Automatic 301 redirect management from admin panel
- OpenGraph and Twitter Card tags on all public pages
- Structured data (Schema.org) for profiles, blogs, success stories

---

## 15. PUBLIC PAGES

| Page | URL | Description |
|---|---|---|
| Home | `/` | Hero, featured profiles, how it works, success stories, CTA |
| Search/Browse | `/search` | Public profile browse (limited) |
| Profile Detail | `/profile/[id]` | Public profile page (SEO optimized) |
| About Us | `/about` | Platform story, team, mission |
| How It Works | `/how-it-works` | Step-by-step platform guide |
| Membership Plans | `/plans` | Subscription tier comparison |
| Success Stories | `/success-stories` | Community success stories |
| Community Index | `/communities` | All communities listing |
| Community Page | `/community/[slug]` | Individual community page |
| Blogs | `/blog` | Blog listing |
| Blog Post | `/blog/[slug]` | Individual blog post |
| FAQs | `/faq` | Frequently asked questions |
| Contact Us | `/contact` | Contact form + DPO contact |
| About Us | `/about` | Platform info |
| Terms & Conditions | `/terms` | Legal terms |
| Privacy Policy | `/privacy` | DPDP-compliant privacy policy |
| Cookie Policy | `/cookies` | Cookie usage details |
| Sitemap | `/sitemap.xml` | XML sitemap |
| 404 Error | — | Custom 404 page |
| 500 Error | — | Custom error page |

### Cookie Consent Banner
- Shown to all new visitors
- Options: Accept All / Accept Necessary Only / Manage Preferences
- Consent recorded per user/session
- No non-essential cookies set before consent

---

## 16. ACCOUNT MANAGEMENT

### 16.1 Authentication
- **Primary login:** Email + Password
- **Forgot Password:** Email-based reset link (valid 30 minutes)
- **Reset Password:** Secure token-based reset page
- **Session Management:**
  - Session valid for 7 days (remember me) or browser session
  - Users can view and revoke active sessions from account settings
  - Admin-triggered force logout (on suspension)
- **Admin Panel:** Mandatory 2-Factor Authentication (TOTP — Google Authenticator) for Super Admin and Admin roles; optional for other roles

### 16.2 Account Deactivation (User-initiated)
- User can deactivate their profile (profile hidden from search immediately)
- Account and data retained for 90 days
- User can reactivate within 90 days (profile re-approved without full KYC redo)
- After 90 days of deactivation: account moved to deletion queue

### 16.3 Account Deletion (DPDP — Right to Erasure)
```
User submits account deletion request →
  Confirmation email sent with 7-day cancellation window →
  If not cancelled within 7 days:
    Profile hidden immediately
    Personal data anonymized/erased within 30 days
    Payment records retained for 7 years (GST compliance)
    KYC documents deleted within 30 days
    Audit logs anonymized
    User notified of completion
```

### 16.4 Data Export (DPDP — Right to Access)
- User can request a download of all their personal data ("My Data Export")
- Export includes: profile data, interest history, match history, payment history, consent records
- Export delivered as a downloadable ZIP within 48 hours
- Export excludes: audit logs, internal admin notes

### 16.5 Inactive Account Policy
- Accounts with no login for **24 months** are flagged
- User notified via email: "Your account will be deleted in 30 days due to inactivity"
- If no login within 30 days: account deleted per DPDP data retention policy

---

## 17. STORAGE & SECURITY

### 17.1 Image Storage
- **Linode Object Storage** (India region) for all uploaded files
- Files served via **signed URLs** with expiry (default: 1 hour for private, CDN-cached for public)
- Folder structure: `/users/{userId}/profile/`, `/users/{userId}/gallery/`, `/users/{userId}/kyc/`, `/users/{userId}/horoscope/`
- KYC folder is **private-only** — no public signed URLs, admin access only
- Thumbnails generated server-side on upload (300x300 for grid, 800x800 for full view)
- Images optimized to WebP format on upload

### 17.2 Security Features
- **Passwords:** bcrypt hashing (min 12 rounds)
- **Authentication:** JWT with short expiry (15 min access token + 7-day refresh token)
- **Admin 2FA:** Deferred to Phase 2 (not implemented in Phase 1)
- **OTP:** Email OTP for registration; 6-digit, 10-minute expiry, max 3 attempts
- **Rate Limiting:** Per-IP and per-user rate limits on all API endpoints
- **CORS:** Strict allowlist of origins
- **HTTPS:** TLS 1.2+ enforced; HTTP redirected to HTTPS
- **Audit Logs:** All admin actions logged with user ID, action, timestamp, IP address
- **API Security:** All APIs require authentication except public listing endpoints
- **Input Validation:** Server-side validation on all inputs; parameterized queries (Prisma ORM)
- **SQL Injection / XSS Prevention:** Handled by Prisma and sanitized input middleware
- **Secure Headers:** HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- **VAPT:** Vulnerability Assessment & Penetration Testing recommended before production launch

### 17.3 Data Encryption
- All sensitive data at rest encrypted (database-level encryption for PII columns)
- KYC documents encrypted in object storage
- TLS in transit for all API communication

### 17.4 Backup & Recovery
- Database backups: daily automated backups, retained for 30 days
- Object storage: versioning enabled for critical assets
- Disaster recovery target: RTO 4 hours, RPO 24 hours

---

## 18. ADMIN PANEL & ANALYTICS

### 18.1 Dashboard KPIs
- Total registered users
- Approved profiles count
- Pending KYC approvals (with age indicator — items pending >24hrs flagged)
- Pending image approvals
- Subscription revenue (today / this month / this year)
- Active subscriptions breakdown by plan
- Mutual matches count
- Match tickets status summary
- Community member counts
- Daily new registrations (7-day chart)
- Interest-to-match conversion rate

### 18.2 User Management
- User list with filters: status, subscription, KYC status, community, registration date
- User profile detail view (all fields visible to admin)
- Actions: approve, suspend, delete, change subscription, add note, force logout
- Bulk actions: bulk approve, bulk reject, bulk suspend
- Export user list as CSV

### 18.3 KYC Moderation Queue
- List of pending KYC submissions with submission date
- Flagged items (>24hr SLA breached shown in red)
- KYC detail view: selfie, handwritten code, ID document side-by-side
- Approve / Reject with predefined rejection reasons
- Rejection reason sent to user in notification

### 18.4 Image Moderation Queue
- List of pending image approvals
- Image preview with user profile context
- Approve / Reject per image
- Bulk approve/reject
- SLA alert if queue backlog exceeds configured threshold

### 18.5 Subscription & Payment Management
- All subscriptions list with status
- Manual subscription assignment/override
- Payment history with filter by date, plan, status
- Refund initiation with reason
- Coupon management (create/edit/deactivate coupons)
- Revenue reports (exportable as CSV)

### 18.6 Match Communication Tickets
- All match tickets list with status
- Ticket detail: both profiles side-by-side, consent status, admin notes, meeting history
- Schedule meeting (Google Meet link + date/time)
- Update ticket status
- Close ticket with outcome

### 18.7 Notification Management
- View/edit notification templates (email, in-app)
- Send manual notification to a user or segment
- Notification log (sent/delivered/failed)

### 18.8 Audit Logs
- All admin actions logged: who / what / when / IP
- Filterable by admin user, action type, date range
- Exportable as CSV
- Non-deletable (append-only log table)

### 18.9 Field Visibility Control Panel
- Visual grid: rows = profile fields, columns = audience types
- Each cell = ON/OFF toggle
- Save publishes changes platform-wide immediately
- Change history maintained

### 18.10 Platform Settings
A centralised settings panel (Super Admin only) that controls all platform-wide configuration without requiring code changes or redeployment.

**Payment Configuration**
| Setting | Description |
|---|---|
| Razorpay Key ID | Live / Test mode key |
| Razorpay Key Secret | Stored encrypted |
| Razorpay Mode | Test / Live toggle |

**GST Configuration**
| Setting | Description |
|---|---|
| GST Rate (%) | Default: 18% |
| GST Type | CGST+SGST / IGST based on customer state |

**Business Information**
| Setting | Description |
|---|---|
| Platform Legal Name | For invoices and legal documents |
| GSTIN | Platform GST registration number |
| Registered Address | For invoice footer |
| Invoice Prefix | e.g., INV-, MAT- |
| Invoice Starting Number | Sequence start value |

**KYC Configuration**
| Setting | Description |
|---|---|
| Mode B (Manual ID) | Enable / Disable |
| Mode C (Digio API) | Enable / Disable |
| Digio Client ID | API credential |
| Digio Client Secret | Stored encrypted |
| Digio Environment | Sandbox / Production |
| Max KYC resubmission attempts | Default: 3 |

**Notification Configuration**
| Setting | Description |
|---|---|
| Email Provider | AWS SES / SendGrid (toggle) |
| AWS SES — Region, Access Key, Secret | Stored encrypted |
| SendGrid API Key | Stored encrypted |
| Sender Email Address | e.g., noreply@platform.com |
| Sender Display Name | e.g., Platform Name |
| SMS Provider | Enabled / Disabled |
| SMS Gateway API Key | Stored encrypted |
| SMS Sender ID | Regulatory DLT sender ID |

**Refund Policy**
| Setting | Description |
|---|---|
| Free cancellation window (hours) | 0–72 |
| Refund type after window | Full / Prorated / No Refund |
| Admin cancellation refund | Full / Partial / No Refund |

**DPDP / Legal Configuration**
| Setting | Description |
|---|---|
| DPO Name | Published on Privacy Policy and Contact pages |
| DPO Email Address | Published publicly |
| DPO Phone (optional) | Published publicly |
| Data Retention — Inactive accounts (months) | Default: 24 months |
| Data Retention — Post-deletion hold (days) | Default: 30 days |

**Environment / Deployment**
| Setting | Description |
|---|---|
| Staging Domain | e.g., staging.platform.com |
| Production Domain | e.g., platform.com |
| Maintenance Mode | Enable / Disable with custom message |

> All secrets (API keys, credentials) are stored **encrypted at rest** in the database. They are never exposed in API responses — only write-only input fields in the settings UI.

---

## 19. NOTIFICATION SYSTEM

### 19.1 Notification Events & Channels
SMS is implemented in **Phase 1** and can be globally enabled or disabled from **Platform Settings → Notification Configuration → SMS Provider**. When disabled, only Email and In-App channels fire.

| Event | Email | In-App | SMS* |
|---|:---:|:---:|:---:|
| Email OTP during registration | ✅ | ❌ | ❌ |
| Profile approved | ✅ | ✅ | ✅ |
| Profile rejected (with reason) | ✅ | ✅ | ✅ |
| KYC approved | ✅ | ✅ | ✅ |
| KYC rejected (with reason) | ✅ | ✅ | ✅ |
| Image approved | ❌ | ✅ | ❌ |
| Image rejected | ✅ | ✅ | ❌ |
| Interest received | ✅ | ✅ | ✅ |
| Interest accepted | ✅ | ✅ | ✅ |
| Interest declined | ❌ | ✅ | ❌ |
| Mutual match confirmed | ✅ | ✅ | ✅ |
| Meeting scheduled by admin | ✅ | ✅ | ✅ |
| Subscription activated | ✅ | ✅ | ✅ |
| Subscription expiry reminder (7d, 3d, 1d) | ✅ | ✅ | ✅ |
| Payment confirmed | ✅ | ❌ | ✅ |
| Payment failed | ✅ | ✅ | ✅ |
| Refund processed | ✅ | ✅ | ✅ |
| Account deletion confirmation | ✅ | ❌ | ❌ |
| Data export ready | ✅ | ✅ | ❌ |
| Inactivity warning | ✅ | ❌ | ❌ |
| Data breach notification | ✅ | ✅ | ❌ |

> *SMS fires only when SMS Provider is enabled in Platform Settings. Client must register a DLT Sender ID with TRAI and provide SMS gateway credentials.

### 19.2 User Notification Preferences
- Users can manage notification preferences from account settings
- Toggle email notifications per event category (marketing vs transactional)
- **Transactional notifications** (OTP, payment, account) cannot be disabled
- **Preference changes** are recorded (DPDP consent tracking)

### 19.3 Admin Notification Templates
- Admin can edit subject and body of all email notification templates
- Template variables supported (e.g., `{{user_name}}`, `{{plan_name}}`, `{{meeting_link}}`)
- Preview template before saving
- Template version history

### 19.4 Email & SMS Service
- Both **AWS SES** and **SendGrid** are implemented; active provider toggled from **Platform Settings → Notification Configuration → Email Provider**
- Switching providers requires only a settings change — no code redeployment
- Bounce and complaint handling for both providers
- Email delivery status tracked in notification log (sent / delivered / bounced / failed)
- **SMS gateway** integrated in Phase 1; enabled/disabled from Platform Settings
- SMS provider credentials (API key, Sender ID) configured from Platform Settings
- Client must register **DLT Sender ID** with TRAI for SMS delivery in India (regulatory requirement)

---

## 20. TECHNOLOGY STACK

### Frontend
- **Framework:** Next.js (latest stable version) with TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide Icons
- **Forms:** React Hook Form + Zod validation
- **State Management:** Zustand  
- **HTTP Client:** Axios / TanStack Query (React Query)
- **Rich Text Editor (CMS):** TipTap or Quill

### Backend
- **API:** Next.js API Routes / Route Handlers
- **ORM:** Prisma ORM
- **Authentication:** Custom JWT (Access + Refresh token pattern)
- **Admin 2FA:** TOTP (speakeasy library)
- **File Upload:** Multer + direct upload to Linode Object Storage via S3-compatible SDK
- **Queue System:** BullMQ (Redis-backed) for async jobs (image processing, notifications, exports)
- **Background Jobs:** Image watermarking, thumbnail generation, email sending, data export

### Database
- **Primary:** PostgreSQL
- **Cache:** Redis (session store, rate limiting, queue backend)

### Infrastructure
- **Storage:** Linode Object Storage (S3-compatible, India region)
- **Cache/Queue:** Redis (Linode managed or self-hosted on VPS)
- **CDN:** Cloudflare CDN for public static assets (profile images, thumbnails)
- **Server:** Linode VPS (India region) — Node.js server or containerized
- **Deployment:** Docker + manual or CI/CD pipeline (GitHub Actions)
- **Monitoring:** Sentry (error tracking), Uptime monitoring (BetterUptime or similar)

### DPDP Compliance Technical Stack
- Consent records: dedicated database table with immutable append-only design
- Audit logs: append-only log table in PostgreSQL
- Data erasure: automated job triggered by deletion request, tracked to completion
- Data export: BullMQ job generating ZIP archive, stored temporarily in object storage

---

## 21. UI/UX REQUIREMENTS

### 21.1 Design Language
- **Theme:** Royal Gold & Deep Maroon — glassmorphism style, premium matrimony aesthetic
- **Style:** Dark background with frosted-glass cards, glowing gold accents, animated blob gradients
- **Tone:** Culturally resonant, trust-focused, elegant — not flashy

### 21.2 Color Palette

| Token | Value | Usage |
|---|---|---|
| Maroon 700 | `#7B1D1D` | Primary brand, active states |
| Maroon 800 | `#5C1212` | Darker hover states |
| Gold 500 | `#C9972C` | CTA buttons, accents, borders |
| Gold 300 | `#E8C76A` | Highlights, shimmer text |
| Background | `#1a0505` | Page base |
| Glass Surface | `rgba(255,255,255,0.05–0.08)` | All cards and panels |
| Glass Border | `rgba(255,255,255,0.09–0.12)` | Card borders |
| Gold Glass | `rgba(201,151,44,0.12)` | Featured / VIP cards |

### 21.3 Typography

| Role | Font | Notes |
|---|---|---|
| **Primary / Body** | **Plus Jakarta Sans** | All body text, UI labels, forms |
| Display / Headings | Playfair Display | Section headings, hero title |
| Accent / Decorative | DM Serif Display | Price figures, ornamental text |

- All three fonts loaded via Google Fonts
- Primary body font is **Plus Jakarta Sans** (weights: 400, 500, 600, 700)

### 21.4 Glassmorphism Design Rules
- **Background:** Fixed full-page dark maroon gradient with 4 animated blurred blobs
- **Cards:** `backdrop-filter: blur(18–24px)` + `rgba(255,255,255,0.05)` background + `1px rgba(255,255,255,0.09)` border
- **Gold glass cards:** Used for Featured profiles and VIP plan — `rgba(201,151,44,0.12)` tint with gold border
- **Navbar:** `backdrop-filter: blur(20px)` on scroll, transparent on hero
- **Buttons (primary):** Gold gradient shimmer with `box-shadow` glow on hover
- **Buttons (secondary):** Glass button — `rgba(255,255,255,0.08)` with white border
- **Tags/Badges:** Glass tag (`rgba(201,151,44,0.12)` + gold border) or white-glass variant
- **All text on glass:** White (`#fff`) for headings, `rgba(255,255,255,0.6)` for secondary text

### 21.5 General UX
- **Mobile-first:** Fully responsive, optimized for mobile devices
- **Performance targets:** LCP < 2.5s, FID < 100ms, CLS < 0.1 (Core Web Vitals)
- **Accessibility:** WCAG 2.1 AA compliance
- **Onboarding:** Multi-step onboarding with progress indicator and save-and-continue support
- **Empty states:** Meaningful empty state screens with CTAs (e.g., no matches yet)
- **Loading states:** Skeleton loaders on all data-fetching components
- **Error handling:** User-friendly error messages (no raw error codes exposed)
- **Image blur:** Profile photos shown as blurred thumbnails for guests; full photo after registration
- **Dark/Light mode:** Dark theme is the default; Light mode optional (Phase 2)
- **Multi-language:** Phase 2 (Tamil, Hindi, Telugu as priority languages)

---

## 22. FUTURE ENHANCEMENTS

| Enhancement | Priority | Phase |
|---|---|---|
| Mobile applications (iOS + Android) | High | Phase 3 |
| SMS notifications (OTP + alerts) | Medium | Phase 2 |
| Multi-language support (Tamil, Hindi, Telugu) | High | Phase 2 |
| Aadhaar-based KYC via licensed API (IDfy/Digio) | Medium | Phase 2 |
| AI-based profile matchmaking recommendations | Medium | Phase 3 |
| AI fraud detection on KYC photos | Medium | Phase 2 |
| AI image moderation (auto-reject inappropriate images) | Medium | Phase 2 |
| Astrology compatibility engine (Jathaka Porutham) | Low | Phase 3 |
| WhatsApp notification integration | Medium | Phase 2 |
| Dark mode UI | Low | Phase 2 |
| Video profile introduction upload | Low | Phase 3 |
| Affiliate/referral program | Low | Phase 3 |

---

## 23. FINAL DELIVERABLES

### Platform
- Matrimony web platform (Next.js)
- Admin panel (integrated, role-based)

### Features
- DPDP Act 2023 compliant data flows
- Permission-based dynamic RBAC system
- User registration, profile completion, and KYC workflow
- Admin approval workflow (KYC, images, profiles)
- Profile visibility with admin field control panel
- Search & filter (basic + advanced)
- Wishlist, Interest, Mutual Match flows
- Admin Match Communication Ticket system
- Image moderation with watermarking
- Subscription management (Free, Premium, VIP, Community)
- Razorpay payment integration with GST invoices
- Refund/cancellation management
- Community module with admin-controlled membership
- CMS with WYSIWYG editor, versioning, scheduling
- SEO management (meta, OG, schema, sitemap, robots.txt)
- Notification system (email + in-app) with user preferences
- Account management (deactivation, deletion, data export)
- DPDP compliance flows (consent, erasure, breach notification, DPO contact)
- Admin dashboard with KPIs and analytics
- Audit logs

### Documentation
- Technical architecture document
- API documentation
- Database schema documentation
- Admin panel user guide
- DPDP compliance artifact documents (Privacy Policy, Terms, Data Retention Policy, Data Breach Response Plan)
- Deployment guide

---

## 24. DECISIONS — RESOLVED

All previously open decisions have been resolved. The table below records each decision and its outcome for reference.

| # | Decision | Resolution | Where Implemented |
|---|---|---|---|
| 1 | Subscription pricing currency | **INR** — exact pricing amounts to be entered by admin via Platform Settings | Section 11, Section 18.10 |
| 2 | KYC method | **All three modes implemented in Phase 1** (Selfie+Code, Manual Govt ID, Digio API); each mode can be enabled/disabled from Platform Settings | Section 5, Section 18.10 |
| 3 | Max KYC resubmission attempts | **3 attempts** before escalation flag; configurable from Platform Settings | Section 5.5, Section 18.10 |
| 4 | Can Free users see interest sender profile? | **No — Paid plans only** (Premium, VIP) can view sender profile | Section 11.1 |
| 5 | Refund policy type | **Fully dynamic** — admin configures all refund rules from Platform Settings → Refund Policy | Section 12.4, Section 18.10 |
| 6 | GST rate | **Configurable** from Platform Settings → GST Configuration (default: 18%) | Section 12.2, Section 18.10 |
| 7 | Business details for invoices | **Configurable** from Platform Settings → Business Information (GSTIN, name, address, invoice prefix) | Section 12.2, Section 18.10 |
| 8 | Razorpay API keys | **Configurable** from Platform Settings → Payment Configuration; stored encrypted | Section 12.1, Section 18.10 |
| 9 | Email service provider | **Both AWS SES and SendGrid implemented**; active provider toggled from Platform Settings | Section 19.4, Section 18.10 |
| 10 | DPO contact details | **Configurable** from Platform Settings → DPDP / Legal Configuration; auto-published on Privacy Policy and Contact pages | Section 2.7, Section 18.10 |
| 11 | Staging / production domain | **Configurable** from Platform Settings → Environment / Deployment | Section 18.10 |
| 12 | SMS notifications phase | **Phase 1** — implemented but can be globally enabled/disabled from Platform Settings; client must register DLT Sender ID with TRAI | Section 19.1, Section 19.4, Section 18.10 |
| 13 | Auto-renewal default | **ON by default** — user can disable from account settings | Section 11.3 |
| 14 | Interest expiry period | **30 days** — configurable from admin subscription settings | Section 7.2 |
| 15 | Admin 2FA | **Deferred to Phase 2** — not implemented in Phase 1 | Section 17.2 |

---

## 25. IMPORTANT NOTES

### Scope of Development
All development, implementation, and integration work is included in the development scope. This includes:
- Full platform development (frontend + backend + admin panel)
- DPDP compliance technical implementation
- Third-party service integration (Razorpay, email provider, object storage)
- Technical documentation

### Client Responsibilities
All external third-party service charges and infrastructure costs are borne by the client directly:
- Domain registration and renewals
- Server/VPS/Cloud hosting (Linode)
- Linode Object Storage charges
- CDN services (Cloudflare)
- SMS gateway services (Phase 1 — required if SMS is enabled)
- Email service provider (AWS SES or SendGrid)
- Razorpay payment gateway charges and account
- Any API or subscription-based external services
- Future third-party integrations

### Legal Compliance
- The client is responsible for designating a **Data Protection Officer (DPO)** as required by the DPDP Act 2023
- The client is responsible for registering with the **Data Protection Board of India** as required
- DPDP compliance artifacts (Privacy Policy, Terms, DPA templates) will be prepared by the development team but must be **reviewed and approved by the client's legal counsel** before publication
- The client is responsible for maintaining DPDP compliance post-launch (employee training, periodic audits)
- KYC document handling and data breach response are the platform operator's (client's) legal responsibility

### Development Phases
- **Phase 1:** Core platform — all features in this document, including SMS notifications (admin-toggled), Digio KYC API, multi-provider email, configurable Platform Settings
- **Phase 2:** Multi-language support (Tamil, Hindi, Telugu), Admin 2FA, WhatsApp notifications, dark mode UI
- **Phase 3:** Mobile apps (iOS + Android), AI matchmaking, AI fraud detection, astrology compatibility engine

---

*Document Version: 2.1 | Last Updated: June 2026*
*Status: All decisions resolved — Ready for development scoping and estimation*

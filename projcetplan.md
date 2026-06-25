1. PROJECT OVERVIEW
The platform is a premium verified matrimony ecosystem focused on secure matchmaking, manual profile verification, controlled communication, subscription management, and community-based profile discovery.
The platform will support:
• Verified matrimonial profiles
• Community/group-based registrations
• Admin-controlled matchmaking flow
• Subscription-based feature access
• Advanced privacy controls
• Horoscope-based matchmaking
• SEO-optimized public discovery pages
• Secure image and KYC verification workflows

2. USER ROLES & ROLE-BASED ACCESS CONTROL
The platform must support granular role-based permissions.
Roles:
• Super Admin
• Admin
• Moderator
• Subscription Manager
• CMS Manager
• Support Executive
• Community/Group Manager
• Registered User
• Premium User

Permissions should support:
• User approvals
• KYC approvals
• Image approvals
• Subscription management
• SEO management
• CMS management
• Dashboard analytics
• User suspension
• Profile visibility controls
• Report handling

3. USER REGISTRATION & PROFILE FLOW

STEP 1 – BASIC REGISTRATION
• Mobile number registration
• EMAIL OTP verification
• Email verification (optional)
• Basic signup form

STEP 2 – PROFILE COMPLETION
Users must complete:
• Personal details
• Family details
• Education & profession
• Partner preferences
• Detailed horoscope details
• Community details
• Image uploads

STEP 3 – KYC VERIFICATION
• System generates unique 3-digit verification code
• User writes code on white paper
• User uploads selfie holding white paper with code
• Manual admin verification required

STEP 4 – ADMIN APPROVAL
Admin manually verifies:
• KYC
• Uploaded photos
• Profile information
• Fraud/spam validation

STEP 5 – PUBLIC LISTING
• Only approved profiles will appear publicly
• Unapproved profiles remain hidden




4. PROFILE VISIBILITY & PRIVACY LOGIC

Public users:
• Can see approved profiles
• Sensitive information remains hidden

Community users:
• Can see approved profiles
• Only name and limited public details visible

Sensitive information includes:
• Phone number
• Email
• Salary
• Address
• Confidential family information

Admin Controls:
• Admin can override visibility settings
• Admin can enable/disable any profile data
• Admin can suspend or hide profiles



5. MATCHING & INTEREST FLOW

• Users can add profiles to Wishlist
• Users can mark “Interested” on profiles
• Opposite profile receives notification
• If both users express interest:
    → Admin receives mutual match alert
    → Admin initiates controlled communication process



6. COMMUNICATION FLOW

Direct user chat and video calling are NOT required.

Communication Process:
• Users cannot see each other’s phone numbers
• Only admin WhatsApp contact will be shown
• Admin manually coordinates communication

After mutual interest:
• Admin may arrange:
    • Google Meet online meeting
    • Physical meeting
    • Assisted offline introductions
Communication access is controlled by admin approval.

7. IMAGE & CONTENT MODERATION

All uploaded content requires manual approval.

Requirements:
• Image moderation queue
• Approve/reject images
• Admin review system
• Prevent fake or abusive uploads
• Optional future AI moderation support


8. HOROSCOPE & MATRIMONY DETAILS
The platform must support detailed horoscope collection.
Fields:

• Date of birth
• Time of birth
• Place of birth
• Nakshatra
• Rashi
• Gothram
• Dosham details
• Horoscope document uploads


Future Scope:
• Astrology compatibility engine
9. SUBSCRIPTION MANAGEMENT

The platform requires flexible subscription management.

Subscription Types:


• Free
• Premium
• VIP
• Community subscriptions


Feature-level access:


• Wishlist limits
• Number of interests
• Premium visibility
• Access to advanced filters
• Priority listings


Admin Controls:


• Dynamic pricing
• Subscription duration
• Coupon management
• Feature configuration
• Community-specific subscriptions


10. PAYMENT GATEWAY INTEGRATION
Required:


• Razorpay / Stripe integration
• UPI payments
• Subscription billing
• Payment history
• Invoice tracking
• Failed payment handling


11. GROUP & COMMUNITY MODULE
The platform should support:

• Community/group registrations
• Community landing pages
• Community-based subscriptions
• Group member management


Important:
• Only platform admins can approve users
• Communities cannot independently approve users
• Revenue sharing is NOT required

12. CMS & SEO MANAGEMENT
Admin should manage:

• Public pages
• Blogs
• FAQs
• Success stories
• SEO landing pages
• Dynamic metadata


SEO Features:

• Meta title management
• Meta descriptions
• OpenGraph tags
• Schema markup
• Sitemap generation
• SEO-friendly URLs


13. PUBLIC PAGES
Required public pages:

• Home page
• About Us
• Contact Us
• Community pages
• Success stories
• Membership plans
• Blogs
• Terms & Conditions
• Privacy Policy


14. ACCOUNT MANAGEMENT
Required features:

• Forgot password
• Reset password
• Account deletion request
• User profile deactivation
• Reactivation flow


15. STORAGE & SECURITY
Image Storage:


• Linode Object Storage integration
• Secure image access
• Signed URLs
• Image optimization
• Thumbnail generation


Security Features:

• Encrypted passwords
• Secure authentication
• OTP verification
• Fraud prevention
• Audit logs
• Role-based access
• Rate limiting
• Secure APIs


16. ADMIN PANEL & ANALYTICS
Admin Dashboard KPIs:

• Total users
• Approved profiles
• Pending KYC approvals
• Subscription revenue
• Active subscriptions
• Mutual matches
• Community analytics
• Daily registrations
• Interest conversion metrics


Admin Features:

• User management
• Profile moderation
• Subscription controls
• Notification management
• Reports handling
• Audit logs
• CMS management


17. NOTIFICATION SYSTEM
Notifications required:

• OTP verification
• Interest alerts
• Mutual match alerts
• Admin approval notifications
• Subscription reminders
• Payment confirmations


Channels:

• Email
• WhatsApp notifications (future)


18. TECHNOLOGY STACK
Frontend:

• Latest Next.js version
• TypeScript
• Tailwind CSS
• Advanced UI/UX architecture


Backend:
• Next.js APIs / Node.js services
• Prisma ORM

Database:
• PostgreSQL

Infrastructure:

• Linode Object Storage
• Redis caching
• Queue system
• CDN integration

19. UI/UX REQUIREMENTS

Requirements:

• Premium modern UI
• Mobile-first responsive design
• Fast loading performance
• Advanced UX interactions
• Accessibility support
• Smooth onboarding flows


20. FUTURE ENHANCEMENTS
Possible future upgrades:

• Mobile applications
• AI matchmaking
• AI fraud detection
• AI moderation
• Astrology compatibility engine
• AI profile recommendations


21. FINAL DELIVERABLES

Deliverables:

• Matrimony web platform
• Admin panel
• Role management system
• Subscription management
• KYC verification workflow
• CMS management
• SEO setup
• Payment integration
• Deployment setup
• Technical documentation


22. IMPORTANT NOTE

All external third-party service charges and infrastructure costs will be borne by the client directly.
This includes, but is not limited to:


• Domain registration and renewals
• Server/VPS/Cloud hosting charges
• Linode Object Storage charges
• CDN services
• SMS gateway services
• Email service providers
• Payment gateway charges
• Any API or subscription-based external services
• Future third-party integrations


The development scope includes only implementation and integration support. Any recurring or one-time payments for external platforms, infrastructure, or services must be purchased and maintained by the client.

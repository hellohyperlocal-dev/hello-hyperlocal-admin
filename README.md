# Hello Hyperlocal — Admin Portal

Central administration and back-office management portal for **Hello Hyperlocal** (starting with Hello Linden). Built with Next.js 16 (App Router & Turbopack), TypeScript, Tailwind CSS v4, and shadcn/ui.

Operates on the same Supabase database and Cloudflare R2 media infrastructure used by the Expo mobile app (`hello-hyperlocal-rebuild`) and marketing landing page (`hello-hyperlocal-landing-v2`).

---

## Features & Modules

### 1. Overview & Analytics
- **Dashboard (`/`)**: High-level system overview, quick action shortcuts, recent audit activity logs.
- **Website Traffic (`/analytics`)**: Embedded Google Analytics 4 (GA4) traffic overview for the landing page (`hellohyperlocal.co.za`).

### 2. Community & Content Moderation
- **Moderation (`/moderation`)**: Review and approve/reject pending community posts, marketplace items, love local offers, and flagged user reports.
  - Guarded with `AlertDialog` confirmations and required moderation notes.
  - Direct **"Create Community Post"** button to publish pre-approved neighborhood announcements.
- **Businesses & Listings (`/listings`)**: Manage local directory businesses, marketplace ads, and Love Local discount specials.
  - Multi-tab creation dialog supporting cover photos, pricing, specials tags, and categories.
- **Ward Updates (`/ward-updates`)**: Broadcast municipal alerts, load-shedding schedules, water outages, and road closures.
  - Attribute directly to specific ward councillors or pin to the top of mobile feeds.
- **Registrations (`/registrations`)**: Triage interest submissions, founding neighbors, and partner requests originating from the landing page.

### 3. Directory & Team Management
- **Users (`/users`)**: Comprehensive resident, business, and councillor directory with search, filtering, and deep profile inspector (`/users/[id]`).
  - Account suspension modal with `AlertDialog` confirmation and audit logging.
  - Direct **"Add User"** modal to provision resident or business accounts without manual mobile signup.
- **Ward Councillors (`/councillors`)**: Manage civic representatives.
  - Generate 7-day mobile deep-link invites (`hello-hyperlocal://invite/<token>`).
  - Create direct councillor accounts with pre-set temporary passwords.
- **Admin Team (`/admin-team`)**: Manage dashboard operators with full role-based access control.

### 4. Media Storage & Zero-Egress Architecture (Cloudflare R2)
- High-efficiency media storage backed by **Cloudflare R2** with **zero egress fees**.
- **Automatic Compression**: Uploaded images are compressed to next-gen **WebP** (max dimension 1600px, quality 80) via `sharp`, achieving **60% to 95% bandwidth and storage reductions**.
- **Free Shadcn `FileUploader`**: Multi-file dropzone with real-time uploading progress bars, size formatting, fail states, and instant CDN preview.
- **`AvatarUploader`**: Profile avatar uploader in Account Settings, updating sidebar avatars in real-time.

### 5. In-App Notifications & Warning Dialogs
- **Notification Bell in Header**: Pulsing badge alerting admins to pending content, flagged reports, and new landing page registrations.
- **AlertDialog Guardrails**: High-impact destructive operations (user suspension, post rejection) require explicit modal confirmation.
- **Sonner Toast System**: Real-time feedback for all asynchronous server actions.
- **Global Error Boundary (`error.tsx`) & 404 (`not-found.tsx`)**: Branded recovery views in case of network drops or missing routes.

### 6. Design & Typography Alignment
- **Branding**: Custom **Star-13 `HyperlocalLogo`** with brand grass (`#7ED957`) and dark spruce (`#1C472A`) gradients.
- **Typography**: Exact parity with the landing page:
  - **Headings (`--font-heading`)**: **Bricolage Grotesque** across all page titles, card headers, and modals.
  - **Body (`--font-sans`)**: **Geist** for crisp UI copy, tables, forms, and inputs.
  - **Code (`--font-mono`)**: **Geist Mono** for hashes, tokens, and technical identifiers.

---

## Environment Configuration

Create a `.env.local` file in the project root:

```env
# Supabase (Shared with Mobile App)
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Server-Only Service Role Secret (Never expose to client)
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Mobile Deep-Link Scheme
NEXT_PUBLIC_MOBILE_APP_SCHEME=hello-hyperlocal

# Resend (Email Provider for Invites/OTP)
RESEND_API_KEY=re_<key>

# Cloudflare R2 Media Storage (Zero Egress Media Delivery)
R2_ACCOUNT_ID=<cloudflare-account-id>
R2_BUCKET_NAME=media
R2_ACCESS_KEY_ID=<r2-access-key-id>
R2_SECRET_ACCESS_KEY=<r2-secret-access-key>
R2_PUBLIC_URL=https://pub-<hash>.r2.dev

# Google Analytics 4 Data API (Service Account)
GA4_PROPERTY_ID=<property-id>
GA4_CLIENT_EMAIL=<service-account-email>
GA4_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## Development

```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev

# Run production build check
npm run build
```

---

## Security & Architecture Principles

- **Separation of Privileges**: Client components only use the anonymous Supabase client respecting RLS. Mutative operations, audit logs, and privileged record queries execute through server-only actions using `createAdminClient()`.
- **Append-Only Audit Trail**: Every sensitive action (invites, user suspensions, moderation approvals/rejections, profile edits) writes to `admin_activity_log`.
- **Media Preservation**: Uploads generate unique cryptographic UUID timestamps and cache-control headers (`public, max-age=31536000, immutable`), preventing cache thrashing.

# Hello Linden: Community Projects & Inquiries Admin Portal Specification

This document provides complete instructions for the Admin Portal chat to build the admin side of Community Projects and Inquiries for Hello Linden / Hello Hyperlocal.

---

## 1. Supabase Project Handover Details

- **Project URL**: `https://jeesrwrmpsutigeedcry.supabase.co`
- **Inquiries Table**: `public.community_project_inquiries`
- **Projects Table**: `public.community_projects`
- **Pledges Table**: `public.project_pledges`
- **Migration File**: `supabase/migrations/0023_community_project_inquiries.sql`

---

## 2. Business Logic & App Parity

In the Hello Linden mobile app:
- Residents discover local civic initiatives (e.g. 7th Street Verge Planting, Emma Park Restoration, CCTV Grid, Pothole Blitz).
- To eliminate App Store review scrutiny, financial liability, and banking fees, the mobile app has **zero financial transactions**.
- Instead, residents tap **"How Can I Get Involved?"** and submit a structured civic inquiry offering:
  - Volunteer Time (working bees)
  - Materials or Tools (plants, paint, timber)
  - Professional Skills (landscaping, legal, carpentry)
  - Financial Support (asking the committee for official bank / PBO invoice details offline)
  - General Inquiry
- These inquiries save directly into `community_project_inquiries` in Supabase.

The Admin Portal needs two core capabilities:
1. **Manual Projects Management (CRUD)**: Admins create, edit, update funding progress, and manage civic projects.
2. **Community Inquiries Engine**: Admins view, filter, track, and follow up with residents who offered help through the mobile app.

---

## 3. Database Schema (Already Live in Supabase)

All tables, indices, and RLS policies are already migrated and live in the Supabase instance.

### Table 1: `public.community_projects`
Stores the civic initiatives shown in the app feed.

| Column | Type | Constraints / Defaults | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, `gen_random_uuid()` | Unique project ID |
| `suburb_slug` | TEXT | NOT NULL, DEFAULT `'linden'` | Suburb scope |
| `title` | TEXT | NOT NULL | Project headline |
| `description` | TEXT | NOT NULL | Detailed narrative and project goals |
| `category` | TEXT | NOT NULL, DEFAULT `'Infrastructure'` | Category: `Security`, `Parks`, `Infrastructure`, `Municipal`, `Relief`, `Heritage`, `Solar & Power` |
| `target_amount` | NUMERIC(10, 2) | NOT NULL, `CHECK (target_amount > 0)` | Total budget required in ZAR |
| `current_amount_raised` | NUMERIC(10, 2) | NOT NULL, DEFAULT `0.00` | Current funds pledged / raised in ZAR |
| `organizer_name` | TEXT | NOT NULL, DEFAULT `'Linden Community Association'` | Committee, CPF, or initiative leader |
| `image_url` | TEXT | NULLABLE | Cover photo URL |
| `status` | TEXT | NOT NULL, DEFAULT `'active'` | Status: `active`, `funded`, `completed` |
| `deadline` | TIMESTAMPTZ | NULLABLE | Target completion or deadline date |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `NOW()` | Timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `NOW()` | Timestamp |

### Table 2: `public.community_project_inquiries`
Stores resident submissions from the "How Can I Get Involved?" modal in the mobile app.

| Column | Type | Constraints / Defaults | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, `gen_random_uuid()` | Unique inquiry ID |
| `project_id` | UUID | REFERENCES `community_projects(id)` ON DELETE SET NULL | Linked project |
| `project_title` | TEXT | NOT NULL | Project title snapshot |
| `resident_name` | TEXT | NOT NULL | Resident full name |
| `phone` | TEXT | NOT NULL | Resident phone / WhatsApp |
| `email` | TEXT | NOT NULL | Resident email |
| `street_address` | TEXT | NULLABLE | Resident street or area (e.g. "Corner 4th & 7th") |
| `contribution_types` | TEXT[] | NOT NULL, DEFAULT `'{}'` | Array of selected help categories |
| `message` | TEXT | NULLABLE | Personal note, questions, or specific offer |
| `profile_id` | UUID | REFERENCES `profiles(id)` ON DELETE SET NULL | Mobile user profile ID (if authenticated) |
| `status` | TEXT | NOT NULL, DEFAULT `'new'` | Workflow status: `'new'`, `'contacted'`, `'connected'` |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `NOW()` | Submission timestamp |

**Allowed `contribution_types` values**:
- `'volunteer_time'`: Hands-on help during working bee weekends
- `'donate_materials'`: Plants, compost, paint, tools, or building materials
- `'professional_skills'`: Landscaping, carpentry, legal, planning, or design
- `'financial_support'`: Request official initiative bank info or sponsor invoice
- `'general_inquiry'`: General inquiry on roadmap, milestones, and timing

### Table 3: `public.project_pledges`
Read-only counts for resident backer tally.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `project_id` | UUID | Linked project |
| `profile_id` | UUID | Mobile resident profile |
| `resident_name` | TEXT | Display name |
| `created_at` | TIMESTAMPTZ | Timestamp |

---

## 4. Helpful Supabase Queries for the Admin Portal

### Fetch All Inquiries (Newest First)
```typescript
const { data, error } = await supabase
  .from('community_project_inquiries')
  .select('*')
  .order('created_at', { ascending: false });
```

### Filter by Status (e.g. New Inquiries)
```typescript
const { data, error } = await supabase
  .from('community_project_inquiries')
  .select('*')
  .eq('status', 'new')
  .order('created_at', { ascending: false });
```

### Filter by Specific Project
```typescript
const { data, error } = await supabase
  .from('community_project_inquiries')
  .select('*')
  .eq('project_id', projectId);
```

### Update Status When Admin Follows Up
```typescript
const { error } = await supabase
  .from('community_project_inquiries')
  .update({ status: 'contacted' }) // or 'connected'
  .eq('id', inquiryId);
```

### Direct Contact Links for Admins
- **WhatsApp**: `https://wa.me/27[PhoneWithoutLeadingZero]`
- **Email**: `mailto:[email]?subject=Hello Linden: [project_title]`

---

## 5. Navigation & Route Setup

### 5.1 Sidebar Navigation
In `src/lib/nav-config.ts`, add Community Projects under the `"Community"` group:

```ts
import { HeartHandshake } from "lucide-react";

// Under the "Community" group in NAV_GROUPS:
{
  title: "Community",
  items: [
    { href: "/community-projects", label: "Community Projects", icon: HeartHandshake },
    { href: "/registrations", label: "Registrations", icon: Inbox },
    { href: "/listings", label: "Businesses & Listings", icon: Store },
    { href: "/users", label: "Users", icon: Users },
  ],
}
```

### 5.2 Main Page Route
Create the dashboard route:
- `src/app/(dashboard)/community-projects/page.tsx`
- Protected with `await requireAdmin();` from `@/lib/auth`.

---

## 6. UI/UX Feature Breakdown

Build the screen with two primary tabs:
- **Tab 1: Projects**: Manage active, funded, and completed civic initiatives.
- **Tab 2: Inquiries**: Review and follow up with residents who volunteered or inquired.

---

### Tab 1: Projects Management

#### 1. Header & Actions
- Page Title: **Community Projects**
- Subtitle: **Manage neighborhood initiatives and track civic progress for Linden.**
- Button: **"New Project"** (opens the Project Create / Edit Dialog).

#### 2. Project List Table / Cards
Display all records from `community_projects` ordered by `created_at DESC`.
Each row or card should display:
- **Cover Image Thumbnail**: 48x48 rounded preview (or placeholder icon).
- **Project Title & Organizer**: Title in bold, organizer name below in muted text.
- **Category Badge**: Clean pill styled by category (Security = Slate, Parks = Emerald, Infrastructure = Amber, Municipal = Blue, Relief = Rose).
- **Funding / Budget Progress**:
  - Format Rand amounts: `R{amount.toLocaleString('en-ZA')}`
  - Progress bar: `(current_amount_raised / target_amount) * 100` %
  - Label: `R17,500 of R25,000 (70%)`
- **Backers / Pledges**: Number of supporters pledged.
- **Status Badge**:
  - `active`: Green badge ("Active")
  - `funded`: Blue badge ("100% Funded")
  - `completed`: Gray badge ("Completed")
- **Actions Dropdown**:
  - Edit Project
  - View Inquiries (switches to Tab 2 filtered to this project)
  - Change Status (`active` / `funded` / `completed`)
  - Delete Project (with confirmation alert dialog)

#### 3. Create / Edit Project Dialog
Form fields:
1. **Title** (Text input, required): e.g. "Linden Park Solar Security Lighting"
2. **Category** (Select dropdown, required):
   - Options: `Security & Safety`, `Parks & Greening`, `Solar & Power`, `Infrastructure`, `Municipal`, `Relief`, `Heritage`
3. **Organizer Name** (Text input, required): e.g. "Linden Community Safety Forum"
4. **Target Budget (ZAR)** (Number input, required): e.g. `25000`
5. **Current Amount Raised (ZAR)** (Number input, default 0): Allows admins to manually record offline corporate sponsorships or bank transfers.
6. **Deadline Date** (Date picker or date input, optional)
7. **Status** (Select dropdown): `active`, `funded`, `completed`
8. **Cover Image URL** (Text input or image upload to Supabase storage): e.g. Unsplash URL or uploaded asset.
9. **Full Description** (Textarea, required): Explains what the project is, why it matters, and what resources are needed.

---

### Tab 2: Community Inquiries ("Get Involved" Leads)

#### 1. Stat Summary Cards (Top Row)
- **Total Inquiries**: Count of all records in `community_project_inquiries`.
- **New Leads**: Count of inquiries where `status = 'new'` (amber highlight).
- **Contacted**: Count of inquiries where `status = 'contacted'` (blue highlight).
- **Connected**: Count of inquiries where `status = 'connected'` (green highlight).

#### 2. Filters & Search Bar
- **Search**: Search by resident name, phone number, email, or street.
- **Filter by Project**: Dropdown of all projects or "All Projects".
- **Filter by Status**: Dropdown (`All`, `new`, `contacted`, `connected`).
- **Filter by Contribution Type**: Dropdown (`All`, `Volunteer Time`, `Materials`, `Skills`, `Financial`, `General`).
- **Export CSV Button**: Exports filtered inquiries for committee meetings.

#### 3. Inquiries Data Table
Columns:
1. **Date**: Formatted date (e.g. `12 Nov 2026, 14:30`).
2. **Resident**:
   - Full name in bold.
   - Street address / area in small muted text (if provided).
3. **Contact Details**:
   - Phone with WhatsApp click-to-chat button:
     - URL format: `https://wa.me/27${phone.replace(/[^0-9]/g, '').replace(/^0/, '')}?text=${encodeURIComponent('Hi ' + resident_name + ', thank you for reaching out regarding the ' + project_title + ' project on Hello Linden!')}`
   - Email with click-to-mail link:
     - URL format: `mailto:${email}?subject=${encodeURIComponent('Hello Linden: ' + project_title)}`
4. **Target Project**: Project title linked to the project details.
5. **How They Want to Help (Pills)**:
   - Badge chips for each item in `contribution_types`:
     - `volunteer_time`: `Volunteer Time` (Green)
     - `donate_materials`: `Materials / Tools` (Amber)
     - `professional_skills`: `Professional Skills` (Purple)
     - `financial_support`: `Financial Support` (Blue)
     - `general_inquiry`: `General Info` (Gray)
6. **Resident Message / Notes**:
   - Truncated single-line snippet.
   - Clicking opens a detail dialog displaying the full message.
7. **Status Selector**:
   - Inline dropdown selector allowing admins to change status directly:
     - `new` (Amber badge)
     - `contacted` (Blue badge)
     - `connected` (Emerald badge)
8. **Quick Actions**:
   - Open WhatsApp
   - Send Email
   - Mark Connected

---

## 7. TypeScript Types Reference

Use these exact types in the admin portal implementation:

```ts
export type ProjectCategory =
  | 'Security'
  | 'Parks'
  | 'Infrastructure'
  | 'Municipal'
  | 'Relief'
  | 'Heritage'
  | 'Solar & Power';

export type ProjectStatus = 'active' | 'funded' | 'completed';

export interface CommunityProject {
  id: string;
  suburb_slug: string;
  title: string;
  description: string;
  category: ProjectCategory;
  target_amount: number;
  current_amount_raised: number;
  organizer_name: string;
  image_url: string | null;
  status: ProjectStatus;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export type ContributionType =
  | 'volunteer_time'
  | 'donate_materials'
  | 'professional_skills'
  | 'financial_support'
  | 'general_inquiry';

export type InquiryStatus = 'new' | 'contacted' | 'connected';

export interface CommunityProjectInquiry {
  id: string;
  project_id: string | null;
  project_title: string;
  resident_name: string;
  phone: string;
  email: string;
  street_address: string | null;
  contribution_types: ContributionType[];
  message: string | null;
  profile_id: string | null;
  status: InquiryStatus;
  created_at: string;
}
```

---

## 8. Summary Checklist for the Builder Agent

1. Add `{ href: "/community-projects", label: "Community Projects", icon: HeartHandshake }` to `src/lib/nav-config.ts`.
2. Create `src/app/(dashboard)/community-projects/page.tsx` with admin auth check (`await requireAdmin()`).
3. Build the Tabbed View:
   - Projects tab: list with progress bar, status badges, and manual Create/Edit project dialog.
   - Inquiries tab: status counters, search/filter bar, WhatsApp 1-click links, email links, and inline status updater.
4. Verify end-to-end: new inquiries submitted from the mobile app show up immediately in the inquiries table.

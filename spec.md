# Pawspective

## Current State
- Homepage has hero with "Find a Sitter" and "Track My Booking" CTAs — no "Become a Sitter" CTA
- No dedicated sitter application page; sitters apply via the LoginPage sitter portal directly
- LoginPage handles sitter/admin portal sign-in only
- Admin Applications tab shows pending sitters but has no badge count
- No application status page for pending applicants to check their review status
- Backend: `createSitterProfile` sets `isActive = false` for self-registered sitters (pending), `isActive = true` for admin-created sitters
- Sitter ownership tracked via `owner` field (Principal)

## Requested Changes (Diff)

### Add
- **"Become a Sitter" CTA** on homepage hero section (alongside "Find a Sitter")
- **"Become a Sitter" nav link** in homepage header
- **New SitterApplicationPage** (`sitter-apply` view in App.tsx):
  - Step 1: Internet Identity sign-in (if not already logged in)
  - Step 2: Full application form with fields:
    - Full name, location, short bio
    - Photo URL (optional)
    - Services offered (multi-select checkboxes)
    - Hourly rate
    - Years of pet care experience
    - Do you have pets of your own? (yes/no radio)
    - Why do you want to be a Pawspective sitter? (textarea)
    - References (name + contact, up to 2, optional)
  - Submits via `createSitterProfile` (bio field stores screening answers as structured text appended to user bio)
  - On success: shows confirmation screen with application status
- **Application Status page** (shown after submission OR when returning logged-in applicant visits `sitter-apply`):
  - Checks if caller already has a sitter profile (by matching `owner` principal across `getAllSitters`)
  - Shows: Pending (under review), Approved (link to dashboard), or Not Applied
  - Approved sitters redirected to sitter dashboard
- **Admin Applications tab badge**: shows pending sitter count as a red badge on the "Applications" tab trigger

### Modify
- **App.tsx**: Add `sitter-apply` to the `View` type; render `SitterApplicationPage`
- **HomePage**: Add "Become a Sitter" button in hero CTAs; add nav link in header
- **AdminDashboard**: Add live pending count badge on the Applications `TabsTrigger`
- **MobileNav**: Add `sitter-apply` view handling if needed

### Remove
- Nothing removed

## Implementation Plan
1. Add `sitter-apply` view to `App.tsx` View type and render `SitterApplicationPage`
2. Update `HomePage` hero with "Become a Sitter" CTA button + nav link
3. Create `src/frontend/src/pages/SitterApplicationPage.tsx` with multi-step form + status page
4. Update `AdminDashboard` Applications tab trigger to show pending count badge
5. Verify biome.json has `noArrayIndexKey: off` (already done)

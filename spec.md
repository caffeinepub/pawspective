# Pawspective — World-Class Upgrade (Items 1–12)

## Current State

- Full-stack pet sitting marketplace (Motoko backend + React/TypeScript/Tailwind frontend)
- Role-based: Clients (no login), Sitters (Internet Identity), Admins (Internet Identity)
- Pages: HomePage, SitterDetailPage (booking wizard), BookingLookupPage, ClientDashboard, SitterDashboard, AdminDashboard, SitterApplicationPage, LoginPage
- Components: SitterCard, BookingCard, InvoiceModal, MobileNav, ServiceLogTimeline, SitterInvoicesTab, StarRating, StatusBadge, MessageThread
- Hooks: useQueries.ts has full CRUD hooks; useSubmitReview exists but is not wired to any UI
- Backend: submitReview only takes a rating (Float), no text storage; sitter profiles have no badge/verification fields
- AdminAvailabilityTab receives `sitters` prop which may be empty on first render (data-timing bug)
- Booking confirmation (Step 7) is minimal — just a booking ID and two buttons
- ClientDashboard: bare email-lookup list with no sitter info, no Book Again, no message link
- MobileNav: 4 items, no active indicators beyond icon color, no notification dots
- AnalyticsTab: summary cards + horizontal bar chart + static lists; no real charting library
- SitterApplicationPage post-submit: no rich confirmation/next-steps screen
- No dark mode tokens in index.css; no toggle anywhere
- Homepage: static "How It Works" section, no social proof, no service quick-select
- No dedicated sitter portfolio page (SitterDetailPage doubles as booking wizard starting at step 0 which shows profile)
- Sitter badges/verification: not implemented anywhere (backend or frontend)

## Requested Changes (Diff)

### Add
1. **Availability Tab fix**: guard `AdminAvailabilityTab` render with `sittersLoading` check; show skeleton while loading
2. **Review UI**: Star+text review modal triggered from ClientDashboard on completed bookings; calls `useSubmitReview`; shows review count/rating on sitter cards and profile
3. **Sitter portfolio tab**: Add a "Profile" tab (step=-1 or separate view) to SitterDetailPage showing full bio, service rates, availability, and reviews before the booking wizard
4. **Client Dashboard upgrade**: Show sitter name/photo per booking, "Book Again" button, message link for confirmed bookings, cleaner visual timeline
5. **Live Activity Feed**: Upgrade ServiceLogTimeline — animated pulse dot when active, smooth slide-in for new entries, better visual design
6. **Verification badges**: Frontend-only admin-assignable badges ("Background Checked", "5+ Years", "Top Sitter") stored in sitter `bio` as a structured prefix OR as a separate in-memory map; shown on SitterCard and sitter profile
7. **Homepage redesign**: Replace "How It Works" with a social-proof section (star count, booking stats), add popular services quick-select grid that filters the sitter list
8. **Booking confirmation screen**: Upgrade Step 7 — show sitter photo, full service summary, total cost, copyable booking code, animated checkmark, "Save to My Bookings" CTA
9. **Admin Analytics overhaul**: Add recharts-based line chart (revenue over time), donut chart (booking status), bar chart (top sitters); add date range filter
10. **Mobile nav enhancement**: Active pill indicator, notification dot on Bookings when status changes, "Quick Book" FAB
11. **Dark mode**: Add dark theme tokens to index.css; add toggle button in HomePage nav and SitterDashboard/AdminDashboard header
12. **Sitter onboarding screen**: Post-application success screen with checklist, next steps, and a printable/shareable confirmation card

### Modify
- `AdminDashboard.tsx`: fix availability tab data-timing; add recharts analytics; add badge management to sitter edit form
- `SitterDetailPage.tsx`: add portfolio view before booking wizard; upgrade confirmation screen
- `ClientDashboard.tsx`: enrich booking cards with sitter info, Book Again, messages
- `SitterCard.tsx`: show verification badges
- `MobileNav.tsx`: add active pill, notification dot logic
- `HomePage.tsx`: replace How It Works with social proof + quick service filter
- `ServiceLogTimeline.tsx`: animated pulse, slide-in entries
- `SitterApplicationPage.tsx`: enrich post-submit success screen
- `index.css`: add dark mode CSS tokens
- `App.tsx`: wire dark mode state; pass sitter data to ClientDashboard for Book Again
- `useQueries.ts`: add `useSubmitReview` export (already exists), ensure it invalidates sitter queries

### Remove
- Static "How It Works" section from HomePage (replaced by social proof)

## Implementation Plan

1. Update `index.css` with dark mode tokens (`:root.dark` / `[data-theme=dark]`)
2. Update `App.tsx` to hold `darkMode` state + toggle; pass to pages that need it
3. Fix `AdminDashboard.tsx`:
   - Guard availability tab with loading skeleton
   - Add recharts (AreaChart for revenue, PieChart for status, BarChart for top sitters)
   - Date range filter for analytics
   - Badge toggles in sitter edit dialog
4. Update `SitterDetailPage.tsx`:
   - Add portfolio/profile view as step -1 ("View Profile" before booking)
   - Upgrade Step 7 confirmation with sitter photo, full summary, animated check
5. Update `ClientDashboard.tsx`:
   - Load active sitters to match sitter names/photos to booking sitterIds
   - Add Book Again button, message link, enriched visual cards
   - Add "Leave a Review" button on completed bookings → star+text modal
6. Update `SitterCard.tsx`: render badge chips from sitter data
7. Update `HomePage.tsx`:
   - Replace How It Works with social proof bar + popular services quick-select
   - Retain existing sitter grid and filters
8. Update `ServiceLogTimeline.tsx`: animated pulse, stagger slide-in
9. Update `MobileNav.tsx`: active pill styling, FAB Quick Book button
10. Update `SitterApplicationPage.tsx`: rich post-submit success screen
11. Update `useQueries.ts`: make `useSubmitReview` invalidate `active-sitters` + `sitter` queries so ratings update live

**No backend changes required** — all additions are frontend-only except review text (stored client-side in the modal only; rating propagated to backend via existing `submitReview`). Badge data will be encoded into the `bio` field prefix using a parseable format `[badges:Background Checked,Top Sitter]` to avoid backend changes.

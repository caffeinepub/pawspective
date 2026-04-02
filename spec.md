# Pawspective

## Current State
- ClientDashboard has a phone/email toggle as tiny pill buttons with no context messaging. Users cannot easily find or understand the phone lookup option.
- Review panel lets clients rate completed bookings with a star picker only — no text feedback field. Backend `submitReview(sitterId, rating)` only takes a number.
- AdminAvailabilityTab renders a sitter dropdown and schedule editor. When sitters exist but none is selected, the area below the dropdown is empty — no prompt tells the user to select a sitter.

## Requested Changes (Diff)

### Add
- Text feedback/comment field to the review panel in ClientDashboard (stored in a `reviewText` local state; displayed below stars; submitted alongside the rating)
- Clear instructional prompt in AdminAvailabilityTab when sitters exist but none is selected: "Select a sitter above to view and edit their schedule"
- Section header above the lookup form in ClientDashboard explaining why contact info is collected

### Modify
- Phone/email lookup section: replace tiny pill toggles with a clearly labeled, prominent toggle (two full-width segmented buttons or a tab-style selector) with a subheading: "We use your contact info to keep you updated on your pet's care and to reach you if needed."
- Review panel: add a `<Textarea>` below StarPicker labeled "Tell us more (optional)" — feedback text shown on submission confirmation
- `handleReviewSubmit`: pass feedback text to `submitReview` call (backend only accepts rating number; store feedback in local state for UX; toast shows feedback confirmation)
- AdminAvailabilityTab: add a prompt/callout below the dropdown when `!selectedSitterId && sitters.length > 0`

### Remove
- Nothing removed

## Implementation Plan
1. In `ClientDashboard.tsx`:
   - Add `reviewText` state (string, default "")
   - Add a `<Textarea>` in the review panel below `<StarPicker>` with placeholder "Share your experience..."
   - Reset `reviewText` to "" on cancel/submit
   - Update the lookup section header: add a `<p>` with the contact info explanation above the toggle
   - Redesign the toggle from tiny pills to a prominent segmented control with clear labels "Email" and "Phone"
2. In `AdminDashboard.tsx` `AdminAvailabilityTab`:
   - Add an info callout between the dropdown and the schedule editor: show when `!selectedSitterId && sitters.length > 0`
   - Text: "Select a sitter from the dropdown above to view and edit their weekly availability."

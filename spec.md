# Pawspective

## Current State
Full-stack pet sitting marketplace with sitter profiles, multi-pet bookings, admin dashboard, service logs, invoices, analytics, and passkey-based authentication. Backend stores sitters, bookings, service logs, payments, messages, and user profiles.

## Requested Changes (Diff)

### Add
- Per-service hourly rates for sitters: `setSitterServiceRates` / `getSitterServiceRates` backend functions (map of service name to hourly rate in cents)
- Multi-service day scheduling in bookings: `serviceSchedule` field containing array of `DaySchedule` (date string, array of `ServiceSlot` with service, sitterId, startTime, endTime, ratePerHour)
- Explicit `isCallerAdmin()` query function in backend
- `claimAdminBySitter` function: allows claim when no admin assigned yet (same as claimFirstAdmin but called from sitter dashboard)
- Admin toggle in sitter profile dashboard: shows "Become Admin" button when `isAdminAssigned()` is false

### Modify
- Admin dashboard: fix `adminAssigned === false` strict check to `adminAssigned !== true` so it shows claim option during loading/undefined state
- Booking `Creation` type: add optional `serviceSchedule` field
- Booking `Public` type: add optional `serviceSchedule` field
- Invoice: show line items per service slot with sitter name, time window, duration, cost; bundle discount line; all sitters in header

### Remove
- Nothing removed

## Implementation Plan
1. Add `ServiceRate` type and `sitterServiceRates` map to backend
2. Add `setSitterServiceRates` and `getSitterServiceRates` backend functions
3. Add `ServiceSlot` and `DaySchedule` types, add `serviceSchedule` optional field to `Booking.Creation` and `Booking.Public`
4. Add explicit `isCallerAdmin()` query function
5. Fix AdminDashboard frontend: change strict `=== false` to `!== true` for adminAssigned check
6. Add "Become Admin" button in SitterDashboard profile tab (shows when adminAssigned is false)
7. Update booking wizard: multi-service day builder with DoorDash-style cart (per-day service slots, sitter selection per service, live total)
8. Update sitter dashboard: per-service rate editor in profile/settings
9. Update invoice: line-item breakdown by service+day, bundle discount, all sitters listed

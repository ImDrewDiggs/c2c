# Employee GPS Connection Plan

## Goal
Let employees connect to the app on their personal phones through the browser so admins can see their live GPS positions. Capture both continuous tracking while they are clocked in and snapshot locations when they clock in/out.

## Current State
- Employees already sign in at `/employee/login` and land on `/employee/dashboard`.
- The `TimeTracker` component records clock-in/out times and can optionally capture a GPS coordinate, but it falls back silently when location is unavailable.
- A `Map` component contains a `LocationTracker` that updates `employee_locations` every 15 seconds, but it only runs while the map is rendered.
- The admin GPS page (`/admin/gps-tracking`) already reads from `employee_locations` and shows a real-time map.
- The `employee_locations` table exists with RLS, audit triggers, and a cleanup function.
- No standalone, always-on location service exists for the employee dashboard.
- The app is wrapped in Capacitor but has no background-geolocation plugin installed yet.

## Proposed Architecture

```text
Employee phone (browser)
  -> Employee Dashboard mounts
     -> LocationService hook starts
        -> On clock-in: high-accuracy snapshot saved to work_sessions
        -> While active session: periodic medium-accuracy updates to employee_locations
        -> On clock-out: high-accuracy snapshot saved to work_sessions
  -> Supabase Realtime broadcasts changes
  -> Admin GPS page reads employee_locations and shows live markers
```

## Implementation Steps

1. **Create a standalone `useEmployeeLocationTracking` hook**
   - Runs inside `EmployeeDashboard` whenever an authenticated employee is present.
   - Watches the active `work_sessions` row to know when the employee is "on the clock".
   - Uses `navigator.geolocation.watchPosition` while clocked in and `clearWatch` when clocked out or signed out.
   - Throttles Supabase writes to once every 30 seconds to preserve battery and avoid rate limits.
   - Stores the latest location in a ref so React re-renders do not restart the watcher.

2. **Refactor `TimeTracker` to use the shared location service**
   - Remove duplicated `getCurrentPosition` calls.
   - Request high-accuracy location on clock-in and clock-out.
   - Pass the captured coordinates into the `work_sessions` insert/update.
   - Show a clear message when location permission is denied, with instructions to enable it.

3. **Add a location-permission helper**
   - Detect `PermissionStatus.state` for geolocation.
   - Show an onboarding card on the employee dashboard if permission is `prompt` or `denied`.
   - Explain that location is only tracked during active work sessions.

4. **Tighten RLS and policies on `employee_locations`**
   - Employees can insert/update only rows where `employee_id = auth.uid()`.
   - Employees can read only their own row.
   - Admins and super admins can read all rows.
   - No `anon` access.

5. **Add a small edge function `record-location`**
   - Accept `{ latitude, longitude, accuracy, timestamp }`.
   - Verify the caller is an authenticated employee via `supabase.auth.getUser()`.
   - Upsert the `employee_locations` row.
   - Returns generic success/error messages (no sensitive details).
   - This keeps location writes behind server-side validation and makes future mobile plugins easier to integrate.

6. **Update the admin GPS page to remove mock-data fallback**
   - `useEmployeeLocations` should show an empty state when no locations exist instead of generating fake Boston coordinates.
   - Keep real-time Supabase channel subscription.

7. **Add privacy/consent UI**
   - Short notice on the employee dashboard: "Your location is tracked only while you are clocked in."
   - Link to the existing privacy/terms content.

8. **Prepare the Capacitor path (no-op for now)**
   - Document the exact background-geolocation plugin to install later (`@capacitor-community/background-geolocation`).
   - Keep the web service interface identical so switching to company phones later is a drop-in replacement.

## Technical Details

- **Tracking interval**: 30 seconds while clocked in; high-accuracy snapshot on clock events.
- **Battery strategy**: Use `enableHighAccuracy: false` for continuous pings; `enableHighAccuracy: true` only for clock-in/out.
- **Table writes**: Upsert on `employee_id` so each employee has exactly one live row.
- **Cleanup**: Existing `cleanup_old_employee_locations()` already anonymizes after 7 days and deletes after 30 days.
- **Security**: Location data is high-risk PII; keep audit triggers, restrict reads to admins/self, and never return employee locations to customers.

## Limitations on Personal Phones

- Browser geolocation only works while the employee has the app open in an active tab. If they lock the phone or switch apps, updates stop.
- For true background tracking on company phones, the Capacitor build will need `@capacitor-community/background-geolocation` and additional native permissions. This plan keeps that as a future, plug-compatible upgrade.

## Files to Touch
- `src/hooks/useEmployeeLocationTracking.ts` (new)
- `src/components/employee/TimeTracker.tsx`
- `src/components/employee/dashboard/DashboardContent.tsx`
- `src/components/employee/dashboard/DashboardHeader.tsx` or a new `LocationPermissionCard.tsx`
- `src/components/admin/dashboard/hooks/useEmployeeLocations.ts`
- `supabase/functions/record-location/index.ts` (new)
- `supabase/config.toml` (register new function)
- Database migration for `employee_locations` RLS refresh

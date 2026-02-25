# Silicon Teklogic Conclave Quiz Portal

## Current State

The quiz portal has a strict "first-user-becomes-admin" authorization system where:
- The first person to log in with Internet Identity and enter password "admin123" becomes the permanent admin
- Once `adminAssigned = true`, all subsequent users (even with correct password) are assigned as regular users
- No way to see who the current admin is
- No way to reset admin if the creator loses access or uses a different browser/Identity

**Problem**: The project creator cannot access admin features because someone (possibly themselves on a different session) already claimed the admin role, and there's no visibility or recovery mechanism.

## Requested Changes (Diff)

### Add
1. **Backend function** `getAdminPrincipal()` - Returns the Principal ID of the current admin (or null if none assigned)
2. **Backend function** `resetAdmin(password: Text)` - Resets the admin system using a special reset password, allowing a new admin to be assigned
3. **Frontend UI** - Display current admin Principal ID in error messages when login fails due to admin already assigned
4. **Frontend UI** - Show admin reset option if user needs to reclaim admin access

### Modify
1. **Access Control module** - Add getter function for admin Principal and reset capability
2. **Admin login flow** - Enhanced error messages showing WHO is the current admin
3. **Admin login UI** - Add "Reset Admin Access" option with clear warnings

### Remove
- None

## Implementation Plan

### Backend Changes
1. Add `getAdminPrincipal()` query function in `access-control.mo` to return current admin's Principal
2. Add `resetAdmin(resetPassword: Text)` function that:
   - Requires special reset password: `"reset_silicon_teklogic_2026"`
   - Clears `adminAssigned` flag
   - Clears all user roles
   - Allows next correct login to become admin
   - **Preserves all quiz data** (questions, participants, submissions, whitelist)
3. Expose both functions in `main.mo` actor interface

### Frontend Changes
1. Update `AdminDashboard.tsx` login error handling:
   - Call `getAdminPrincipal()` when "admin already assigned" error occurs
   - Display the admin's Principal ID in a toast notification
   - Provide actionable guidance
2. Add "Reset Admin Access" section in login card:
   - Collapsible/expandable section with warning styling
   - Input for reset password
   - Clear warnings about data preservation
   - Confirmation step before resetting
3. Update `backend.d.ts` with new function signatures

### Authorization Module Enhancement
Add to `access-control.mo`:
```motoko
public func getAdminPrincipal(state : AccessControlState) : ?Principal
public func resetAdminAccess(state : AccessControlState, resetPassword : Text)
```

## UX Notes

**Admin Reset UX Flow**:
1. User sees "Admin Already Assigned" error with current admin Principal ID
2. User can compare their own Principal (from II authentication) with displayed admin Principal
3. If they recognize it as their own previous session, they can use that browser/Identity
4. If not, they can expand "Reset Admin Access" with clear warnings:
   - "⚠️ This will clear admin assignment but preserve all quiz data"
   - "Enter reset password: reset_silicon_teklogic_2026"
   - "After reset, the first person to log in with admin123 becomes admin"
5. After successful reset, automatic redirect to login flow

**Error Message Clarity**:
- Old: "Admin Already Assigned - Another user has the admin role"
- New: "Admin Already Assigned - Admin Principal: 2vxsx-fae... (Your Principal: aaaaa-aa...)"

This gives users full transparency and recovery capability while preserving quiz data integrity.

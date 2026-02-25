# Silicon Teklogic Quiz Portal

## Current State

The quiz portal has:
- Admin dashboard with question management, email whitelist, participant tracking, and leaderboard
- Authorization system using MixinAuthorization with role-based access control
- Admin initialization requires calling `_initializeAccessControlWithSecret(adminPassword)` with correct password
- System initialization requires admin access before any quiz operations

**Current Problem**: Admin login is failing with "Failed to verify admin access. Please ensure you are the first user." error. The authorization initialization function `_initializeAccessControlWithSecret` is defined in the backend but may not be properly exposed or the environment variable `CAFFEINE_ADMIN_TOKEN` is not set.

## Requested Changes (Diff)

### Add
- Simplified admin bootstrap logic that doesn't depend on environment variables
- Automatic admin assignment to the first user who provides correct password "admin123"
- Better error messages in admin login flow

### Modify
- Backend authorization initialization to use hardcoded admin token "admin123" instead of requiring environment variable
- Admin login flow to properly handle first-time initialization
- Error handling to provide clearer feedback on what's failing

### Remove
- Dependency on `CAFFEINE_ADMIN_TOKEN` environment variable

## Implementation Plan

1. **Backend Changes**:
   - Modify `MixinAuthorization.mo` to use hardcoded admin token "admin123" instead of requiring environment variable
   - Ensure `_initializeAccessControlWithSecret` is properly exposed
   - Update `initializeSystem()` to allow first-time initialization when called by the first user with correct password

2. **Frontend Changes**:
   - Simplify admin login flow in `AdminDashboard.tsx`
   - Add better error handling and logging
   - Ensure `_initializeAccessControlWithSecret` is called with correct password

3. **Validation**:
   - Test admin login flow from scratch
   - Verify first user becomes admin with password "admin123"
   - Ensure subsequent users cannot gain admin access

## UX Notes

- Admin login should be a simple two-step process: (1) Login with Internet Identity, (2) Enter password "admin123"
- Clear error messages should guide users if something goes wrong
- First user to successfully authenticate with correct password becomes the permanent admin

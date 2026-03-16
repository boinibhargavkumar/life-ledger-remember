

## Analysis

The project is currently a **blank skeleton** with critical issues:

1. **Build is completely broken** — `vite: command not found` means dependencies aren't installed. The TypeScript errors are all downstream from missing `node_modules`.
2. **No authentication exists** — there are no login, signup, forgot password, or reset password pages. The App.tsx is just a "Life Ledger" heading.
3. **No database tables** — the database is empty, no profiles table, no user roles.
4. **No routes** — just a single catch-all route rendering the placeholder App.

The user is on `/login` but that route doesn't exist — it just falls through to the catch-all showing "Life Ledger".

## Plan

### 1. Fix Build Errors
- Add `"type": "module"` compatibility and ensure `tsconfig.json` is correct (it already looks fine)
- The `vite: command not found` error typically resolves on rebuild — the package.json has all correct dependencies listed. I'll do a minor package.json touch to trigger reinstall.

### 2. Create Database Schema
- **profiles** table — `id` (uuid, FK to auth.users), `full_name`, `avatar_url`, `created_at`, `updated_at`
- **RLS policies** — users can read/update their own profile
- **Trigger** — auto-create profile on signup via `handle_new_user` function

### 3. Build Authentication Pages

| Page | Route | Purpose |
|------|-------|---------|
| Login | `/login` | Email + password sign-in |
| Signup | `/signup` | Email + password registration |
| Forgot Password | `/forgot-password` | Send OTP code to email |
| Reset Password | `/reset-password` | Enter OTP + set new password |

### 4. Build Auth Infrastructure
- **AuthProvider** context — manages session state via `onAuthStateChange` (set up before `getSession`)
- **ProtectedRoute** wrapper — redirects unauthenticated users to `/login`
- **Auth layout** — clean centered card design consistent with "Life Ledger" branding

### 5. Build Dashboard (Post-Auth Landing)
- Simple dashboard at `/` showing welcome message and user info
- Logout button
- Protected by auth guard

### 6. Wire Up Routing
```text
/login          → Login (public)
/signup         → Signup (public)
/forgot-password → ForgotPassword (public)
/reset-password  → ResetPassword (public)
/               → Dashboard (protected)
```

### 7. OTP-Based Password Reset Flow
Per project memory, use OTP (6-digit code) instead of email links:
1. User enters email on `/forgot-password`
2. Backend sends OTP via `resetPasswordForEmail`
3. User enters OTP on `/reset-password`
4. `verifyOtp` with `type: 'recovery'` validates code
5. User sets new password via `updateUser`

### Technical Details
- All auth uses `@/integrations/supabase/client` (existing auto-generated file)
- Form validation with inline error messages
- Loading states on all buttons
- Toast notifications for success/error feedback (using sonner)
- Need to add `sonner` and `@radix-ui/react-toast` dependencies


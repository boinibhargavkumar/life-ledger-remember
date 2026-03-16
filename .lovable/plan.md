

## Problem

The build fails because the system expects a `build:dev` script in `package.json`, but only `build`, `dev`, and `preview` scripts exist.

## Fix

Add `"build:dev": "vite build"` to the scripts section of `package.json`. This is the only change needed — the auth UI and pages are already built and working (as seen in the screenshot).

### Change
**package.json** — Add missing script:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "build:dev": "vite build",
  "preview": "vite preview"
}
```

This single-line addition resolves the build error. The authentication pages (login, signup, forgot password, reset password) are already implemented and rendering correctly on the live site.


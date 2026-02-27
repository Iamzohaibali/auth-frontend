# MERN Auth — Frontend

A production-ready authentication frontend built with **React 18**, **Vite**, **Tailwind CSS v4**, and **Zustand**. Connects to the MERN Auth REST API for full-stack authentication with role-based access control.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages and Routes](#pages-and-routes)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [State Management](#state-management)
- [API Layer](#api-layer)
- [Authentication Flow](#authentication-flow)
- [Role-Based Access](#role-based-access)
- [Component Reference](#component-reference)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Features

### Authentication
- Register with email and password (with confirm password validation)
- Login with email and password
- Email verification — account is blocked until email is verified
- Resend verification email with 60-second cooldown
- Forgot password and reset password via email link
- JWT access tokens (15 min) and refresh tokens (7 days) via HTTP-only cookies
- Auto-logout on session expiry

### Two-Factor Authentication
- Enable or disable email-based OTP 2FA per account
- OTP entry screen with masked email hint (e.g. `us***@example.com`)
- Auto-logout after enabling 2FA to force re-authentication
- 2FA toggle blocked until email is verified

### Profile Management
- Edit first name, last name, bio, phone, location, and website
- Upload and remove avatar (powered by Cloudinary)
- Form resets cleanly to saved values after a successful update
- Unsaved changes indicator with a Discard button
- Delete account with password confirmation

### Security
- Change password with confirm field — auto-logout after change
- Login history showing device, IP, timestamp, and success/fail status
- Email verification banner with resend button on Profile and Security pages

### Admin and Moderator Panel
- User statistics cards (total, active, banned, this month)
- Role breakdown summary
- Search users by name or email with pagination
- Smart action dropdown that flips upward automatically when near the bottom of the screen
- Change user role (user / moderator / admin)
- Ban and unban users
- Reset any user's password
- Delete users permanently

### UX
- Fully responsive mobile-first design
- Toast notifications for all actions
- Loading spinners on all async operations
- Protected routes with role guards
- Public routes redirect to dashboard if already logged in

---

## Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.3 | UI framework |
| Vite | 6.0 | Build tool and dev server |
| Tailwind CSS | 4.0 | Utility-first styling |
| React Router DOM | 7.1 | Client-side routing |
| Zustand | 5.0 | Global state management |
| Axios | 1.7 | HTTP client |
| React Hook Form | 7.54 | Form validation |
| React Hot Toast | 2.4 | Toast notifications |
| Lucide React | 0.469 | Icon library |

---

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── axios.js                      # Axios instance (withCredentials, baseURL)
│   │   └── index.js                      # authAPI, profileAPI, adminAPI
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.jsx        # Route guards (auth + role-based)
│   │   ├── layout/
│   │   │   ├── Layout.jsx                # Page wrapper with Navbar
│   │   │   └── Navbar.jsx                # Responsive top nav + mobile drawer
│   │   └── ui/
│   │       ├── FormElements.jsx          # Input, Button, Badge components
│   │       └── EmailVerificationBanner.jsx  # Resend verification widget
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx                 # Login form + 2FA OTP screen
│   │   ├── RegisterPage.jsx              # Registration with confirm password
│   │   ├── DashboardPage.jsx             # Overview + personal info cards
│   │   ├── ProfilePage.jsx               # Edit profile + avatar + delete account
│   │   ├── SecurityPage.jsx              # 2FA toggle + change password + login history
│   │   ├── AdminPage.jsx                 # Admin and moderator user management
│   │   └── AuthPages.jsx                 # VerifyEmail, ForgotPassword, ResetPassword
│   │
│   ├── store/
│   │   └── authStore.js                  # Zustand store — user, auth state, actions
│   │
│   ├── App.jsx                           # Route definitions
│   ├── main.jsx                          # React entry point
│   └── index.css                         # Tailwind imports
│
├── .env                                  # Local environment variables (not committed)
├── .env.example                          # Example env file
├── vercel.json                           # SPA rewrite rule for Vercel
├── vite.config.js                        # Vite configuration
└── package.json
```

---

## Pages and Routes

| Route | Page | Access |
|-------|------|--------|
| `/login` | LoginPage | Public only (redirects to dashboard if logged in) |
| `/register` | RegisterPage | Public only |
| `/forgot-password` | ForgotPasswordPage | Public only |
| `/reset-password/:token` | ResetPasswordPage | Public only |
| `/verify-email/:token` | VerifyEmailPage | Always public |
| `/dashboard` | DashboardPage | Authenticated only |
| `/profile` | ProfilePage | Authenticated only |
| `/security` | SecurityPage | Authenticated only |
| `/admin` | AdminPage | Admin and Moderator only |
| `/` | — | Redirects to `/dashboard` |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend API running locally or deployed (see backend README)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/mern-auth.git
cd mern-auth/frontend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

### Configure environment

Open `.env` and set the API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

### Start the development server

```bash
npm run dev
# Runs at http://localhost:5173
```

### Preview the production build locally

```bash
npm run build
npm run preview
# Runs at http://localhost:4173
```

> **Note:** When using `npm run preview`, make sure your backend `CLIENT_URL` (or `FRONTEND_PORT`) points to port `4173` so verification email links work correctly.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Full base URL of the backend API including `/api` |

**Development (`.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

**Production (Vercel Environment Variables):**
```env
VITE_API_URL=https://your-backend.herokuapp.com/api
```

Set production variables in **Vercel Dashboard → Project → Settings → Environment Variables**. Never commit `.env` to version control.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Preview production build on port 4173 |
| `npm run lint` | Run ESLint across all JS and JSX files |

---

## State Management

Global authentication state is managed with **Zustand** in `src/store/authStore.js`.

### Store Shape

```js
{
  user:            Object | null,  // Full user object from the API
  isLoading:       Boolean,        // True only during the initial session check on mount
  isAuthenticated: Boolean,        // Whether a valid session exists
}
```

### Actions

| Action | Description |
|--------|-------------|
| `checkAuth()` | Called once on app mount — restores session from the HTTP-only cookie |
| `login(credentials)` | Submits login. Returns `{ requires2FA, pendingToken }` when 2FA is enabled |
| `verify2FA({ otp, pendingToken })` | Completes a 2FA login and sets the user in state |
| `logout()` | Clears the session on the backend and resets local state |
| `updateUser(updates)` | Merges a partial object into the current `user` in state |

### Usage in a component

```jsx
import useAuthStore from '../store/authStore';

function MyComponent() {
  const user       = useAuthStore((s) => s.user);
  const logout     = useAuthStore((s) => s.logout);
  const updateUser = useAuthStore((s) => s.updateUser);

  // ...
}
```

---

## API Layer

All HTTP calls are in `src/api/index.js` using a shared Axios instance from `src/api/axios.js`.

### Axios Instance

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,   // sends cookies on every request automatically
});
```

No default `Content-Type` is set. Axios detects it automatically: `application/json` for plain objects and `multipart/form-data; boundary=...` for `FormData` (required for avatar uploads).

### Auth API

```js
authAPI.register(data)
authAPI.login(data)
authAPI.verify2FA({ otp, pendingToken })
authAPI.logout()
authAPI.getMe()
authAPI.verifyEmail(token)
authAPI.resendVerification(email)            // Public — for unverified users at login
authAPI.resendVerificationLoggedIn()         // Protected — for logged-in users
authAPI.forgotPassword(email)
authAPI.resetPassword(token, password)
authAPI.changePassword({ currentPassword, newPassword })
authAPI.toggle2FA()
authAPI.getLoginHistory()
```

### Profile API

```js
profileAPI.getProfile()
profileAPI.updateProfile(data)
profileAPI.uploadAvatar(formData)
profileAPI.deleteAvatar()
profileAPI.deleteAccount(password)
```

### Admin API

```js
adminAPI.getStats()
adminAPI.getAllUsers({ page, limit, search })
adminAPI.banUser(id, reason)
adminAPI.unbanUser(id)
adminAPI.updateUserRole(id, role)
adminAPI.resetPassword(id, newPassword)
adminAPI.deleteUser(id)
```

---

## Authentication Flow

### Initial Session Restore

```
App mounts
  → checkAuth() calls GET /auth/me
      ├── 200 OK  → set user + isAuthenticated: true
      └── 401     → set isAuthenticated: false
                    → ProtectedRoute redirects to /login
```

### Standard Login

```
User submits credentials → POST /auth/login
  ├── requires2FA: false → set user → navigate to /dashboard
  └── requires2FA: true  → show OTP screen
                            → user enters code → POST /auth/verify-2fa
                            → set user → navigate to /dashboard
```

### Email Verification Block

```
POST /auth/login returns 403 "Please verify your email"
  → LoginPage shows yellow banner with user's masked email
  → User clicks "Resend Verification Email" (60s cooldown)
      → POST /auth/resend-verification
      → New email sent with correct link
  → User clicks link in email → GET /auth/verify-email/:token
  → Redirected to /login → can now sign in
```

### Token Refresh

Access tokens expire after 15 minutes. The backend transparently issues a new access token on every request using the `refreshToken` HTTP-only cookie. No interceptor is needed in the frontend.

---

## Role-Based Access

| Feature | user | moderator | admin |
|---------|:----:|:---------:|:-----:|
| Dashboard, Profile, Security | ✅ | ✅ | ✅ |
| View Admin Panel | ❌ | ✅ | ✅ |
| Ban / Unban users | ❌ | ❌ | ✅ |
| Change user roles | ❌ | ❌ | ✅ |
| Reset user passwords | ❌ | ❌ | ✅ |
| Delete users | ❌ | ❌ | ✅ |

### ProtectedRoute usage

```jsx
// Require any authenticated user
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>

// Require a specific role
<Route element={<ProtectedRoute allowedRoles={['admin', 'moderator']} />}>
  <Route path="/admin" element={<AdminPage />} />
</Route>
```

---

## Component Reference

### `<Input />`

A controlled input with label, icon, and inline error support. Fully compatible with React Hook Form via `{...register(...)}`.

```jsx
<Input
  label="Email Address"
  type="email"
  icon={Mail}
  placeholder="you@example.com"
  error={errors.email?.message}
  {...register('email', { required: 'Email is required' })}
/>
```

### `<Button />`

```jsx
<Button
  variant="primary"   // primary | secondary | outline | ghost | danger
  size="lg"           // sm | md | lg
  isLoading={false}   // shows spinner and disables button
  disabled={false}
>
  Sign In
</Button>
```

### `<Badge />`

```jsx
<Badge variant="success">Active</Badge>
<Badge variant="danger">Banned</Badge>
<Badge variant="moderator">Moderator</Badge>
```

Variants: `default` · `primary` · `success` · `danger` · `warning` · `moderator`

### `<EmailVerificationBanner />`

Automatically renders nothing when `user.isEmailVerified` is true. Includes a resend button with a 60-second server-enforced and client-enforced cooldown.

```jsx
// Full card version — used on Security page
<EmailVerificationBanner />

// Compact inline version — used on Profile page
<EmailVerificationBanner compact />
```

---

## Deployment

### Deploy to Vercel

```bash
npm install -g vercel
cd frontend
vercel
```

Add this environment variable in **Vercel Dashboard → Project → Settings → Environment Variables**:

```
VITE_API_URL = https://your-backend.herokuapp.com/api
```

Then redeploy:

```bash
vercel --prod
```

### SPA Routing

The `vercel.json` file prevents 404 errors when users refresh the page on non-root routes:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### After Frontend Deployment

Update the backend `CLIENT_URL` to your exact Vercel URL with no trailing slash:

```bash
heroku config:set CLIENT_URL=https://your-app.vercel.app \
  --app your-heroku-app-name

heroku restart --app your-heroku-app-name
```

---

## Troubleshooting

### Verification emails link to `localhost` instead of the live site

The backend `CLIENT_URL` config var on Heroku still points to localhost. Fix it:

```bash
heroku config:set CLIENT_URL=https://your-app.vercel.app \
  --app your-heroku-app-name
```

Make sure there is no trailing slash at the end of the URL.

### Session lost on every page refresh

Cookies require `Secure` and `SameSite=None` for cross-origin requests (Vercel frontend to Heroku backend). Both domains must use `https://`. Check that cookies are being set in **DevTools → Application → Cookies**.

### CORS error in browser console

The Vercel domain is not in the backend allowed origins. Verify `CLIENT_URL` on Heroku matches your Vercel URL exactly. All `*.vercel.app` preview URLs are automatically allowed.

### Avatar upload returns 400 Bad Request

The Axios instance must not have a hardcoded `Content-Type: application/json` default. That header overrides Axios's auto-detection and breaks multipart uploads. Check `src/api/axios.js` and remove any default `Content-Type`.

### 401 on all API requests after login

The refresh token flow requires Redis (Upstash). Check backend logs for Redis connection errors:

```bash
heroku logs --tail --app your-heroku-app-name
```

### Admin dropdown cut off at bottom of screen

The `AdminPage` uses a `SmartDropdown` component with `fixed` positioning that measures available viewport space and automatically flips the dropdown upward when there is not enough room below. Ensure you are using the latest version of `AdminPage.jsx`.

---

## License

MIT — free to use for personal and commercial projects.
# P4: Authentication | تسجيل الدخول والتسجيل

## 🎯 الهدف
بناء صفحات تسجيل الدخول والتسجيل مع form validation ونظام auth بـ Pinia.

---

## 📦 المهام

### 4.1 — Auth Types
**File:** `src/types/auth.ts`
- `User` interface: id, name, email, grade, avatar, role
- `LoginPayload`: email, password
- `RegisterPayload`: name, email, password, grade
- `AuthState`: user, isAuthenticated, loading, error

### 4.2 — Auth Store
**File:** `src/stores/auth.ts`
- Pinia store with state: user, isAuthenticated, loading, error
- Actions: login, register, logout, checkAuth
- Mock authentication (simulate API with setTimeout)
- Persist auth state in localStorage
- Getters: isLoggedIn, currentUser, userGrade

### 4.3 — LoginForm Component
**File:** `src/components/auth/LoginForm.vue`
- Email input (AppInput with email validation)
- Password input (AppInput with password toggle)
- "تذكرني" checkbox
- "نسيت كلمة المرور؟" link
- Submit button (AppButton primary, loading state)
- Form validation: required fields, email format, min password length
- Error message display
- Link to register page

### 4.4 — RegisterForm Component
**File:** `src/components/auth/RegisterForm.vue`
- Name input
- Email input
- Password input + confirm password
- Grade select (ابتدائي / إعدادي / ثانوي)
- Terms checkbox
- Submit button with loading state
- Form validation: all fields required, email format, passwords match, min length
- Error message display
- Link to login page

### 4.5 — LoginPage View
**File:** `src/views/LoginPage.vue`
- Split layout: form (right) + decorative illustration (left)
- Navy gradient on illustration side
- Logo at top
- LoginForm component
- Social login buttons placeholder
- Responsive: full width form on mobile

### 4.6 — RegisterPage View
**File:** `src/views/RegisterPage.vue`
- Same split layout as login
- RegisterForm component
- Step indicator (optional)
- Responsive

### 4.7 — Route Guards
- Update router with navigation guards
- Redirect to login if accessing protected routes when not authenticated
- Redirect to dashboard if accessing login/register when already authenticated

### 4.8 — useAuth Composable
**File:** `src/composables/useAuth.ts`
- Wrapper around auth store for components
- Methods: login, register, logout
- Reactive: user, isLoggedIn

---

## ✅ Acceptance Criteria
- [ ] Login form validates inputs correctly
- [ ] Register form validates all fields including password match
- [ ] Mock auth works (login stores user, logout clears)
- [ ] Auth persists across page refreshes (localStorage)
- [ ] Protected routes redirect to login
- [ ] Logged-in users redirected away from login/register
- [ ] Loading states work during auth operations
- [ ] Error messages display correctly

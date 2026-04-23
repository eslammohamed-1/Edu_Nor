# P1: Project Setup & Design System | تأسيس المشروع ونظام التصميم

## 🎯 الهدف
تأسيس مشروع Vue 3 + TypeScript + Vite وبناء نظام التصميم الكامل من الـ Brand Guide + بناء كل الـ Base Components.

---

## 📦 المهام

### 1.1 — Project Initialization
- Run `npx -y create-vite@latest ./ --template vue-ts`
- Install dependencies:
  - `vue-router@4`
  - `pinia`
  - `lucide-vue-next`
- Setup `tsconfig.json` with strict mode + path aliases (`@/`)
- Setup `vite.config.ts` with aliases
- Clean boilerplate files

### 1.2 — CSS Design System: Variables
**File:** `src/assets/css/variables.css`
- Define all color tokens (primary, secondary, accent, semantic, gradients)
- Define dark mode overrides via `[data-theme="dark"]`
- Define spacing tokens (`--space-xxs` to `--space-4xl`)
- Define typography tokens (font families, sizes, weights, line heights)
- Define border radius tokens
- Define shadow tokens
- Define transition tokens (durations + easing curves)
- Define breakpoint reference comments
- Define z-index scale

### 1.3 — CSS Reset
**File:** `src/assets/css/reset.css`
- Modern CSS reset (box-sizing, margin, padding)
- RTL direction as default
- Smooth scrolling
- Image defaults
- Button/input reset
- `prefers-reduced-motion` support

### 1.4 — Typography Setup
**File:** `src/assets/css/typography.css`
- Import Cairo + Poppins from Google Fonts
- Define heading styles (h1-h4) with responsive sizes
- Define body text styles
- Define caption/small styles
- Arabic-first font stack

### 1.5 — Utility Classes
**File:** `src/assets/css/utilities.css`
- Text alignment utilities
- Display utilities (flex, grid, hidden)
- Spacing utilities (margin, padding)
- Color utilities
- Container/wrapper classes
- Screen-reader only class

### 1.6 — Animation System
**File:** `src/assets/css/animations.css`
- Fade in/out keyframes
- Slide up/down keyframes
- Scale keyframes
- Skeleton shimmer keyframe
- Utility classes for common animations
- Respect `prefers-reduced-motion`

### 1.7 — Component: AppButton
**File:** `src/components/common/AppButton.vue`
- Props: variant (primary/secondary/ghost/danger), size (sm/md/lg), loading, disabled, icon
- All states from brand guide (default, hover, active, disabled, loading)
- Emit: click
- Slot: default (button text)

### 1.8 — Component: AppCard
**File:** `src/components/common/AppCard.vue`
- Props: hoverable, padding (sm/md/lg), clickable
- Shadow + hover lift effect from brand guide
- Slot: default, header, footer

### 1.9 — Component: AppInput
**File:** `src/components/common/AppInput.vue`
- Props: type, label, placeholder, error, modelValue, disabled
- v-model support
- Focus ring from brand guide
- Error state styling
- Emit: update:modelValue

### 1.10 — Component: AppBadge
**File:** `src/components/common/AppBadge.vue`
- Props: variant (primary/success/warning/danger/info/teal), size (sm/md)
- Pill shape with brand colors

### 1.11 — Component: AppModal
**File:** `src/components/common/AppModal.vue`
- Props: modelValue (open/close), title, size (sm/md/lg)
- Backdrop overlay
- Close on escape + backdrop click
- Transition animations
- Slot: default, footer

### 1.12 — Component: AppToast
**File:** `src/components/common/AppToast.vue`
- Props: message, type (success/error/warning/info), duration
- Slide in from top animation
- Auto-dismiss after duration
- useToast composable for programmatic use

### 1.13 — Component: AppProgressBar
**File:** `src/components/common/AppProgressBar.vue`
- Props: value (0-100), variant (primary/gold/teal), size (sm/md), showLabel
- Animated width transition
- Label showing percentage

### 1.14 — Component: AppSkeleton
**File:** `src/components/common/AppSkeleton.vue`
- Props: width, height, variant (text/circle/rect)
- Shimmer pulse animation from brand guide

### 1.15 — Component: AppIcon
**File:** `src/components/common/AppIcon.vue`
- Wrapper around Lucide icons
- Props: name, size (16/20/24/32/48), color
- Consistent sizing with brand icon grid

---

## ✅ Acceptance Criteria
- [ ] `npm run dev` starts without errors
- [ ] All CSS variables match brand guide exactly
- [ ] All components render correctly in isolation
- [ ] RTL direction works by default
- [ ] TypeScript strict mode passes
- [ ] Google Fonts load correctly (Cairo + Poppins)

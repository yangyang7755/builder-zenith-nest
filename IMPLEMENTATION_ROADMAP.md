# Implementation Roadmap: UI Consistency + User Authentication

## Overview

This roadmap outlines the steps to achieve complete UI consistency between web and React Native apps, followed by implementing a robust user authentication system.

## Phase 1: UI Consistency (React Native + Web)

### ✅ COMPLETED
- [x] Created unified design tokens system
- [x] Updated web app with mobile-first approach
- [x] Created React Native design tokens

### 🔄 IN PROGRESS
- [ ] Update React Native components to use design tokens
- [ ] Sync component styling across platforms

### 📋 REMAINING TASKS

#### 1.1 Update React Native Components

**Priority: High**
**Effort: 2-3 hours**

Update React Native components to use the new design tokens:

```bash
# Files to update:
react-native/components/CategoryActivities.tsx
react-native/screens/*.tsx (when created)
react-native/App.tsx (navigation styling)
```

**Key Changes:**
- Replace hardcoded colors with `designTokens.colors.primary`
- Use `commonStyles` for consistent styling
- Apply unified spacing using `getSpacing()`
- Match typography with `getTypography()`

#### 1.2 Create Shared Component Library

**Priority: Medium**
**Effort: 3-4 hours**

Create components that work on both platforms:

```
shared/
├── components/
│   ├── Button/
│   │   ├── Button.web.tsx
│   │   ├── Button.native.tsx
│   │   └── index.ts
│   ├── Card/
│   ├── Input/
│   └── Header/
└── styles/
    └── designTokens.ts (shared)
```

#### 1.3 Test UI Consistency

**Priority: High**
**Effort: 1-2 hours**

- [ ] Compare web app (mobile width) vs React Native
- [ ] Verify color consistency
- [ ] Check spacing and typography
- [ ] Test navigation patterns

---

## Phase 2: User Authentication System

### 2.1 Backend Setup (Supabase)

**Priority: High**
**Effort: 2-3 hours**

#### Current Status
Check existing Supabase configuration:

<function_calls>
<invoke name="Read">
<parameter name="file_path">client/lib/supabase.ts

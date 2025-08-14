# Create Test User for Authentication

Since your authentication is now connected to real Supabase, you need to create a test user account.

## Option 1: Create via Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
2. **Navigate to Authentication > Users**
3. **Click "Add User"**
4. **Create test user:**
   - Email: `demo@wildpals.com`
   - Password: `demo123456`
   - Email Confirm: ✅ (check this)

## Option 2: Sign Up Through Your App

1. **Visit your app at** `/auth/signup`
2. **Fill out the signup form**
3. **Check your email for verification link**
4. **Click verification link**
5. **Now you can login**

## Option 3: SQL Insert (Quick Test)

Run this in your Supabase SQL Editor to create a test user manually:

```sql
-- Create auth user first
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '00000000-0000-0000-0000-000000000000',
  'demo@wildpals.com',
  crypt('demo123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
);

-- Create corresponding profile
INSERT INTO profiles (
  id, 
  email, 
  full_name, 
  university, 
  bio
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'demo@wildpals.com',
  'Demo User',
  'Demo University',
  'Test user for WildPals app'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  university = EXCLUDED.university,
  bio = EXCLUDED.bio;
```

## Test the Authentication

After creating the user, test the flow:

1. **Visit `/auth`** - Should see auth landing page
2. **Click "Sign In"** - Should go to login page
3. **Enter credentials:**
   - Email: `demo@wildpals.com`
   - Password: `demo123456`
4. **Should redirect to `/explore`** - Main app with real authentication

## Verify Real Authentication

✅ **Profile page shows real user data** (not demo)  
✅ **Can navigate protected routes**  
✅ **Sign out works and redirects to auth**  
✅ **Trying to access protected routes redirects to login**  

Your authentication is now **production-ready**! 🎉

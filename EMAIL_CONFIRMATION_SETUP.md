# Email Confirmation Setup for Supabase

## Current Issue
Users are getting "Email not confirmed" error when trying to log in because Supabase requires email confirmation by default.

## Solution Options

### Option 1: Disable Email Confirmation (Recommended for Development)
1. Go to your Supabase dashboard
2. Navigate to Authentication > Settings
3. Scroll down to "Email confirmation" 
4. Toggle OFF "Enable email confirmations"
5. Click "Save"

### Option 2: Configure Email Confirmation (Production Setup)
1. Go to your Supabase dashboard
2. Navigate to Authentication > Settings 
3. Scroll to "SMTP Settings"
4. Configure your email provider (Gmail, SendGrid, etc.)
5. Set up email templates in "Email Templates" section

### Option 3: Use Email Confirmation in Development
If you want to test email confirmation:
1. Check your email for the confirmation link after signing up
2. Click the confirmation link
3. Then try logging in again

## Current App Behavior
- The app shows "Email not confirmed" error when trying to log in with an unconfirmed email
- Users need to either confirm their email or have email confirmation disabled

## Quick Fix for Testing
For immediate testing, disable email confirmation in your Supabase dashboard as described in Option 1.

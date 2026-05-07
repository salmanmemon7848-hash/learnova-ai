# 🔐 Supabase Authentication Setup Guide

## Quick Setup (10 minutes)

### Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com/)
2. Click **"Start your project"** → **"New project"**
3. Fill in:
   - **Project name**: Thinkior
   - **Database password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

### Step 2: Get Your API Keys

1. In your Supabase project dashboard
2. Go to **Settings** (gear icon) → **API**
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbG...` (long string)
   - **service_role key**: `eyJhbG...` (different long string)

### Step 3: Update Environment Variables

Open `.env.local` and update:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

Replace with your actual values from Step 2.

### Step 4: Configure Email Auth (Already Enabled by Default)

Supabase enables email/password authentication automatically! No extra setup needed.

**Optional - Disable Email Confirmation:**
1. Go to **Authentication** → **Providers** → **Email**
2. Toggle off **"Enable email confirmations"** (for development)
3. Click **Save**

### Step 5: Setup Google OAuth (Fix 401 invalid_client Error)

#### 5.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Name it "Thinkior" and click **Create**

#### 5.2 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Fill in:
   - **App name**: Thinkior
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click **Save and Continue**
5. **Scopes**: Skip (no additional scopes needed)
6. **Test users**: Add your email for testing
7. Click **Save and Continue**

#### 5.3 Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **Web application**
4. Name: **Thinkior Web**
5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   http://localhost:3001
   https://your-domain.com (when deployed)
   ```
6. **Authorized redirect URIs**:
   ```
   https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
   ```
   ⚠️ **IMPORTANT**: Replace `YOUR_PROJECT_ID` with your actual Supabase project ID!
   
   Example: `https://abcdefghij.supabase.co/auth/v1/callback`

7. Click **Create**

#### 5.4 Copy Google Credentials

You'll see a popup with:
- **Client ID**: `xxxxxxxxx.apps.googleusercontent.com`
- **Client Secret**: `xxxxxxxxxxxxxxx`

#### 5.5 Add Google Credentials to Supabase

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click on it
4. Toggle **Enable Sign in with Google**
5. Paste your credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
6. Click **Save**

### Step 6: Restart Your Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 7: Test Authentication

#### Test Email/Password Signup:
1. Go to `http://localhost:3000/signup`
2. Fill in: Name, Email, Password
3. Click "Create Account"
4. Check your email for verification (if enabled)
5. Go to login and sign in

#### Test Email/Password Login:
1. Go to `http://localhost:3000/login`
2. Enter email and password
3. Click "Sign In"
4. Should redirect to `/chat`

#### Test Google Login:
1. Go to `http://localhost:3000/login`
2. Click "Continue with Google"
3. Select your Google account
4. Should redirect to `/chat`

---

## 🎯 What's Already Implemented

✅ Supabase client configuration (browser + server)  
✅ Email/password signup with validation  
✅ Email/password login with error handling  
✅ Google OAuth integration  
✅ Session management via AuthContext  
✅ Auto-login if session exists  
✅ Protected routes via middleware  
✅ Logout functionality  
✅ Real-time auth state updates  
✅ Beautiful UI with loading states  

---

## 📁 Files Created/Modified

### New Files:
- `src/lib/supabase/client.ts` - Browser client
- `src/lib/supabase/server.ts` - Server client  
- `src/lib/supabase/middleware.ts` - Session middleware
- `src/contexts/AuthContext.tsx` - Auth state management

### Modified Files:
- `src/middleware.ts` - Updated to use Supabase
- `src/components/Providers.tsx` - Uses AuthProvider
- `src/app/(auth)/login/page.tsx` - Supabase auth
- `src/app/(auth)/signup/page.tsx` - Supabase auth
- `.env.local` - Added Supabase variables

---

## 🔒 Security Features

- ✅ Password hashing (handled by Supabase)
- ✅ JWT token management
- ✅ Secure cookie storage
- ✅ CSRF protection
- ✅ Session refresh
- ✅ Protected routes

---

## 🐛 Troubleshooting

### Error: "Invalid login credentials"
**Fix:** Make sure you're using the correct email/password that you signed up with

### Error: "Email not confirmed"
**Fix:** Check your email inbox (and spam) for verification link from Supabase

### Google OAuth: "401 invalid_client"
**Fix:** 
1. Make sure Client ID and Secret are correctly added in Supabase Dashboard
2. Verify redirect URI includes your Supabase project ID:
   `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
3. Check that Google Cloud Console has the correct redirect URI

### Google OAuth: "access_denied"
**Fix:** Add your email as a test user in Google OAuth consent screen

### "No Supabase URL provided"
**Fix:** Make sure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` set correctly

### Session not persisting
**Fix:** 
1. Check that middleware is configured correctly
2. Make sure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
3. Restart your dev server

---

## 📊 Supabase Dashboard

Monitor your users at:
- **Authentication** → **Users**: View all registered users
- **Authentication** → **Providers**: Configure auth providers
- **Logs**: View auth events and errors

---

## 🚀 Production Deployment

When deploying to production:

1. **Update Environment Variables** on your hosting platform:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

2. **Update Google OAuth** in Google Cloud Console:
   - Add production domain to Authorized JavaScript origins
   - Add production redirect URI:
     `https://your-project.supabase.co/auth/v1/callback`

3. **Enable Email Confirmations** in Supabase (recommended for production)

4. **Set up Custom Email Templates** in Supabase (optional)

---

## 💡 Additional Features (Optional)

### Magic Links
```typescript
const { error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
})
```

### Password Reset
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
})
```

### Update Profile
```typescript
const { error } = await supabase.auth.updateUser({
  data: { name: 'New Name' }
})
```

---

**Need help?** Check the browser console and Supabase logs for detailed error messages.

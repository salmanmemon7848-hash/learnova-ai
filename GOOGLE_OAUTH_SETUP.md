# 🔐 Google OAuth Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Name it "Learnova" and click **Create**

### Step 2: Enable Google+ API

1. In the sidebar, go to **APIs & Services** → **Library**
2. Search for **"Google+ API"**
3. Click **Enable**

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure the **OAuth consent screen**:
   - User Type: **External**
   - App name: **Learnova**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Scopes: Skip this step
   - Test users: Add your email for testing
   - Click **Save and Continue**

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **Learnova Web**
   - Authorized JavaScript origins: 
     - `http://localhost:3000`
     - `http://localhost:3001`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `http://localhost:3001/api/auth/callback/google`
   - Click **Create**

### Step 4: Copy Credentials

You'll see a popup with:
- **Client ID**: `xxxxxxxxx.apps.googleusercontent.com`
- **Client Secret**: `xxxxxxxxxxxxxxx`

### Step 5: Update Environment Variables

Open `.env.local` and update:

```env
# Google OAuth (Required for Google Sign-In)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

Replace with your actual credentials from Step 4.

### Step 6: Restart Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 7: Test Google Login

1. Go to `http://localhost:3000/login`
2. Click **"Continue with Google"**
3. Select your Google account
4. You should be redirected to the dashboard!

---

## 🎯 What's Already Working

✅ Google OAuth provider is configured in NextAuth  
✅ "Continue with Google" buttons on login/signup pages  
✅ Automatic account creation for new users  
✅ Auto-login for existing users  
✅ Proper redirect to `/chat` after login  

## 🔒 Security Notes

- Never commit `.env.local` to Git
- Keep your Client Secret private
- Add your production domain to Authorized redirect URIs when deploying
- Use environment-specific credentials

## 🐛 Troubleshooting

### Error: "Invalid redirect_uri"
**Fix:** Make sure the redirect URI in Google Console exactly matches:
`http://localhost:3000/api/auth/callback/google`

### Error: "access_denied"
**Fix:** Add your email as a test user in OAuth consent screen

### Google button doesn't work
**Fix:** Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env.local`

---

**Need help?** Check the browser console and terminal for error messages.

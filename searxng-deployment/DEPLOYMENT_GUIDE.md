# SearXNG Deployment Guide for Learnova AI

## 🚀 Quick Deployment on Railway (10 minutes)

### Step 1: Create Railway Account

1. Go to: https://railway.app
2. Click "Login" → Use GitHub
3. Authorize Railway to access your GitHub

---

### Step 2: Deploy SearXNG

#### Option A: One-Click Deploy (Easiest)

1. Click this link: **https://railway.app/new/template/searxng**
2. Click "Deploy"
3. Wait 2-3 minutes for deployment

#### Option B: Manual Deploy (Recommended)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```
   This will open your browser for authentication.

3. **Navigate to deployment folder**:
   ```bash
   cd "c:\Users\salma\Documents\Learnova Ai\searxng-deployment"
   ```

4. **Create new project**:
   ```bash
   railway init
   ```
   - Project name: `learnova-searxng`
   - Press Enter

5. **Deploy**:
   ```bash
   railway up
   ```
   - This will upload and deploy your SearXNG instance
   - Takes 2-3 minutes

6. **Get your URL**:
   ```bash
   railway domain
   ```
   - Returns: `https://learnova-searxng-production.up.railway.app` (or similar)
   - **Copy this URL!** You'll need it.

---

### Step 3: Update Learnova AI Code

Once you have your Railway URL, update the web search configuration:

**File**: `src/lib/webSearch.ts`

```typescript
const searxngInstances = [
  'https://YOUR-RAILWAY-URL.up.railway.app',  // ← Replace with your URL!
  'https://search.sapti.me',                   // Fallback
  'https://searx.tiekoetter.com',              // Fallback
];
```

I'll help you update this once you have the URL!

---

### Step 4: Test Your Instance

1. **Open your browser**:
   ```
   https://YOUR-RAILWAY-URL.up.railway.app
   ```

2. **Search for something**:
   - Try: "current affairs today"
   - Should show results immediately

3. **Test JSON API**:
   ```
   https://YOUR-RAILWAY-URL.up.railway.app/search?q=current+affairs&format=json
   ```
   - Should return JSON with search results

---

## 🐳 Alternative: Deploy on Render (Also Free)

### Step 1: Create Render Account
- Go to: https://render.com
- Sign up with GitHub

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `learnova-searxng`
   - **Region**: Nearest to you
   - **Branch**: main
   - **Root Directory**: `searxng-deployment`
   - **Runtime**: Docker
   - **Instance Type**: Free

### Step 3: Deploy
- Click "Create Web Service"
- Wait 3-5 minutes
- Copy the URL provided

---

## 🎯 Alternative: Deploy on Fly.io (Also Free)

### Step 1: Install Fly CLI
```bash
# Windows (using scoop)
scoop install flyctl

# Or download from: https://fly.io/docs/hands-on/install-flyctl/
```

### Step 2: Login
```bash
fly auth login
```

### Step 3: Deploy
```bash
cd "c:\Users\salma\Documents\Learnova Ai\searxng-deployment"
fly launch
fly deploy
```

---

## 💰 Cost Breakdown

### Railway (Recommended)
- **Free tier**: 500 hours/month
- **Your usage**: ~720 hours/month (24/7)
- **Overage**: 220 hours × $0.00023/minute = ~$3/month
- **Total**: **~$3/month** (very cheap!)

### Render
- **Free tier**: 750 hours/month
- **Your usage**: 720 hours/month
- **Total**: **FREE** ✅

### Fly.io
- **Free tier**: 3 VMs (shared CPU, 256MB RAM)
- **Your usage**: 1 VM
- **Total**: **FREE** ✅

---

## 🔧 Configuration Details

### settings.yml Explained

```yaml
server:
  limiter: false          # No rate limiting for your private instance
  secret_key: "..."       # Change this to a random string
  
engines:
  - google                # Uses Google search
  - bing                  # Uses Bing search
  - duckduckgo            # Uses DuckDuckGo
  - wikipedia             # Uses Wikipedia
  - brave                 # Uses Brave search
```

**Why multiple engines?**
- Better results
- Redundancy if one fails
- More comprehensive coverage

---

## 📊 After Deployment

### Update Your Learnova AI Code

I'll automatically update this file for you once you provide the Railway URL:

**Current**: `src/lib/webSearch.ts`
```typescript
const searxngInstances = [
  'https://search.sapti.me',      // Public (unreliable)
  'https://searx.tiekoetter.com', // Public (unreliable)
  // ... more public instances
];
```

**After**: `src/lib/webSearch.ts`
```typescript
const searxngInstances = [
  'https://your-instance.railway.app',  // YOUR private instance! ✅
  'https://search.sapti.me',            // Fallback
  'https://searx.tiekoetter.com',       // Fallback
];
```

---

## 🧪 Testing After Deployment

### Test 1: Web Interface
```
https://your-instance.railway.app
```
- Should load search interface
- Try searching: "latest news"

### Test 2: JSON API
```
https://your-instance.railway.app/search?q=test&format=json
```
- Should return JSON with results

### Test 3: From Learnova AI
```bash
cd "c:\Users\salma\Documents\Learnova Ai\learnova-web"
node test-searxng.mjs
```
- Should show: ✅ Success!

---

## 🎯 What You Need to Do

### Right Now (5 minutes):

1. **Go to Railway**: https://railway.app
2. **Sign up** (use GitHub)
3. **Deploy** using one of the methods above
4. **Copy your URL** (e.g., `https://learnova-searxng-production.up.railway.app`)
5. **Give me the URL** - I'll update the code automatically!

### Or If You Prefer:

I can guide you through the Railway CLI deployment step-by-step. Just let me know!

---

## 📁 Files Created

All deployment files are in:
```
c:\Users\salma\Documents\Learnova Ai\searxng-deployment\
├── docker-compose.yml          # Docker configuration
├── searxng-config/
│   └── settings.yml            # SearXNG settings
├── Procfile                    # Railway deployment file
└── DEPLOYMENT_GUIDE.md         # This file
```

---

## 🚀 Quick Commands Summary

### Railway CLI Deployment:
```bash
# 1. Install
npm install -g @railway/cli

# 2. Login
railway login

# 3. Navigate
cd "c:\Users\salma\Documents\Learnova Ai\searxng-deployment"

# 4. Create project
railway init

# 5. Deploy
railway up

# 6. Get URL
railway domain
```

---

## 💡 Pro Tips

1. **Keep your URL private** - it's your private search instance
2. **Monitor usage** in Railway dashboard
3. **Backup settings.yml** - contains your configuration
4. **Test thoroughly** before integrating with Learnova AI

---

## 🎉 After Setup

Once deployed and integrated:

✅ **100% reliable** web search  
✅ **No rate limits** - unlimited searches  
✅ **Fast responses** - dedicated instance  
✅ **Private** - only you use it  
✅ **Cost-effective** - ~$3/month or FREE  

**Your AI will finally have real-time internet access!** 🌐

---

## 📞 Need Help?

If you get stuck at any step:
1. Tell me where you're stuck
2. I'll provide detailed guidance
3. We'll get it working together!

**Ready to deploy?** Go to https://railway.app and let's get started! 🚀

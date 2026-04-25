# GitHub & Render Deployment Guide

## 📋 Step-by-Step Instructions

### Phase 1: Push to GitHub (5 minutes)

#### Option A: If you already have a GitHub repo

```bash
# 1. Navigate to your project
cd "c:\Users\salma\Documents\Learnova Ai"

# 2. Check git status
git status

# 3. Add the searxng folder
git add searxng-deployment/

# 4. Commit
git commit -m "Add SearXNG deployment files"

# 5. Push to GitHub
git push origin main
```

#### Option B: If you DON'T have a GitHub repo yet

```bash
# 1. Navigate to your project
cd "c:\Users\salma\Documents\Learnova Ai"

# 2. Initialize git (if not already done)
git init

# 3. Add all files
git add .

# 4. Commit
git commit -m "Initial commit - Learnova AI with SearXNG"

# 5. Go to GitHub.com
#    - Click "New Repository"
#    - Name: learnova-ai
#    - Make it Public or Private (your choice)
#    - Click "Create repository"

# 6. Connect local to GitHub
git remote add origin https://github.com/YOUR_USERNAME/learnova-ai.git

# 7. Push
git branch -M main
git push -u origin main
```

---

### Phase 2: Deploy on Render (5 minutes)

#### Step 1: Go to Render Dashboard
- URL: https://dashboard.render.com
- You should be logged in from Step 1

#### Step 2: Create New Web Service
1. Click **"New +"** button (top right)
2. Select **"Web Service"**

#### Step 3: Connect Repository
1. You'll see a list of your GitHub repositories
2. Find and click on **"learnova-ai"** (or your repo name)
3. If you don't see it, click **"Configure access"** and select your repo

#### Step 4: Configure Service

Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | `learnova-searxng` |
| **Region** | Choose nearest to you (e.g., Oregon, Frankfurt) |
| **Branch** | `main` |
| **Root Directory** | `searxng-deployment` |
| **Runtime** | `Docker` |
| **Instance Type** | `Free` |

**Visual Guide**:
```
Name: learnova-searxng
Region: Oregon (US West) ▼
Branch: main
Root Directory: searxng-deployment
Runtime: Docker ▼
Instance Type: Free ▼
```

#### Step 5: Click "Create Web Service"

- Click the blue button at the bottom
- Render will start deploying
- **Wait 3-5 minutes**

#### Step 6: Monitor Deployment

You'll see a build log. Wait for:
```
✅ Build successful
✅ Service deployed
```

#### Step 7: Get Your URL

At the top of the page, you'll see:
```
https://learnova-searxng.onrender.com
```

**Copy this URL!** You'll need it.

---

### Phase 3: Test Your Instance (2 minutes)

#### Test 1: Web Interface
1. Open browser
2. Go to: `https://learnova-searxng.onrender.com`
3. You should see the SearXNG search page
4. Try searching: "latest news"

#### Test 2: JSON API
1. Go to: `https://learnova-searxng.onrender.com/search?q=current+affairs&format=json`
2. You should see JSON data with search results

#### Test 3: Give Me the URL!
Paste your Render URL here, and I'll:
1. Update your code
2. Test the integration
3. Verify everything works

---

## 🎯 Important Notes

### Free Tier Limitations:
- **Spin-down**: After 15 minutes of inactivity, the service sleeps
- **Wake-up time**: Takes ~30 seconds to wake up
- **Solution**: Not a problem for our use case! AI will wake it up when needed

### Monthly Quota:
- **Free tier**: 750 hours/month
- **Your usage**: ~720 hours (24/7)
- **Result**: ✅ Fits within free tier!

### Auto-Deploy:
- Every time you push to GitHub, Render auto-deploys
- Keep your `searxng-deployment` folder updated

---

## 🆘 Troubleshooting

### Issue: "Root Directory not found"
**Fix**: Make sure you typed exactly: `searxng-deployment` (with hyphen)

### Issue: "Build failed"
**Fix**: Check that `docker-compose.yml` is in the `searxng-deployment` folder

### Issue: "Service not starting"
**Fix**: Check the logs in Render dashboard for error messages

### Issue: "404 Not Found"
**Fix**: Wait 3-5 minutes for deployment to complete

---

## 📊 What You'll Have After

✅ Private SearXNG instance  
✅ 100% reliable (no rate limits)  
✅ Completely FREE  
✅ Auto-deploys on git push  
✅ Only you can use it  

---

## 🚀 Quick Summary

1. Push code to GitHub (5 min)
2. Create Render account (1 min)
3. Create web service (2 min)
4. Wait for deployment (3-5 min)
5. Copy URL
6. Give me URL
7. **Done!** 🎉

**Total time**: ~10-12 minutes

---

## 💬 Need Help?

If you get stuck at ANY step:
1. Tell me which step
2. Tell me what you see
3. I'll guide you through it!

**Ready to start? Let me know!** 🚀

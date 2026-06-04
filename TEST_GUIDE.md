# 🧪 Learnova AI - Complete Feature Test Guide

## Server Status
✅ **Development Server Running**: http://localhost:3000
✅ **No compilation errors**
✅ **All routes accessible**

---

## 📋 Feature Testing Checklist

### **1. HOMEPAGE (Public - No Login Required)**
**URL**: http://localhost:3000

**Test Each Section:**
- [ ] **Hero Section**: Check headline, beta badge, CTA buttons work
- [ ] **Live Demo**: Click any of the 3 example prompts, verify AI response appears
- [ ] **Features Grid**: All 6 feature cards display with icons
- [ ] **Who is Learnova for?**: Two columns (Students/Builders) with checkmarks
- [ ] **How It Works**: 3-step visual flow
- [ ] **About Section**: Salman Memon, Gariyaband info displays
- [ ] **Footer**: All links work (Terms, Privacy, Beta Disclaimer)

**Expected Behavior:**
- Light theme by default
- Smooth scrolling between sections
- Demo chat works without login (1 response limit)
- Mobile responsive (test on phone size)

---

### **2. LEGAL PAGES (Public)**
Test each page loads correctly:

- [ ] **Terms of Service**: http://localhost:3000/terms
- [ ] **Privacy Policy**: http://localhost:3000/privacy  
- [ ] **Beta Disclaimer**: http://localhost:3000/beta-disclaimer

**Expected:**
- Clean, readable layout
- Back to Home link works
- Proper formatting with sections

---

### **3. AUTH PAGES**
- [ ] **Login**: http://localhost:3000/login
  - Check Terms/Privacy links point to /terms and /privacy (not #)
- [ ] **Signup**: http://localhost:3000/signup
  - Check Terms/Privacy links point to /terms and /privacy (not #)

---

### **4. DASHBOARD (Login Required)**
**Login first**, then test each feature:

#### **4.1 Exam Simulator**
**URL**: http://localhost:3000/exam

**Test Flow:**
1. [ ] Select exam type (UPSC/JEE/NEET/CAT)
2. [ ] Enter subject (e.g., "Physics")
3. [ ] Select difficulty (Easy/Medium/Hard)
4. [ ] Choose question count (5/10/20)
5. [ ] Click "Start Exam"
6. [ ] Verify timer appears and counts down
7. [ ] Answer a question
8. [ ] Check explanation shows after answer
9. [ ] Click "Next Question"
10. [ ] Complete all questions
11. [ ] Verify results page shows score %, time taken
12. [ ] Test "Try Again" and "Try Harder" buttons

**Expected:**
- Timer changes color when < 30 seconds (red)
- Correct answers show green, wrong show red
- Explanation appears after each answer
- Results show percentage and motivational message

---

#### **4.2 Business Validator**
**URL**: http://localhost:3000/validate

**Test Flow:**
1. [ ] Fill in all fields:
   - Startup idea description
   - Target audience (dropdown)
   - City/region
   - Budget range (dropdown)
   - Main problem being solved
2. [ ] Click "Validate My Idea"
3. [ ] Wait for analysis
4. [ ] Check results page displays:
   - Overall score (0-100)
   - Score breakdown (4 categories with progress bars)
   - Key Risks section
   - 7-Day Action Plan
5. [ ] Click "Save & Download Report"
6. [ ] Verify PDF downloads with proper formatting

**Expected:**
- Form validation (required fields)
- Beautiful report with color-coded scores
- PDF includes header, scores, risks, action plan
- File name: `Learnova-Business-Report-[idea].pdf`

---

#### **4.3 AI Mock Interview** ⭐ NEW
**URL**: http://localhost:3000/interview

**Test Flow:**
1. [ ] Select interview type (Job/College/Startup)
2. [ ] If Job: Select role (Software Engineer/Marketing/etc.)
3. [ ] If College: Enter target institution
4. [ ] Select language (English/Hindi/Hinglish)
5. [ ] Click "Start Interview"
6. [ ] Wait for 8 questions to generate
7. [ ] Read first question
8. [ ] Type answer in textarea
9. [ ] Click "Submit Answer"
10. [ ] Wait for evaluation
11. [ ] Check feedback shows:
    - Score (1-10)
    - What was good
    - What to improve
12. [ ] Click "Next Question"
13. [ ] Repeat for all 8 questions
14. [ ] Verify final results page shows average score
15. [ ] Review all Q&A with feedback

**Expected:**
- Questions are relevant to interview type
- Scores are realistic (1-10)
- Feedback is constructive and specific
- Results show complete summary

---

#### **4.4 Study Planner (Upgraded)** ⭐ UPGRADED
**URL**: http://localhost:3000/planner

**Test Flow:**
1. [ ] **Step 1**: Select target exam (UPSC/JEE/NEET/CAT)
2. [ ] Pick exam date from date picker
3. [ ] Adjust study hours slider (1-12 hrs)
4. [ ] Click "Next Step"
5. [ ] **Step 2**: Select weak subjects (multi-select)
6. [ ] Click "Next Step"
7. [ ] **Step 3**: Select strong subjects (multi-select)
8. [ ] Click "Generate My Study Plan"
9. [ ] Wait for AI to generate plan
10. [ ] Check results page shows day-by-day plan
11. [ ] Verify weak subjects get more frequency
12. [ ] Test marking days as complete
13. [ ] Check progress bar updates

**Expected:**
- Subjects change based on selected exam
- Weak subjects highlighted in red
- Strong subjects highlighted in green
- Plan is personalized and realistic
- Progress tracking works

---

#### **4.5 Pitch Deck Generator** ⭐ NEW
**URL**: http://localhost:3000/pitch-deck

**Test Flow:**
1. [ ] Answer all 10 questions in wizard:
   - What does your startup do?
   - What problem does it solve?
   - Who is your target customer?
   - How does it make money?
   - Who are your main competitors?
   - What makes you different?
   - What is your go-to-market plan?
   - What is your founding team?
   - How much money are you looking to raise?
   - What will you use the funds for?
2. [ ] Click through wizard (Back/Next buttons work)
3. [ ] Click "Generate Pitch Deck" on last question
4. [ ] Wait ~30 seconds for generation
5. [ ] Check slide preview displays
6. [ ] Navigate through all 10 slides
7. [ ] Click slide thumbnails to jump
8. [ ] Click "Download as PDF"
9. [ ] Verify PDF downloads with all slides

**Expected:**
- Progress bar updates as you answer
- Slides are professional and investor-ready
- Content is specific to your startup
- PDF is landscape orientation
- File name: `learnova-pitch-deck.pdf`

---

#### **4.6 Dashboard Sidebar**
**Test Navigation:**
- [ ] All old links work (Chat, Exam, Planner, etc.)
- [ ] **New**: "Mock Interview" link appears and works
- [ ] **New**: "Pitch Deck" link appears and works
- [ ] Active state highlights current page
- [ ] Mobile menu toggle works
- [ ] Sign out button works

---

### **5. THEME TOGGLE**
**Test Light/Dark Mode:**

1. [ ] Default theme is LIGHT on landing page
2. [ ] Check all colors match design system:
   - Primary: #1a1a2e (deep navy)
   - Accent: #4f46e5 (indigo)
   - Highlight: #f97316 (warm orange for CTAs)
   - Surface: #f8f7ff (off-white)
3. [ ] Dashboard should remember theme preference
4. [ ] Theme persists after page refresh (localStorage)

---

### **6. MOBILE RESPONSIVENESS**
**Test on Mobile (320px+):**

1. [ ] Homepage sections stack vertically
2. [ ] Live demo chat is usable
3. [ ] Navigation collapses to hamburger menu
4. [ ] Forms are readable and tappable
5. [ ] Bottom nav appears on dashboard
6. [ ] All buttons are 48px+ height (touch-friendly)
7. [ ] No horizontal scrolling

**Test on Tablet (768px+):**
- [ ] Grid layouts show 2 columns
- [ ] Sidebar is accessible
- [ ] All features work properly

---

## 🐛 Known Warnings (Non-Critical)

1. **themeColor metadata warning**: Move to viewport export (cosmetic)
2. **Multiple lockfiles warning**: Can be ignored or cleaned up
3. **Middleware deprecation**: Will update in future Next.js version
4. **Auth refresh token errors**: Expected when not logged in

---

## ✅ Success Criteria

All features pass if:
- ✅ No compilation errors
- ✅ All routes return 200 status
- ✅ No broken links
- ✅ AI features generate responses
- ✅ PDF downloads work
- ✅ Mobile responsive
- ✅ Theme system works
- ✅ Forms validate properly

---

## 📝 Testing Notes Template

Use this to track issues:

| Feature | Status | Issues Found | Notes |
|---------|--------|--------------|-------|
| Homepage | ⬜ Pass / ⬜ Fail | | |
| Live Demo | ⬜ Pass / ⬜ Fail | | |
| Legal Pages | ⬜ Pass / ⬜ Fail | | |
| Exam Simulator | ⬜ Pass / ⬜ Fail | | |
| Business Validator | ⬜ Pass / ⬜ Fail | | |
| Mock Interview | ⬜ Pass / ⬜ Fail | | |
| Study Planner | ⬜ Pass / ⬜ Fail | | |
| Pitch Deck | ⬜ Pass / ⬜ Fail | | |
| Theme Toggle | ⬜ Pass / ⬜ Fail | | |
| Mobile Responsive | ⬜ Pass / ⬜ Fail | | |

---

## 🚀 Quick Test URLs

Copy-paste these to test quickly:

```
Homepage:           http://localhost:3000
Terms:              http://localhost:3000/terms
Privacy:            http://localhost:3000/privacy
Beta Disclaimer:    http://localhost:3000/beta-disclaimer
Login:              http://localhost:3000/login
Signup:             http://localhost:3000/signup
Dashboard:          http://localhost:3000/dashboard
Exam Simulator:     http://localhost:3000/exam
Business Validator: http://localhost:3000/validate
Mock Interview:     http://localhost:3000/interview
Study Planner:      http://localhost:3000/planner
Pitch Deck:         http://localhost:3000/pitch-deck
```

---

**Last Updated**: April 28, 2026
**Version**: Beta 1.0
**Built by**: Salman Memon, Gariyaband, Chhattisgarh, India

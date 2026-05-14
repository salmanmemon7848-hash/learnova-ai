# Thinkior AI - Complete Testing Guide

## 🚨 IMPORTANT: Before Testing

You need to run these commands in order:

### Step 1: Stop All Node Processes
```bash
# Open Command Prompt as Administrator and run:
taskkill /F /IM node.exe
```

### Step 2: Push Database Schema
```bash
cd "c:\Users\salma\Documents\Learnova Ai\learnova-web"
npx prisma db push
```

This will create all the new tables in your Supabase database:
- DoubtSolver
- StudyNote
- ExamAttempt
- StudyStreak
- WeakAreaTracking
- ParentLink

### Step 3: Regenerate Prisma Client
```bash
npx prisma generate
```

### Step 4: Start Development Server
```bash
npm run dev
```

---

## ✅ Testing Checklist

### Phase 1: AI Doubt Solver

#### Test 1: Text Doubt
1. Go to: http://localhost:3000/doubt-solver
2. Type a doubt in the text area (e.g., "How to solve quadratic equations?")
3. Select subject: Mathematics
4. Select chapter: Algebra
5. Click "Solve Doubt"
6. **Expected**: AI response with:
   - Subject & chapter info
   - Step-by-step solution
   - Key formulas
   - Exam tips
   - Similar problems

#### Test 2: Image Doubt (Photo)
1. Go to: http://localhost:3000/doubt-solver
2. Upload an image (drag & drop or camera)
3. Add question text (optional)
4. Select difficulty
5. Click "Solve Doubt"
6. **Expected**: Image-based solution with diagram analysis

#### Test 3: Save as Study Note
1. After getting a solution
2. Click "Save as Study Note" button
3. Fill in title, subject, topic, tags
4. Click "Save Note"
5. **Expected**: Note saved successfully

---

### Phase 2: Analytics Dashboard

#### Test 1: View Academic DNA
1. Go to: http://localhost:3000/dashboard
2. **Expected**: 
   - 4 quick stat cards (streak, readiness, improvement, questions)
   - Academic DNA section with subject performance
   - Weak/Medium/Strong categorization
   - Colored badges (green, yellow, red)

#### Test 2: Daily Recommendation
1. On dashboard
2. **Expected**:
   - AI-generated daily recommendation
   - Specific topic suggestion
   - Estimated study time
   - 3 action items
   - Motivational message

#### Test 3: Weekly Report
1. Check the weekly progress section
2. **Expected**:
   - Questions answered count
   - Accuracy percentage
   - Study streak
   - Topics mastered

---

### Phase 3: Enhanced AI Chat

#### Test 1: Tone Modes
1. Go to: http://localhost:3000/chat
2. **Expected**: 5 tone buttons at top:
   - 🤝 Simple Bhai (casual Hinglish)
   - 👨‍🏫 Class (teacher-style)
   - 🎓 Expert (advanced)
   - 💼 Business (startup advisor)
   - ⚡ Revision (quick review)

3. Select "Simple Bhai" mode
4. Ask: "What is photosynthesis?"
5. **Expected**: Casual Hinglish response with desi analogies

6. Select "Expert" mode
7. Ask same question
8. **Expected**: Technical, detailed response

#### Test 2: Language Switcher
1. In chat
2. Click language dropdown
3. Select "हिंदी" (Hindi)
4. Ask a question
5. **Expected**: Response in Hindi (Devanagari script)

6. Select "Hinglish"
7. Ask same question
8. **Expected**: Mix of Hindi and English

#### Test 3: Depth Toggle
1. Toggle between "Simple" and "Detailed"
2. Ask a question in each mode
3. **Expected**: 
   - Simple: Short, basic explanation
   - Detailed: Comprehensive, in-depth answer

#### Test 4: Save as Study Note
1. After getting AI response
2. Click "📝 Save Note" button on the message
3. Fill form
4. **Expected**: Note saved to your collection

#### Test 5: Explain Differently
1. After getting response
2. Click "🔄" button
3. **Expected**: AI re-explains with different approach

#### Test 6: Feedback System
1. Click 👍 or 👎 on AI response
2. **Expected**: Feedback recorded

---

### Phase 4: Exam Simulator (API Only)

#### Test 1: Generate Exam
Use Postman or curl:

```bash
curl -X POST http://localhost:3000/api/exam/generate \
  -H "Content-Type: application/json" \
  -d '{
    "examType": "JEE_MAINS",
    "subject": "Physics",
    "topics": ["Kinematics", "Laws of Motion"],
    "difficulty": "Medium",
    "questionCount": 5,
    "duration": 60,
    "markingScheme": {
      "correct": 4,
      "incorrect": -1
    }
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "exam": {
    "examType": "JEE Main",
    "subject": "Physics",
    "questions": [
      {
        "id": "q1",
        "question": "...",
        "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
        "correctAnswer": "B",
        "explanation": "...",
        "topic": "Kinematics",
        "difficulty": "Medium",
        "estimatedTime": 90
      }
    ],
    "duration": 60,
    "markingScheme": {"correct": 4, "incorrect": -1},
    "totalMarks": 20
  }
}
```

#### Test 2: Analyze Exam
```bash
curl -X POST http://localhost:3000/api/exam/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "examType": "JEE Main",
    "subject": "Physics",
    "topic": "Kinematics",
    "questions": [
      {
        "id": "q1",
        "question": "...",
        "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
        "correctAnswer": "B",
        "explanation": "...",
        "topic": "Kinematics",
        "difficulty": "Medium"
      }
    ],
    "answers": ["B", "A", "C", "B", "A"],
    "timeTaken": 3600000
  }'
```

**Expected**: Analysis with score, accuracy, weak topics, insights

---

### Phase 5: Smart Study Planner (API Only)

#### Test 1: Generate Study Plan
```bash
curl -X POST http://localhost:3000/api/planner \
  -H "Content-Type: application/json" \
  -d '{
    "examTarget": "JEE",
    "examDate": "2025-06-15",
    "subjects": [
      {
        "name": "Physics",
        "topics": ["Kinematics", "Thermodynamics", "Optics"],
        "currentLevel": "Intermediate",
        "weakTopics": ["Thermodynamics"]
      },
      {
        "name": "Mathematics",
        "topics": ["Calculus", "Algebra", "Geometry"],
        "currentLevel": "Beginner",
        "weakTopics": ["Calculus"]
      }
    ],
    "dailyHours": {
      "weekday": 4,
      "weekend": 6
    },
    "startDate": "2025-01-01"
  }'
```

**Expected**: Complete study plan with:
- Topic scheduling
- Spaced repetition cycles
- Rest days
- Motivational messages

#### Test 2: Fetch Current Plan
```bash
curl http://localhost:3000/api/planner
```

**Expected**: Your saved study plan

---

## 🐛 Common Issues & Solutions

### Issue 1: "Prisma Client not generated"
**Solution**:
```bash
npx prisma generate
```

### Issue 2: "Table doesn't exist"
**Solution**:
```bash
npx prisma db push
```

### Issue 3: "Authentication error"
**Solution**: 
- Make sure you're logged in
- Check .env.local has correct Supabase credentials
- Restart dev server

### Issue 4: AI not responding
**Solution**:
- Check GOOGLE_API_KEY in .env.local
- Verify API key is active in Google AI Studio
- Check rate limits (50,000 requests/day free tier)

### Issue 5: Images not uploading
**Solution**:
- Check file size (max 5MB)
- Verify file format (PNG, JPG, JPEG, WEBP)
- Check browser console for errors

---

## 📊 Testing Results Template

Use this to track your testing:

```
PHASE 1: AI Doubt Solver
☐ Text doubt works
☐ Image doubt works
☐ Save as note works
☐ Solution quality good
☐ Exam relevance shown

PHASE 2: Analytics Dashboard
☐ Academic DNA displays
☐ Daily recommendation shows
☐ Weekly stats accurate
☐ Progress bars work
☐ Quick actions functional

PHASE 3: Enhanced Chat
☐ All 5 tone modes work
☐ Language switcher works (EN, HI, Hinglish)
☐ Depth toggle works
☐ Save note works
☐ Explain differently works
☐ Feedback system works

PHASE 4: Exam Simulator
☐ Exam generation API works
☐ Analysis API works
☐ Questions are quality
☐ Marking scheme correct
☐ Weak topics identified

PHASE 5: Study Planner
☐ Plan generation works
☐ Spaced repetition included
☐ Rest days scheduled
☐ Weak areas prioritized
☐ Rescheduling works
```

---

## 🎯 Feature Verification Checklist

### Must-Have Features
- [x] AI Doubt Solver with image support
- [x] Study Notes CRUD
- [x] Weak Area tracking
- [x] Academic DNA visualization
- [x] Daily recommendations
- [x] 5 AI Chat tone modes
- [x] 3 Language support
- [x] Exam generation (6 patterns)
- [x] Exam analysis
- [x] Study planner with spaced repetition

### Nice-to-Have (UI pending)
- [ ] Exam taking interface
- [ ] Planner calendar view
- [ ] Gamification UI
- [ ] Parent Dashboard
- [ ] AI Writer upgrades
- [ ] Business Validator upgrades
- [ ] PDF export

---

## 🚀 Performance Testing

### Load Test
1. Generate 10 doubts in quick succession
2. **Expected**: All respond within 5-10 seconds

### Database Test
1. Create 20 study notes
2. **Expected**: All save successfully

### AI Test
1. Test all 5 tone modes with same question
2. **Expected**: Each gives different style response

---

## 📝 Notes

- All APIs require authentication (must be logged in)
- Images are converted to base64 before sending to Gemini
- Spaced repetition follows Ebbinghaus Forgetting Curve
- XP system: 10 XP per doubt, 2 XP per correct exam answer
- Streak updates when studying on consecutive days

---

## 🔧 Manual Database Check

You can verify data in Supabase dashboard:
https://app.supabase.com

Check these tables:
- `DoubtSolver` - All your solved doubts
- `StudyNote` - All saved notes
- `ExamAttempt` - All exam attempts
- `StudyStreak` - Daily streak records
- `WeakAreaTracking` - Topic-wise performance
- `User` - Check xpPoints, streakCount, userLevel

---

## ✅ Success Criteria

Your Thinkior AI platform is working if:
1. ✅ Students can solve doubts via text/photo
2. ✅ Notes can be saved and searched
3. ✅ Dashboard shows personalized analytics
4. ✅ Chat has 5 tone modes and 3 languages
5. ✅ Exams can be generated and analyzed
6. ✅ Study plans use spaced repetition
7. ✅ Weak areas are automatically tracked
8. ✅ XP and streaks update correctly

---

**Next Steps After Testing:**
1. Fix any bugs found
2. Build remaining UI components
3. Add PDF export functionality
4. Implement Parent Dashboard
5. Add gamification UI
6. Deploy to production!

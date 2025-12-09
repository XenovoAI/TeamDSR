# 📍 Where Do Questions Appear?

## Quick Answer:
Questions appear in the **Practice Arena** (`/practice`) for students to take quizzes!

---

## Student Flow:

### 1. Student Dashboard (`/dashboard`)
```
Student logs in
    ↓
Sees Dashboard
    ↓
Clicks "Practice Arena" card
```

### 2. Practice Page (`/practice`)
```
Shows all subjects
    ↓
Student clicks a subject (e.g., Mathematics)
    ↓
Shows all chapters for that subject
```

### 3. Practice Detail (`/practice/:id`)
```
Shows chapter details
    ↓
Lists all questions for that chapter
    ↓
Student clicks "Start Quiz"
```

### 4. Quiz Player (`/practice/:id/play`)
```
Shows questions one by one
    ↓
Student answers each question
    ↓
Gets instant feedback (correct/wrong)
    ↓
Sees final score
```

---

## How It Works:

### Admin Creates Questions:
1. Admin goes to `/admin/questions`
2. Clicks "Add Question"
3. Selects **Subject** (e.g., Mathematics)
4. Selects **Chapter** (e.g., Algebra)
5. Creates question with 4 options
6. Saves question

### Students See Questions:
1. Student goes to `/practice`
2. Sees **Mathematics** card
3. Clicks Mathematics
4. Sees **Algebra** chapter
5. Clicks "Start Quiz"
6. Gets questions from Algebra chapter!

---

## Database Structure:

```
subjects (Mathematics, Physics, etc.)
    ↓
chapters (Algebra, Geometry, etc.)
    ↓
questions (What is 2+2?, etc.)
```

### Example:
```
Subject: Mathematics
  ├─ Chapter: Algebra
  │   ├─ Question 1: What is 2+2?
  │   ├─ Question 2: Solve x+5=10
  │   └─ Question 3: What is 3x=15?
  │
  ├─ Chapter: Geometry
  │   ├─ Question 1: Area of circle?
  │   └─ Question 2: Pythagoras theorem?
  │
  └─ Chapter: Trigonometry
      ├─ Question 1: What is sin(90)?
      └─ Question 2: cos(0) = ?
```

---

## Current Issue: No Subjects/Chapters

### Why Dropdowns Are Empty:
Your database has:
- ✅ Users table (with data)
- ✅ Questions table (empty)
- ✅ Subjects table (empty) ← **This is the problem!**
- ✅ Chapters table (empty) ← **This is the problem!**

### Solution:
Run the `SAMPLE_DATA_SETUP.sql` script!

---

## How to Add Sample Data:

### Step 1: Open Supabase
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor**

### Step 2: Run the Script
1. Click **New Query**
2. Copy entire content of `SAMPLE_DATA_SETUP.sql`
3. Paste into SQL Editor
4. Click **Run** (or Ctrl+Enter)

### Step 3: Verify
Run this query to check:
```sql
SELECT 
  s.name as subject,
  COUNT(c.id) as chapters
FROM subjects s
LEFT JOIN chapters c ON s.id = c.subject_id
GROUP BY s.id, s.name;
```

You should see:
```
Mathematics  | 4 chapters
Physics      | 4 chapters
Chemistry    | 4 chapters
Biology      | 4 chapters
English      | 4 chapters
```

---

## After Adding Sample Data:

### Test Admin Panel:
1. Go to `/admin/questions`
2. Click "Add Question"
3. **Subject dropdown** now shows:
   - Mathematics
   - Physics
   - Chemistry
   - Biology
   - English
4. Select "Mathematics"
5. **Chapter dropdown** now shows:
   - Algebra
   - Geometry
   - Trigonometry
   - Calculus
6. Create your question!

### Test Student View:
1. Go to `/practice`
2. See 5 subject cards (Math, Physics, etc.)
3. Click "Mathematics"
4. See 4 chapters (Algebra, Geometry, etc.)
5. Click "Algebra"
6. See questions you created!
7. Click "Start Quiz"
8. Take the quiz!

---

## Question Lifecycle:

### 1. Admin Creates:
```
Admin Panel → Questions Management
    ↓
Select Subject & Chapter
    ↓
Create Question
    ↓
Saved to Database
```

### 2. Student Takes:
```
Practice Arena → Select Subject
    ↓
Select Chapter
    ↓
Start Quiz
    ↓
Answer Questions
    ↓
Get Score
```

### 3. Data Stored:
```
quiz_sessions table
    ↓
Records:
- User ID
- Chapter ID
- Questions attempted
- Correct answers
- Score
- Time taken
```

---

## Pages Where Questions Appear:

### For Students:
1. **`/practice`** - Browse subjects
2. **`/practice/:chapterId`** - See chapter questions
3. **`/practice/:chapterId/play`** - Take quiz

### For Admins:
1. **`/admin/questions`** - Manage all questions
2. **`/admin/ai-questions`** - Generate questions with AI

---

## What You Need to Do Now:

### 1. Add Sample Data (Required):
```bash
# Run SAMPLE_DATA_SETUP.sql in Supabase
```

### 2. Create Questions:
```bash
# Go to /admin/questions
# Click "Add Question"
# Now dropdowns will work!
```

### 3. Test as Student:
```bash
# Sign out
# Sign in as student
# Go to /practice
# See subjects and chapters
# Take a quiz!
```

---

## Summary:

✅ **Questions are created in:** `/admin/questions`
✅ **Questions appear in:** `/practice` (for students)
✅ **Questions organized by:** Subject → Chapter
✅ **Current issue:** No subjects/chapters in database
✅ **Solution:** Run `SAMPLE_DATA_SETUP.sql`

**After running the SQL script, everything will work!** 🎉

---

## Quick Commands:

### Check if you have subjects:
```sql
SELECT COUNT(*) FROM subjects;
```

### Check if you have chapters:
```sql
SELECT COUNT(*) FROM chapters;
```

### Check if you have questions:
```sql
SELECT COUNT(*) FROM questions;
```

### If all return 0, run the sample data script!

---

**Next Step:** Run `SAMPLE_DATA_SETUP.sql` in Supabase SQL Editor!

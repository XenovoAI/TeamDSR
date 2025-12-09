# 🚀 Admin Panel Quick Start Guide

## Step 1: Set Up Database Tables

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project: `ezcoqsyzchjijbwwnhfn`

2. **Run the SQL Script**
   - Go to **SQL Editor**
   - Click **New query**
   - Copy the entire contents of `ADMIN_SETUP.sql`
   - Paste and click **Run**
   - Wait for "Success" message

## Step 2: Make Yourself an Admin

Run this SQL in Supabase SQL Editor:

```sql
-- Replace with your actual email
UPDATE users 
SET role = 'admin', is_admin = true 
WHERE email = 'your-email@gmail.com';
```

## Step 3: Access Admin Panel

1. **Restart your dev server** (if running)
   ```bash
   npm run dev
   ```

2. **Sign in to your account**
   - Go to http://localhost:5000/login
   - Sign in with Google

3. **Access Admin Dashboard**
   - Go to http://localhost:5000/admin
   - You should see the admin dashboard!

## 🎯 What You Can Do Now

### ✅ Available Features:

1. **Admin Dashboard** (`/admin`)
   - View platform statistics
   - Quick access to all admin features
   - Recent activity feed

2. **AI Question Generator** (`/admin/ai-questions`)
   - Generate MCQs using AI
   - Customize difficulty and count
   - Preview and save questions

### 🚧 Coming Soon:

3. **Bulk Upload** - Upload questions via CSV/Excel
4. **Questions Management** - Edit, delete, add voice explanations
5. **Study Materials** - Upload e-books and notes
6. **One Shot Videos** - Manage chapter-wise videos
7. **Users Management** - Manage students and admins
8. **Analytics** - View platform statistics
9. **Settings** - Configure platform

## 📊 Database Tables Created

| Table | Description |
|-------|-------------|
| `subjects` | Mathematics, Science, etc. |
| `chapters` | Chapter organization |
| `questions` | MCQs with explanations |
| `study_materials` | E-books, notes, PDFs |
| `one_shot_videos` | Chapter-wise videos |
| `quiz_sessions` | Student quiz attempts |
| `question_answers` | Individual answers |
| `ai_question_logs` | AI generation history |

## 🔍 Verify Setup

### Check if tables were created:
1. Go to Supabase → **Table Editor**
2. You should see all the new tables listed

### Check if you're an admin:
1. Go to Supabase → **Table Editor** → `users`
2. Find your user record
3. Check that `is_admin` = `true` and `role` = `admin`

### Test admin access:
1. Go to http://localhost:5000/admin
2. If you see "Access Denied", you're not an admin yet
3. If you see the dashboard, you're all set! 🎉

## 🎨 Admin Panel Features

### Current Features:
- ✅ Role-based access control
- ✅ Beautiful admin dashboard
- ✅ AI question generation
- ✅ Question preview
- ✅ Bulk save functionality

### Planned Features:
- ⏳ CSV/Excel bulk upload
- ⏳ Voice explanation upload
- ⏳ GIF animations for correct/wrong answers
- ⏳ Video management
- ⏳ E-book upload
- ⏳ Analytics dashboard
- ⏳ User management

## 🐛 Troubleshooting

### "Access Denied" when visiting /admin
**Solution:** Make sure you ran the SQL to make yourself an admin:
```sql
UPDATE users SET role = 'admin', is_admin = true WHERE email = 'your-email@gmail.com';
```

### Tables not showing in Supabase
**Solution:** Make sure you ran the entire `ADMIN_SETUP.sql` script

### Can't see admin menu in navbar
**Solution:** The admin menu will be added in the next update. For now, access directly via `/admin`

## 📝 Next Steps

1. ✅ Set up database tables
2. ✅ Make yourself admin
3. ✅ Access admin dashboard
4. ⏳ Test AI question generator
5. ⏳ Wait for bulk upload feature
6. ⏳ Start adding content!

## 💡 Tips

- **Sample Data:** The SQL script includes sample subjects and chapters
- **Testing:** Use the AI generator to create test questions
- **Organization:** Organize content by Subject → Chapter → Questions
- **Backup:** Export your database regularly

---

**Ready to manage your educational platform! 🎓**

Need help? Check `ADMIN_PANEL_PROGRESS.md` for detailed implementation status.

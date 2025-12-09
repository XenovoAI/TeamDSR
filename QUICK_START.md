# ⚡ Quick Start - 4 Steps to Launch

## Step 1: Enable Email Auth in Firebase (2 minutes)
1. Go to https://console.firebase.google.com/
2. Select project: **digraj-sir**
3. Authentication → Sign-in method
4. Enable **Email/Password**
5. Save

## Step 2: Run SQL in Supabase (1 minute)
1. Go to https://supabase.com/dashboard
2. SQL Editor → New Query
3. Copy/paste `ADMIN_SETUP_FINAL.sql`
4. Run (Ctrl+Enter)

## Step 3: Make Yourself Admin (30 seconds)
```sql
UPDATE users SET role = 'admin', is_admin = true 
WHERE email = 'YOUR-EMAIL@gmail.com';
```

## Step 4: Test Everything (5 minutes)
```bash
npm run dev
```

Visit: http://localhost:5000/login

### Test Checklist:
- [ ] Google sign-in works
- [ ] Email sign-up works (new account)
- [ ] Email sign-in works (existing account)
- [ ] Check console for sync logs (🔄 → ✅)
- [ ] Visit http://localhost:5000/admin
- [ ] See Admin Dashboard

## 🎉 Done!

**Total Time: ~8 minutes**

---

## What You Get:

✅ Google OAuth (priority/default)
✅ Email/Password authentication
✅ User profiles in Supabase
✅ Admin panel access
✅ Complete database schema
✅ Role-based access control

---

## Troubleshooting:

**Can't sign in?**
→ Check Firebase Console - Email/Password enabled?

**User not in Supabase?**
→ Check browser console for sync logs

**Can't access admin?**
→ Run the UPDATE query in Step 3

**Need help?**
→ See `SETUP_COMPLETE_GUIDE.md` for detailed instructions

---

## Ready to Build! 🚀

Next features to implement:
1. Bulk question upload (CSV/Excel)
2. Study materials management (PDFs)
3. One-shot videos
4. Voice explanations
5. GIF animations for quiz

All the infrastructure is ready!

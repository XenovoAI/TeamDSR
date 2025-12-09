# 📍 Where Are My Users?

## Quick Answer:

**Supabase Table Editor → users table** ✅

NOT in Supabase Authentication panel ❌

---

## Step-by-Step Guide:

### 1. Go to Supabase Dashboard
- Visit: https://supabase.com/dashboard
- Select your project

### 2. Click "Table Editor"
- Look in the left sidebar
- Click **Table Editor** (database icon)

### 3. Click "users" Table
- You'll see a list of tables
- Click **users**

### 4. See All Your Users!
```
┌──────────────────────┬─────────────────────┬──────────┬─────────┬──────────┐
│ id                   │ email               │ name     │ role    │ is_admin │
├──────────────────────┼─────────────────────┼──────────┼─────────┼──────────┤
│ kw7Ave8BhgT3x9xs...  │ etox130@gmail.com   │ Etox     │ admin   │ true     │
│ Ni4X6jKRhehbVCt8...  │ thaetovi@gmail.com  │ User     │ student │ false    │
└──────────────────────┴─────────────────────┴──────────┴─────────┴──────────┘
```

---

## Why Not in Supabase Authentication?

### We Use Firebase for Authentication:
```
Firebase Auth ✅
├─ Google OAuth
├─ Email/Password
├─ Session Management
└─ Security Tokens

Supabase Auth ❌
└─ Not used (will be empty)
```

### We Use Supabase for Data Storage:
```
Supabase Database ✅
├─ users table (profiles)
├─ subjects table
├─ chapters table
├─ questions table
└─ All other data
```

---

## Where to Find Users:

### In Supabase (User Profiles):
**Location:** Table Editor → users
**Contains:**
- Email, name, avatar
- Role, is_admin
- Class, school
- All custom fields

### In Firebase (Authentication):
**Location:** Authentication → Users
**Contains:**
- Login credentials
- Auth sessions
- Last sign-in time
- Provider info (Google, Email)

---

## Both Systems Work Together:

```
User Signs In
    ↓
Firebase Auth ← Handles login
    ↓
Get Firebase UID
    ↓
Supabase Database ← Store profile with Firebase UID as ID
    ↓
App Uses Supabase Data ← All features use this
```

---

## Fixed the 406 Error:

**Before:**
```typescript
.single()  // Throws 406 if no rows found
```

**After:**
```typescript
.maybeSingle()  // Returns null if no rows, no error
```

Now you won't see that 406 error anymore!

---

## Quick Check:

### To See All Users in Supabase:
```sql
SELECT id, email, name, role, is_admin, created_at
FROM users
ORDER BY created_at DESC;
```

### To Count Users:
```sql
SELECT COUNT(*) as total_users FROM users;
```

### To See Only Admins:
```sql
SELECT email, name, role
FROM users
WHERE is_admin = true;
```

### To See Only Students:
```sql
SELECT email, name, class, school
FROM users
WHERE role = 'student';
```

---

## Summary:

✅ **Users ARE being stored** - in Supabase Database
✅ **Check Table Editor** - not Authentication panel
✅ **Firebase handles auth** - Supabase stores data
✅ **406 error fixed** - using maybeSingle()
✅ **Everything works** - just look in the right place!

---

**Where to Look:**
- Supabase → Table Editor → users ✅
- NOT Supabase → Authentication ❌

**Why:**
- We use Firebase for authentication
- We use Supabase for data storage
- Best of both worlds! 🎉

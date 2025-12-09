# Authentication Setup - Email/Password (MVP)

## ✅ Current Setup: Email & Password

Your app now uses **Email/Password authentication** instead of Phone OTP. This is perfect for MVP and testing!

## 🚀 How It Works

### User Flow
1. Go to login page
2. Enter email and password
3. Click "Sign Up" (first time) or "Sign In" (returning user)
4. Get redirected to dashboard

### No Setup Required!
Email authentication is **enabled by default** in Supabase. You can start using it immediately.

## 📝 Features

### ✅ Sign Up
- Email validation
- Password strength check (min 6 characters)
- Email verification (optional)
- User type stored (user or vendor)
- Auto-redirect after signup

### ✅ Sign In
- Email/password validation
- Remember session
- Automatic redirect to correct dashboard
- Error handling

### ✅ Toggle Between Sign Up/Sign In
- No page reload needed
- Smooth transition
- Preserves user input

### ✅ Show/Hide Password
- Eye icon to toggle visibility
- Better UX for mobile users

## 🧪 Testing Your Auth

### Test User Account
1. Go to: http://localhost:3000/login?mode=user
2. Click "Don't have an account? Sign Up"
3. Enter:
   - Email: `user@test.com`
   - Password: `test123`
4. Click "Create Account"
5. You'll be redirected to `/user/dashboard`

### Test Vendor Account
1. Go to: http://localhost:3000/login?mode=vendor
2. Click "Don't have an account? Sign Up"
3. Enter:
   - Email: `vendor@test.com`
   - Password: `test123`
4. Click "Create Account"
5. You'll be redirected to `/vendor/dashboard`

## 📊 Verify in Supabase

After creating accounts, check in Supabase:

1. Go to: https://supabase.com/dashboard/project/dybhxveohvritzrbztgp/auth/users
2. You'll see your test users listed
3. Click on a user to see details including:
   - Email
   - User metadata (user_type: vendor or user)
   - Creation date
   - Last sign in

## 🔄 Email Verification (Optional)

By default, Supabase sends verification emails. You can:

### Option 1: Disable Email Verification (For Testing)
1. Go to Supabase → Authentication → Providers
2. Scroll to "Email"
3. Uncheck "Confirm email"
4. Save

Now users can login immediately after signup!

### Option 2: Use Test Email
Use a service like:
- [Mailinator](https://www.mailinator.com)
- [Temp Mail](https://temp-mail.org)
- Create email: `yourname@mailinator.com`
- Check inbox at mailinator.com

## 🔐 Security Features

### Built-in Protection
- ✅ Email format validation
- ✅ Password length requirement
- ✅ SQL injection protection
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Secure session cookies

### Password Requirements
- Minimum 6 characters
- Can add more rules later (uppercase, numbers, special chars)

## 🎯 Advantages of Email/Password for MVP

### ✅ Pros
- No SMS costs
- Works everywhere
- Easy to test
- No Twilio setup
- Instant account creation
- Multiple test accounts

### 📱 Phone OTP (Coming Later)
- Better for India market
- No password to remember
- More user-friendly for vendors
- Required for production

## 🚀 Using the Auth System

### In Your Components

```typescript
import { createClient } from '@/lib/supabase/client'

// Get current user
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()

// Check if user is logged in
if (user) {
  console.log('Logged in:', user.email)
  console.log('User type:', user.user_metadata.user_type)
}

// Sign out
await supabase.auth.signOut()
```

### Protected Routes

Currently, dashboard pages will show even without login. To protect them:

```typescript
// Add to any protected page
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  router.push('/login')
  return
}
```

## 🐛 Troubleshooting

### "Invalid login credentials"
- Check email and password are correct
- Try signing up first if account doesn't exist

### "Password should be at least 6 characters"
- Password too short
- Use minimum 6 characters

### "Email rate limit exceeded"
- Too many signup attempts
- Wait a few minutes
- Or use different email

### Can't receive verification email?
- Check spam folder
- Disable email verification (see above)
- Use test email service

## 🎨 UI Features

### Current UI
- ✅ Email input with icon
- ✅ Password input with show/hide toggle
- ✅ Toggle between Sign Up / Sign In
- ✅ Switch between User / Vendor mode
- ✅ Error messages
- ✅ Success messages
- ✅ Loading states
- ✅ Disabled button when invalid

### Mobile Optimized
- Large input fields
- Clear button states
- Easy to tap buttons
- Responsive design

## 📈 Next Steps

### Now Available
- ✅ Create unlimited test accounts
- ✅ Test user dashboard
- ✅ Test vendor dashboard
- ✅ No SMS costs
- ✅ Fast testing

### Later (Production)
- [ ] Add phone OTP option
- [ ] Social login (Google, Facebook)
- [ ] Two-factor authentication
- [ ] Password reset flow
- [ ] Profile completion

## 🔄 Switching to Phone OTP Later

When ready for production:
1. Keep email/password as backup
2. Add phone OTP as primary
3. Let users choose preferred method
4. Vendors use phone, users use email

Both can coexist!

## 💡 Pro Tips

1. **Multiple Test Accounts**: Create separate accounts for testing different scenarios
2. **Use Mailinator**: For quick test emails without signup
3. **Disable Email Verification**: For faster testing during development
4. **Check Supabase Dashboard**: See all users and their metadata
5. **Use Strong Passwords**: Even for test accounts

## 📞 Quick Test Credentials

Create these for testing:

```
User Account:
- Email: user@test.com
- Password: test123456

Vendor Account:
- Email: vendor@test.com
- Password: test123456

Admin Account (later):
- Email: admin@test.com
- Password: admin123456
```

## ✅ Checklist

- [x] Email/Password auth implemented
- [x] Sign up flow working
- [x] Sign in flow working
- [x] Toggle between sign up/in
- [x] User type saved (user/vendor)
- [x] Auto-redirect after auth
- [x] Error handling
- [x] Success messages
- [x] Password show/hide
- [ ] Test with real accounts (do this now!)

## 🎊 You're Ready!

No additional setup needed. Just:
1. Go to http://localhost:3000/login
2. Create an account
3. Start testing!

---

**Auth Type**: Email/Password
**Status**: ✅ Ready to use
**Setup Required**: None
**Cost**: Free

Phone OTP can be added later without breaking anything!

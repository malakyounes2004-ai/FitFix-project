# Email Setup Instructions for User Reports

## ✅ Email Service is Ready!

The "Send by Email" feature is now fully implemented and ready to send **real emails** to users.

## 🔧 Required Configuration

To send real emails, you need to set up email credentials in your `.env` file:

### 1. Create/Update `.env` file in the root directory:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
```

### 2. Gmail Setup (Recommended)

**Step 1: Enable 2-Factor Authentication**
- Go to https://myaccount.google.com/security
- Turn on **2-Step Verification**

**Step 2: Generate App Password**
- Go to https://myaccount.google.com/apppasswords
- Select **"Mail"** as the app
- Select your device (or "Other" and type "FitFix")
- Click **"Generate"**
- Copy the **16-character password** (it will look like: `abcd efgh ijkl mnop`)

**Step 3: Add to .env**
```env
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # Use the 16-character app password (remove spaces)
```

### 3. Restart Your Server

After updating `.env`, restart your backend server:
```bash
npm run dev
# or
node server.js
```

## 📧 How It Works

1. **Employee clicks "Send by Email"** in the Reports & Analytics page
2. **Backend validates** user email and permissions
3. **Email service** creates a professional HTML email with:
   - User information
   - Meal plan details
   - Workout plan details
   - Progress statistics
4. **Email is sent** via Gmail SMTP to the user's email address
5. **Success notification** appears in the frontend

## 🧪 Testing

1. Select a user in the Reports & Analytics page
2. Click **"Send by Email"** button
3. Check the **backend console** for logs:
   - `📧 Preparing to send user report email to: user@example.com`
   - `📤 Sending email to user@example.com...`
   - `✅ User report email sent successfully!`
4. Check the **user's email inbox** (and spam folder)
5. You should see a professional email with the complete report

## 🔍 Troubleshooting

### Error: "Email service not configured"
- **Solution**: Make sure `EMAIL_USER` and `EMAIL_PASSWORD` are set in `.env`
- **Check**: Restart server after updating `.env`

### Error: "EAUTH" or "Authentication failed"
- **Solution**: 
  - Make sure you're using an **App Password**, not your regular Gmail password
  - Verify 2-Factor Authentication is enabled
  - Regenerate the app password if needed

### Error: "ECONNECTION" or "Could not connect"
- **Solution**: 
  - Check your internet connection
  - Verify Gmail SMTP is accessible
  - Try again after a few minutes

### Email not received
- **Check**: User's spam/junk folder
- **Verify**: Email address is correct in user profile
- **Check logs**: Backend console should show success message

## 📝 Email Content

The email includes:
- ✅ User's personal information
- ✅ Current meal plan (name, calories, meals breakdown)
- ✅ Current workout plan (name, goal, days per week, exercises)
- ✅ Progress statistics (completion %, active days, compliance rates)
- ✅ Professional FitFix branding

## 🎯 Next Steps

1. **Set up email credentials** in `.env`
2. **Restart your server**
3. **Test with a real user** in the Reports & Analytics page
4. **Verify email delivery** in user's inbox

---

**Note**: The email service uses **real SMTP** (Gmail) and sends **actual emails**. Make sure your email credentials are secure and never commit them to version control!


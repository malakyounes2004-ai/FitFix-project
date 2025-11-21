# Email Setup Guide for FitFix

## Overview
When you create an employee account, the system automatically sends an email to the employee with their login credentials.

## Required Environment Variables

Add these to your `.env` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
```

## Setup Instructions

### Option 1: Gmail (Recommended)

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com/security
   - Turn on 2-Step Verification

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Click "Generate"
   - Copy the 16-character password

3. **Add to .env**
   ```env
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  (16-character app password)
   ```

### Option 2: Other Email Services

**Outlook/Hotmail:**
```javascript
// In src/utils/emailService.js, change:
service: 'outlook'
```

**Yahoo:**
```javascript
service: 'yahoo'
```

**Custom SMTP:**
```javascript
host: 'smtp.yourserver.com',
port: 587,
secure: false,
auth: {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASSWORD
}
```

## Email Template

The employee will receive a professional email with:
- Welcome message
- **💳 Subscription plan details** (if created from employee registration)
  - Plan name (Monthly, 2-Month, 3-Month, Yearly)
  - Amount paid ($200, $390, $599, $2300)
  - Payment confirmation badge
- Login credentials (email + temporary password)
- Link to login page
- Security notice to change password

> **Note:** The payment info section only appears if the employee was created from a pending registration. If you create an employee manually (without selecting a registration), the payment section is hidden.

## Testing

1. Create an employee account from `/admin/employees`
2. Check the console logs for email status
3. Verify the employee received the email

## Troubleshooting

**"Invalid login" error:**
- Make sure you're using an App Password, not your regular password
- Enable "Less secure app access" if using regular password (not recommended)

**Email not sending:**
- Check console logs for detailed error messages
- Verify EMAIL_USER and EMAIL_PASSWORD are set correctly
- Check your email provider's SMTP settings
- Make sure 2FA is enabled for Gmail

**Port blocked:**
- Try port 465 (SSL) instead of 587 (TLS)
- Check if your firewall is blocking SMTP ports

## Production Considerations

For production, consider using:
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5,000 emails/month)
- **AWS SES** (pay-as-you-go, very cheap)
- **Postmark** (great deliverability)

These services are more reliable than Gmail for production use.


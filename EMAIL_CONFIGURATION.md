# Email Configuration - Production Timeout Fix

## Problem
The production environment was experiencing `ETIMEDOUT` errors when sending emails via nodemailer, causing invoice emails to fail.

## Solution Implemented

### 1. **Enhanced Transporter Configuration**
Added timeout and pool settings to both `auth.js` and `orders.js`:
```javascript
connectionTimeout: 10000,  // 10 seconds
socketTimeout: 10000,      // 10 seconds
pool: {
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 4000,
  rateLimit: 14
}
```

### 2. **Timeout Wrapper for Email Sending**
Added a `Promise.race()` pattern to prevent email sends from hanging indefinitely:
```javascript
const emailPromise = transporter.sendMail(mailOptions);
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("Email send timeout")), 8000)
);

await Promise.race([emailPromise, timeoutPromise]);
```

### 3. **Non-Blocking Email Sending**
- Orders are no longer blocked if email sending fails
- Email failures are logged but don't prevent order completion
- Added check for EMAIL_USER and EMAIL_PASSWORD before attempting to send

## Required Environment Variables

Make sure these are set in your Render production environment:

```
EMAIL_SERVICE=gmail  # or your email service provider
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Use app-specific password for Gmail
FRONTEND_URL=https://your-frontend-domain.com
JWT_SECRET=your-secret-key
```

## Gmail App Password Setup

If using Gmail:
1. Enable 2-Factor Authentication on your Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Use the generated 16-character password as `EMAIL_PASSWORD`

## Recommendations for Production

1. **Consider Email Service Alternative**: If Gmail continues to timeout:
   - Use SendGrid API
   - Use AWS SES
   - Use Mailgun
   - Use Resend or other modern email services

2. **Implement Email Queue System**:
   - Use Bull/BullMQ with Redis for async email sending
   - Decouple email sending from order processing
   - Add retry logic for failed emails

3. **Add Email Verification**:
   ```bash
   npm install nodemailer-sendgrid-transport
   ```

4. **Monitor Email Delivery**:
   - Log all email attempts with timestamps
   - Track delivery status
   - Set up alerts for repeated failures

## Files Modified

- `/backend/routes/auth.js` - Enhanced forgot password email handling
- `/backend/routes/orders.js` - Enhanced invoice email handling
- Added this configuration guide

## Testing

After deployment, verify:
1. Test user registration
2. Test forgot password flow
3. Place a test order and verify invoice email sends (or is logged)

## Next Steps if Issues Persist

1. Check Render logs for specific error messages
2. Verify email credentials are correct
3. Consider switching to SendGrid or similar service
4. Implement Queue-based email system for reliability

# Production Email Configuration Guide

## Problem
Email sending works in development but fails in production (Render, Heroku, etc.) due to SMTP connectivity issues.

## Solutions

### Option 1: Use Gmail (Free)
**Pros:** Free, easy to setup
**Cons:** Can be unstable in production, rate limits

**Setup:**
1. Enable 2-Factor Authentication on your Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Copy the 16-character password

**Environment Variables:**
```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=https://your-app-domain.com
```

---

### Option 2: SendGrid (Recommended for Production) ⭐
**Pros:** Most reliable, high deliverability, free tier (100 emails/day)
**Cons:** Requires SendGrid account

**Setup:**
1. Create account at https://sendgrid.com
2. Get API Key from Settings → API Keys
3. Verify your sender email

**Environment Variables:**
```
EMAIL_SERVICE=sendgrid
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-sendgrid-api-key
FRONTEND_URL=https://your-app-domain.com
```

---

### Option 3: Mailgun (Alternative)
**Pros:** Good pricing, reliable
**Cons:** Requires account

**Setup:**
1. Create account at https://www.mailgun.com
2. Add and verify your domain
3. Get SMTP credentials

**Environment Variables:**
```
EMAIL_SERVICE=mailgun
EMAIL_USER=postmaster@mg.yourdomain.com
EMAIL_PASSWORD=your-mailgun-password
FRONTEND_URL=https://your-app-domain.com
```

---

### Option 4: Resend (Modern Alternative)
**Pros:** Built for developers, reliable, free tier
**Cons:** Requires account

**Setup:**
1. Create account at https://resend.com
2. Get API Key
3. Verify sender domain (optional)

**Environment Variables:**
```
EMAIL_SERVICE=resend
EMAIL_USER=onboarding@resend.dev
EMAIL_PASSWORD=your-resend-api-key
FRONTEND_URL=https://your-app-domain.com
```

---

## Render Deployment Steps

### 1. Add Environment Variables in Render

Go to your Render service → Environment:

```
EMAIL_SERVICE=sendgrid  # or gmail, mailgun, resend
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-api-key
FRONTEND_URL=https://your-frontend-url.onrender.com
JWT_SECRET=your-secret-key
MONGODB_URI=your-mongodb-uri
```

### 2. Deploy Code

```bash
git add -A
git commit -m "feat: Production-ready email configuration"
git push origin dev
```

Render will automatically deploy from your GitHub repository.

### 3. Verify Email Configuration

Check Render logs:
```
// Should see:
✓ Email sent successfully: <messageId>

// If not configured, should see:
⚠️ Email credentials not configured. Password reset emails will not be sent.
```

---

## Troubleshooting

### Email not sending in production

1. **Check environment variables** - Render → Settings → Environment
   ```bash
   # On Render console:
   echo $EMAIL_SERVICE
   echo $EMAIL_USER
   ```

2. **Check logs** - Render → Logs for error messages

3. **Verify credentials** - Test locally first:
   ```bash
   NODE_ENV=production node server.js
   ```

4. **Check firewall** - Render may block certain SMTP ports:
   - Port 25: Usually blocked (don't use)
   - Port 587: TLS (use this)
   - Port 465: SSL (use this)

### Email service specific issues

**Gmail:** 
- Use App Password, not your Google password
- May need to allow "Less secure apps"
- Rate limited after ~500 emails/hour

**SendGrid:**
- Verify sender email
- Check API key has Mail Send permission
- Monitor usage on dashboard

**Mailgun:**
- Verify domain in sandbox
- Check API credentials format

---

## Email Service Comparison

| Feature | Gmail | SendGrid | Mailgun | Resend |
|---------|-------|----------|---------|--------|
| Free Tier | ✓ | ✓ (100/day) | ✓ (limited) | ✓ |
| Reliability | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Setup Difficulty | Easy | Medium | Medium | Easy |
| Deliverability | Good | Excellent | Excellent | Excellent |
| Rate Limits | Yes | No | No | No |
| Support | Community | Excellent | Good | Good |

---

## Production Best Practices

1. **Never commit credentials** - Use environment variables only

2. **Monitor email delivery** - Check service dashboard regularly

3. **Set up alerts** - Most services have failure notifications

4. **Use queue for emails** - For better reliability:
   ```bash
   npm install bullmq redis
   ```
   Implement Redis-based email queue

5. **Log all email attempts** - For debugging:
   ```javascript
   console.log(`Email: ${email}, Status: success, MessageId: ${messageId}`);
   ```

6. **Handle failures gracefully** - Orders/resets should complete even if email fails

---

## Testing in Production

### 1. Test Forgot Password Flow
- Go to login page
- Click "Forgot password?"
- Enter email
- Check email inbox (may take 1-2 minutes)
- Click reset link
- Change password

### 2. Test Order Invoice Email
- Login as user
- Place an order
- Check email for invoice

### 3. Monitor Logs
```bash
# On Render
# Check real-time logs for email status
tail -f logs
```

---

## Files Modified

- `/backend/utils/emailService.js` - New email service configuration
- `/backend/routes/auth.js` - Updated to use new service
- `/backend/routes/orders.js` - Updated to use new service

## Next Steps

1. Choose an email service from options above
2. Add environment variables to Render
3. Deploy code
4. Test the flow
5. Monitor logs

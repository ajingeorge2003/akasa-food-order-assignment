import nodemailer from 'nodemailer';

/**
 * Email Service Configuration
 * Supports multiple email providers for better reliability in production
 */

const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.warn('⚠️ Email credentials not configured. Password reset emails will not be sent.');
    return null;
  }

  // Gmail Configuration
  if (emailService === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword, // Use Gmail App Password, not your regular password
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
      pool: {
        maxConnections: 3,
        maxMessages: 50,
        rateDelta: 4000,
        rateLimit: 14,
      },
      secure: true,
      requireTLS: true,
    });
  }

  // SendGrid Configuration (Recommended for production)
  if (emailService === 'sendgrid') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: emailPassword, // SendGrid API Key
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
      pool: {
        maxConnections: 5,
        maxMessages: 100,
      },
    });
  }

  // Mailgun Configuration (Alternative for production)
  if (emailService === 'mailgun') {
    return nodemailer.createTransport({
      host: 'smtp.mailgun.org',
      port: 587,
      auth: {
        user: emailUser, // Your Mailgun domain
        pass: emailPassword, // Your Mailgun password
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
      pool: {
        maxConnections: 5,
        maxMessages: 100,
      },
    });
  }

  // Resend Configuration (Modern alternative)
  if (emailService === 'resend') {
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: emailPassword, // Resend API Key
      },
    });
  }

  // Default fallback to Gmail
  console.warn(`⚠️ Unknown email service: ${emailService}. Falling back to Gmail.`);
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
    connectionTimeout: 10000,
    socketTimeout: 10000,
    pool: {
      maxConnections: 3,
      maxMessages: 50,
    },
  });
};

/**
 * Send email with timeout protection
 * @param {Object} transporter - Nodemailer transporter
 * @param {Object} mailOptions - Email options (from, to, subject, html)
 * @param {number} timeout - Timeout in milliseconds (default: 8000)
 * @returns {Promise} - Email send result
 */
export const sendEmailWithTimeout = async (transporter, mailOptions, timeout = 8000) => {
  if (!transporter) {
    console.warn('⚠️ Email transporter not configured. Email will not be sent.');
    return { skipped: true, reason: 'Email service not configured' };
  }

  try {
    const emailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email send timeout')), timeout)
    );

    const result = await Promise.race([emailPromise, timeoutPromise]);
    console.log('✓ Email sent successfully:', result.messageId);
    return result;
  } catch (err) {
    console.error('✗ Failed to send email:', err.message);
    // Don't throw - let the application continue
    return { error: err.message };
  }
};

/**
 * Verify email configuration
 * @returns {Object} - Configuration status
 */
export const verifyEmailConfig = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  return {
    configured: !!(emailUser && emailPassword),
    service: emailService,
    user: emailUser ? `${emailUser.substring(0, 3)}***` : 'NOT SET',
    password: emailPassword ? '***' : 'NOT SET',
    frontendUrl: frontendUrl,
  };
};

export default createTransporter;

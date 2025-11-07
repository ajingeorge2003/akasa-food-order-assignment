import * as brevo from '@getbrevo/brevo';

/**
 * Brevo Email Service Configuration
 * Uses official Brevo SDK for reliable email delivery
 */

// Create and configure Brevo API client
const createBrevoClient = () => {
  if (!process.env.EMAIL_PASSWORD) {
    console.warn('⚠️ Brevo API key not configured.');
    return null;
  }

  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.EMAIL_PASSWORD);
  return apiInstance;
};

const apiInstance = createBrevoClient();

/**
 * Send email using Brevo SDK
 * @param {Object} mailOptions - Email options (from, to, subject, html)
 * @returns {Promise} - Email send result
 */
export const sendEmailWithTimeout = async (mailOptions, timeout = 10000) => {
  if (!apiInstance) {
    console.warn('⚠️ Brevo API client not initialized. Email will not be sent.');
    return { skipped: true, reason: 'Brevo API client not initialized' };
  }

  if (!process.env.EMAIL_PASSWORD) {
    console.warn('⚠️ Brevo API key not configured. Email will not be sent.');
    return { skipped: true, reason: 'Brevo API key not configured' };
  }

  try {
    // Prepare email data for Brevo
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.to = [
      {
        email: mailOptions.to,
        name: mailOptions.toName || mailOptions.to,
      },
    ];
    
    sendSmtpEmail.sender = {
      email: mailOptions.from || process.env.EMAIL_FROM || 'noreply@example.com',
      name: mailOptions.fromName || 'Eato Food Order',
    };
    
    sendSmtpEmail.subject = mailOptions.subject;
    sendSmtpEmail.htmlContent = mailOptions.html;
    
    // Add reply-to if provided
    if (mailOptions.replyTo) {
      sendSmtpEmail.replyTo = {
        email: mailOptions.replyTo,
      };
    }

    console.log('📧 Sending email via Brevo:', {
      to: sendSmtpEmail.to[0].email,
      from: sendSmtpEmail.sender.email,
      subject: sendSmtpEmail.subject,
    });

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email send timeout')), timeout)
    );

    // Send email with timeout protection
    const emailPromise = apiInstance.sendTransacEmail(sendSmtpEmail);
    const result = await Promise.race([emailPromise, timeoutPromise]);

    console.log('✓ Email sent successfully:', result.body.messageId);
    return { 
      success: true, 
      messageId: result.body.messageId,
      data: result.body 
    };
  } catch (err) {
    console.error('✗ Failed to send email:', err.message);
    console.error('Error details:', err.response?.status, err.response?.body || err.toString());
    // Don't throw - let the application continue
    return { 
      error: err.message,
      status: err.response?.status,
      details: err.response?.body || err.toString()
    };
  }
};

/**
 * Verify email configuration
 * @returns {Object} - Configuration status
 */
export const verifyEmailConfig = () => {
  const apiKey = process.env.EMAIL_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  return {
    configured: !!(apiKey && emailFrom),
    service: 'brevo',
    apiKey: apiKey ? `${apiKey.substring(0, 10)}***` : 'NOT SET',
    emailFrom: emailFrom || 'NOT SET',
    frontendUrl: frontendUrl,
  };
};

export default sendEmailWithTimeout;

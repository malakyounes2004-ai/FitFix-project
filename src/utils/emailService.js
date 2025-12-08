import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter using Gmail or any SMTP service
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('EMAIL_USER and EMAIL_PASSWORD environment variables are required');
  }
  
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to other services
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASSWORD // Your email password or app password
    }
  });
};

/**
 * Send employee credentials via email
 * @param {string} employeeEmail - Employee's email address
 * @param {string} employeeName - Employee's name
 * @param {string} tempPassword - Temporary password
 * @param {object} paymentInfo - Payment plan information (optional)
 * @returns {Promise}
 */
export const sendEmployeeCredentials = async (employeeEmail, employeeName, tempPassword, paymentInfo = null) => {
  try {
    const transporter = createTransporter();

    // Build payment plan section if payment info is provided
    let paymentSection = '';
    if (paymentInfo && paymentInfo.selectedPlan) {
      paymentSection = `
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 25px; margin: 25px 0; color: white;">
          <div style="text-align: center; margin-bottom: 15px;">
            <strong style="font-size: 18px;">💳 Your Subscription Plan</strong>
          </div>
          <div style="background: rgba(255,255,255,0.2); border-radius: 8px; padding: 20px; backdrop-filter: blur(10px);">
            <div style="margin-bottom: 12px;">
              <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">Plan:</div>
              <strong style="font-size: 18px;">${paymentInfo.selectedPlan}</strong>
            </div>
            <div>
              <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">Amount Paid:</div>
              <strong style="font-size: 24px; color: #fbbf24;">$${paymentInfo.amount}</strong>
            </div>
          </div>
          <p style="text-align: center; margin: 15px 0 0 0; font-size: 13px; opacity: 0.9;">
            ✅ Payment confirmed and processed successfully
          </p>
        </div>
      `;
    }

    const mailOptions = {
      from: `"FitFix Admin" <${process.env.EMAIL_USER}>`,
      to: employeeEmail,
      subject: '🎉 Welcome to FitFix - Your Employee Account is Ready!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 30px auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #1f36ff 0%, #15b5ff 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: bold;
            }
            .content {
              padding: 40px 30px;
            }
            .credentials-box {
              background: #f8f9fa;
              border-left: 4px solid #1f36ff;
              padding: 20px;
              margin: 25px 0;
              border-radius: 8px;
            }
            .credential-item {
              margin: 15px 0;
            }
            .credential-label {
              font-weight: 600;
              color: #666;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .credential-value {
              font-size: 16px;
              color: #1f36ff;
              font-weight: bold;
              margin-top: 5px;
              word-break: break-all;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #1f36ff 0%, #15b5ff 100%);
              color: white;
              text-decoration: none;
              padding: 14px 32px;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 8px;
              font-size: 14px;
            }
            .footer {
              background: #f8f9fa;
              padding: 30px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .footer strong {
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to FitFix!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Your employee account has been created</p>
            </div>
            
            <div class="content">
              <p>Hi <strong>${employeeName}</strong>,</p>
              
              <p>Great news! Your employee account for FitFix Health & Fitness platform has been successfully created by our admin team.</p>
              
              ${paymentSection}
              
              <p>You can now access the platform using the credentials below:</p>
              
              <div class="credentials-box">
                <div class="credential-item">
                  <div class="credential-label">Login Email</div>
                  <div class="credential-value">${employeeEmail}</div>
                </div>
                <div class="credential-item">
                  <div class="credential-label">Temporary Password</div>
                  <div class="credential-value">${tempPassword}</div>
                </div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong><br>
                This is a temporary password. Please change it immediately after your first login for security purposes.
              </div>
              
              <center>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">
                  Login to Dashboard →
                </a>
              </center>
              
              <p style="margin-top: 30px;">If you have any questions or need assistance, feel free to reach out to our admin team.</p>
              
              <p style="margin-top: 20px;">Best regards,<br><strong>FitFix Admin Team</strong></p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;"><strong>FitFix Health & Fitness</strong></p>
              <p style="margin: 5px 0 0 0;">Empowering fitness coaches worldwide 💪</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

/**
 * Send password reset notification to employee
 * @param {string} employeeEmail - Employee's email address
 * @param {string} employeeName - Employee's name
 * @param {string} newPassword - New password
 * @returns {Promise}
 */
export const sendPasswordResetNotification = async (employeeEmail, employeeName, newPassword) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"FitFix Admin" <${process.env.EMAIL_USER}>`,
      to: employeeEmail,
      subject: '🔐 Your FitFix Password Has Been Reset',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 30px auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: bold;
            }
            .content {
              padding: 40px 30px;
            }
            .alert-box {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border-left: 4px solid #f59e0b;
              padding: 20px;
              margin: 25px 0;
              border-radius: 8px;
              color: #92400e;
            }
            .credentials-box {
              background: #f8f9fa;
              border-left: 4px solid #a855f7;
              padding: 20px;
              margin: 25px 0;
              border-radius: 8px;
            }
            .credential-item {
              margin: 15px 0;
            }
            .credential-label {
              font-weight: 600;
              color: #666;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .credential-value {
              font-size: 18px;
              color: #a855f7;
              font-weight: bold;
              margin-top: 5px;
              word-break: break-all;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
              color: white;
              text-decoration: none;
              padding: 14px 32px;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .footer {
              background: #f8f9fa;
              padding: 30px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .footer strong {
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Your password has been updated</p>
            </div>
            
            <div class="content">
              <p>Hi <strong>${employeeName}</strong>,</p>
              
              <div class="alert-box">
                <strong>⚠️ Security Notice</strong><br>
                Your FitFix account password was recently changed by an administrator.
              </div>
              
              <p>You can now log in to your account using your new credentials:</p>
              
              <div class="credentials-box">
                <div class="credential-item">
                  <div class="credential-label">Login Email</div>
                  <div class="credential-value">${employeeEmail}</div>
                </div>
                <div class="credential-item">
                  <div class="credential-label">New Password</div>
                  <div class="credential-value">${newPassword}</div>
                </div>
              </div>
              
              <center>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">
                  Login to Dashboard →
                </a>
              </center>
              
              <p style="margin-top: 30px; padding: 15px; background: #fef3c7; border-radius: 8px; font-size: 14px; color: #92400e;">
                <strong>🔒 Important:</strong> For security reasons, we recommend changing this password after your next login. Go to Settings → Change Password.
              </p>
              
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                If you did not request this password change, please contact your administrator immediately.
              </p>
              
              <p style="margin-top: 20px;">Best regards,<br><strong>FitFix Admin Team</strong></p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;"><strong>FitFix Health & Fitness</strong></p>
              <p style="margin: 5px 0 0 0;">Empowering fitness coaches worldwide 💪</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Password reset email failed:', error);
    throw error;
  }
};

/**
 * Send subscription confirmation email
 * @param {string} employeeEmail - Employee's email address
 * @param {string} employeeName - Employee's name
 * @param {string} planLabel - Plan name (e.g., "Monthly Plan")
 * @param {number} amount - Amount paid
 * @param {Date} expirationDate - Subscription expiration date
 * @returns {Promise}
 */
export const sendSubscriptionConfirmation = async (employeeEmail, employeeName, planLabel, amount, expirationDate) => {
  try {
    const transporter = createTransporter();
    const formattedDate = expirationDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const mailOptions = {
      from: `"FitFix Admin" <${process.env.EMAIL_USER}>`,
      to: employeeEmail,
      subject: '✅ Subscription Confirmed - Welcome to FitFix!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 32px; font-weight: bold; }
            .content { padding: 40px 30px; }
            .success-box { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 8px; color: #065f46; }
            .info-box { background: #f8f9fa; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 8px; }
            .info-item { margin: 10px 0; }
            .info-label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
            .info-value { font-size: 18px; color: #10b981; font-weight: bold; margin-top: 5px; }
            .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; text-align: center; }
            .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Subscription Confirmed!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Welcome to FitFix</p>
            </div>
            <div class="content">
              <p>Hi <strong>${employeeName}</strong>,</p>
              <div class="success-box">
                <strong>🎉 Congratulations!</strong><br>
                Your subscription payment has been successfully processed and your account is now active.
              </div>
              <p>Here are your subscription details:</p>
              <div class="info-box">
                <div class="info-item">
                  <div class="info-label">Subscription Plan</div>
                  <div class="info-value">${planLabel}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Amount Paid</div>
                  <div class="info-value">$${amount}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Expires On</div>
                  <div class="info-value">${formattedDate}</div>
                </div>
              </div>
              <center>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">
                  Access Your Dashboard →
                </a>
              </center>
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                You will receive a reminder email 2 days before your subscription expires.
              </p>
              <p style="margin-top: 20px;">Best regards,<br><strong>FitFix Admin Team</strong></p>
            </div>
            <div class="footer">
              <p style="margin: 0;"><strong>FitFix Health & Fitness</strong></p>
              <p style="margin: 5px 0 0 0;">Empowering fitness coaches worldwide 💪</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Subscription confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Subscription confirmation email failed:', error);
    throw error;
  }
};

/**
 * Send subscription expiration reminder (2 days before)
 * @param {string} employeeEmail - Employee's email address
 * @param {string} employeeName - Employee's name
 * @param {string} planLabel - Plan name
 * @param {Date} expirationDate - Subscription expiration date
 * @returns {Promise}
 */
export const sendSubscriptionReminder = async (employeeEmail, employeeName, planLabel, expirationDate) => {
  try {
    const transporter = createTransporter();
    const formattedDate = expirationDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const mailOptions = {
      from: `"FitFix Admin" <${process.env.EMAIL_USER}>`,
      to: employeeEmail,
      subject: '⏰ Your FitFix Subscription Expires Soon',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 32px; font-weight: bold; }
            .content { padding: 40px 30px; }
            .warning-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 8px; color: #92400e; }
            .info-box { background: #f8f9fa; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 8px; }
            .info-item { margin: 10px 0; }
            .info-label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
            .info-value { font-size: 18px; color: #d97706; font-weight: bold; margin-top: 5px; }
            .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; text-align: center; }
            .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Subscription Reminder</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Your subscription expires in 2 days</p>
            </div>
            <div class="content">
              <p>Hi <strong>${employeeName}</strong>,</p>
              <div class="warning-box">
                <strong>⚠️ Important Notice</strong><br>
                Your FitFix subscription will expire in 2 days. Renew now to continue enjoying all features.
              </div>
              <p>Subscription Details:</p>
              <div class="info-box">
                <div class="info-item">
                  <div class="info-label">Current Plan</div>
                  <div class="info-value">${planLabel}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Expires On</div>
                  <div class="info-value">${formattedDate}</div>
                </div>
              </div>
              <center>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/contact-admin" class="button">
                  Renew Subscription →
                </a>
              </center>
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                If you have any questions, please contact our support team.
              </p>
              <p style="margin-top: 20px;">Best regards,<br><strong>FitFix Admin Team</strong></p>
            </div>
            <div class="footer">
              <p style="margin: 0;"><strong>FitFix Health & Fitness</strong></p>
              <p style="margin: 5px 0 0 0;">Empowering fitness coaches worldwide 💪</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Subscription reminder email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Subscription reminder email failed:', error);
    throw error;
  }
};

/**
 * Send subscription expiration notification
 * @param {string} employeeEmail - Employee's email address
 * @param {string} employeeName - Employee's name
 * @param {string} planLabel - Plan name
 * @param {Date} expirationDate - Subscription expiration date
 * @returns {Promise}
 */
export const sendSubscriptionExpiration = async (employeeEmail, employeeName, planLabel, expirationDate) => {
  try {
    const transporter = createTransporter();
    const formattedDate = expirationDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const mailOptions = {
      from: `"FitFix Admin" <${process.env.EMAIL_USER}>`,
      to: employeeEmail,
      subject: '🔴 Your FitFix Subscription Has Expired',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 32px; font-weight: bold; }
            .content { padding: 40px 30px; }
            .alert-box { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-left: 4px solid #ef4444; padding: 20px; margin: 25px 0; border-radius: 8px; color: #991b1b; }
            .info-box { background: #f8f9fa; border-left: 4px solid #ef4444; padding: 20px; margin: 25px 0; border-radius: 8px; }
            .info-item { margin: 10px 0; }
            .info-label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
            .info-value { font-size: 18px; color: #dc2626; font-weight: bold; margin-top: 5px; }
            .button { display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; text-align: center; }
            .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔴 Subscription Expired</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Your subscription has ended</p>
            </div>
            <div class="content">
              <p>Hi <strong>${employeeName}</strong>,</p>
              <div class="alert-box">
                <strong>⚠️ Important Notice</strong><br>
                Your FitFix subscription expired on ${formattedDate}. Your account access has been suspended. Renew now to restore access.
              </div>
              <p>Subscription Details:</p>
              <div class="info-box">
                <div class="info-item">
                  <div class="info-label">Expired Plan</div>
                  <div class="info-value">${planLabel}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Expired On</div>
                  <div class="info-value">${formattedDate}</div>
                </div>
              </div>
              <center>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/contact-admin" class="button">
                  Renew Subscription →
                </a>
              </center>
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                If you have any questions or need assistance, please contact our support team.
              </p>
              <p style="margin-top: 20px;">Best regards,<br><strong>FitFix Admin Team</strong></p>
            </div>
            <div class="footer">
              <p style="margin: 0;"><strong>FitFix Health & Fitness</strong></p>
              <p style="margin: 5px 0 0 0;">Empowering fitness coaches worldwide 💪</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Subscription expiration email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Subscription expiration email failed:', error);
    throw error;
  }
};

/**
 * Send welcome email to new user (client) with login credentials
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @param {string} tempPassword - Temporary password
 * @param {string} assignedEmployeeName - Name of assigned trainer/coach
 * @returns {Promise}
 */
export const sendUserWelcomeEmail = async (realEmail, userName, loginEmail, tempPassword, assignedEmployeeName = 'Your Trainer') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"FitFix" <${process.env.EMAIL_USER}>`,
      to: realEmail,
      subject: '🎉 Welcome to FitFix - Your Fitness Journey Starts Here!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 30px auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #1f36ff 0%, #15b5ff 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: bold;
            }
            .content {
              padding: 40px 30px;
            }
            .welcome-box {
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              border-left: 4px solid #1f36ff;
              padding: 20px;
              margin: 25px 0;
              border-radius: 8px;
              color: #1e40af;
            }
            .credentials-box {
              background: #f8f9fa;
              border-left: 4px solid #1f36ff;
              padding: 20px;
              margin: 25px 0;
              border-radius: 8px;
            }
            .credential-item {
              margin: 15px 0;
            }
            .credential-label {
              font-weight: 600;
              color: #666;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .credential-value {
              font-size: 16px;
              color: #1f36ff;
              font-weight: bold;
              margin-top: 5px;
              word-break: break-all;
            }
            .info-box {
              background: #f0fdf4;
              border-left: 4px solid #10b981;
              padding: 20px;
              margin: 25px 0;
              border-radius: 8px;
              color: #065f46;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #1f36ff 0%, #15b5ff 100%);
              color: white;
              text-decoration: none;
              padding: 14px 32px;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 8px;
              font-size: 14px;
              color: #856404;
            }
            .footer {
              background: #f8f9fa;
              padding: 30px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .footer strong {
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to FitFix!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Your fitness journey starts here</p>
            </div>
            
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              
              <div class="welcome-box">
                <strong>🌟 Great News!</strong><br>
                Your FitFix account has been created and you've been assigned to <strong>${assignedEmployeeName}</strong> as your personal trainer. You're all set to start your fitness journey!
              </div>
              
              <p>You can now access the FitFix mobile app using the credentials below:</p>
              
              <div class="credentials-box">
                <div class="credential-item">
                  <div class="credential-label">Login Email</div>
                  <div class="credential-value">${loginEmail}</div>
                </div>
                <div class="credential-item">
                  <div class="credential-label">Temporary Password</div>
                  <div class="credential-value">${tempPassword}</div>
                </div>
              </div>
              <div class="info-box" style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 8px; font-size: 14px; color: #1565c0;">
                <strong>📧 Important:</strong><br>
                Your login email is <strong>${loginEmail}</strong>. Use this email (not your personal email) to log in to the FitFix mobile app.
              </div>
              
              <div class="info-box">
                <strong>📱 Mobile App Access</strong><br>
                Download the FitFix mobile app and log in with the credentials above to:
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>View your personalized meal and workout plans</li>
                  <li>Track your progress daily</li>
                  <li>Chat with your trainer</li>
                  <li>Access all fitness resources</li>
                </ul>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong><br>
                This is a temporary password. Please change it immediately after your first login in the mobile app for security purposes.
              </div>
              
              <center>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">
                  Access Mobile App →
                </a>
              </center>
              
              <p style="margin-top: 30px;">If you have any questions or need assistance, feel free to reach out to your trainer or our support team.</p>
              
              <p style="margin-top: 20px;">Best regards,<br><strong>FitFix Team</strong></p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;"><strong>FitFix Health & Fitness</strong></p>
              <p style="margin: 5px 0 0 0;">Empowering your fitness journey 💪</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ User welcome email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ User welcome email failed:', error);
    throw error;
  }
};

/**
 * Send employee report via email
 * @param {string} employeeEmail - Employee's email address
 * @param {string} employeeName - Employee's name
 * @param {object} reportData - Complete employee report data
 * @returns {Promise}
 */
export const sendEmployeeReport = async (employeeEmail, employeeName, reportData) => {
  try {
    const transporter = createTransporter();

    // Format dates
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      } catch {
        return dateString;
      }
    };

    // Build subscription section
    let subscriptionSection = '<p style="color: #666;">No active subscription</p>';
    if (reportData.subscription) {
      const sub = reportData.subscription;
      const daysRemaining = sub.expirationDate 
        ? Math.ceil((new Date(sub.expirationDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null;
      
      subscriptionSection = `
        <div style="background: #f8f9fa; border-left: 4px solid #1f36ff; padding: 20px; margin: 15px 0; border-radius: 8px;">
          <div style="margin: 10px 0;"><strong>Plan:</strong> ${sub.planName || 'N/A'}</div>
          <div style="margin: 10px 0;"><strong>Duration:</strong> ${sub.duration ? `${sub.duration} days` : 'N/A'}</div>
          <div style="margin: 10px 0;"><strong>Start Date:</strong> ${formatDate(sub.startDate)}</div>
          <div style="margin: 10px 0;"><strong>Expiration Date:</strong> ${formatDate(sub.expirationDate)}</div>
          <div style="margin: 10px 0;"><strong>Days Remaining:</strong> ${daysRemaining !== null ? (daysRemaining > 0 ? `${daysRemaining} days` : 'Expired') : 'N/A'}</div>
          <div style="margin: 10px 0;"><strong>Status:</strong> <span style="color: ${sub.status === 'active' ? '#10b981' : '#ef4444'}">${sub.status || 'Expired'}</span></div>
          <div style="margin: 10px 0;"><strong>Total Payments:</strong> $${(sub.totalPayments || 0).toLocaleString()}</div>
        </div>
      `;
    }

    // Build activity section
    const activity = reportData.activity || {};
    const activitySection = `
      <div style="background: #f8f9fa; border-left: 4px solid #10b981; padding: 20px; margin: 15px 0; border-radius: 8px;">
        <div style="margin: 10px 0;"><strong>Users Managed:</strong> ${activity.usersManaged || 0}</div>
        <div style="margin: 10px 0;"><strong>Meal Plans Created:</strong> ${activity.mealPlansCreated || 0}</div>
        <div style="margin: 10px 0;"><strong>Workout Plans Created:</strong> ${activity.workoutPlansCreated || 0}</div>
        <div style="margin: 10px 0;"><strong>Last Login:</strong> ${formatDate(activity.lastLogin) || 'Never'}</div>
        <div style="margin: 10px 0;"><strong>Chat Messages:</strong> ${activity.chatMessages || 0}</div>
      </div>
    `;

    // Build payment history section
    let paymentHistorySection = '<p style="color: #666;">No payment history available</p>';
    if (reportData.paymentHistory && reportData.paymentHistory.length > 0) {
      paymentHistorySection = reportData.paymentHistory.map(payment => `
        <div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981;">
          <div style="margin: 5px 0;"><strong>Date:</strong> ${formatDate(payment.date)}</div>
          <div style="margin: 5px 0;"><strong>Amount:</strong> $${(payment.amount || 0).toLocaleString()}</div>
          <div style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${payment.status === 'completed' ? '#10b981' : '#f59e0b'}">${payment.status || 'Pending'}</span></div>
          ${payment.type ? `<div style="margin: 5px 0;"><strong>Type:</strong> ${payment.type}</div>` : ''}
        </div>
      `).join('');
    }

    const mailOptions = {
      from: `"FitFix Admin" <${process.env.EMAIL_USER}>`,
      to: employeeEmail,
      subject: '📊 Your FitFix Employee Report',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 700px; margin: 30px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1f36ff 0%, #15b5ff 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 32px; font-weight: bold; }
            .content { padding: 40px 30px; }
            .section { margin: 30px 0; }
            .section-title { font-size: 20px; font-weight: bold; color: #1f36ff; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; }
            .info-row { margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .info-label { font-weight: 600; color: #666; font-size: 14px; }
            .info-value { font-size: 16px; color: #333; margin-top: 5px; }
            .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Employee Report</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Your comprehensive account summary</p>
            </div>
            <div class="content">
              <p>Hi <strong>${employeeName}</strong>,</p>
              <p>Please find your detailed employee report below:</p>

              <div class="section">
                <div class="section-title">👤 Employee Information</div>
                <div class="info-row">
                  <div class="info-label">Full Name</div>
                  <div class="info-value">${reportData.displayName || employeeName || 'N/A'}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Email</div>
                  <div class="info-value">${reportData.email || employeeEmail}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Account Created</div>
                  <div class="info-value">${formatDate(reportData.createdAt)}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Status</div>
                  <div class="info-value" style="color: ${reportData.isActive !== false ? '#10b981' : '#ef4444'}">
                    ${reportData.isActive !== false ? '✅ Active' : '❌ Suspended'}
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">💳 Subscription Information</div>
                ${subscriptionSection}
              </div>

              <div class="section">
                <div class="section-title">💰 Payment History</div>
                ${paymentHistorySection}
                ${reportData.totalAmountPaid ? `<div style="margin-top: 15px; padding: 15px; background: #e0f2fe; border-radius: 8px;"><strong>Total Amount Paid:</strong> $${reportData.totalAmountPaid.toLocaleString()}</div>` : ''}
              </div>

              <div class="section">
                <div class="section-title">📈 Activity Summary</div>
                ${activitySection}
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                This report was generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
              </p>
              <p style="margin-top: 20px;">Best regards,<br><strong>FitFix Admin Team</strong></p>
            </div>
            <div class="footer">
              <p style="margin: 0;"><strong>FitFix Health & Fitness</strong></p>
              <p style="margin: 5px 0 0 0;">Empowering fitness coaches worldwide 💪</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Employee report email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Employee report email failed:', error);
    throw error;
  }
};

export default { sendEmployeeCredentials, sendPasswordResetNotification, sendSubscriptionConfirmation, sendSubscriptionReminder, sendSubscriptionExpiration, sendUserWelcomeEmail, sendEmployeeReport };


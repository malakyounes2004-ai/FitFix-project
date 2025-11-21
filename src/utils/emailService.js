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

export default { sendEmployeeCredentials, sendPasswordResetNotification, sendSubscriptionConfirmation, sendSubscriptionReminder, sendSubscriptionExpiration };


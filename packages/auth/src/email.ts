import { Resend } from 'resend';

let resendInstance: Resend | null = null;

export const initializeEmail = (apiKey: string) => {
    resendInstance = new Resend(apiKey);
};

const getResend = () => {
    if (!resendInstance) {
        throw new Error('Email service not initialized. Call initializeEmail first.');
    }
    return resendInstance;
};

const emailStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&display=swap');
    
    body {
        font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #C7F4FA;
        margin: 0;
        padding: 0;
        background-color: #032125;
    }
    .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: rgba(3, 33, 37, 0.95);
        border-radius: 30px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(8, 75, 84, 0.3);
    }
    .header {
        background: linear-gradient(135deg, rgba(6, 54, 61, 0.9) 0%, rgba(8, 75, 84, 0.9) 100%);
        padding: 50px 40px;
        text-align: center;
        border-bottom: 2px solid rgba(16, 158, 177, 0.3);
    }
    .logo {
        margin-bottom: 20px;
    }
    .header h1 {
        color: #C7F4FA;
        margin: 0;
        font-size: 32px;
        font-weight: 600;
        letter-spacing: 0.5px;
    }
    .header p {
        color: rgba(199, 244, 250, 0.8);
        margin: 10px 0 0;
        font-size: 16px;
    }
    .content {
        padding: 40px;
        background-color: rgba(3, 33, 37, 0.95);
    }
    .content p {
        margin: 0 0 20px;
        font-size: 16px;
        color: #C7F4FA;
        line-height: 1.8;
    }
    .content strong {
        color: #98EAF5;
    }
    .button-container {
        text-align: center;
        margin: 30px 0;
    }
    .button {
        display: inline-block;
        padding: 15px 40px;
        background: #109EB1;
        color: #C7F4FA !important;
        text-decoration: none;
        border-radius: 124px;
        font-weight: 700;
        font-size: 16px;
        transition: all 0.3s ease;
        border: 2px solid #109EB1;
    }
    .button:hover {
        background: #0d8a9b;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 158, 177, 0.4);
    }
    .footer {
        background-color: rgba(6, 54, 61, 0.5);
        padding: 30px 40px;
        text-align: center;
        border-top: 1px solid rgba(8, 75, 84, 0.5);
    }
    .footer p {
        margin: 8px 0;
        font-size: 14px;
        color: rgba(199, 244, 250, 0.6);
    }
    .security-notice {
        background-color: rgba(16, 158, 177, 0.15);
        border-left: 4px solid #109EB1;
        padding: 20px;
        margin: 25px 0;
        border-radius: 12px;
    }
    .security-notice p {
        margin: 0;
        font-size: 14px;
        color: #98EAF5;
        line-height: 1.6;
    }
    .link-box {
        background-color: rgba(6, 54, 61, 0.6);
        padding: 20px;
        border-radius: 12px;
        margin: 25px 0;
        word-break: break-all;
        border: 1px solid rgba(8, 75, 84, 0.5);
    }
    .link-box p {
        margin: 5px 0 10px;
        font-size: 14px;
        color: #C7F4FA;
    }
    .link-box code {
        color: #109EB1;
        font-size: 13px;
        background-color: rgba(8, 75, 84, 0.4);
        padding: 8px 12px;
        border-radius: 6px;
        display: block;
        margin-top: 10px;
    }
    .icon-circle {
        width: 80px;
        height: 80px;
        background: rgba(152, 234, 245, 0.2);
        border: 2px solid rgba(152, 234, 245, 0.4);
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        font-size: 40px;
    }
`;

export const sendVerificationEmail = async (email: string, url: string) => {
    const resend = getResend();

    await resend.emails.send({
        from: 'Orbis <no-reply@orbis.place>',
        to: email,
        subject: 'Verify Your Email Address - Orbis',
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify Your Email</title>
                <style>${emailStyles}</style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="icon-circle">✉️</div>
                        <h1>Verify Your Email</h1>
                        <p>Welcome to Orbis - Enter the space where every vision finds its form</p>
                    </div>
                    <div class="content">
                        <p>Hi there,</p>
                        <p>Thanks for signing up with <strong>Orbis</strong>! We're excited to have you join our community.</p>
                        <p>To complete your registration and start your journey, please verify your email address by clicking the button below:</p>
                        
                        <div class="button-container">
                            <a href="${url}" class="button">Verify My Email</a>
                        </div>

                        <div class="link-box">
                            <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
                            <code>${url}</code>
                        </div>

                        <div class="security-notice">
                            <p><strong>⚠️ Security Notice:</strong> This verification link will expire in 24 hours for your security. If you didn't create an account with Orbis, please ignore this email.</p>
                        </div>

                        <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
                        
                        <p>Best regards,<br><strong>The Orbis Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Orbis. All rights reserved.</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
    });
};

export const sendResetPasswordEmail = async (email: string, url: string) => {
    const resend = getResend();

    await resend.emails.send({
        from: 'Orbis <no-reply@orbis.place>',
        to: email,
        subject: 'Reset Your Password - Orbis',
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Your Password</title>
                <style>${emailStyles}</style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="icon-circle">🔐</div>
                        <h1>Password Reset Request</h1>
                        <p>Secure your account with a new password</p>
                    </div>
                    <div class="content">
                        <p>Hi there,</p>
                        <p>We received a request to reset the password for your <strong>Orbis</strong> account associated with this email address.</p>
                        <p>To reset your password, click the button below:</p>
                        
                        <div class="button-container">
                            <a href="${url}" class="button">Reset My Password</a>
                        </div>

                        <div class="link-box">
                            <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
                            <code>${url}</code>
                        </div>

                        <div class="security-notice">
                            <p><strong>⚠️ Security Notice:</strong> This password reset link will expire in 1 hour for security reasons. If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.</p>
                        </div>

                        <p><strong>Why did I receive this email?</strong><br>
                        This email was sent because someone (hopefully you) requested a password reset for your account. If this wasn't you, your account is still secure and no changes have been made.</p>
                        
                        <p>Best regards,<br><strong>The Orbis Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Orbis. All rights reserved.</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
    });
};
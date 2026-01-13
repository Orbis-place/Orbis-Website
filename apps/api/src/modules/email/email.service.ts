import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

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

@Injectable()
export class EmailService {
    private resend: Resend | null = null;
    private readonly logger = new Logger(EmailService.name);

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        if (apiKey) {
            this.resend = new Resend(apiKey);
        } else {
            this.logger.warn('RESEND_API_KEY not found in configuration. Email service will not work.');
        }
    }

    async sendDonationReminderEmail(
        email: string,
        resourceName: string,
        donationLink: string,
        scheduledAt: string,
        resourceSlug: string,
        resourceType: string
    ) {
        if (!this.resend) {
            this.logger.error('Cannot send email: Resend client not initialized');
            return;
        }

        const appUrl = this.configService.get<string>('APP_URL') || 'https://orbis.place';
        const resourceUrl = `${appUrl}/resources/${resourceType.toLowerCase()}/${resourceSlug}`;

        try {
            await this.resend.emails.send({
                from: 'Orbis <no-reply@orbis.place>',
                to: email,
                subject: `Reminder: Support the creator of ${resourceName}`,
                scheduledAt: scheduledAt,
                html: `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Support the Creator</title>
                        <style>${emailStyles}</style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <div class="icon-circle">❤️</div>
                                <h1>Support the Creator</h1>
                                <p>You asked us to remind you to donate</p>
                            </div>
                            <div class="content">
                                <p>Hi there,</p>
                                <p>You recently downloaded <strong><a href="${resourceUrl}" style="color: #98EAF5; text-decoration: none;">${resourceName}</a></strong> on Orbis and asked us to remind you to support the creator.</p>
                                <p>Creating high-quality resources takes time and effort. If you found this resource useful, please consider making a donation to show your appreciation and support future development.</p>
                                
                                <div class="button-container">
                                    <a href="${donationLink}" class="button">Donate Now</a>
                                </div>

                                <div class="link-box">
                                    <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
                                    <code>${donationLink}</code>
                                </div>

                                <p>If you've already donated, thank you! You can simply ignore this email.</p>
                                
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
            this.logger.log(`Donation reminder email scheduled for ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send donation reminder email to ${email}`, error);
            throw error;
        }
    }
}

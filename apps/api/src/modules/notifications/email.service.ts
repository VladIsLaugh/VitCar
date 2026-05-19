import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    this.resend = new Resend(this.config.get<string>('RESEND_API_KEY') ?? 'not-configured');
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'https://vit-car.vercel.app');
    const url = `${frontendUrl}/auth/verify-email?token=${token}`;

    const { error } = await this.resend.emails.send({
      from: 'VitAuto <noreply@vitauto.ua>',
      to: email,
      subject: 'Verify your email — VitAuto',
      html: `
        <p>Thank you for registering at VitAuto!</p>
        <p>Click the link below to verify your email address (valid 24 hours):</p>
        <p><a href="${url}">Verify email</a></p>
        <p>If you did not register, you can safely ignore this email.</p>
      `,
    });

    if (error) {
      this.logger.error(`Failed to send verification email to ${email}: ${error.message}`);
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'https://vit-car.vercel.app');
    const url = `${frontendUrl}/auth/reset-password?token=${token}`;

    const { error } = await this.resend.emails.send({
      from: 'VitAuto <noreply@vitauto.ua>',
      to: email,
      subject: 'Reset your password — VitAuto',
      html: `
        <p>You requested a password reset for your VitAuto account.</p>
        <p>Click the link below to set a new password (valid 1 hour):</p>
        <p><a href="${url}">Reset password</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
    });

    if (error) {
      this.logger.error(`Failed to send password reset email to ${email}: ${error.message}`);
    }
  }
}

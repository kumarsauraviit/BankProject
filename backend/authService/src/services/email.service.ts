import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env.js';

export class EmailService {
  private transporter?: Transporter;

  private getTransporter(): Transporter {
    const { host, port, secure, user, password } = env.email;

    if (!host || !port || !Number.isInteger(port) || port <= 0 || !user || !password || !env.email.from) {
      throw new Error('SMTP configuration is incomplete');
    }

    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass: password,
        },
      });
    }

    return this.transporter;
  }

  /**
   * Sends a password reset email to the given recipient.
   * Never logs the raw token or full reset URL.
   */
  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const sanitizedEmail = to.replace(/^(.)(.*)(@.*)$/, (_match, p1, p2, p3) => {
      return `${p1}${'*'.repeat(Math.max(p2.length, 3))}${p3}`;
    });

    await this.getTransporter().sendMail({
      from: env.email.from,
      to,
      subject: 'Reset your password',
      text: `You requested a password reset. Use this link within 5 minutes: ${resetUrl}`,
      html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 5 minutes.</p>`,
    });

    console.log(`[EmailService] Password reset email sent for recipient: ${sanitizedEmail}`);
  }
}

export const emailService = new EmailService();

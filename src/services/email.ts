// Email Notification Service
// Uses Supabase Edge Functions or external email service

import { supabase } from '@/integrations/supabase/client';

export type EmailTemplate = 
  | 'subscription_confirmation'
  | 'payment_success'
  | 'payment_failed'
  | 'expiry_reminder'
  | 'trial_ending'
  | 'subscription_cancelled'
  | 'subscription_renewed';

interface EmailParams {
  to: string;
  userId?: string;
  template: EmailTemplate;
  data: Record<string, any>;
}

interface EmailTemplateData {
  subject: string;
  body: string;
}

class EmailService {
  /**
   * Get email template content
   */
  private getTemplate(template: EmailTemplate, data: Record<string, any>): EmailTemplateData {
    const templates: Record<EmailTemplate, EmailTemplateData> = {
      subscription_confirmation: {
        subject: 'Selamat! Subscription Anda Aktif - RumahKu',
        body: `
Halo ${data.customerName},

Terima kasih telah berlangganan RumahKu!

Detail Subscription:
- Paket: ${data.tierName}
- Harga: Rp ${data.amount?.toLocaleString('id-ID')}
- Berlaku hingga: ${data.expiresAt}

Anda sekarang dapat menikmati semua fitur dari paket ${data.tierName}.

Jika ada pertanyaan, jangan ragu untuk menghubungi kami.

Salam hangat,
Tim RumahKu
        `.trim(),
      },
      payment_success: {
        subject: 'Pembayaran Berhasil - RumahKu',
        body: `
Halo ${data.customerName},

Pembayaran Anda telah berhasil diproses!

Detail Pembayaran:
- Order ID: ${data.orderId}
- Paket: ${data.tierName}
- Jumlah: Rp ${data.amount?.toLocaleString('id-ID')}
${data.discountAmount ? `- Diskon: Rp ${data.discountAmount?.toLocaleString('id-ID')}` : ''}
- Tanggal: ${new Date().toLocaleDateString('id-ID')}

Subscription Anda telah diperpanjang hingga ${data.expiresAt}.

Terima kasih atas kepercayaan Anda!

Salam hangat,
Tim RumahKu
        `.trim(),
      },
      payment_failed: {
        subject: 'Pembayaran Gagal - RumahKu',
        body: `
Halo ${data.customerName},

Maaf, pembayaran Anda gagal diproses.

Detail:
- Order ID: ${data.orderId}
- Alasan: ${data.reason || 'Tidak diketahui'}

Silakan coba lagi atau hubungi kami jika masalah berlanjut.

Salam hangat,
Tim RumahKu
        `.trim(),
      },
      expiry_reminder: {
        subject: 'Subscription Anda Akan Berakhir - RumahKu',
        body: `
Halo ${data.customerName},

Subscription ${data.tierName} Anda akan berakhir dalam ${data.daysLeft} hari.

Tanggal berakhir: ${data.expiresAt}

Perpanjang sekarang untuk terus menikmati semua fitur RumahKu tanpa gangguan.

[Perpanjang Subscription]

Salam hangat,
Tim RumahKu
        `.trim(),
      },
      trial_ending: {
        subject: 'Trial Period Anda Akan Berakhir - RumahKu',
        body: `
Halo ${data.customerName},

Trial period Anda akan berakhir dalam ${data.daysLeft} hari.

Tanggal berakhir: ${data.trialEndsAt}

Upgrade ke paket berbayar untuk terus menggunakan semua fitur premium RumahKu.

[Lihat Paket]

Salam hangat,
Tim RumahKu
        `.trim(),
      },
      subscription_cancelled: {
        subject: 'Subscription Dibatalkan - RumahKu',
        body: `
Halo ${data.customerName},

Subscription ${data.tierName} Anda telah dibatalkan.

Anda masih dapat menggunakan fitur premium hingga ${data.expiresAt}.
Setelah itu, akun Anda akan kembali ke paket Free.

Kami akan senang jika Anda kembali! Jika ada masalah, silakan hubungi kami.

Salam hangat,
Tim RumahKu
        `.trim(),
      },
      subscription_renewed: {
        subject: 'Subscription Diperpanjang - RumahKu',
        body: `
Halo ${data.customerName},

Subscription ${data.tierName} Anda telah diperpanjang!

Berlaku hingga: ${data.expiresAt}

Terima kasih telah terus mempercayai RumahKu.

Salam hangat,
Tim RumahKu
        `.trim(),
      },
    };

    return templates[template];
  }

  /**
   * Queue email for sending
   */
  async queueEmail(params: EmailParams): Promise<void> {
    try {
      const template = this.getTemplate(params.template, params.data);

      const { error } = await supabase.from('email_notifications').insert({
        recipient_email: params.to,
        recipient_user_id: params.userId,
        subject: template.subject,
        body: template.body,
        template_name: params.template,
        status: 'pending',
        metadata: params.data,
      });

      if (error) {
        throw error;
      }

      console.log(`Email queued: ${params.template} to ${params.to}`);
    } catch (error: any) {
      console.error('Failed to queue email:', error);
      throw error;
    }
  }

  /**
   * Send email immediately (requires backend/edge function)
   * This is a placeholder - actual implementation depends on your email provider
   */
  async sendEmail(params: EmailParams): Promise<void> {
    try {
      const template = this.getTemplate(params.template, params.data);

      // Option 1: Use Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: params.to,
          subject: template.subject,
          body: template.body,
          template: params.template,
          data: params.data,
        },
      });

      if (error) {
        // Fallback: queue for later
        await this.queueEmail(params);
        return;
      }

      console.log('Email sent:', data);
    } catch (error: any) {
      console.error('Failed to send email:', error);
      // Fallback: queue for later
      await this.queueEmail(params);
    }
  }

  /**
   * Send subscription confirmation email
   */
  async sendSubscriptionConfirmation(
    email: string,
    userId: string,
    data: {
      customerName: string;
      tierName: string;
      amount: number;
      expiresAt: string;
    }
  ): Promise<void> {
    await this.queueEmail({
      to: email,
      userId,
      template: 'subscription_confirmation',
      data,
    });
  }

  /**
   * Send payment success email
   */
  async sendPaymentSuccess(
    email: string,
    userId: string,
    data: {
      customerName: string;
      orderId: string;
      tierName: string;
      amount: number;
      discountAmount?: number;
      expiresAt: string;
    }
  ): Promise<void> {
    await this.queueEmail({
      to: email,
      userId,
      template: 'payment_success',
      data,
    });
  }

  /**
   * Send payment failed email
   */
  async sendPaymentFailed(
    email: string,
    userId: string,
    data: {
      customerName: string;
      orderId: string;
      reason?: string;
    }
  ): Promise<void> {
    await this.queueEmail({
      to: email,
      userId,
      template: 'payment_failed',
      data,
    });
  }

  /**
   * Send expiry reminder email
   */
  async sendExpiryReminder(
    email: string,
    userId: string,
    data: {
      customerName: string;
      tierName: string;
      expiresAt: string;
      daysLeft: number;
    }
  ): Promise<void> {
    await this.queueEmail({
      to: email,
      userId,
      template: 'expiry_reminder',
      data,
    });
  }

  /**
   * Send trial ending reminder
   */
  async sendTrialEndingReminder(
    email: string,
    userId: string,
    data: {
      customerName: string;
      trialEndsAt: string;
      daysLeft: number;
    }
  ): Promise<void> {
    await this.queueEmail({
      to: email,
      userId,
      template: 'trial_ending',
      data,
    });
  }

  /**
   * Process email queue (to be called by cron job or background worker)
   */
  async processEmailQueue(limit: number = 10): Promise<void> {
    try {
      // Get pending emails
      const { data: emails, error } = await supabase
        .from('email_notifications')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error || !emails || emails.length === 0) {
        return;
      }

      // Process each email
      for (const email of emails) {
        try {
          // Here you would integrate with your actual email service
          // For example: SendGrid, Mailgun, AWS SES, etc.
          
          // Placeholder: mark as sent
          await supabase
            .from('email_notifications')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
            })
            .eq('id', email.id);

          console.log(`Email sent: ${email.id}`);
        } catch (emailError: any) {
          // Mark as failed
          await supabase
            .from('email_notifications')
            .update({
              status: 'failed',
              error_message: emailError.message,
            })
            .eq('id', email.id);

          console.error(`Failed to send email ${email.id}:`, emailError);
        }
      }
    } catch (error: any) {
      console.error('Failed to process email queue:', error);
    }
  }
}

export const emailService = new EmailService();
export type { EmailParams, EmailTemplate };

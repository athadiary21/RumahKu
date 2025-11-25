// Stub implementation for email service until email_notifications table is implemented

export type EmailTemplate = 'welcome' | 'trial_ending' | 'subscription_renewed' | 'payment_success';

export interface EmailParams {
  to: string;
  userId?: string;
  template: EmailTemplate;
  data: Record<string, any>;
}

export class EmailService {
  async queueEmail(params: EmailParams): Promise<void> {
    // TODO: Implement email_notifications table
    console.log('Email queued (stub):', params);
  }

  async processEmailQueue(limit: number = 10): Promise<void> {
    // TODO: Implement email_notifications table
    console.log('Processing email queue (stub)');
  }
}

export const emailService = new EmailService();

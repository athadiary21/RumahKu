# Email Notifications Setup

## Overview

RumahKu menggunakan sistem email notifications untuk mengirim notifikasi otomatis kepada user saat terjadi perubahan subscription atau menjelang expiration.

## Architecture

1. **Database Trigger** - Otomatis membuat entry di `email_notifications` table saat ada perubahan subscription
2. **Email Queue** - Table `email_notifications` berfungsi sebagai queue
3. **Edge Function** - Supabase Edge Function `send-email` memproses queue dan mengirim email
4. **Email Service** - Integrasi dengan Resend API (atau email provider lainnya)

## Setup Instructions

### 1. Apply Migrations

Migrations sudah tersedia di:
- `20251126000001_subscription_history.sql` - Subscription history tracking
- `20251126000002_email_notifications.sql` - Email notifications system

Apply via Supabase CLI:
```bash
supabase db push
```

Atau via Supabase Dashboard > SQL Editor (copy-paste migration files)

### 2. Deploy Edge Function

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-email
```

### 3. Set Environment Variables

Via Supabase Dashboard > Project Settings > Edge Functions > Secrets:

```bash
# Resend API Key (get from https://resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Or use another email service provider
# SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
# AWS_SES_ACCESS_KEY=xxxxxxxxxxxxx
```

### 4. Setup Cron Job (Optional)

For expiration reminders, setup a cron job to call the function daily:

Via Supabase Dashboard > Database > Cron Jobs:

```sql
-- Run daily at 9 AM
SELECT cron.schedule(
  'send-expiration-reminders',
  '0 9 * * *',
  $$
  SELECT send_expiration_reminders();
  SELECT net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/send-email',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

## Email Templates

### 1. Subscription Change

**Trigger**: Saat admin mengubah subscription tier atau status user

**Template**: `subscription_change`

**Data**:
- `user_name` - Nama user
- `family_name` - Nama family
- `old_tier` - Tier sebelumnya
- `new_tier` - Tier baru
- `old_status` - Status sebelumnya
- `new_status` - Status baru
- `expires_at` - Tanggal expiration

### 2. Expiration Reminder

**Trigger**: 7, 3, dan 1 hari sebelum subscription expire

**Template**: `expiration_reminder`

**Data**:
- `user_name` - Nama user
- `family_name` - Nama family
- `tier` - Current tier
- `expires_at` - Tanggal expiration
- `days_left` - Jumlah hari tersisa

## Email Service Providers

### Resend (Recommended)

**Pros**:
- Simple API
- Good deliverability
- Free tier: 3,000 emails/month
- Easy to setup

**Setup**:
1. Sign up at https://resend.com
2. Verify your domain
3. Get API key
4. Set `RESEND_API_KEY` in Supabase secrets

### SendGrid

**Pros**:
- Reliable
- Free tier: 100 emails/day
- Advanced features

**Setup**:
1. Sign up at https://sendgrid.com
2. Create API key
3. Modify Edge Function to use SendGrid API
4. Set `SENDGRID_API_KEY` in Supabase secrets

### AWS SES

**Pros**:
- Very cheap ($0.10 per 1,000 emails)
- High deliverability
- Scalable

**Setup**:
1. Setup AWS SES
2. Verify domain
3. Get access keys
4. Modify Edge Function to use AWS SDK
5. Set AWS credentials in Supabase secrets

## Testing

### 1. Test Subscription Change Email

```sql
-- Update a subscription to trigger email
UPDATE subscriptions
SET tier = 'premium'
WHERE family_id = 'your-family-id';

-- Check email_notifications table
SELECT * FROM email_notifications
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### 2. Manually Trigger Edge Function

```bash
curl -X POST \
  'https://your-project-ref.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

### 3. Test Expiration Reminder

```sql
-- Call the function manually
SELECT send_expiration_reminders();

-- Check queued emails
SELECT * FROM email_notifications
WHERE template_name = 'expiration_reminder'
ORDER BY created_at DESC;
```

## Monitoring

### View Email Queue

```sql
-- Pending emails
SELECT * FROM email_notifications
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Failed emails
SELECT * FROM email_notifications
WHERE status = 'failed'
ORDER BY created_at DESC;

-- Sent emails (last 24 hours)
SELECT * FROM email_notifications
WHERE status = 'sent'
AND sent_at > NOW() - INTERVAL '24 hours'
ORDER BY sent_at DESC;
```

### Email Statistics

```sql
-- Email stats by status
SELECT 
  status,
  COUNT(*) as count,
  MAX(created_at) as last_created
FROM email_notifications
GROUP BY status;

-- Email stats by template
SELECT 
  template_name,
  status,
  COUNT(*) as count
FROM email_notifications
GROUP BY template_name, status
ORDER BY template_name, status;
```

## Troubleshooting

### Emails Not Sending

1. **Check email_notifications table**:
   ```sql
   SELECT * FROM email_notifications
   WHERE status = 'pending'
   ORDER BY created_at DESC;
   ```

2. **Check Edge Function logs**:
   - Go to Supabase Dashboard > Edge Functions > send-email > Logs

3. **Verify API key**:
   - Check if `RESEND_API_KEY` is set correctly

4. **Test Edge Function manually**:
   ```bash
   curl -X POST 'https://your-project-ref.supabase.co/functions/v1/send-email' \
     -H 'Authorization: Bearer YOUR_ANON_KEY'
   ```

### Failed Emails

```sql
-- View failed emails with error messages
SELECT 
  recipient_email,
  subject,
  error_message,
  created_at
FROM email_notifications
WHERE status = 'failed'
ORDER BY created_at DESC;

-- Retry failed emails (reset to pending)
UPDATE email_notifications
SET status = 'pending', error_message = NULL
WHERE status = 'failed'
AND created_at > NOW() - INTERVAL '1 hour';
```

### Email Deliverability Issues

1. **Verify domain** - Make sure your sending domain is verified
2. **Check SPF/DKIM records** - Properly configure DNS records
3. **Monitor bounce rate** - High bounce rate can hurt deliverability
4. **Use professional email** - Don't use free email providers as sender

## Customization

### Add New Email Template

1. **Add template to Edge Function**:
   ```typescript
   const templates = {
     // ... existing templates
     
     new_template: (data: Record<string, any>) => `
       <html>
         <body>
           <!-- Your HTML template here -->
         </body>
       </html>
     `,
   }
   ```

2. **Create function to queue email**:
   ```sql
   CREATE OR REPLACE FUNCTION send_new_notification()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO email_notifications (
       recipient_email,
       recipient_name,
       subject,
       template_name,
       template_data
     ) VALUES (
       'user@example.com',
       'User Name',
       'Your Subject',
       'new_template',
       jsonb_build_object('key', 'value')
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   ```

3. **Create trigger** (if needed):
   ```sql
   CREATE TRIGGER new_notification_trigger
     AFTER INSERT ON your_table
     FOR EACH ROW
     EXECUTE FUNCTION send_new_notification();
   ```

### Change Email Sender

Edit Edge Function:
```typescript
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${resendApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'Your Name <noreply@yourdomain.com>', // Change this
    to: [notification.recipient_email],
    subject: notification.subject,
    html: htmlContent,
  }),
})
```

## Best Practices

1. **Rate Limiting** - Don't send too many emails at once
2. **Unsubscribe Link** - Always include unsubscribe option
3. **Mobile Responsive** - Make sure emails look good on mobile
4. **Plain Text Version** - Provide plain text alternative
5. **Test Before Deploy** - Always test emails before production
6. **Monitor Deliverability** - Track open rates, bounce rates
7. **Respect Privacy** - Don't send marketing emails without consent
8. **Error Handling** - Properly handle and log errors

## Future Enhancements

- [ ] Email preferences per user
- [ ] Unsubscribe functionality
- [ ] Email analytics (open rate, click rate)
- [ ] A/B testing for email templates
- [ ] Multi-language support
- [ ] Rich text editor for admin to customize templates
- [ ] Email scheduling
- [ ] Batch email sending for newsletters

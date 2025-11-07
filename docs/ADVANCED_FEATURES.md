# Advanced Subscription Features - RumahKu

## Overview

Sistem subscription RumahKu telah dilengkapi dengan fitur-fitur advanced yang mencakup payment gateway integration, email notifications, subscription history, trial period, dan promo codes. Dokumen ini menjelaskan cara kerja dan penggunaan setiap fitur.

---

## 1. Payment Gateway Integration

### Supported Gateways

**Midtrans**
- Support untuk berbagai metode pembayaran (Credit Card, VA, E-Wallet, QRIS)
- Sandbox dan production mode
- Automatic payment status tracking

**Xendit**
- Invoice-based payment
- Virtual Account support
- QR Code payment
- Flexible payment methods

### Implementation

Payment service telah diimplementasikan sebagai unified wrapper yang mendukung kedua gateway:

```typescript
import { paymentService } from '@/services/payment';

const result = await paymentService.createPayment({
  gateway: 'midtrans', // or 'xendit'
  familyId: 'family-uuid',
  subscriptionId: 'subscription-uuid',
  tier: 'family',
  amount: 20000,
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  promoCode: 'WELCOME50', // optional
});

if (result.success) {
  window.location.href = result.paymentUrl;
}
```

### Configuration

Set environment variables di `.env`:

```env
# Midtrans
VITE_MIDTRANS_CLIENT_KEY=your_client_key
VITE_MIDTRANS_SERVER_KEY=your_server_key
VITE_MIDTRANS_IS_PRODUCTION=false

# Xendit
VITE_XENDIT_API_KEY=your_api_key
VITE_XENDIT_IS_PRODUCTION=false
```

### Payment Flow

1. User memilih paket subscription
2. User memilih payment gateway (Midtrans/Xendit)
3. User dapat memasukkan promo code (optional)
4. System membuat payment transaction di database
5. System redirect user ke payment page
6. User melakukan pembayaran
7. Payment gateway mengirim webhook/callback
8. System update subscription status
9. System mengirim email konfirmasi

### Webhook Handling

Untuk production, setup webhook URL di dashboard payment gateway:

**Midtrans:** `https://yourdomain.com/api/webhooks/midtrans`
**Xendit:** `https://yourdomain.com/api/webhooks/xendit`

Handler webhook perlu diimplementasikan di backend/edge function untuk memproses payment callback dan update subscription status.

---

## 2. Email Notification System

### Email Templates

System mendukung berbagai template email:

- `subscription_confirmation` - Konfirmasi subscription baru
- `payment_success` - Pembayaran berhasil
- `payment_failed` - Pembayaran gagal
- `expiry_reminder` - Reminder sebelum subscription expired
- `trial_ending` - Reminder trial period akan berakhir
- `subscription_cancelled` - Subscription dibatalkan
- `subscription_renewed` - Subscription diperpanjang

### Usage

```typescript
import { emailService } from '@/services/email';

await emailService.sendPaymentSuccess(
  'user@example.com',
  'user-uuid',
  {
    customerName: 'John Doe',
    orderId: 'ORDER-123',
    tierName: 'Family',
    amount: 20000,
    expiresAt: '2024-12-31',
  }
);
```

### Email Queue

Email disimpan di table `email_notifications` dengan status:
- `pending` - Menunggu dikirim
- `sent` - Berhasil dikirim
- `failed` - Gagal dikirim

Background worker dapat memproses queue dengan:

```typescript
await emailService.processEmailQueue(10); // Process 10 emails
```

### Integration Options

Email service dapat diintegrasikan dengan:
- **Supabase Edge Functions** - Recommended untuk serverless
- **SendGrid** - Popular email service
- **Mailgun** - Alternative email service
- **AWS SES** - Cost-effective untuk volume tinggi
- **Resend** - Modern email API

---

## 3. Subscription History

### Features

- Tracking semua perubahan subscription
- Audit log untuk compliance
- Link ke payment transactions
- Timeline view untuk user

### History Actions

- `created` - Subscription dibuat
- `upgraded` - Upgrade tier
- `downgraded` - Downgrade tier
- `renewed` - Perpanjangan subscription
- `cancelled` - Subscription dibatalkan
- `expired` - Subscription kadaluarsa

### Automatic Logging

History otomatis dicatat melalui database trigger saat:
- Subscription tier berubah
- Subscription status berubah
- Payment berhasil

### User Interface

Component `SubscriptionHistory` menampilkan:
- Timeline perubahan subscription
- Detail setiap action
- Payment information
- Status badge

---

## 4. Trial Period

### Features

- Free trial untuk tier berbayar
- Configurable trial duration
- Trial ending reminder
- Auto-downgrade setelah trial berakhir

### Implementation

Trial period dikelola di table `subscriptions`:

```sql
is_trial: boolean
trial_ends_at: timestamp
```

### Trial Banner

Component `TrialBanner` menampilkan:
- Countdown hari tersisa
- Urgent warning (3 hari sebelum berakhir)
- Call-to-action untuk upgrade

### Trial Flow

1. User signup → Otomatis dapat free tier
2. Admin set trial period untuk user tertentu
3. User dapat akses fitur premium selama trial
4. System menampilkan reminder saat trial akan berakhir
5. Setelah trial berakhir, downgrade ke free tier

### Admin Management

Admin dapat:
- Enable trial untuk user tertentu
- Set trial duration
- Extend trial period
- Convert trial ke paid subscription

---

## 5. Promo Codes System

### Features

- Percentage discount (e.g., 50%)
- Fixed amount discount (e.g., Rp 10,000)
- Tier-specific promo codes
- Usage limits (per code and per user)
- Expiry date
- Active/inactive status

### Promo Code Structure

```typescript
{
  code: 'WELCOME50',
  discount_type: 'percentage', // or 'fixed'
  discount_value: 50,
  max_uses: 100, // null for unlimited
  applicable_tiers: ['family', 'premium'], // null for all tiers
  valid_until: '2024-12-31',
  is_active: true
}
```

### Validation

System melakukan validasi:
- Kode promo valid dan aktif
- Belum expired
- Belum mencapai max uses
- Applicable untuk tier yang dipilih
- User belum pernah menggunakan kode ini

### User Interface

**PromoCodeInput Component:**
- Input field untuk kode promo
- Real-time validation
- Discount calculation preview
- Apply/remove promo code

**Admin Panel:**
- Create/edit/delete promo codes
- View usage statistics
- Enable/disable codes
- Set expiry dates

### Sample Promo Codes

Database migration sudah include sample promo codes:

- `WELCOME50` - 50% discount untuk new customers
- `FAMILY10K` - Rp 10,000 discount untuk Family tier
- `PREMIUM2024` - 25% discount untuk Premium tier

### Admin Management

Admin dapat:
- Create unlimited promo codes
- Set discount type dan value
- Configure usage limits
- Set applicable tiers
- Monitor usage statistics
- Deactivate codes

---

## Database Schema

### New Tables

**payment_transactions**
- Menyimpan semua transaksi pembayaran
- Link ke subscription dan family
- Track payment status dan gateway

**subscription_history**
- Audit log semua perubahan subscription
- Link ke payment transactions
- Automatic logging via trigger

**promo_codes**
- Master data promo codes
- Discount configuration
- Usage limits dan expiry

**promo_code_usage**
- Track penggunaan promo code per family
- Prevent duplicate usage
- Link ke payment transactions

**email_notifications**
- Queue untuk email notifications
- Template-based emails
- Status tracking

### Updated Tables

**subscriptions**
- Added `is_trial`, `trial_ends_at`
- Added `auto_renew`, `cancelled_at`
- Added `cancellation_reason`

---

## Setup Instructions

### 1. Database Migration

Run migration file:

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard
# Copy-paste SQL from:
# supabase/migrations/20251107000001_advanced_subscription_features.sql
```

### 2. Environment Variables

Copy `.env.example` to `.env` dan isi dengan credentials:

```bash
cp .env.example .env
```

Edit `.env` dan tambahkan:
- Midtrans credentials
- Xendit credentials
- Email service credentials (optional)

### 3. Payment Gateway Setup

**Midtrans:**
1. Register di https://midtrans.com
2. Get Client Key dan Server Key
3. Setup webhook URL
4. Test di sandbox mode

**Xendit:**
1. Register di https://xendit.co
2. Get API Key
3. Setup callback URL
4. Test di test mode

### 4. Email Service Setup (Optional)

Choose one email provider dan setup:

**Option 1: Supabase Edge Function**
```bash
supabase functions new send-email
# Implement email sending logic
supabase functions deploy send-email
```

**Option 2: External Service**
- Setup SendGrid/Mailgun/AWS SES
- Add API key ke environment variables
- Update email service implementation

### 5. Webhook Implementation

Create API endpoints untuk webhook:

```typescript
// /api/webhooks/midtrans
export async function POST(req: Request) {
  const body = await req.json();
  // Verify signature
  // Update payment status
  // Update subscription
  return Response.json({ success: true });
}

// /api/webhooks/xendit
export async function POST(req: Request) {
  const body = await req.json();
  // Verify callback token
  // Update payment status
  // Update subscription
  return Response.json({ success: true });
}
```

---

## Testing

### Payment Gateway Testing

**Midtrans Sandbox:**
- Credit Card: `4811 1111 1111 1114`
- CVV: `123`
- Expiry: Any future date
- OTP: `112233`

**Xendit Test Mode:**
- Use test API key
- All payments auto-success in test mode

### Promo Code Testing

Sample codes sudah tersedia:
- `WELCOME50` - 50% off
- `FAMILY10K` - Rp 10,000 off
- `PREMIUM2024` - 25% off

### Email Testing

Check `email_notifications` table untuk queued emails:

```sql
SELECT * FROM email_notifications 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

---

## Monitoring & Analytics

### Key Metrics

**Subscription Metrics:**
- Total active subscriptions
- MRR (Monthly Recurring Revenue)
- Tier distribution
- Churn rate

**Payment Metrics:**
- Success rate
- Failed transactions
- Average transaction value
- Payment method distribution

**Promo Code Metrics:**
- Usage count per code
- Total discount given
- Conversion rate
- Most popular codes

### Admin Dashboard

Access `/admin/subscriptions` untuk:
- Real-time subscription statistics
- Revenue tracking
- User distribution by tier

Access `/admin/promo-codes` untuk:
- Promo code performance
- Usage statistics
- Active/inactive codes

---

## Best Practices

### Security

1. **Never expose API keys** di frontend
2. **Verify webhook signatures** untuk prevent fraud
3. **Use HTTPS** untuk semua payment transactions
4. **Implement rate limiting** untuk prevent abuse
5. **Validate promo codes** di server-side

### Performance

1. **Cache subscription data** dengan React Query
2. **Use database indexes** untuk fast queries
3. **Batch email sending** untuk avoid rate limits
4. **Optimize payment flow** untuk reduce abandonment

### User Experience

1. **Clear error messages** untuk payment failures
2. **Progress indicators** saat processing payment
3. **Email confirmations** untuk all transactions
4. **Easy promo code application** dengan instant feedback
5. **Transparent pricing** dengan discount breakdown

---

## Troubleshooting

### Payment tidak berhasil

**Check:**
- Environment variables configured correctly
- Payment gateway credentials valid
- Webhook URL accessible
- Database transaction created

**Debug:**
```sql
SELECT * FROM payment_transactions 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

### Email tidak terkirim

**Check:**
- Email service configured
- Queue processor running
- Email templates correct

**Debug:**
```sql
SELECT * FROM email_notifications 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

### Promo code tidak valid

**Check:**
- Code exists dan active
- Not expired
- Applicable untuk tier
- User belum pernah pakai

**Debug:**
```sql
SELECT * FROM promo_codes WHERE code = 'YOUR_CODE';
SELECT * FROM promo_code_usage WHERE promo_code_id = 'promo-uuid';
```

---

## Future Enhancements

### Planned Features

1. **Recurring Payments**
   - Auto-charge sebelum expiry
   - Subscription auto-renewal
   - Payment retry logic

2. **Refund Management**
   - Refund requests
   - Partial refunds
   - Refund history

3. **Advanced Analytics**
   - Revenue forecasting
   - Cohort analysis
   - Churn prediction

4. **Loyalty Program**
   - Referral rewards
   - Loyalty points
   - Member benefits

5. **Multi-currency Support**
   - USD, SGD, MYR
   - Auto currency conversion
   - Regional pricing

---

## Support

Untuk pertanyaan atau issue terkait advanced features:

1. Check documentation ini
2. Review code di `/src/services/`
3. Check database schema
4. Create issue di GitHub repository
5. Contact development team

---

**Last Updated:** November 7, 2024
**Version:** 2.0.0

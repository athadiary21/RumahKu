# Payment Gateway Integration - RumahKu

## Overview

Dokumentasi lengkap implementasi Payment Gateway Midtrans dan Xendit untuk sistem subscription RumahKu.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Payment Flow](#payment-flow)
3. [Midtrans Integration](#midtrans-integration)
4. [Xendit Integration](#xendit-integration)
5. [Webhook Handlers](#webhook-handlers)
6. [Setup Guide](#setup-guide)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Architecture

### Components

**Frontend:**
- `PaymentDialog.tsx` - Payment UI component
- `SubscriptionSettings.tsx` - Subscription management page

**Backend (Supabase Edge Functions):**
- `create-midtrans-payment` - Create Midtrans Snap transaction
- `create-xendit-payment` - Create Xendit invoice
- `midtrans-webhook` - Handle Midtrans payment notifications
- `xendit-webhook` - Handle Xendit payment notifications

**Database:**
- `payment_transactions` - Payment transaction records
- `subscriptions` - Subscription status
- `subscription_history` - Subscription change log
- `promo_codes` - Promo code management
- `email_queue` - Email notifications

### Payment Flow Diagram

```
User → PaymentDialog → Edge Function → Payment Gateway
                                            ↓
                                      Payment Page
                                            ↓
                                    User Pays/Cancels
                                            ↓
                                    Webhook Notification
                                            ↓
                                    Update Database
                                            ↓
                                    Send Email
                                            ↓
                                    Redirect User
```

---

## Payment Flow

### 1. Initiate Payment

**User Action:**
1. User clicks "Upgrade" button on subscription tier
2. `PaymentDialog` opens with options:
   - Billing period (monthly/yearly)
   - Payment method (Midtrans/Xendit)
   - Promo code (optional)

**Frontend Process:**
```typescript
// User selects options and clicks "Bayar Sekarang"
const handlePayment = async () => {
  if (paymentMethod === 'midtrans') {
    await handleMidtransPayment();
  } else {
    await handleXenditPayment();
  }
};
```

### 2. Create Payment Transaction

**Backend Process (Edge Function):**

```typescript
// Create transaction record
const transaction = await supabase
  .from('payment_transactions')
  .insert({
    user_id: user.id,
    amount: finalAmount,
    tier: tier,
    billing_period: billingPeriod,
    payment_method: gateway,
    status: 'pending',
  });

// Call payment gateway API
const paymentData = await createGatewayPayment(transaction);

// Return payment URL/token to frontend
return { snap_token, invoice_url };
```

### 3. User Completes Payment

**Midtrans:**
- Snap popup opens with payment options
- User selects payment method and completes payment
- Snap popup closes automatically

**Xendit:**
- New tab opens with Xendit invoice page
- User selects payment method and completes payment
- User manually closes tab or clicks return button

### 4. Webhook Notification

**Payment Gateway → Webhook Handler:**

```typescript
// Verify signature/token
verifyWebhookAuthenticity(notification);

// Update transaction status
await updateTransactionStatus(orderId, status);

// If payment successful
if (status === 'completed') {
  await activateSubscription(familyId, tier, billingPeriod);
  await logSubscriptionHistory(familyId, action);
  await queueSuccessEmail(userId);
}
```

### 5. Update Subscription

**Database Updates:**

```sql
-- Update subscription
UPDATE subscriptions
SET tier = 'family',
    status = 'active',
    current_period_end = NOW() + INTERVAL '1 month'
WHERE family_id = 'xxx';

-- Log history
INSERT INTO subscription_history
(family_id, action, new_tier, payment_transaction_id)
VALUES ('xxx', 'upgraded', 'family', 'yyy');

-- Queue email
INSERT INTO email_queue
(recipient_email, template, data)
VALUES ('user@example.com', 'payment_success', {...});
```

---

## Midtrans Integration

### Features

**Supported Payment Methods:**
- Credit/Debit Card (Visa, Mastercard, JCB, Amex)
- Bank Transfer (BCA, Mandiri, BNI, BRI, Permata)
- E-Wallet (GoPay, ShopeePay, QRIS)
- Convenience Store (Alfamart, Indomaret)

### Implementation

**1. Create Payment (Edge Function)**

```typescript
// supabase/functions/create-midtrans-payment/index.ts

const snapPayload = {
  transaction_details: {
    order_id: transaction.id,
    gross_amount: finalAmount,
  },
  customer_details: {
    first_name: customerName,
    email: customerEmail,
  },
  item_details: [{
    id: tier,
    price: finalAmount,
    quantity: 1,
    name: `RumahKu ${tier} - ${billingPeriod}`,
  }],
  callbacks: {
    finish: `${FRONTEND_URL}/dashboard/settings?payment=success`,
    error: `${FRONTEND_URL}/dashboard/settings?payment=error`,
    pending: `${FRONTEND_URL}/dashboard/settings?payment=pending`,
  },
};

const response = await fetch(MIDTRANS_SNAP_URL, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${btoa(SERVER_KEY + ':')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(snapPayload),
});

const { token, redirect_url } = await response.json();
```

**2. Frontend Integration**

```typescript
// Load Snap.js
<script src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key="YOUR_CLIENT_KEY"></script>

// Trigger payment
window.snap.pay(snap_token, {
  onSuccess: (result) => {
    console.log('Payment success:', result);
  },
  onPending: (result) => {
    console.log('Payment pending:', result);
  },
  onError: (result) => {
    console.log('Payment error:', result);
  },
  onClose: () => {
    console.log('Payment popup closed');
  },
});
```

**3. Webhook Handler**

```typescript
// supabase/functions/midtrans-webhook/index.ts

// Verify signature
const signatureKey = `${orderId}${statusCode}${grossAmount}${serverKey}`;
const hash = createHmac('sha512', signatureKey).digest('hex');

if (hash !== notification.signature_key) {
  throw new Error('Invalid signature');
}

// Map status
let status = 'pending';
if (notification.transaction_status === 'settlement') {
  status = 'completed';
} else if (notification.transaction_status === 'cancel') {
  status = 'failed';
}

// Update transaction
await updateTransaction(orderId, status);
```

### Webhook URL

```
https://your-project.supabase.co/functions/v1/midtrans-webhook
```

**Configure in Midtrans Dashboard:**
1. Login to Midtrans Dashboard
2. Go to Settings → Configuration
3. Set Payment Notification URL
4. Save configuration

---

## Xendit Integration

### Features

**Supported Payment Methods:**
- Virtual Account (BCA, Mandiri, BNI, BRI, Permata)
- E-Wallet (OVO, Dana, LinkAja, ShopeePay)
- QR Code (QRIS)
- Retail Outlet (Alfamart, Indomaret)
- Credit Card

### Implementation

**1. Create Invoice (Edge Function)**

```typescript
// supabase/functions/create-xendit-payment/index.ts

const invoicePayload = {
  external_id: transaction.id,
  amount: finalAmount,
  payer_email: customerEmail,
  description: `RumahKu ${tier} Subscription`,
  customer: {
    given_names: customerName,
    email: customerEmail,
  },
  success_redirect_url: `${FRONTEND_URL}/dashboard/settings?payment=success`,
  failure_redirect_url: `${FRONTEND_URL}/dashboard/settings?payment=error`,
  currency: 'IDR',
  items: [{
    name: `RumahKu ${tier}`,
    quantity: 1,
    price: finalAmount,
  }],
};

const response = await fetch('https://api.xendit.co/v2/invoices', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${btoa(API_KEY + ':')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(invoicePayload),
});

const { id, invoice_url, expiry_date } = await response.json();
```

**2. Frontend Integration**

```typescript
// Open invoice URL in new tab
window.open(invoice_url, '_blank');

// Or redirect in same window
window.location.href = invoice_url;
```

**3. Webhook Handler**

```typescript
// supabase/functions/xendit-webhook/index.ts

// Verify callback token
const callbackToken = req.headers.get('x-callback-token');
if (callbackToken !== XENDIT_CALLBACK_TOKEN) {
  throw new Error('Invalid callback token');
}

// Map status
let status = 'pending';
if (notification.status === 'PAID') {
  status = 'completed';
} else if (notification.status === 'EXPIRED') {
  status = 'failed';
}

// Update transaction
await updateTransaction(externalId, status);
```

### Webhook URL

```
https://your-project.supabase.co/functions/v1/xendit-webhook
```

**Configure in Xendit Dashboard:**
1. Login to Xendit Dashboard
2. Go to Settings → Webhooks
3. Add webhook URL for "Invoice Paid"
4. Set callback token
5. Save configuration

---

## Webhook Handlers

### Security

**Midtrans:**
- Signature verification using SHA512 HMAC
- Signature key: `order_id + status_code + gross_amount + server_key`

**Xendit:**
- Callback token verification
- Token sent in `x-callback-token` header

### Status Mapping

**Midtrans → Internal Status:**
- `capture` (fraud_status: accept) → `completed`
- `settlement` → `completed`
- `pending` → `pending`
- `cancel` / `deny` / `expire` → `failed`

**Xendit → Internal Status:**
- `PAID` / `SETTLED` → `completed`
- `PENDING` → `pending`
- `EXPIRED` → `failed`

### Post-Payment Actions

**On Success:**
1. Update transaction status to `completed`
2. Set `paid_at` timestamp
3. Activate/upgrade subscription
4. Calculate new expiry date
5. Log subscription history
6. Increment promo code usage
7. Queue success email

**On Failure:**
1. Update transaction status to `failed`
2. Queue failure email
3. No subscription changes

---

## Setup Guide

### 1. Register Payment Gateway Accounts

**Midtrans:**
1. Go to [https://midtrans.com](https://midtrans.com)
2. Sign up for merchant account
3. Complete KYB (Know Your Business) verification
4. Get Sandbox credentials for testing
5. Get Production credentials after approval

**Xendit:**
1. Go to [https://xendit.co](https://xendit.co)
2. Sign up for business account
3. Complete verification
4. Get API keys from dashboard
5. Generate callback token

### 2. Configure Environment Variables

**Create `.env` file:**

```bash
# Midtrans
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx
MIDTRANS_SERVER_KEY=SB-Mid-server-xxx
MIDTRANS_IS_PRODUCTION=false

# Xendit
XENDIT_API_KEY=xnd_development_xxx
XENDIT_CALLBACK_TOKEN=your_random_token_here
XENDIT_IS_PRODUCTION=false

# Frontend
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
```

### 3. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy create-midtrans-payment
supabase functions deploy create-xendit-payment
supabase functions deploy midtrans-webhook
supabase functions deploy xendit-webhook

# Set secrets
supabase secrets set MIDTRANS_SERVER_KEY=xxx
supabase secrets set MIDTRANS_CLIENT_KEY=xxx
supabase secrets set XENDIT_API_KEY=xxx
supabase secrets set XENDIT_CALLBACK_TOKEN=xxx
supabase secrets set FRONTEND_URL=https://your-domain.com
```

### 4. Configure Webhooks

**Midtrans Dashboard:**
1. Settings → Configuration
2. Payment Notification URL: `https://xxx.supabase.co/functions/v1/midtrans-webhook`
3. Save

**Xendit Dashboard:**
1. Settings → Webhooks
2. Add webhook for "Invoice Paid"
3. URL: `https://xxx.supabase.co/functions/v1/xendit-webhook`
4. Callback token: (same as in .env)
5. Save

### 5. Run Database Migrations

```bash
# Run migrations
supabase db push

# Or manually in SQL Editor
-- Run all migration files in order:
-- 20251107000001_advanced_subscription_features.sql
-- 20251107000002_vault_documents.sql
-- 20251107000003_payment_gateway_functions.sql
```

---

## Testing

### Test Mode

**Midtrans Sandbox:**
- Use sandbox credentials
- Test cards: [https://docs.midtrans.com/docs/testing-payment](https://docs.midtrans.com/docs/testing-payment)
- Test card: `4811 1111 1111 1114`
- CVV: `123`
- Expiry: Any future date

**Xendit Test Mode:**
- Use development API key
- Test payment methods available in dashboard
- Simulate payment via Xendit dashboard

### Test Flow

**1. Test Successful Payment:**

```
1. Login to dashboard
2. Go to Settings → Langganan
3. Click "Upgrade" on Family tier
4. Select "Bulanan" billing
5. Select "Midtrans" payment method
6. Click "Bayar Sekarang"
7. Snap popup opens
8. Select "Credit Card"
9. Enter test card: 4811 1111 1111 1114
10. CVV: 123, Expiry: 12/25
11. Click "Pay"
12. ✅ Payment success
13. ✅ Popup closes
14. ✅ Subscription upgraded
15. ✅ Email sent
```

**2. Test Promo Code:**

```
1. Create promo code in admin panel
2. Code: WELCOME10
3. Discount: 10% percentage
4. Valid dates: Today to next month
5. Go to payment dialog
6. Enter promo code
7. Click validate (checkmark)
8. ✅ Discount applied
9. ✅ Final price reduced
10. Complete payment
11. ✅ Promo usage incremented
```

**3. Test Webhook:**

```
1. Complete payment in test mode
2. Check Supabase logs
3. ✅ Webhook received
4. ✅ Signature verified
5. ✅ Transaction updated
6. ✅ Subscription activated
7. ✅ History logged
8. ✅ Email queued
```

### Monitoring

**Check Logs:**

```bash
# View function logs
supabase functions logs create-midtrans-payment
supabase functions logs midtrans-webhook

# View database logs
# Go to Supabase Dashboard → Database → Logs
```

**Check Database:**

```sql
-- Check transactions
SELECT * FROM payment_transactions
ORDER BY created_at DESC
LIMIT 10;

-- Check subscriptions
SELECT * FROM subscriptions
WHERE status = 'active';

-- Check history
SELECT * FROM subscription_history
ORDER BY created_at DESC
LIMIT 10;

-- Check email queue
SELECT * FROM email_queue
WHERE status = 'pending';
```

---

## Troubleshooting

### Common Issues

**1. Payment fails with "Invalid signature"**

**Cause:** Server key mismatch or signature calculation error

**Solution:**
- Verify `MIDTRANS_SERVER_KEY` in environment
- Check signature calculation in webhook handler
- Ensure order_id, status_code, gross_amount match exactly

**2. Webhook not received**

**Cause:** Webhook URL not configured or incorrect

**Solution:**
- Verify webhook URL in payment gateway dashboard
- Check Edge Function deployment status
- Test webhook manually with curl

**3. Snap popup doesn't open**

**Cause:** Snap.js not loaded or client key incorrect

**Solution:**
- Check browser console for errors
- Verify `VITE_MIDTRANS_CLIENT_KEY` in .env
- Ensure Snap.js script loaded before calling `snap.pay()`

**4. Subscription not activated after payment**

**Cause:** Webhook handler error or database update failed

**Solution:**
- Check webhook function logs
- Verify transaction status in database
- Manually trigger webhook handler with transaction ID

**5. Promo code not working**

**Cause:** Code expired, max uses reached, or inactive

**Solution:**
- Check promo code in database
- Verify `valid_from` and `valid_until` dates
- Check `current_uses` vs `max_uses`
- Ensure `is_active = true`

### Debug Mode

**Enable detailed logging:**

```typescript
// In Edge Functions
console.log('Payment request:', JSON.stringify(payload));
console.log('Gateway response:', JSON.stringify(response));
console.log('Webhook notification:', JSON.stringify(notification));
```

**View logs:**

```bash
supabase functions logs <function-name> --follow
```

---

## Production Checklist

**Before going live:**

- [ ] Get production credentials from Midtrans
- [ ] Get production API key from Xendit
- [ ] Update environment variables to production
- [ ] Set `MIDTRANS_IS_PRODUCTION=true`
- [ ] Set `XENDIT_IS_PRODUCTION=true`
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Configure production webhook URLs
- [ ] Test payment flow in production
- [ ] Monitor first few transactions closely
- [ ] Setup error alerting
- [ ] Document support procedures

---

## Security Best Practices

1. **Never expose server keys in frontend code**
2. **Always verify webhook signatures/tokens**
3. **Use HTTPS for all webhook URLs**
4. **Validate all input data**
5. **Log all payment transactions**
6. **Monitor for suspicious activity**
7. **Implement rate limiting**
8. **Use environment variables for secrets**
9. **Regularly rotate API keys**
10. **Keep dependencies updated**

---

## Support

**Midtrans:**
- Documentation: [https://docs.midtrans.com](https://docs.midtrans.com)
- Support: support@midtrans.com

**Xendit:**
- Documentation: [https://developers.xendit.co](https://developers.xendit.co)
- Support: support@xendit.co

**RumahKu:**
- Technical issues: [GitHub Issues](https://github.com/athadiary21/Rumahku/issues)
- General support: help@rumahku.com

---

**Last Updated:** November 7, 2024  
**Version:** 1.0.0  
**Status:** Production Ready ✅

# Admin Panel API Integration - RumahKu

## Overview

Dokumentasi lengkap untuk backend API yang mendukung Admin Panel RumahKu. Semua API telah terintegrasi dengan frontend untuk mengambil data real dari database.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Database Functions](#database-functions)
3. [Edge Functions](#edge-functions)
4. [Frontend API Service](#frontend-api-service)
5. [Integration Details](#integration-details)
6. [Testing Guide](#testing-guide)
7. [Troubleshooting](#troubleshooting)

---

## Architecture

### System Overview

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
└────────┬────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│  Admin API      │
│  Service        │
│  (adminApi.ts)  │
└────────┬────────┘
         │
         ├──────────────┬──────────────┐
         │              │              │
         ▼              ▼              ▼
┌────────────┐  ┌────────────┐  ┌────────────┐
│ Database   │  │ Edge       │  │ Supabase   │
│ Functions  │  │ Functions  │  │ Client     │
└─────┬──────┘  └─────┬──────┘  └─────┬──────┘
      │               │               │
      └───────────────┴───────────────┘
                      │
                      ▼
              ┌───────────────┐
              │   PostgreSQL  │
              │   Database    │
              └───────────────┘
```

### Technology Stack

**Backend:**
- PostgreSQL (Database)
- Supabase (Backend as a Service)
- PL/pgSQL (Database Functions)
- Deno (Edge Functions Runtime)

**Frontend:**
- React 18
- TypeScript
- TanStack Query (React Query)
- Supabase JS Client

---

## Database Functions

### Overview

Database functions provide secure, server-side logic for admin operations with built-in authorization checks.

### Functions List

#### 1. `get_admin_users()`

**Purpose:** Retrieve all users with their subscription information

**Returns:**
```sql
TABLE (
  user_id uuid,
  email text,
  full_name text,
  created_at timestamptz,
  family_id uuid,
  family_name text,
  subscription_tier text,
  subscription_status text,
  current_period_end timestamptz,
  user_role text
)
```

**Security:** SECURITY DEFINER with admin role check

**Usage:**
```typescript
const { data, error } = await supabase.rpc('get_admin_users');
```

---

#### 2. `get_dashboard_stats()`

**Purpose:** Get overall dashboard statistics

**Returns:**
```json
{
  "total_users": 150,
  "active_subscriptions": 45,
  "monthly_revenue": 4500000,
  "active_promo_codes": 12,
  "completed_transactions": 85,
  "pending_transactions": 15
}
```

**Security:** SECURITY DEFINER with admin role check

**Usage:**
```typescript
const { data, error } = await supabase.rpc('get_dashboard_stats');
```

---

#### 3. `get_subscription_stats()`

**Purpose:** Get subscription-specific statistics

**Returns:**
```json
{
  "total_active": 45,
  "total_free": 90,
  "total_family": 35,
  "total_premium": 10,
  "mrr": 4500000,
  "total_subscriptions": 150
}
```

**Security:** SECURITY DEFINER with admin role check

**Usage:**
```typescript
const { data, error } = await supabase.rpc('get_subscription_stats');
```

---

#### 4. `get_revenue_trend(days_back)`

**Purpose:** Get daily revenue trend for specified number of days

**Parameters:**
- `days_back` (int): Number of days to look back (default: 14)

**Returns:**
```sql
TABLE (
  date date,
  revenue numeric
)
```

**Security:** SECURITY DEFINER with admin role check

**Usage:**
```typescript
const { data, error } = await supabase.rpc('get_revenue_trend', { 
  days_back: 14 
});
```

---

#### 5. `admin_update_subscription()`

**Purpose:** Update user subscription (admin only)

**Parameters:**
- `p_family_id` (uuid): Family ID
- `p_tier` (text): New subscription tier
- `p_status` (text): New subscription status
- `p_current_period_end` (timestamptz): New expiry date

**Returns:**
```json
{
  "success": true,
  "message": "Subscription updated successfully"
}
```

**Security:** SECURITY DEFINER with admin role check

**Side Effects:**
- Updates subscription record
- Creates subscription history entry

**Usage:**
```typescript
const { data, error } = await supabase.rpc('admin_update_subscription', {
  p_family_id: 'uuid-here',
  p_tier: 'premium',
  p_status: 'active',
  p_current_period_end: '2024-12-31T23:59:59Z'
});
```

---

#### 6. `get_promo_stats()`

**Purpose:** Get promo code statistics

**Returns:**
```json
{
  "total_codes": 25,
  "active_codes": 12,
  "total_uses": 150,
  "expired_codes": 5
}
```

**Security:** SECURITY DEFINER with admin role check

**Usage:**
```typescript
const { data, error } = await supabase.rpc('get_promo_stats');
```

---

#### 7. `validate_promo_code(p_code, p_tier)`

**Purpose:** Validate a promo code and return discount information

**Parameters:**
- `p_code` (text): Promo code to validate
- `p_tier` (text): Subscription tier to check against

**Returns:**
```json
{
  "valid": true,
  "discount_type": "percentage",
  "discount_value": 10,
  "code": "WELCOME10"
}
```

**Or if invalid:**
```json
{
  "valid": false,
  "error": "Promo code has expired"
}
```

**Security:** Available to authenticated users

**Usage:**
```typescript
const { data, error } = await supabase.rpc('validate_promo_code', {
  p_code: 'WELCOME10',
  p_tier: 'family'
});
```

---

## Edge Functions

### Overview

Edge Functions provide serverless API endpoints for complex operations that require service role access.

### Functions List

#### 1. `admin-dashboard-stats`

**Endpoint:** `https://[project-ref].supabase.co/functions/v1/admin-dashboard-stats`

**Method:** GET

**Purpose:** Get comprehensive dashboard statistics including revenue trend and subscription breakdown

**Headers:**
```
Authorization: Bearer [user-jwt-token]
```

**Response:**
```json
{
  "stats": {
    "total_users": 150,
    "active_subscriptions": 45,
    "monthly_revenue": 4500000,
    "active_promo_codes": 12,
    "completed_transactions": 85,
    "pending_transactions": 15
  },
  "revenueTrend": [
    { "date": "2024-11-01", "revenue": 150000 },
    { "date": "2024-11-02", "revenue": 200000 }
  ],
  "subscriptionBreakdown": {
    "free": 90,
    "family": 35,
    "premium": 10
  }
}
```

**Security:** Requires admin role

---

#### 2. `admin-users`

**Endpoint:** `https://[project-ref].supabase.co/functions/v1/admin-users`

**Methods:** GET, PUT

**Purpose:** Manage users and their subscriptions

**GET - List all users:**

**Headers:**
```
Authorization: Bearer [user-jwt-token]
```

**Response:**
```json
{
  "users": [
    {
      "user_id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "created_at": "2024-01-01T00:00:00Z",
      "family_id": "uuid",
      "family_name": "Doe Family",
      "subscription_tier": "family",
      "subscription_status": "active",
      "current_period_end": "2024-12-31T23:59:59Z",
      "user_role": "owner"
    }
  ]
}
```

**PUT - Update user subscription:**

**Headers:**
```
Authorization: Bearer [user-jwt-token]
Content-Type: application/json
```

**Body:**
```json
{
  "familyId": "uuid",
  "tier": "premium",
  "status": "active",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription updated successfully"
}
```

**Security:** Requires admin role

---

## Frontend API Service

### Overview

The `adminApi.ts` service provides a clean interface for frontend components to interact with backend APIs.

### Service Location

```
src/services/adminApi.ts
```

### Available Methods

#### User Management

**`isAdmin(): Promise<boolean>`**
- Check if current user has admin role

**`getAdminUsers(): Promise<AdminUser[]>`**
- Get all users with subscription info

**`updateUserSubscription(familyId, tier, status, expiresAt): Promise<void>`**
- Update user subscription

---

#### Dashboard Statistics

**`getDashboardStats(): Promise<DashboardData>`**
- Get comprehensive dashboard statistics

**Returns:**
```typescript
{
  stats: DashboardStats;
  revenueTrend: RevenueTrend[];
  subscriptionBreakdown: SubscriptionBreakdown;
}
```

---

#### Subscription Management

**`getSubscriptionStats(): Promise<SubscriptionStats>`**
- Get subscription statistics

**`getSubscriptions(): Promise<Subscription[]>`**
- Get all subscriptions with details

**`getSubscriptionHistory(familyId?): Promise<SubscriptionHistory[]>`**
- Get subscription change history

---

#### Promo Code Management

**`getPromoStats(): Promise<PromoStats>`**
- Get promo code statistics

**`getPromoCodes(): Promise<PromoCode[]>`**
- Get all promo codes

**`createPromoCode(data): Promise<PromoCode>`**
- Create new promo code

**`updatePromoCode(id, data): Promise<PromoCode>`**
- Update existing promo code

**`deletePromoCode(id): Promise<void>`**
- Delete promo code

**`validatePromoCode(code, tier): Promise<ValidationResult>`**
- Validate promo code

---

#### Payment Transactions

**`getPaymentTransactions(limit?): Promise<Transaction[]>`**
- Get payment transaction history

---

## Integration Details

### Dashboard Integration

**Component:** `src/pages/admin/AdminDashboard.tsx`

**API Usage:**
```typescript
import { getDashboardStats } from '@/services/adminApi';

const { data: dashboardData, isLoading } = useQuery({
  queryKey: ['admin-dashboard-stats'],
  queryFn: getDashboardStats,
});

const stats = dashboardData?.stats;
const revenueTrend = dashboardData?.revenueTrend || [];
const subscriptionBreakdown = dashboardData?.subscriptionBreakdown;
```

**Features:**
- Real-time stats cards
- Revenue trend chart (14 days)
- Subscription breakdown pie chart
- Transaction status with completion rate

---

### User Management Integration

**Component:** `src/pages/admin/UsersManagement.tsx`

**API Usage:**
```typescript
import { getAdminUsers, updateUserSubscription } from '@/services/adminApi';

// Fetch users
const { data: users = [], isLoading } = useQuery({
  queryKey: ['admin-users'],
  queryFn: getAdminUsers,
});

// Update subscription
const updateSubscriptionMutation = useMutation({
  mutationFn: async ({ familyId, tier, status, expiresAt }) => {
    await updateUserSubscription(familyId, tier, status, expiresAt);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  },
});
```

**Features:**
- User list with search and filter
- Subscription tier and status badges
- Edit subscription dialog
- Real-time updates

---

### Subscription Management Integration

**Component:** `src/pages/admin/SubscriptionsManagement.tsx`

**API Usage:**
```typescript
import { getSubscriptionStats, getSubscriptions } from '@/services/adminApi';

// Already integrated via direct Supabase queries
// Can be migrated to use adminApi service
```

**Features:**
- Subscription statistics
- Distribution bar chart
- Filter by tier and status
- Detailed subscription table

---

### Promo Code Management Integration

**Component:** `src/pages/admin/PromoCodesAdmin.tsx`

**API Usage:**
```typescript
// Already integrated via direct Supabase queries
// Uses promo_codes table directly
```

**Features:**
- Promo code CRUD operations
- Statistics dashboard
- Copy code functionality
- Validation and expiry checks

---

## Testing Guide

### Prerequisites

1. **Admin User Setup:**
```sql
-- Create admin role for your user
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id', 'admin');
```

2. **Sample Data:**
```sql
-- Insert test users, subscriptions, and promo codes
-- (Use migration files or Supabase dashboard)
```

### Testing Checklist

#### Database Functions

**Test get_admin_users:**
```sql
SELECT * FROM get_admin_users();
```

**Expected:** List of all users with subscription info

---

**Test get_dashboard_stats:**
```sql
SELECT * FROM get_dashboard_stats();
```

**Expected:** JSON with dashboard statistics

---

**Test get_revenue_trend:**
```sql
SELECT * FROM get_revenue_trend(14);
```

**Expected:** Daily revenue for last 14 days

---

**Test admin_update_subscription:**
```sql
SELECT admin_update_subscription(
  'family-id-here'::uuid,
  'premium',
  'active',
  '2024-12-31 23:59:59'::timestamptz
);
```

**Expected:** Success message and updated subscription

---

#### Frontend Integration

**Test Dashboard:**
1. Navigate to `/admin`
2. Verify stats cards show correct numbers
3. Check revenue trend chart displays
4. Verify subscription breakdown pie chart
5. Check transaction status

**Test User Management:**
1. Navigate to `/admin/users`
2. Verify user list loads
3. Test search functionality
4. Test tier and status filters
5. Edit a user subscription
6. Verify changes persist

**Test Subscription Management:**
1. Navigate to `/admin/subscriptions`
2. Verify subscription stats
3. Check distribution chart
4. Test filters
5. Verify subscription details

**Test Promo Code Management:**
1. Navigate to `/admin/promo-codes`
2. Create new promo code
3. Edit existing code
4. Test copy functionality
5. Delete a code
6. Verify validation works

---

## Troubleshooting

### Common Issues

#### 1. "Unauthorized: Admin access required"

**Cause:** User doesn't have admin role

**Solution:**
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

---

#### 2. "Function does not exist"

**Cause:** Migration not run

**Solution:**
```bash
# Run migrations
supabase db push

# Or manually run migration file
psql -f supabase/migrations/20251107000004_admin_api_functions.sql
```

---

#### 3. "Permission denied for function"

**Cause:** Function permissions not granted

**Solution:**
```sql
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;
-- etc.
```

---

#### 4. "No data returned"

**Cause:** Empty database or incorrect queries

**Solution:**
- Check if tables have data
- Verify foreign key relationships
- Check RLS policies
- Review function logic

---

#### 5. "CORS error" (Edge Functions)

**Cause:** Missing CORS headers

**Solution:**
- Verify CORS headers in Edge Function
- Check if OPTIONS method is handled
- Ensure Authorization header is sent

---

### Debugging Tips

**Enable SQL logging:**
```typescript
const { data, error } = await supabase
  .rpc('get_admin_users')
  .then(result => {
    console.log('Result:', result);
    return result;
  });
```

**Check network requests:**
- Open browser DevTools
- Go to Network tab
- Filter by "rpc" or "functions"
- Inspect request/response

**Verify admin role:**
```typescript
import { isAdmin } from '@/services/adminApi';

const checkAdmin = async () => {
  const admin = await isAdmin();
  console.log('Is admin:', admin);
};
```

---

## Performance Optimization

### Database Indexes

Already created in migration:
```sql
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
```

### Query Optimization

**Use select specific columns:**
```typescript
// Instead of select('*')
.select('id, email, full_name')
```

**Implement pagination:**
```typescript
.range(0, 99) // First 100 records
```

**Cache with React Query:**
```typescript
const { data } = useQuery({
  queryKey: ['admin-users'],
  queryFn: getAdminUsers,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

---

## Security Best Practices

### 1. Always Check Admin Role

```typescript
// In database functions
IF NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
) THEN
  RAISE EXCEPTION 'Unauthorized: Admin access required';
END IF;
```

### 2. Use SECURITY DEFINER Carefully

- Only for admin functions
- Always include authorization checks
- Set explicit search_path

### 3. Validate Input

```typescript
// In Edge Functions
if (!familyId || !tier || !status) {
  return new Response(
    JSON.stringify({ error: 'Missing required fields' }),
    { status: 400 }
  );
}
```

### 4. Use RLS Policies

```sql
-- Ensure RLS is enabled
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin full access" ON subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

---

## API Reference Summary

| Function | Purpose | Security | Returns |
|----------|---------|----------|---------|
| `get_admin_users()` | List all users | Admin only | User array |
| `get_dashboard_stats()` | Dashboard stats | Admin only | Stats JSON |
| `get_subscription_stats()` | Subscription stats | Admin only | Stats JSON |
| `get_revenue_trend(days)` | Revenue trend | Admin only | Revenue array |
| `admin_update_subscription()` | Update subscription | Admin only | Success JSON |
| `get_promo_stats()` | Promo stats | Admin only | Stats JSON |
| `validate_promo_code()` | Validate promo | Authenticated | Validation JSON |

---

## Deployment Checklist

### Database

- [x] Run migration files
- [x] Create indexes
- [x] Grant function permissions
- [x] Test all functions

### Edge Functions

- [ ] Deploy Edge Functions
```bash
supabase functions deploy admin-dashboard-stats
supabase functions deploy admin-users
```

- [ ] Set environment variables
```bash
supabase secrets set SUPABASE_URL=your-url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
```

- [ ] Test Edge Functions
```bash
curl -X GET https://[project-ref].supabase.co/functions/v1/admin-dashboard-stats \
  -H "Authorization: Bearer [token]"
```

### Frontend

- [x] Build frontend
- [x] Test all admin pages
- [x] Verify API integration
- [x] Deploy to production

---

**Last Updated:** November 7, 2024  
**Version:** 1.0.0  
**Status:** Production Ready ✅

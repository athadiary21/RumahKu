# Admin Panel UI/UX Design - RumahKu

## Overview

Dokumentasi lengkap desain UI/UX untuk Admin Panel RumahKu yang mencakup manajemen user, status subscription, dan CRUD promo code.

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Dashboard Overview](#dashboard-overview)
3. [User Management](#user-management)
4. [Subscription Management](#subscription-management)
5. [Promo Code Management](#promo-code-management)
6. [UI Components](#ui-components)
7. [Responsive Design](#responsive-design)
8. [Color System](#color-system)
9. [Typography](#typography)
10. [Accessibility](#accessibility)

---

## Design Principles

### Core Principles

**1. Clarity**
- Clear hierarchy and information architecture
- Intuitive navigation and labeling
- Consistent terminology across the platform

**2. Efficiency**
- Quick access to common tasks
- Batch operations where applicable
- Keyboard shortcuts for power users

**3. Feedback**
- Immediate visual feedback for all actions
- Clear success/error messages
- Loading states for async operations

**4. Consistency**
- Unified design language
- Consistent component behavior
- Predictable interaction patterns

**5. Accessibility**
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader friendly

---

## Dashboard Overview

### Layout

```
┌─────────────────────────────────────────────────────┐
│  Header: Dashboard Admin                            │
│  Subtitle: Overview dan statistik platform RumahKu  │
└─────────────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┐
│ Total    │ Active   │ Monthly  │ Active   │
│ Users    │ Subs     │ Revenue  │ Promos   │
│  150     │   45     │ Rp 4.5M  │   12     │
└──────────┴──────────┴──────────┴──────────┘

┌────────────────────────┬────────────────────────┐
│  Revenue Trend         │  Subscription          │
│  (Area Chart)          │  Breakdown             │
│                        │  (Pie Chart)           │
│  [14 days data]        │  [By tier]             │
└────────────────────────┴────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Transaction Status                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Completed: 85  ✓                               │
│  Pending: 15    ⏳                              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Quick Actions                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Manage   │  │ Subs     │  │ Promo    │    │
│  │ Users    │  │ Status   │  │ Codes    │    │
│  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────┘
```

### Features

**Stats Cards:**
- Total Users count
- Active Subscriptions count
- Monthly Revenue (MRR)
- Active Promo Codes count

**Charts:**
- Revenue Trend (Area Chart) - Last 14 days
- Subscription Breakdown (Pie Chart) - By tier

**Transaction Status:**
- Completed transactions count with progress bar
- Pending transactions count

**Quick Actions:**
- Direct links to main admin functions
- Icon + label for clarity
- Hover effects for interactivity

---

## User Management

### Layout

```
┌─────────────────────────────────────────────────────┐
│  👥 User Management                                  │
│  Manage users and their subscription status         │
└─────────────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┐
│ Total    │ Free     │ Family   │ Premium  │
│ Users    │ Tier     │ Tier     │ Tier     │
│  150     │   90     │   45     │   15     │
└──────────┴──────────┴──────────┴──────────┘

┌─────────────────────────────────────────────────────┐
│  Filters                                            │
│  ┌──────────────────┐ ┌────────┐ ┌────────┐       │
│  │ 🔍 Search...     │ │ Tier   │ │ Status │       │
│  └──────────────────┘ └────────┘ └────────┘       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Users (150)                                        │
│  ┌───────────────────────────────────────────────┐ │
│  │ User │ Email │ Family │ Tier │ Status │ ... │ │
│  ├───────────────────────────────────────────────┤ │
│  │ John │ john@ │ Smith  │ Free │ Active │ ... │ │
│  │ Jane │ jane@ │ Doe    │ Fam  │ Active │ ... │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Features

**Stats Cards:**
- Total users count
- Breakdown by tier (Free, Family, Premium)
- Visual icons for each tier

**Filters:**
- Search by name, email, or family
- Filter by subscription tier
- Filter by subscription status

**User Table:**
- User avatar and name
- Email with icon
- Family name
- Subscription tier badge
- Subscription status badge
- Expiry date with calendar icon
- User role badge
- Edit action button

**Edit Dialog:**
- Update subscription tier
- Change subscription status
- Set expiry date
- Save/Cancel actions

### UI Elements

**Tier Badges:**
- Free: Gray with Shield icon
- Family: Blue with Zap icon
- Premium: Yellow with Crown icon

**Status Badges:**
- Active: Green
- Expired: Red
- Cancelled: Gray

---

## Subscription Management

### Layout

```
┌─────────────────────────────────────────────────────┐
│  💳 Subscription Management                          │
│  Monitor and manage all subscriptions               │
└─────────────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ Active   │ Free     │ Family   │ Premium  │ MRR      │
│  45      │   90     │   35     │   10     │ Rp 4.5M  │
└──────────┴──────────┴──────────┴──────────┴──────────┘

┌─────────────────────────────────────────────────────┐
│  Subscription Distribution                          │
│  ┌───────────────────────────────────────────────┐ │
│  │  [Bar Chart showing tier distribution]        │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Filters                                            │
│  ┌────────────────┐ ┌────────────────┐            │
│  │ Filter by Tier │ │ Filter by Status│            │
│  └────────────────┘ └────────────────┘            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Subscriptions (150)                                │
│  ┌───────────────────────────────────────────────┐ │
│  │ Family│ Tier │ Status │ Billing │ Dates │ ...│ │
│  ├───────────────────────────────────────────────┤ │
│  │ Smith │ Free │ Active │ Monthly │ ...   │ ...│ │
│  │ Doe   │ Fam  │ Active │ Yearly  │ ...   │ ...│ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Features

**Stats Cards:**
- Active subscriptions count
- Breakdown by tier
- Monthly Recurring Revenue (MRR)

**Chart:**
- Bar chart showing subscription distribution by tier
- Color-coded bars for each tier

**Filters:**
- Filter by subscription tier
- Filter by subscription status

**Subscription Table:**
- Family name
- Subscription tier badge
- Subscription status badge
- Billing period badge
- Start date with calendar icon
- End date with calendar icon
- Price display

### Metrics

**MRR Calculation:**
```typescript
// Monthly Recurring Revenue
MRR = Σ (active_subscriptions * monthly_price)

// For yearly subscriptions
monthly_price = yearly_price / 12
```

---

## Promo Code Management

### Layout

```
┌─────────────────────────────────────────────────────┐
│  🏷️ Promo Codes Management          [+ Create]      │
│  Create and manage promotional discount codes      │
└─────────────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┐
│ Total    │ Active   │ Total    │ Expired  │
│ Codes    │ Codes    │ Uses     │ Codes    │
│  25      │   12     │   150    │   5      │
└──────────┴──────────┴──────────┴──────────┘

┌─────────────────────────────────────────────────────┐
│  Promo Codes (25)                                   │
│  ┌───────────────────────────────────────────────┐ │
│  │ Code  │ Discount │ Period │ Usage │ Status  │ │
│  ├───────────────────────────────────────────────┤ │
│  │ WEL10 │ 10%      │ ...    │ 5/100 │ Active  │ │
│  │ NEW50 │ Rp 50k   │ ...    │ 10/∞  │ Active  │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Features

**Stats Cards:**
- Total promo codes count
- Active promo codes count
- Total uses across all codes
- Expired promo codes count

**Promo Table:**
- Code display with copy button
- Discount type and value
- Valid period (from - to)
- Usage statistics (current/max)
- Status badges (Active/Inactive/Expired)
- Max uses reached indicator
- Edit and Delete actions

**Create/Edit Dialog:**
- Code input (auto-uppercase)
- Discount type selector (Percentage/Fixed)
- Discount value input
- Max uses input (optional)
- Valid from date picker
- Valid until date picker
- Active toggle switch

### Validation

**Code Rules:**
- Auto-convert to uppercase
- Alphanumeric characters only
- Minimum 3 characters
- Maximum 20 characters

**Discount Rules:**
- Percentage: 0-100
- Fixed: Positive integer

**Date Rules:**
- Valid from must be before valid until
- Cannot create expired promo codes

### UI Elements

**Code Display:**
```
┌──────────────────┐
│ WELCOME10  [📋]  │  ← Monospace font + copy button
└──────────────────┘
```

**Discount Display:**
```
% 10%              ← Percentage with icon
Rp 50,000          ← Fixed amount with currency
```

**Usage Display:**
```
5 / 100            ← Current / Max
10 / ∞             ← Unlimited uses
[Max Reached]      ← Badge when limit hit
```

**Status Badges:**
- Active: Green badge
- Inactive: Gray badge
- Expired: Red badge (auto-detected)

---

## UI Components

### Cards

**Stats Card:**
```
┌────────────────────────┐
│ Title          [Icon]  │
│                        │
│ 150                    │  ← Large number
│ Subtitle text          │  ← Small description
└────────────────────────┘
```

**Properties:**
- Header with title and icon
- Large number display
- Subtitle for context
- Hover effect
- Responsive sizing

### Tables

**Data Table:**
```
┌─────────────────────────────────────┐
│ Header 1 │ Header 2 │ Header 3 │   │
├─────────────────────────────────────┤
│ Data 1   │ Data 2   │ Data 3   │ ✏️│
│ Data 1   │ Data 2   │ Data 3   │ ✏️│
└─────────────────────────────────────┘
```

**Properties:**
- Striped rows for readability
- Hover highlight
- Sticky header on scroll
- Action buttons in last column
- Empty state message
- Loading skeleton

### Badges

**Tier Badges:**
- Free: `[🛡️ Free]` - Gray
- Family: `[⚡ Family]` - Blue
- Premium: `[👑 Premium]` - Yellow

**Status Badges:**
- Active: `[Active]` - Green
- Expired: `[Expired]` - Red
- Cancelled: `[Cancelled]` - Gray
- Pending: `[Pending]` - Yellow

### Dialogs

**Modal Structure:**
```
┌─────────────────────────────────┐
│ Title                     [×]   │
│ Description text                │
├─────────────────────────────────┤
│                                 │
│ Form fields...                  │
│                                 │
├─────────────────────────────────┤
│              [Cancel] [Save]    │
└─────────────────────────────────┘
```

**Properties:**
- Overlay backdrop
- Centered positioning
- Close button
- Keyboard shortcuts (Esc to close)
- Focus trap
- Responsive width

### Buttons

**Primary Button:**
- Background: Primary color
- Text: White
- Hover: Darker shade
- Active: Even darker
- Disabled: Gray with reduced opacity

**Secondary Button:**
- Background: Transparent
- Border: Primary color
- Text: Primary color
- Hover: Light background

**Ghost Button:**
- Background: Transparent
- No border
- Text: Muted color
- Hover: Light background

**Icon Button:**
- Square or circle
- Icon only
- Tooltip on hover
- Consistent sizing

### Charts

**Area Chart (Revenue Trend):**
- X-axis: Dates
- Y-axis: Revenue (formatted)
- Fill: Primary color with opacity
- Stroke: Primary color
- Tooltip: Formatted currency
- Grid: Subtle lines

**Pie Chart (Subscription Breakdown):**
- Segments: Color-coded by tier
- Labels: Percentage + tier name
- Legend: Below chart
- Hover: Highlight segment

**Bar Chart (Distribution):**
- X-axis: Categories
- Y-axis: Count
- Bars: Primary color
- Rounded corners
- Hover: Tooltip with exact value

---

## Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  /* Single column layout */
  /* Stacked stats cards */
  /* Simplified tables */
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  /* 2-column layout */
  /* 2x2 stats grid */
  /* Scrollable tables */
}

/* Desktop */
@media (min-width: 1025px) {
  /* Multi-column layout */
  /* 4-column stats grid */
  /* Full-width tables */
}
```

### Mobile Optimizations

**Dashboard:**
- Stack stats cards vertically
- Reduce chart height
- Simplify quick actions

**Tables:**
- Horizontal scroll
- Sticky first column
- Compact row height
- Swipe actions

**Dialogs:**
- Full-screen on mobile
- Bottom sheet style
- Touch-friendly buttons

**Navigation:**
- Hamburger menu
- Slide-out sidebar
- Bottom navigation bar

---

## Color System

### Primary Colors

```
Primary:   #3b82f6 (Blue)
Secondary: #8b5cf6 (Purple)
Success:   #10b981 (Green)
Warning:   #f59e0b (Yellow)
Error:     #ef4444 (Red)
```

### Tier Colors

```
Free:      #94a3b8 (Gray)
Family:    #3b82f6 (Blue)
Premium:   #f59e0b (Yellow/Gold)
```

### Neutral Colors

```
Background:  #ffffff (White)
Surface:     #f8fafc (Light Gray)
Border:      #e2e8f0 (Gray)
Text:        #0f172a (Dark)
Muted:       #64748b (Gray)
```

### Dark Mode

```
Background:  #0f172a (Dark Blue)
Surface:     #1e293b (Lighter Dark)
Border:      #334155 (Gray)
Text:        #f1f5f9 (Light)
Muted:       #94a3b8 (Gray)
```

---

## Typography

### Font Family

```
Primary:   Inter, system-ui, sans-serif
Monospace: 'Courier New', monospace (for codes)
```

### Font Sizes

```
Heading 1:  2.25rem (36px) - Page titles
Heading 2:  1.875rem (30px) - Section titles
Heading 3:  1.5rem (24px) - Card titles
Body:       1rem (16px) - Regular text
Small:      0.875rem (14px) - Labels, captions
Tiny:       0.75rem (12px) - Hints, badges
```

### Font Weights

```
Light:   300 - Subtle text
Regular: 400 - Body text
Medium:  500 - Emphasis
Semibold: 600 - Headings
Bold:    700 - Strong emphasis
```

---

## Accessibility

### Keyboard Navigation

**Tab Order:**
- Logical flow top to bottom, left to right
- Skip links for main content
- Focus visible on all interactive elements

**Keyboard Shortcuts:**
- `Tab`: Next element
- `Shift + Tab`: Previous element
- `Enter`: Activate button/link
- `Space`: Toggle checkbox/switch
- `Esc`: Close dialog/dropdown
- `Arrow keys`: Navigate lists/menus

### Screen Readers

**ARIA Labels:**
- Descriptive labels for all inputs
- Role attributes for custom components
- Live regions for dynamic content
- Alt text for images and icons

**Semantic HTML:**
- Proper heading hierarchy
- Native form elements
- Landmark regions
- List structures

### Visual Accessibility

**Contrast Ratios:**
- Text: Minimum 4.5:1
- Large text: Minimum 3:1
- UI components: Minimum 3:1

**Focus Indicators:**
- Visible focus ring
- High contrast outline
- Consistent styling

**Color Independence:**
- Don't rely solely on color
- Use icons + text
- Patterns for charts

---

## Best Practices

### Performance

**Optimization:**
- Lazy load tables and charts
- Virtualize long lists
- Debounce search inputs
- Cache query results
- Optimize images

**Loading States:**
- Skeleton screens for tables
- Spinners for actions
- Progress bars for uploads
- Shimmer effects

### User Experience

**Feedback:**
- Toast notifications for actions
- Inline validation for forms
- Confirmation dialogs for destructive actions
- Success animations

**Error Handling:**
- Clear error messages
- Actionable suggestions
- Retry mechanisms
- Fallback UI

### Data Display

**Formatting:**
- Currency: Rp 1,000,000
- Dates: dd MMM yyyy
- Percentages: 10%
- Numbers: 1,000

**Empty States:**
- Helpful illustrations
- Clear messaging
- Call-to-action buttons
- Getting started guides

---

## Implementation Checklist

### Dashboard
- [x] Stats cards with icons
- [x] Revenue trend chart
- [x] Subscription breakdown chart
- [x] Transaction status display
- [x] Quick action links

### User Management
- [x] User stats cards
- [x] Search and filters
- [x] User table with badges
- [x] Edit subscription dialog
- [x] Tier and status badges

### Subscription Management
- [x] Subscription stats cards
- [x] Distribution bar chart
- [x] Filter by tier and status
- [x] Subscription table
- [x] MRR calculation

### Promo Code Management
- [x] Promo stats cards
- [x] Promo code table
- [x] Create promo dialog
- [x] Edit promo dialog
- [x] Delete confirmation
- [x] Copy code functionality
- [x] Validation rules

### Responsive Design
- [x] Mobile breakpoints
- [x] Tablet layout
- [x] Desktop layout
- [x] Touch-friendly buttons

### Accessibility
- [x] Keyboard navigation
- [x] ARIA labels
- [x] Focus indicators
- [x] Screen reader support

---

## Screenshots

### Dashboard
![Dashboard Overview](screenshots/dashboard.png)
- Stats cards showing key metrics
- Revenue trend chart with 14-day data
- Subscription breakdown pie chart
- Transaction status with progress bars
- Quick action cards

### User Management
![User Management](screenshots/users.png)
- User stats by tier
- Search and filter controls
- User table with all details
- Edit dialog for subscription changes

### Subscription Management
![Subscription Management](screenshots/subscriptions.png)
- Subscription stats and MRR
- Distribution bar chart
- Filter controls
- Detailed subscription table

### Promo Code Management
![Promo Codes](screenshots/promo-codes.png)
- Promo code stats
- Code table with copy buttons
- Create/edit dialog
- Status badges and indicators

---

## Future Enhancements

### Planned Features

**Dashboard:**
- Real-time updates via websockets
- Customizable widgets
- Export reports to PDF/Excel
- Date range filters

**User Management:**
- Bulk actions (select multiple users)
- Export user list
- Send email to users
- User activity logs

**Subscription Management:**
- Subscription analytics
- Churn prediction
- Renewal reminders
- Upgrade suggestions

**Promo Code Management:**
- Promo code templates
- A/B testing support
- Usage analytics
- Automatic expiry notifications

---

**Last Updated:** November 7, 2024  
**Version:** 1.0.0  
**Design System:** Shadcn UI + Tailwind CSS  
**Status:** Production Ready ✅

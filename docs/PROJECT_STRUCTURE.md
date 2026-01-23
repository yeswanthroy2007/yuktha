# Emergency QR Code - Project Structure & Integration Guide

## 📂 Complete File Structure

```
studio-main/
│
├── src/
│   ├── lib/
│   │   ├── data.ts (existing - EmergencyInfo type)
│   │   └── emergency-token.ts ✨ NEW
│   │       ├── generateEmergencyToken()
│   │       ├── isValidEmergencyToken()
│   │       ├── getEmergencyUrl()
│   │       ├── storeEmergencyToken()
│   │       ├── getStoredEmergencyToken()
│   │       └── clearEmergencyToken()
│   │
│   ├── components/
│   │   ├── qr-code-display.tsx ✨ NEW
│   │   │   └── QRCodeDisplay component
│   │   │       ├── Props: qrData, size, showDescription, copyableUrl
│   │   │       └── Features: Display QR + Copy button
│   │   │
│   │   └── ui/ (existing components)
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx (existing)
│   │   ├── use-toast.ts (existing)
│   │   └── use-emergency-info-fetch.ts ✨ NEW
│   │       ├── useEmergencyInfoFetch(token)
│   │       └── Returns: { data, loading, error }
│   │
│   ├── context/
│   │   ├── auth-context.tsx (existing)
│   │   ├── emergency-info-context.tsx 🔄 MODIFIED
│   │   │   ├── Added: emergencyToken state
│   │   │   ├── Added: generateAndStoreToken()
│   │   │   └── Updated: Provider value
│   │   │
│   │   ├── medicine-context.tsx (existing)
│   │   ├── notification-context.tsx (existing)
│   │   └── report-context.tsx (existing)
│   │
│   └── app/
│       ├── layout.tsx (existing)
│       ├── page.tsx (existing)
│       │
│       ├── api/
│       │   ├── (other existing routes)
│       │   └── emergency/
│       │       └── [token]/
│       │           └── route.ts ✨ NEW
│       │               ├── GET handler
│       │               ├── Token validation
│       │               ├── Emergency data fetch
│       │               └── Security headers
│       │
│       ├── emergency/
│       │   └── [token]/ ✨ NEW
│       │       └── page.tsx
│       │           ├── Public page (no auth)
│       │           ├── useEmergencyInfoFetch hook
│       │           └── Hospital-friendly UI
│       │
│       ├── dashboard/
│       │   ├── layout.tsx (existing)
│       │   ├── page.tsx (existing)
│       │   │
│       │   ├── profile/
│       │   │   └── page.tsx 🔄 MODIFIED
│       │   │       ├── Integrated: QRCodeDisplay
│       │   │       ├── Added: Emergency token display
│       │   │       └── Updated: QR section
│       │   │
│       │   ├── emergency-qr/
│       │   │   └── page.tsx 🔄 MODIFIED
│       │   │       ├── QR management
│       │   │       ├── Regenerate feature
│       │   │       └── How-it-works guide
│       │   │
│       │   ├── add-prescription/ (existing)
│       │   ├── family/ (existing)
│       │   ├── med-tracker/ (existing)
│       │   └── reports/ (existing)
│       │
│       ├── login/ (existing)
│       └── doctor/ (existing)
│
└── docs/
    ├── blueprint.md (existing)
    ├── EMERGENCY_QR_SUMMARY.md ✨ NEW
    │   └── Executive summary, key features, next steps
    ├── emergency-qr-implementation.md ✨ NEW
    │   └── Full technical guide, architecture, database migration
    ├── emergency-qr-quick-reference.md ✨ NEW
    │   └── API reference, quick start, testing checklist
    └── emergency-qr-examples.tsx ✨ NEW
        └── 10 code examples, usage patterns
```

## 🔗 Component Dependencies

```
User Flow:
┌─────────────────────────────────────┐
│   Dashboard Profile Page             │
│   (/dashboard/profile)               │
│  ┌─ useEmergencyInfo hook           │
│  ├─ QRCodeDisplay component          │
│  └─ emergencyToken from context      │
└─────────────────────────────────────┘
           ↓
      (user generates QR)
           ↓
┌─────────────────────────────────────┐
│   Emergency QR Management Page       │
│   (/dashboard/emergency-qr)          │
│  ┌─ useEmergencyInfo hook            │
│  ├─ QRCodeDisplay component          │
│  ├─ Regenerate functionality         │
│  └─ Emergency info summary           │
└─────────────────────────────────────┘
           ↓
      (patient shares QR)
           ↓
┌─────────────────────────────────────┐
│   First Responder Scans QR Code     │
│   Public URL: /emergency/[token]     │
│  ┌─ useEmergencyInfoFetch hook       │
│  ├─ Fetches from API                 │
│  └─ Displays emergency info          │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   API Endpoint                       │
│   GET /api/emergency/[token]         │
│  ├─ Token validation                 │
│  ├─ Fetch emergency data             │
│  └─ Return safe data only            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Emergency Information Displayed    │
│   (/emergency/[token])               │
│  ├─ Patient name                     │
│  ├─ Blood group (prominent)          │
│  ├─ Allergies (highlighted)          │
│  ├─ Medications                      │
│  └─ Emergency contact                │
└─────────────────────────────────────┘
```

## 📊 Data Flow Diagram

```
localStorage (Client)
    ↓
┌──────────────────────────┐
│ EmergencyInfoContext     │
│ - emergencyInfo          │
│ - emergencyToken         │
│ - generateAndStoreToken()│
└──────────────────────────┘
    ↓ (provides to components)
    ├─→ Profile page
    ├─→ Emergency QR page
    └─→ Public emergency page


Token Storage Flow:
┌──────────────────────────────────────────┐
│ User fills emergency info                │
│ setEmergencyInfo(data)                   │
└──────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────┐
│ User generates QR code                   │
│ generateAndStoreToken()                  │
└──────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────┐
│ Token generation                         │
│ crypto.randomUUID()                      │
│ → "a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5"│
└──────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────┐
│ Store token                              │
│ localStorage.setItem('...-token', token) │
│ Context state updated                    │
└──────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────┐
│ Generate QR URL                          │
│ /emergency/a1b2c3d4-e5f6-4g7h-...       │
└──────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────┐
│ Encode in QR code                        │
│ QR Server API generates QR               │
└──────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────┐
│ Display QR code                          │
│ User can copy link or share QR           │
└──────────────────────────────────────────┘
```

## 🔄 Update Flows

### Emergency Context Updates

```
Before Implementation:
┌─────────────────────────────────────┐
│ useEmergencyInfo()                  │
├─ emergencyInfo: EmergencyInfo       │
├─ setEmergencyInfo: (info) => void   │
├─ isModalOpen: boolean               │
└─ setIsModalOpen: (open) => void     │
└─────────────────────────────────────┘

After Implementation:
┌─────────────────────────────────────┐
│ useEmergencyInfo()                  │
├─ emergencyInfo: EmergencyInfo       │
├─ setEmergencyInfo: (info) => void   │
├─ isModalOpen: boolean               │
├─ setIsModalOpen: (open) => void     │
├─ emergencyToken: string | null      │ ✨ NEW
└─ generateAndStoreToken: () => string│ ✨ NEW
└─────────────────────────────────────┘
```

### Profile Page Updates

```
Before:
- Display QR using data embedding
- QR contains all emergency info
- No token system

After:
- Display QR using token-based system
- QR contains only /emergency/[token]
- Generate token when needed
- Copy link functionality
- Regenerate option
```

## 🎯 Integration Checklist

### Step 1: Context Integration ✅
```typescript
// In any component
import { useEmergencyInfo } from '@/context/emergency-info-context';

const { 
  emergencyToken,           // New field
  generateAndStoreToken     // New method
} = useEmergencyInfo();
```

### Step 2: Component Integration ✅
```typescript
// In profile or emergency QR page
import { QRCodeDisplay } from '@/components/qr-code-display';

<QRCodeDisplay 
  qrData={emergencyUrl}
  copyableUrl={emergencyUrl}
/>
```

### Step 3: Hook Integration ✅
```typescript
// In public emergency page
import { useEmergencyInfoFetch } from '@/hooks/use-emergency-info-fetch';

const { data, loading, error } = useEmergencyInfoFetch(token);
```

### Step 4: API Integration ✅
```typescript
// Public endpoint ready
// GET /api/emergency/[token]
// Accepts: UUID format token
// Returns: Emergency data (no auth required)
```

## 🔐 Security Boundary

```
PUBLIC ROUTES (No Auth Required)
┌───────────────────────────────────────────┐
│ GET /api/emergency/[token]                │
│ - Accessible to anyone                    │
│ - Returns emergency data only             │
│ - No user credentials needed              │
│ - Perfect for first responders            │
└───────────────────────────────────────────┘
         ↑ (only returns)
         │
     Emergency Data Only:
     - Name ✓
     - Blood group ✓
     - Allergies ✓
     - Medications ✓
     - Emergency contact ✓
     - Email ✗
     - Password ✗
     - Internal IDs ✗

PROTECTED ROUTES (Auth Required)
┌───────────────────────────────────────────┐
│ /dashboard/profile                        │
│ /dashboard/emergency-qr                   │
│ - Requires login                          │
│ - User's own data only                    │
│ - Can manage QR codes                     │
│ - Can regenerate tokens                   │
└───────────────────────────────────────────┘
```

## 📈 Scalability Considerations

### Current (MVP)
- localStorage for token storage
- QR Server API for generation
- Mock API responses

### For Production
- Database for token persistence
- Token expiration handling
- Rate limiting on API
- Audit logging
- Caching strategy
- Multi-region deployment

### Database Schema Ready
```sql
-- Migration guide included in docs
-- Schema provided in emergency-qr-implementation.md
-- Indexes for performance
-- Foreign keys for data integrity
```

## 🧪 Testing Integration Points

### Unit Tests (Ready to add)
- `emergency-token.ts` utilities
- `useEmergencyInfoFetch()` hook
- `QRCodeDisplay` component

### Integration Tests (Ready to add)
- Token generation in context
- API endpoint responses
- Public page rendering

### E2E Tests (Ready to add)
- Complete QR code flow
- First responder access
- Error scenarios

## 📱 Responsive Design

```
Mobile (< 768px)
┌─────────────────┐
│ QR Code 200x200 │
│                 │
│ Copy Link Btn   │
│ Manage QR Btn   │
│                 │
│ Emergency Info  │
│ Summary         │
└─────────────────┘

Tablet (768px - 1024px)
┌────────────────────────┐
│  Col1        │  Col2    │
│  QR Code     │ Emergency│
│  200x200     │ Info     │
│              │          │
│  Buttons     │          │
└────────────────────────┘

Desktop (> 1024px)
┌──────────────────────────────────────┐
│ QR Code 250x250  │  Emergency Info    │
│                  │  Summary           │
│ Buttons          │  How-it-works      │
│                  │  Guide             │
└──────────────────────────────────────┘
```

## 🎨 Color Scheme for Emergency Page

```
Header Background:     Gradient Red to Orange (danger indicator)
Text Color:            White (high contrast)

Section Headers:
- Red:     Patient info, critical
- Blue:    Blood group (most important)
- Yellow:  Allergies (warning)
- Purple:  Medical conditions
- Green:   Medications (active)
- Orange:  Emergency contact (important)

All sections have:
- High contrast text
- Large fonts (accessibility)
- Color-blind friendly (using shapes + colors)
```

## 🚀 Deployment Strategy

### Phase 1: Development ✅
- [x] Features implemented
- [x] LocalStorage testing
- [x] Component testing

### Phase 2: Testing
- [ ] Manual QR scanning
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### Phase 3: Production
- [ ] Database migration
- [ ] Rate limiting
- [ ] Security audit
- [ ] Performance testing

### Phase 4: Monitoring
- [ ] Analytics setup
- [ ] Error tracking
- [ ] Usage monitoring

## 📞 Quick Links

### Documentation
- [Full Implementation Guide](emergency-qr-implementation.md)
- [Quick Reference](emergency-qr-quick-reference.md)
- [Code Examples](emergency-qr-examples.tsx)
- [Summary](EMERGENCY_QR_SUMMARY.md)
- [This Document](PROJECT_STRUCTURE.md)

### Key Files
- Token utilities: `src/lib/emergency-token.ts`
- QR component: `src/components/qr-code-display.tsx`
- Fetch hook: `src/hooks/use-emergency-info-fetch.ts`
- API route: `src/app/api/emergency/[token]/route.ts`
- Public page: `src/app/emergency/[token]/page.tsx`

### Modified Files
- Emergency context: `src/context/emergency-info-context.tsx`
- Profile page: `src/app/dashboard/profile/page.tsx`
- QR management: `src/app/dashboard/emergency-qr/page.tsx`

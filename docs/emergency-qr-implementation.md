# Emergency QR Code Implementation Guide

## Overview

This document describes the complete QR code generation and scanning flow for the Yukta medical application. When users submit their emergency medical details, they receive a secure QR code that first responders can scan to instantly access critical medical information.

## Architecture

### Components & Files Created

```
src/
├── lib/
│   └── emergency-token.ts          # Token generation and validation utilities
├── components/
│   └── qr-code-display.tsx         # Reusable QR code display component
├── hooks/
│   └── use-emergency-info-fetch.ts # Hook for fetching emergency info by token
├── context/
│   └── emergency-info-context.tsx  # Updated with token management
├── app/
│   ├── api/
│   │   └── emergency/
│   │       └── [token]/
│   │           └── route.ts        # Public API endpoint for emergency info
│   ├── emergency/
│   │   └── [token]/
│   │       └── page.tsx            # Public emergency info display page
│   └── dashboard/
│       ├── profile/
│       │   └── page.tsx            # Updated profile with QR display
│       └── emergency-qr/
│           └── page.tsx            # QR code management page
```

## Flow Diagram

```
User Flow:
1. User logs in
2. User fills emergency medical details
   ├── Blood Group
   ├── Allergies
   ├── Current Medications
   └── Emergency Contact
3. System generates unique UUID token
4. Token stored in localStorage (mapped to user's emergency info)
5. QR code generated encoding: /emergency/[token]
6. QR code displayed on profile & dashboard

First Responder Flow:
1. Scan QR code from patient's phone/paper
2. Browser opens: /emergency/[token]
3. Public page (no auth required) fetches emergency info via API
4. /api/emergency/[token] returns patient's emergency data
5. Clean, hospital-friendly UI displays information
   ├── Patient Name (large)
   ├── Blood Group (very large, critical)
   ├── Allergies (highlighted)
   ├── Medical Conditions
   ├── Current Medications
   └── Emergency Contact (prominent)
```

## Security Implementation

### Token Generation
- **Algorithm**: UUID v4 (Cryptographically secure random)
- **Format**: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- **Non-guessable**: 128-bit entropy (340 undecillion possibilities)
- **Storage**: localStorage (client-side) mapped to emergency info

```typescript
// Generate unique token
const token = crypto.randomUUID(); // e.g., "a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5"
```

### Public Emergency Page Security

**No Authentication Required ✓** - This is intentional
- First responders in emergencies need immediate access
- No login/password barrier to lifesaving information
- Token is the only identifier

**Data Exposed** (Medical Only):
- ✓ Patient Name
- ✓ Blood Group
- ✓ Allergies
- ✓ Diseases/Medical Conditions
- ✓ Ongoing Medications
- ✓ Emergency Contact

**Data NOT Exposed** (Privacy Protected):
- ✗ Email address
- ✗ Password
- ✗ Phone number (except emergency contact)
- ✗ Home address
- ✗ Internal user IDs
- ✗ Account credentials
- ✗ Financial information

### Token Validation

```typescript
// Validate UUID format
function isValidEmergencyToken(token: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(token);
}
```

### API Response Security
- **Cache-Control**: `no-store, no-cache, must-revalidate` - Prevents caching
- **Pragma**: `no-cache` - Extra cache prevention
- **Expires**: `0` - Immediate expiration
- Only emergency-relevant fields returned
- No sensitive data in response

## API Endpoint

### GET `/api/emergency/[token]`

**Public Endpoint** (NO authentication required)

#### Parameters
- `token`: UUID v4 format emergency token (path parameter)

#### Request Example
```
GET /api/emergency/a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5
```

#### Success Response (200)
```json
{
  "userName": "John Doe",
  "bloodGroup": "O+",
  "bloodGroupOther": "",
  "allergies": "Peanuts, Penicillin",
  "allergiesOther": "",
  "medications": "Metformin 500mg (daily), Lisinopril 10mg (daily)",
  "medicationsOther": "",
  "emergencyContact": "Jane Doe - 555-123-4567"
}
```

#### Error Responses

**400 Bad Request** - Invalid token format
```json
{
  "error": "Invalid emergency token format"
}
```

**404 Not Found** - Token doesn't exist or expired
```json
{
  "error": "Invalid or expired emergency QR"
}
```

**500 Internal Server Error** - Server error
```json
{
  "error": "Internal server error"
}
```

## Component Usage

### QRCodeDisplay Component

```tsx
import { QRCodeDisplay } from '@/components/qr-code-display';
import { getEmergencyUrl } from '@/lib/emergency-token';

const token = 'a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5';
const emergencyUrl = getEmergencyUrl(token);

<QRCodeDisplay 
  qrData={emergencyUrl}        // URL to encode
  size={200}                   // QR code size (default: 200)
  showDescription={true}       // Show helper text
  copyableUrl={emergencyUrl}   // Allow copy to clipboard
/>
```

### useEmergencyInfoFetch Hook

```tsx
import { useEmergencyInfoFetch } from '@/hooks/use-emergency-info-fetch';

const { data, loading, error } = useEmergencyInfoFetch(token);

if (loading) return <Loader />;
if (error) return <ErrorMessage error={error} />;

return (
  <div>
    <p>Blood Group: {data.bloodGroup}</p>
    <p>Allergies: {data.allergies}</p>
  </div>
);
```

### Emergency Context Usage

```tsx
import { useEmergencyInfo } from '@/context/emergency-info-context';

const { 
  emergencyInfo,           // Current emergency data
  setEmergencyInfo,        // Update emergency data
  emergencyToken,          // Current token (null if not generated)
  generateAndStoreToken    // Generate new token
} = useEmergencyInfo();

// Generate token when user submits emergency info
const handleSubmit = (data) => {
  setEmergencyInfo(data);
  const newToken = generateAndStoreToken();
};
```

## User Interface

### Profile Page QR Display
Located at `/dashboard/profile`
- Shows QR code if emergency info is complete
- Button to generate token (if not already generated)
- Link to manage QR code page
- Displays emergency info summary

### Emergency QR Management Page
Located at `/dashboard/emergency-qr`
- Large QR code display (250x250)
- Copy link button for sharing URL
- Regenerate QR code option (invalidates old token)
- Emergency info summary
- How-it-works information

### Public Emergency Page
Located at `/emergency/[token]`
- **No authentication required** ✓
- Hospital-friendly UI with:
  - Large fonts (accessibility)
  - High contrast colors
  - Organized sections
  - Color-coded information
    - Red: Patient name, critical info
    - Blue: Blood group (largest)
    - Yellow: Allergies (with warning icon)
    - Purple: Medical conditions
    - Green: Medications
    - Orange: Emergency contact

## Data Storage (Current Implementation)

### Client-Side Storage
Currently uses `localStorage` for MVP:
- Token: `localStorage.setItem('yuktha-emergency-token', token)`
- Emergency Info: `localStorage.setItem('yuktha-emergency-info', JSON.stringify(info))`

### Production Implementation
Should be migrated to database:

```sql
-- Tokens table
CREATE TABLE emergency_tokens (
  id UUID PRIMARY KEY,
  token UUID UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Users table (existing)
ALTER TABLE users ADD COLUMN emergency_info JSONB;

-- Index for fast lookups
CREATE INDEX idx_emergency_tokens_token ON emergency_tokens(token);
```

### API Route Implementation (for DB)
```typescript
// In src/app/api/emergency/[token]/route.ts
export async function GET(request, context) {
  const { token } = context.params;
  
  // Query database
  const tokenRecord = await db.query(
    'SELECT * FROM emergency_tokens WHERE token = ? AND is_active = true',
    [token]
  );
  
  if (!tokenRecord) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
  }
  
  const user = await db.query(
    'SELECT emergency_info, name FROM users WHERE id = ?',
    [tokenRecord.user_id]
  );
  
  return NextResponse.json({
    userName: user.name,
    ...user.emergency_info
  });
}
```

## Token Lifecycle

### Generation
1. User completes emergency info form
2. `generateAndStoreToken()` called
3. UUID v4 generated
4. Stored in localStorage/database
5. QR code generated encoding the public URL

### Usage
1. First responder scans QR code
2. Browser navigates to `/emergency/[token]`
3. Public page fetches data from API using token
4. Emergency information displayed

### Regeneration
1. User clicks "Regenerate QR Code"
2. Confirmation dialog shown
3. New UUID v4 generated
4. Old token invalidated
5. New QR code displayed

### Expiration (Production)
- Tokens can have optional TTL
- Default: Never expires (unless user regenerates)
- Can implement absolute expiry (e.g., 1 year)

## Testing Scenarios

### Scenario 1: Normal Flow
1. ✓ User fills emergency info
2. ✓ Generate token button appears
3. ✓ QR code displays
4. ✓ Scan QR code
5. ✓ Emergency info page loads
6. ✓ All medical info displays correctly

### Scenario 2: Invalid Token
1. ✓ Manually navigate to `/emergency/invalid-uuid`
2. ✓ Error page displays: "Invalid or expired emergency QR"

### Scenario 3: Regeneration
1. ✓ User has existing QR code
2. ✓ Click "Regenerate"
3. ✓ Confirmation shown
4. ✓ New token generated
5. ✓ Old QR code no longer works
6. ✓ New QR code works

### Scenario 4: Accessibility
1. ✓ Large fonts readable from distance
2. ✓ High contrast colors (WCAG AA compliant)
3. ✓ Large touch targets on mobile
4. ✓ Sections clearly labeled

## Browser Compatibility

### QR Code Generation
- Uses QR Server API (cloud-based)
- Works on all modern browsers
- No dependencies required
- Offline fallback not provided (intentional - for real-time access)

### Emergency Page
- Works on iOS (Camera app directly opens in browser)
- Works on Android (Chrome/default browser)
- Responsive design (mobile-first)
- No special permissions needed

## Future Enhancements

### Security
- [ ] Token expiration timestamps
- [ ] Rate limiting on API endpoint
- [ ] IP-based geo-blocking (optional)
- [ ] Audit logging for emergency info access
- [ ] Token usage analytics

### Features
- [ ] Download QR code as image
- [ ] Print QR code
- [ ] Share QR code link via SMS/WhatsApp
- [ ] Multiple QR codes (one per family member)
- [ ] QR code validity dates (auto-expire)

### Integrations
- [ ] Wearable display (smartwatch QR code)
- [ ] NFC chip integration
- [ ] Emergency services API integration
- [ ] Multi-language support

## Troubleshooting

### QR Code Not Displaying
- Check if emergency info is filled
- Verify token is generated
- Check browser console for errors
- Ensure QR Server API is accessible

### Emergency Page Shows Error
- Verify token format (should be UUID)
- Check if token is correct
- Try regenerating QR code
- Clear browser cache

### Token Not Persisting
- Check if localStorage is enabled
- Check for private/incognito mode
- Verify session storage isn't interfering

## Security Considerations

### Token Compromise
If a token is compromised:
1. User can regenerate it anytime
2. Old token becomes invalid
3. New QR code must be distributed
4. No data is exposed beyond emergency info

### HTTPS Requirement
- Production must use HTTPS
- Emergency URL should always be HTTPS
- QR codes must encode HTTPS URL

### Rate Limiting (Recommended)
- Implement rate limiting on API endpoint
- Suggest: 100 requests per minute per token
- Prevent API abuse/scanning attacks

## Deployment Checklist

- [ ] Database migration for token storage (when moving from localStorage)
- [ ] API endpoint security review
- [ ] HTTPS certificate valid
- [ ] Rate limiting configured
- [ ] Error handling tested
- [ ] Mobile responsiveness verified
- [ ] Accessibility (WCAG AA) tested
- [ ] Load testing for API endpoint
- [ ] Backup/disaster recovery plan
- [ ] User documentation created
- [ ] First responder documentation created

## References

- [UUID v4 Specification](https://tools.ietf.org/html/rfc4122)
- [QR Code Format](https://www.qr-code.co.uk/qr-code-logo)
- [WCAG 2.1 Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

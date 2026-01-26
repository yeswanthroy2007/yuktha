# Next.js 15 Params Fix

## Problem
Next.js 15 requires params to be unwrapped using `React.use()` before accessing their values. The error was:
```
Error: params are being enumerated. `params` should be unwrapped with `React.use()` before using its value.
```

## Solution

### For Client Components (Pages)
Changed from:
```typescript
const params = useParams();
const qrCode = params.qrCode as string;
```

To:
```typescript
import { use } from 'react';
const params = useParams();
const qrCode = use(params).qrCode as string;
```

### For API Routes
Changed from:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { qrCode: string } }
) {
  const { qrCode } = params;
```

To:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  const { qrCode } = await params;
```

## Files Fixed

### Client Components
1. ✅ `src/app/qr/[qrCode]/page.tsx`
2. ✅ `src/app/emergency/[token]/page.tsx`
3. ✅ `src/app/dashboard/family/[memberId]/page.tsx`

### API Routes
1. ✅ `src/app/api/qr/[qrCode]/route.ts`
2. ✅ `src/app/api/emergency/[token]/route.ts`
3. ✅ `src/app/api/medicines/[id]/route.ts`

## Changes Summary

### Client Components
- Added `use` import from 'react'
- Wrapped params access with `use(params)`

### API Routes
- Changed params type from `{ id: string }` to `Promise<{ id: string }>`
- Added `await` when destructuring params
- Updated all references to use the awaited value

## Testing

All files have been updated and linted. The application should now work without the params enumeration error.

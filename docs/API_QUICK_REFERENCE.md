# Quick API Reference

## Installation

```bash
npm install mongoose bcrypt jsonwebtoken
```

## Environment Variables (.env.local)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/yukta
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRY=7d
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## File Checklist

- [x] `src/lib/db.ts` - MongoDB connection
- [x] `src/lib/auth.ts` - JWT utilities
- [x] `src/lib/qr.ts` - QR code generation
- [x] `src/models/User.ts` - User schema with password hashing
- [x] `src/models/MedicalInfo.ts` - Medical information schema
- [x] `src/models/Medicine.ts` - Medicine tracking schema
- [x] `src/app/api/auth/signup/route.ts` - User registration
- [x] `src/app/api/auth/login/route.ts` - User login
- [x] `src/app/api/user/profile/route.ts` - Get user profile
- [x] `src/app/api/medical-info/route.ts` - CRUD medical info
- [x] `src/app/api/medicines/route.ts` - List & create medicines
- [x] `src/app/api/medicines/[id]/route.ts` - Update & delete medicines
- [x] `src/app/api/qr/[qrCode]/route.ts` - Public QR access

## API Endpoints

### Auth
```
POST   /api/auth/signup         - Register new user (no auth)
POST   /api/auth/login          - Login user (no auth)
```

### User
```
GET    /api/user/profile        - Get profile (auth required)
```

### Medical Info
```
GET    /api/medical-info        - Get medical info (auth required)
POST   /api/medical-info        - Create/update medical info (auth required)
PATCH  /api/medical-info        - Update fields (auth required)
```

### Medicines
```
GET    /api/medicines           - List medicines (auth required)
POST   /api/medicines           - Add medicine (auth required)
PATCH  /api/medicines/[id]      - Update medicine (auth required)
DELETE /api/medicines/[id]      - Delete medicine (auth required)
```

### QR (Public)
```
GET    /api/qr/[qrCode]         - Get medical info by QR (NO auth)
```

## Authentication Header

All endpoints except signup, login, and QR require:

```
Authorization: Bearer <JWT_TOKEN>
```

## Example: Complete Flow

### 1. Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Response includes `token` and `qrPublicUrl`.

### 2. Update Medical Info
```bash
curl -X POST http://localhost:3000/api/medical-info \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "bloodGroup": "O+",
    "allergies": ["Peanuts"],
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+1234567890",
      "relationship": "Spouse"
    }
  }'
```

### 3. Add Medicine
```bash
curl -X POST http://localhost:3000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Aspirin",
    "dosage": "500mg",
    "frequency": "Twice daily",
    "purpose": "Pain relief"
  }'
```

### 4. Public QR Access (No Auth)
```bash
curl http://localhost:3000/api/qr/a1b2c3d4-e5f6-4000-8001-k0l1m2n3o4p5
```

## Security Features

| Feature | Implementation |
|---------|-----------------|
| Passwords | bcrypt hashing (10 rounds) |
| Auth | JWT tokens (7d expiry) |
| Data Scoping | User ID verification on every request |
| Ownership | 403 Forbidden if user doesn't own resource |
| QR Privacy | Only public medical data exposed |
| Caching | QR results cached 5 min (safe for emergency data) |

## Database Indexes

```typescript
// Automatic indexes created by Mongoose:
User
├── email (unique)
└── qrCode (unique, sparse)

MedicalInfo
└── userId (unique, indexed)

Medicine
├── userId (indexed)
└── userId + isActive (compound index)
```

## Error Codes

```
400 - Bad Request (missing fields, invalid data)
401 - Unauthorized (missing/invalid token)
403 - Forbidden (not owner of resource)
404 - Not Found (resource doesn't exist)
409 - Conflict (email already exists)
500 - Server Error
```

## Common Issues

### "Cannot find module mongoose"
```bash
npm install mongoose
```

### "JWT_SECRET is not defined"
Add to `.env.local`:
```env
JWT_SECRET=your_secret_key_minimum_32_characters_long
```

### "MongooseServerSelectionError"
Check:
1. MONGODB_URI is correct in `.env.local`
2. MongoDB cluster is running
3. IP whitelist includes your machine

### Token invalid
- Check `Authorization: Bearer <TOKEN>` format
- Ensure token hasn't expired (default 7 days)
- Verify JWT_SECRET matches between signup and request

## Next Steps

1. Install dependencies: `npm install mongoose bcrypt jsonwebtoken`
2. Configure `.env.local` with MongoDB and JWT secret
3. Test endpoints with curl or Postman
4. Integrate into React components
5. Add password reset functionality
6. Add email verification
7. Implement refresh token rotation

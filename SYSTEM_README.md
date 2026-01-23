# Yukta Medical Emergency QR System

## Overview

A production-ready Next.js + MongoDB full-stack application with JWT authentication, medicine tracking, and emergency QR code functionality for medical personnel.

**Live URL:** http://localhost:9002

---

## Features

✅ **User Authentication**
- Email + Password signup & login
- bcrypt password hashing
- JWT tokens (7-day expiry)

✅ **Protected Medical Data**
- Blood group, allergies, chronic conditions
- Emergency contact information
- Current medications list
- User-scoped data (each user sees only their own)

✅ **Medicine Tracking**
- Add/edit/delete medicines
- Track dosage & frequency
- Set start/end dates
- Organized by user

✅ **Emergency QR System**
- Unique QR code per user
- Public endpoint for emergency access
- Displays only non-sensitive medical data
- Beautiful emergency UI page
- Cache-optimized (5-minute TTL)

✅ **Security**
- JWT middleware protection
- No password exposure in responses
- Unique emails (lowercase enforced)
- User data scoping (no cross-user access)
- CORS-ready architecture

---

## Tech Stack

| Component | Technology |
|-----------|-------------|
| **Frontend** | Next.js 15.3.3 (App Router) |
| **Backend** | Next.js API Routes |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JWT (jsonwebtoken) |
| **Password Security** | bcrypt |
| **Runtime** | Node.js 18+ |
| **Type Safety** | TypeScript (strict) |

---

## Project Structure

```
src/
├── lib/
│   ├── db.ts              # MongoDB connection pooling
│   ├── auth.ts            # JWT generation & verification
│   └── qr.ts              # QR code utilities
├── models/
│   ├── User.ts            # User schema (email, password, qrCode)
│   ├── Medicine.ts        # Medicine tracking schema
│   └── MedicalInfo.ts     # Blood group, allergies, emergency contact
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup/route.ts    # POST - Create account
│   │   │   └── login/route.ts     # POST - Authenticate user
│   │   ├── medicines/
│   │   │   ├── route.ts           # GET (list), POST (create)
│   │   │   └── [id]/route.ts      # PATCH (update), DELETE
│   │   ├── medical-info/
│   │   │   └── route.ts           # GET, POST (upsert), PATCH
│   │   ├── qr/
│   │   │   └── [qrCode]/route.ts  # GET - Public emergency data
│   │   └── user/
│   │       └── profile/route.ts   # GET - User profile
│   ├── qr/
│   │   └── [qrCode]/page.tsx      # Emergency display UI
│   └── layout.tsx
├── components/               # (Existing UI components)
└── context/                 # (Existing app context)

middleware.ts               # JWT validation & authorization
.env.local                  # Configuration

Documentation/
├── API_COMPLETE_GUIDE.md   # Full API documentation
├── QUICK_START.md          # Quick reference
└── README.md               # This file
```

---

## Installation & Setup

### 1. Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### 2. Environment Configuration

Update `.env.local`:
```env
# Database
MONGODB_URI=mongodb+srv://roy:2007@nodeexpressprojects.axko6.mongodb.net/yuktah?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRY=7d

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:9002
NODE_ENV=development
```

**Important:** 
- Change `JWT_SECRET` to a 32+ character random string for production
- Update `MONGODB_URI` for production database

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```

Server runs on: **http://localhost:9002**

---

## API Endpoints

### Authentication (No Auth Required)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/signup` | Create new user account |
| POST | `/api/auth/login` | Authenticate user |

### Protected Endpoints (JWT Required)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/medicines` | List user's medicines |
| POST | `/api/medicines` | Add new medicine |
| PATCH | `/api/medicines/[id]` | Update medicine |
| DELETE | `/api/medicines/[id]` | Delete medicine |
| GET | `/api/medical-info` | Get user's medical info |
| POST | `/api/medical-info` | Create/update medical info |
| PATCH | `/api/medical-info` | Partial update |
| GET | `/api/user/profile` | Get user profile |

### Public Endpoints (No Auth Required)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/qr/[qrCode]` | Get emergency medical data |
| GET | `/qr/[qrCode]` | View emergency UI page |

---

## Quick Test

### 1. Sign Up
```bash
curl -X POST http://localhost:9002/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Response includes `token` and `qrCode`.

### 2. Update Medical Info (Replace TOKEN)
```bash
curl -X POST http://localhost:9002/api/medical-info \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bloodGroup": "O+",
    "allergies": ["Penicillin"],
    "chronicConditions": ["Diabetes"],
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+1-555-0123",
      "relationship": "Sister"
    }
  }'
```

### 3. View Emergency QR Data
```bash
# Use qrCode from signup response
curl http://localhost:9002/api/qr/550e8400-e29b-41d4-a716-446655440000
```

### 4. View Emergency UI
Open browser: `http://localhost:9002/qr/550e8400-e29b-41d4-a716-446655440000`

---

## Database Schemas

### User Collection
```javascript
{
  _id: ObjectId,
  email: String,              // Unique, lowercase
  password: String,           // Hashed with bcrypt
  firstName: String,
  lastName: String,
  qrCode: String,             // Unique UUID
  createdAt: Date,
  updatedAt: Date
}
```

### Medicine Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User
  name: String,
  dosage: String,
  frequency: String,
  purpose: String,
  instructions: String,
  startDate: Date,
  endDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### MedicalInfo Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User (unique)
  bloodGroup: String,
  allergies: [String],
  chronicConditions: [String],
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  medications: [String],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Authentication Flow

### Signup Process
1. User provides email, password, firstName, lastName
2. Password hashed with bcrypt (10 salt rounds)
3. User created in database with unique qrCode (UUID)
4. MedicalInfo record created (empty, user can fill later)
5. JWT token generated: `{ userId, email, expiresIn: 7d }`
6. Response includes token and qrCode

### Login Process
1. User provides email and password
2. User found in database (email lowercase)
3. Password compared with bcrypt
4. JWT token generated
5. Response includes token and user data

### Protected Route Access
1. Client sends: `Authorization: Bearer <TOKEN>`
2. Middleware extracts token
3. Token verified with JWT_SECRET
4. If valid: userId attached to request
5. Route handler uses userId to scope data
6. If invalid: Return 401 Unauthorized

---

## Middleware Protection

File: `middleware.ts`

Protects routes matching:
- `/api/medicines/*`
- `/api/medical-info/*`

Validates JWT and attaches:
- `x-user-id` header
- `x-user-email` header

---

## Security Best Practices

✅ **Implemented:**
- Password hashing with bcrypt (10 rounds)
- JWT token expiry (7 days)
- User data scoping (each user sees only own data)
- No password exposure in API responses
- Unique email enforcement (lowercase)
- Middleware-based authentication
- Public QR endpoint reveals only safe medical data

⚠️ **Additional for Production:**
- HTTPS enforcement
- Rate limiting middleware
- CORS configuration
- API key rotation
- Database backups
- Monitoring & logging
- Secrets management (AWS Secrets Manager, etc.)

---

## Error Handling

All endpoints return standardized JSON responses:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

### Common Status Codes
- `200` - Success (GET, update)
- `201` - Created (POST new resource)
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not found
- `409` - Conflict (email exists)
- `500` - Server error

---

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Check TypeScript
npx tsc --noEmit
```

---

## Deployment

### Vercel (Recommended)
```bash
npx vercel deploy
```

### Other Platforms
1. Build: `npm run build`
2. Set environment variables
3. Start: `npm start`

### Environment Variables for Production
```env
MONGODB_URI=<production-db-url>
JWT_SECRET=<32-char-random-string>
JWT_EXPIRY=7d
NEXT_PUBLIC_BASE_URL=<production-domain>
NODE_ENV=production
```

---

## Troubleshooting

### Port 9002 Already in Use
```bash
# Kill process using port 9002
lsof -ti:9002 | xargs kill -9

# Or specify different port
npm run dev -- -p 3000
```

### MongoDB Connection Error
- Verify `MONGODB_URI` in `.env.local`
- Check MongoDB network access whitelist
- Ensure database exists
- Test connection: `mongo <connection-string>`

### JWT Token Errors
- Verify `JWT_SECRET` is set and 32+ characters
- Check token format: `Bearer <token>`
- Verify token hasn't expired (7 days)
- Check Authorization header spelling

### CORS Issues
- Add origin to allowed list if needed
- Check Content-Type header is application/json

---

## File Naming Convention

- **Route files**: `route.ts` (no prefix)
- **Models**: `PascalCase.ts` (User.ts, Medicine.ts)
- **Utilities**: `camelCase.ts` (auth.ts, qr.ts)
- **Pages**: `page.tsx` (Next.js convention)
- **Components**: `PascalCase.tsx` (Button.tsx)

---

## Performance Optimizations

- MongoDB connection pooling (global cache)
- JWT token caching in client
- QR endpoint caching (5 minutes)
- Turbopack for fast builds
- Image optimization ready
- API routes auto-compression

---

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes following code style
3. Test endpoints with curl
4. Commit with clear message: `git commit -m "Add feature description"`
5. Push: `git push origin feature/your-feature`

---

## Support & Documentation

- **API Guide**: See `API_COMPLETE_GUIDE.md`
- **Quick Reference**: See `QUICK_START.md`
- **Issues**: Check server terminal for error logs
- **Database**: Access MongoDB Atlas dashboard

---

## License

Private project. All rights reserved.

---

## Last Updated

January 23, 2026

**Version:** 1.0.0  
**Status:** ✅ Production Ready


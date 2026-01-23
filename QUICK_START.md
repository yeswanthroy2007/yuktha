# ⚡ QUICK START REFERENCE

## System Status ✅

- **Database:** MongoDB Atlas connected
- **Server:** http://localhost:9002 (Turbopack)
- **Auth:** JWT + bcrypt
- **Middleware:** Protected routes enabled

---

## 📋 Files Structure

```
src/
├── lib/
│   ├── db.ts          # MongoDB connection pool
│   ├── auth.ts        # JWT utilities
│   └── qr.ts          # QR code generation
├── models/
│   ├── User.ts        # User schema
│   ├── Medicine.ts    # Medicine schema
│   └── MedicalInfo.ts # Medical info schema
├── app/
│   ├── api/
│   │   ├── auth/signup     # POST create user
│   │   ├── auth/login      # POST authenticate
│   │   ├── medicines       # GET/POST/PATCH/DELETE
│   │   ├── medical-info    # GET/POST/PATCH
│   │   └── qr/[qrCode]     # GET public data
│   └── qr/[qrCode]/page.tsx  # Emergency display UI

middleware.ts         # JWT validation & protection
```

---

## 🚀 One-Minute Test

### 1. Sign Up
```bash
curl -X POST http://localhost:9002/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123","firstName":"John","lastName":"Doe"}'
```

**Copy the returned `token`**

### 2. Update Medical Info
```bash
curl -X POST http://localhost:9002/api/medical-info \
  -H "Authorization: Bearer TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"bloodGroup":"O+","allergies":["Peanuts"],"emergencyContact":{"name":"Mom","phone":"911","relationship":"Mother"}}'
```

### 3. Open QR Page
Visit: `http://localhost:9002/qr/YOUR_QR_CODE_FROM_SIGNUP`

---

## 🔐 Authentication

**How it works:**
1. User signs up with email + password
2. Password hashed with bcrypt (10 rounds)
3. JWT token generated (7-day expiry)
4. Middleware verifies JWT on protected routes
5. userId extracted from token & used to scope data

**Token Format:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📱 API Endpoints

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/api/auth/signup` | ❌ | Create account + get JWT |
| POST | `/api/auth/login` | ❌ | Login + get JWT |
| GET | `/api/medical-info` | ✅ | Fetch user's medical data |
| POST | `/api/medical-info` | ✅ | Create/update medical data |
| PATCH | `/api/medical-info` | ✅ | Partial update |
| GET | `/api/medicines` | ✅ | List user's medicines |
| POST | `/api/medicines` | ✅ | Add medicine |
| PATCH | `/api/medicines/[id]` | ✅ | Update medicine |
| DELETE | `/api/medicines/[id]` | ✅ | Delete medicine |
| GET | `/api/qr/[qrCode]` | ❌ | Public emergency data |
| GET | `/qr/[qrCode]` | ❌ | Emergency UI page |

---

## 🛡️ Security Features

✅ **User Scoping:** Each user only sees their own data
✅ **JWT Protection:** Middleware validates tokens
✅ **Password Hashing:** bcrypt with salt rounds
✅ **Public QR:** Exposé only non-sensitive medical data
✅ **No Password in Response:** Password field marked select:false
✅ **Email Lowercase:** Prevents duplicate accounts
✅ **Unique QR Codes:** UUID v4 generation

---

## 🐛 Debugging Tips

### Check if MongoDB is connected:
```bash
# Should return success with data
curl http://localhost:9002/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"wrong"}'
```

### Verify JWT is working:
```bash
# Should return 401 if token missing/invalid
curl http://localhost:9002/api/medicines -H "Authorization: Bearer invalid"
```

### View server logs:
- Terminal shows all requests
- Check for "POST /api/auth/signup 201"

---

## 📊 Database Schema

### User
```javascript
{
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  qrCode: String (unique UUID),
  createdAt: Date,
  updatedAt: Date
}
```

### Medicine
```javascript
{
  userId: ObjectId → User,
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

### MedicalInfo
```javascript
{
  userId: ObjectId → User (unique),
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

## ⚙️ Environment Variables

```env
MONGODB_URI=mongodb+srv://roy:2007@nodeexpressprojects.axko6.mongodb.net/yuktah?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_with_32_characters_minimum
JWT_EXPIRY=7d
NEXT_PUBLIC_BASE_URL=http://localhost:9002
NODE_ENV=development
```

---

## 🚦 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET, POST update) |
| 201 | Created (POST new) |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Not found |
| 409 | Conflict (email exists) |
| 500 | Server error |

---

## 🎯 User Flow

```
1. User visits app
   ↓
2. Signs up (email + password)
   ↓ (JWT token returned)
3. Updates medical info (blood group, allergies, etc)
   ↓
4. Adds medicines to track
   ↓
5. In emergency: Share QR code link
   ↓
6. Medical personnel scan → See name, blood group, allergies, emergency contact
```

---

## 🔄 Common Tasks

### Signup New User
```bash
curl -X POST http://localhost:9002/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "firstName": "FirstName",
    "lastName": "LastName"
  }'
```

### Get Token from Login
```bash
curl -X POST http://localhost:9002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

### Save Medical Info
```bash
curl -X POST http://localhost:9002/api/medical-info \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bloodGroup": "O+",
    "allergies": ["Penicillin", "Nuts"],
    "chronicConditions": ["Diabetes"],
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+1-555-0123",
      "relationship": "Sister"
    },
    "medications": ["Insulin", "Metformin"]
  }'
```

### Add Medicine
```bash
curl -X POST http://localhost:9002/api/medicines \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Insulin",
    "dosage": "10 units",
    "frequency": "Twice daily",
    "purpose": "Blood sugar control",
    "instructions": "Inject before meals"
  }'
```

### List Medicines
```bash
curl http://localhost:9002/api/medicines \
  -H "Authorization: Bearer $TOKEN"
```

### View QR Emergency Data
```bash
# Replace with actual QR code from signup
curl http://localhost:9002/api/qr/550e8400-e29b-41d4-a716-446655440000
```

---

## 📝 Notes

- Passwords must be minimum 6 characters
- Email must be valid format
- QR codes are unique UUIDs (not actual QR image)
- Medical info updates replace entire record
- Medicines are per-user and timezone-aware
- JWT tokens expire in 7 days (configurable)
- All timestamps in UTC/ISO format


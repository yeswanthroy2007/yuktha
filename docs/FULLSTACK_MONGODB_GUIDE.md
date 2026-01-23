# Next.js MongoDB Full-Stack Implementation Guide

Complete guide for implementing authentication, medicine tracking, and QR codes in your Next.js application.

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [API Documentation](#api-documentation)
3. [Authentication Flow](#authentication-flow)
4. [User-Scoped Operations](#user-scoped-operations)
5. [QR Code System](#qr-code-system)
6. [Code Examples](#code-examples)
7. [Error Handling](#error-handling)
8. [Security Considerations](#security-considerations)

---

## Installation & Setup

### 1. Install Dependencies

```bash
npm install mongoose bcrypt jsonwebtoken
npm install -D @types/jsonwebtoken
```

### 2. Set Environment Variables

Create `.env.local` with:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/yukta?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_with_32_characters_minimum
JWT_EXPIRY=7d
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### 3. File Structure

```
src/
├── lib/
│   ├── db.ts              # MongoDB connection
│   ├── auth.ts            # JWT utilities
│   └── qr.ts              # QR code generation
├── models/
│   ├── User.ts            # User schema
│   ├── MedicalInfo.ts     # Medical info schema
│   └── Medicine.ts        # Medicine schema
└── app/
    └── api/
        ├── auth/
        │   ├── signup/route.ts
        │   └── login/route.ts
        ├── user/
        │   └── profile/route.ts
        ├── medical-info/route.ts
        ├── medicines/
        │   ├── route.ts
        │   └── [id]/route.ts
        └── qr/
            └── [qrCode]/route.ts
```

---

## API Documentation

### Authentication APIs

#### POST `/api/auth/signup`

**Create a new user account**

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "qrCode": "a1b2c3d4-e5f6-4000-8001-k0l1m2n3o4p5",
    "qrPublicUrl": "http://localhost:3000/qr/a1b2c3d4-e5f6-4000-8001-k0l1m2n3o4p5"
  },
  "message": "Signup successful. Please update your medical information."
}
```

**Error Responses:**
- `400` - Missing required fields
- `409` - User already exists with this email
- `500` - Server error

---

#### POST `/api/auth/login`

**Authenticate and get JWT token**

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "qrCode": "a1b2c3d4-e5f6-4000-8001-k0l1m2n3o4p5",
    "qrPublicUrl": "http://localhost:3000/qr/a1b2c3d4-e5f6-4000-8001-k0l1m2n3o4p5"
  }
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid email or password
- `500` - Server error

---

### User APIs

#### GET `/api/user/profile`

**Get current user's profile (Requires JWT token)**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "qrCode": "a1b2c3d4-e5f6-4000-8001-k0l1m2n3o4p5",
    "qrPublicUrl": "http://localhost:3000/qr/a1b2c3d4-e5f6-4000-8001-k0l1m2n3o4p5",
    "createdAt": "2026-01-23T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Unauthorized (missing or invalid token)
- `404` - User not found
- `500` - Server error

---

### Medical Information APIs

#### GET `/api/medical-info`

**Get user's medical information (Requires JWT token)**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "bloodGroup": "O+",
    "allergies": ["Peanuts", "Penicillin"],
    "chronicConditions": ["Hypertension", "Type 2 Diabetes"],
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+1234567890",
      "relationship": "Spouse"
    },
    "medications": ["Metformin 500mg", "Lisinopril 10mg"],
    "createdAt": "2026-01-23T10:00:00.000Z",
    "updatedAt": "2026-01-23T10:00:00.000Z"
  }
}
```

---

#### POST `/api/medical-info`

**Create or update medical information (Requires JWT token)**

**Request:**
```json
{
  "bloodGroup": "O+",
  "allergies": ["Peanuts", "Penicillin"],
  "chronicConditions": ["Hypertension"],
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+1234567890",
    "relationship": "Spouse"
  },
  "medications": ["Metformin 500mg"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* medical info object */ },
  "message": "Medical information updated successfully"
}
```

---

#### PATCH `/api/medical-info`

**Update specific medical information fields (Requires JWT token)**

**Request:**
```json
{
  "bloodGroup": "AB-",
  "allergies": ["Peanuts"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated medical info object */ }
}
```

---

### Medicine APIs

#### GET `/api/medicines`

**Get all medicines for user (Requires JWT token)**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439011",
      "name": "Aspirin",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "purpose": "Pain relief",
      "instructions": "Take with food",
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": null,
      "isActive": true,
      "createdAt": "2026-01-23T10:00:00.000Z",
      "updatedAt": "2026-01-23T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### POST `/api/medicines`

**Add a new medicine (Requires JWT token)**

**Request:**
```json
{
  "name": "Aspirin",
  "dosage": "500mg",
  "frequency": "Twice daily",
  "purpose": "Pain relief",
  "instructions": "Take with food",
  "startDate": "2026-01-23",
  "endDate": "2026-02-23"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { /* medicine object */ },
  "message": "Medicine added successfully"
}
```

---

#### PATCH `/api/medicines/[id]`

**Update a medicine (Requires JWT token)**

**Request:**
```json
{
  "dosage": "1000mg",
  "isActive": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated medicine object */ },
  "message": "Medicine updated successfully"
}
```

---

#### DELETE `/api/medicines/[id]`

**Delete a medicine (Requires JWT token)**

**Response (200):**
```json
{
  "success": true,
  "message": "Medicine deleted successfully"
}
```

---

### QR Code APIs

#### GET `/api/qr/[qrCode]`

**Get medical information for a QR code (NO authentication required)**

**URL:**
```
GET /api/qr/a1b2c3d4-e5f6-4000-8001-k0l1m2n3o4p5
```

**Response (200):**
```json
{
  "success": true,
  "patient": {
    "name": "John Doe"
  },
  "medical": {
    "bloodGroup": "O+",
    "allergies": ["Peanuts", "Penicillin"],
    "chronicConditions": ["Hypertension"],
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+1234567890",
      "relationship": "Spouse"
    },
    "medications": ["Metformin 500mg"]
  }
}
```

**Error Responses:**
- `400` - Invalid QR code format
- `404` - QR code not found or deactivated
- `500` - Server error

---

## Authentication Flow

### 1. Signup Flow

```
User fills signup form
         ↓
POST /api/auth/signup
         ↓
Server hashes password with bcrypt
         ↓
Creates user in MongoDB
         ↓
Generates unique QR code (UUID v4)
         ↓
Creates empty MedicalInfo record
         ↓
Generates JWT token
         ↓
Returns token + QR code to client
```

### 2. Login Flow

```
User enters email + password
         ↓
POST /api/auth/login
         ↓
Server finds user by email
         ↓
Compares password with bcrypt
         ↓
Generates JWT token
         ↓
Returns token to client
```

### 3. Token Usage

Store token in client (localStorage or cookie):

```javascript
// After login/signup
const token = response.data.token;
localStorage.setItem('auth_token', token);

// Use token in subsequent requests
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

---

## User-Scoped Operations

### Ownership Verification

Every API ensures user can only access/modify their own data:

```typescript
// Example from medicines API
const authUser = await getAuthenticatedUser(request);
const medicine = await Medicine.findById(medicineId);

// Verify ownership
if (medicine.userId.toString() !== authUser.userId) {
  return NextResponse.json(
    { error: 'Forbidden: You can only update your own medicines' },
    { status: 403 }
  );
}
```

### Scoped Queries

All user-specific data queries include userId filter:

```typescript
// Get medicines only for authenticated user
const medicines = await Medicine.find({ userId: authUser.userId });

// Get medical info only for authenticated user
const medicalInfo = await MedicalInfo.findOne({ userId: authUser.userId });
```

---

## QR Code System

### QR Code Features

1. **Unique per user** - Each user gets one unique QR code
2. **Generated at signup** - Created automatically during registration
3. **Public access** - Anyone can scan to see medical info
4. **Read-only** - No sensitive data exposed
5. **Cached** - Results cached for 5 minutes

### QR Code Data Flow

```
User scans QR code
         ↓
Opens /qr/[qrCode] URL
         ↓
GET /api/qr/[qrCode] (NO auth)
         ↓
Server finds user by QR code
         ↓
Fetches public medical data
         ↓
Returns only: name, blood group, allergies, medications, contact
         ↓
NOT exposed: email, password, private user data
```

### QR Code Format

```
UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
Example: a1b2c3d4-e5f6-4000-8001-k0l1m2n3o4p5
Entropy: 128 bits
Security: Non-guessable, cryptographically secure
```

---

## Code Examples

### Example 1: Signup Flow in React

```typescript
// app/signup.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();

      // Store token
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('qr_code', data.user.qrCode);

      // Redirect to complete medical info
      router.push('/complete-medical-info');
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <input
        type="text"
        placeholder="First Name"
        value={formData.firstName}
        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
      />
      <input
        type="text"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### Example 2: Add Medicine

```typescript
// components/AddMedicine.tsx
'use client';

import { useState } from 'react';

export default function AddMedicine() {
  const [medicineData, setMedicineData] = useState({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    purpose: '',
    instructions: '',
  });

  const handleAddMedicine = async () => {
    const token = localStorage.getItem('auth_token');

    const response = await fetch('/api/medicines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(medicineData),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Medicine added:', data.data);
      setMedicineData({ name: '', dosage: '', frequency: 'Once daily', purpose: '', instructions: '' });
    }
  };

  return (
    <div>
      <input
        placeholder="Medicine Name"
        value={medicineData.name}
        onChange={(e) => setMedicineData({ ...medicineData, name: e.target.value })}
      />
      <input
        placeholder="Dosage (e.g., 500mg)"
        value={medicineData.dosage}
        onChange={(e) => setMedicineData({ ...medicineData, dosage: e.target.value })}
      />
      <select
        value={medicineData.frequency}
        onChange={(e) => setMedicineData({ ...medicineData, frequency: e.target.value })}
      >
        <option>Once daily</option>
        <option>Twice daily</option>
        <option>Thrice daily</option>
        <option>As needed</option>
      </select>
      <button onClick={handleAddMedicine}>Add Medicine</button>
    </div>
  );
}
```

### Example 3: Update Medical Info

```typescript
// app/medical-info.tsx
'use client';

import { useEffect, useState } from 'react';

export default function MedicalInfoPage() {
  const [medicalInfo, setMedicalInfo] = useState(null);

  useEffect(() => {
    const fetchMedicalInfo = async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/medical-info', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMedicalInfo(data.data);
      }
    };

    fetchMedicalInfo();
  }, []);

  const handleUpdateMedicalInfo = async () => {
    const token = localStorage.getItem('auth_token');

    await fetch('/api/medical-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(medicalInfo),
    });
  };

  return (
    <div>
      <h2>Medical Information</h2>
      {medicalInfo && (
        <>
          <select
            value={medicalInfo.bloodGroup}
            onChange={(e) =>
              setMedicalInfo({ ...medicalInfo, bloodGroup: e.target.value })
            }
          >
            <option>O+</option>
            <option>O-</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
          </select>
          <button onClick={handleUpdateMedicalInfo}>Save</button>
        </>
      )}
    </div>
  );
}
```

### Example 4: Public QR Access

```typescript
// app/qr/[qrCode]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PublicQRPage() {
  const params = useParams();
  const qrCode = params.qrCode as string;
  const [medicalData, setMedicalData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQRData = async () => {
      try {
        const response = await fetch(`/api/qr/${qrCode}`);
        if (response.ok) {
          const data = await response.json();
          setMedicalData(data);
        }
      } catch (error) {
        console.error('Failed to fetch QR data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQRData();
  }, [qrCode]);

  if (loading) return <div>Loading emergency information...</div>;
  if (!medicalData) return <div>QR code not found</div>;

  return (
    <div>
      <h1>Emergency Medical Information</h1>
      <h2>{medicalData.patient.name}</h2>
      <div>
        <h3>Blood Group: {medicalData.medical.bloodGroup}</h3>
        <h3>Allergies: {medicalData.medical.allergies.join(', ')}</h3>
        <h3>Medications: {medicalData.medical.medications.join(', ')}</h3>
        <h3>Emergency Contact: {medicalData.medical.emergencyContact?.name}</h3>
      </div>
    </div>
  );
}
```

---

## Error Handling

### Standard Error Responses

All APIs follow this error format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET request returns data |
| 201 | Created | POST creates new resource |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Trying to access another user's data |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Email already exists (signup) |
| 500 | Server Error | Database connection issues |

### Error Handling in React

```typescript
async function apiCall(endpoint: string, method = 'GET', data = null) {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    // Handle specific errors
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    if (response.status === 403) {
      console.error('Access denied - you do not have permission');
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

---

## Security Considerations

### 1. Password Security

- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ Passwords never returned in API responses
- ✅ Password field excluded from queries by default

### 2. JWT Token Security

- ✅ Signed with strong secret (change in production)
- ✅ Expiry time set to 7 days (configurable)
- ✅ Always transmitted in Authorization header (not in URL)
- ✅ Verified on every protected request

### 3. Data Privacy

- ✅ Medical info scoped to authenticated user
- ✅ Medicines scoped to authenticated user
- ✅ QR code endpoint only exposes non-sensitive medical data
- ✅ No passwords, emails, or private data in QR responses

### 4. Ownership Verification

- ✅ Every update verifies user owns the resource
- ✅ userId checked against authenticated user
- ✅ Returns 403 Forbidden if unauthorized

### 5. MongoDB Security

- ✅ Use IP whitelist in MongoDB Atlas
- ✅ Use strong database password
- ✅ Enable MFA on MongoDB account
- ✅ Use environment variables for credentials

### 6. Production Checklist

- [ ] Change `JWT_SECRET` to a strong random string (32+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS for all requests
- [ ] Add rate limiting to auth endpoints
- [ ] Enable CORS with specific origins
- [ ] Add logging/monitoring for failed auth attempts
- [ ] Implement refresh token rotation
- [ ] Add email verification for signup
- [ ] Add password reset functionality
- [ ] Use environment-specific database URLs

---

## Database Schema Reference

### User Schema

```typescript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  password: String (hashed),
  firstName: String,
  lastName: String,
  qrCode: String (unique),
  createdAt: Date,
  updatedAt: Date
}
```

### Medical Info Schema

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref User),
  bloodGroup: String ('O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'),
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

### Medicine Schema

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref User),
  name: String,
  dosage: String,
  frequency: String,
  purpose: String,
  startDate: Date,
  endDate: Date (optional),
  instructions: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

**Implementation Complete** ✅  
All files created and ready to use.

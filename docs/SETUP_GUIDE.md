# MongoDB Full-Stack Setup Guide

Complete step-by-step guide to get your Next.js + MongoDB authentication system running.

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free at https://www.mongodb.com/cloud/atlas)
- Next.js project with App Router

## Step 1: Install Dependencies

```bash
npm install mongoose bcrypt jsonwebtoken
npm install -D @types/jsonwebtoken @types/bcrypt
```

Verify installation:
```bash
npm ls mongoose bcrypt jsonwebtoken
```

## Step 2: Create MongoDB Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user with username/password
4. Whitelist your IP address
5. Copy the connection string: `mongodb+srv://user:password@cluster.mongodb.net/dbname`

## Step 3: Configure Environment Variables

Create `.env.local` in your project root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster-abc123.mongodb.net/yukta?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_minimum_32_characters_long
JWT_EXPIRY=7d

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### Important Notes:
- Replace `username:password` with your MongoDB credentials
- Replace `cluster-abc123` with your actual cluster name
- JWT_SECRET must be at least 32 characters (use something like `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- Never commit `.env.local` to version control

## Step 4: Verify Files Are Created

Check that these files exist:

```
src/
├── lib/
│   ├── db.ts ✓
│   ├── auth.ts ✓
│   └── qr.ts ✓
├── models/
│   ├── User.ts ✓
│   ├── MedicalInfo.ts ✓
│   └── Medicine.ts ✓
└── app/
    └── api/
        ├── auth/
        │   ├── signup/route.ts ✓
        │   └── login/route.ts ✓
        ├── user/
        │   └── profile/route.ts ✓
        ├── medical-info/route.ts ✓
        ├── medicines/
        │   ├── route.ts ✓
        │   └── [id]/route.ts ✓
        └── qr/
            └── [qrCode]/route.ts ✓

docs/
├── FULLSTACK_MONGODB_GUIDE.md ✓
└── API_QUICK_REFERENCE.md ✓
```

## Step 5: Test the Setup

### Option A: Using curl

#### 1. Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPassword123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Save the `token` from the response.

#### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPassword123"
  }'
```

#### 3. Get Profile (use token from login)
```bash
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 4. Update Medical Info
```bash
curl -X POST http://localhost:3000/api/medical-info \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "bloodGroup": "O+",
    "allergies": ["Peanuts"],
    "emergencyContact": {
      "name": "Emergency Person",
      "phone": "+1234567890",
      "relationship": "Friend"
    }
  }'
```

#### 5. Add Medicine
```bash
curl -X POST http://localhost:3000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Aspirin",
    "dosage": "500mg",
    "frequency": "Twice daily",
    "purpose": "Pain relief"
  }'
```

### Option B: Using Postman

1. Import the collection (if available)
2. Set up environment variables:
   - `base_url` = http://localhost:3000
   - `token` = (set after login)
3. Run requests in order:
   - POST /api/auth/signup
   - POST /api/auth/login (copy token to environment)
   - GET /api/user/profile
   - POST /api/medical-info
   - POST /api/medicines
   - GET /api/medicines

## Step 6: Troubleshooting

### Error: "Cannot find module 'mongoose'"

```bash
npm install mongoose
npm install -D @types/mongoose
```

### Error: "MongooseServerSelectionError"

1. Check MONGODB_URI is correct in `.env.local`
2. Verify MongoDB cluster is running
3. Verify IP whitelist in MongoDB Atlas includes your machine
4. Try ping to test connection:
   ```bash
   node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(()=>console.log('Connected')).catch(e=>console.error(e))"
   ```

### Error: "JWT_SECRET must be defined"

Add to `.env.local`:
```env
JWT_SECRET=your_minimum_32_character_secret_key_generate_with_openssl_or_crypto
```

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Error: "Invalid email or password" on login

1. Check email exists (case-sensitive)
2. Check password is correct
3. Verify MongoDB is connected
4. Check database contains users collection

### Middleware/Auth not working

1. Ensure JWT_SECRET matches between signup and other routes
2. Check Authorization header format: `Bearer <TOKEN>`
3. Verify token hasn't expired (default 7 days)
4. Check token is URL-safe (use tools/postman, not browser)

## Step 7: Integrate into React Components

### Authentication Context (Optional)

```typescript
// app/context/auth-context.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  // Load token from storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });

    if (!res.ok) throw new Error('Signup failed');

    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('auth_token', data.token);
  };

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error('Login failed');

    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('auth_token', data.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

### Signup Component

```typescript
// app/signup.tsx
'use client';

import { useAuth } from '@/context/auth-context';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );
      router.push('/medical-info');
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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

## Step 8: Production Deployment

### Before Deploying:

- [ ] Change JWT_SECRET to a strong random string
- [ ] Set NODE_ENV=production
- [ ] Verify MONGODB_URI works with production database
- [ ] Enable HTTPS
- [ ] Add rate limiting to auth endpoints
- [ ] Add email verification
- [ ] Add password reset functionality
- [ ] Set up logging/monitoring
- [ ] Test all endpoints in production

### Environment Variables for Vercel/Netlify:

Set in deployment platform dashboard:
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_production_secret
JWT_EXPIRY=7d
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NODE_ENV=production
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Test API endpoints
4. ✅ Create React components
5. Add password reset
6. Add email verification
7. Add refresh token rotation
8. Set up monitoring
9. Deploy to production

## Resources

- [MongoDB Docs](https://docs.mongodb.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [JWT Docs](https://jwt.io/)
- [bcrypt Docs](https://github.com/kelektiv/node.bcrypt.js)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## Support

If you encounter issues:
1. Check [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)
2. Check [FULLSTACK_MONGODB_GUIDE.md](FULLSTACK_MONGODB_GUIDE.md)
3. Review error messages carefully
4. Test endpoints with curl before React
5. Check MongoDB Atlas dashboard for connection logs

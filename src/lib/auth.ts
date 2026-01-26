/**
 * JWT and Authentication Utilities
 * Handles token generation, verification, and user authentication
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be defined and at least 32 characters long');
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  } as any);
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract JWT token from request headers or cookies
 */
export function extractToken(request: NextRequest): string | null {
  // First try to get from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1];
    }
  }

  // Then try to get from cookies
  const token = request.cookies.get('auth-token')?.value;
  return token || null;
}

/**
 * Get authenticated user from request
 * Returns userId if token is valid, null otherwise
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<{ userId: string; email: string } | null> {
  const token = extractToken(request);
  if (!token) {
    console.log('🔒 No token found in request');
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    console.log('🔒 Invalid token');
    return null;
  }

  console.log('✅ Authenticated user:', payload.email);
  return {
    userId: payload.userId,
    email: payload.email,
  };
}

/**
 * Set JWT token in HTTP-only cookie
 */
export function setAuthCookie(response: Response, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Clear auth cookie
 */
export function clearAuthCookie(response: Response): void {
  response.cookies.delete('auth-token');
}

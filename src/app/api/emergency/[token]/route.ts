/**
 * API Route: GET /api/emergency/[token]
 * 
 * Returns emergency information for a given token
 * NO AUTHENTICATION REQUIRED - Public endpoint
 * 
 * Security:
 * - Token must be valid UUID format
 * - Only returns emergency-relevant data
 * - No user ID, email, or password exposed
 */

import { NextRequest, NextResponse } from 'next/server';

interface EmergencyData {
  userName: string;
  bloodGroup: string;
  bloodGroupOther: string;
  allergies: string;
  allergiesOther: string;
  medications: string;
  medicationsOther: string;
  emergencyContact: string;
}

/**
 * In a real application, this would:
 * 1. Query the database for emergency info using the token
 * 2. Verify the token exists and hasn't expired
 * 3. Return only the public emergency fields
 * 
 * For this implementation, we simulate the database lookup
 * by fetching from localStorage (since we're using localStorage as our "database")
 */

export async function GET(
  request: NextRequest,
  context: { params: { token: string } }
) {
  try {
    const { token } = context.params;

    // Validate token format
    if (!token || !isValidUUID(token)) {
      return NextResponse.json(
        { error: 'Invalid emergency token format' },
        { status: 400 }
      );
    }

    /**
     * PRODUCTION IMPLEMENTATION:
     * Replace this with actual database lookup:
     * 
     * const emergencyRecord = await db.query(
     *   'SELECT * FROM emergency_tokens WHERE token = ? AND expires_at > NOW()',
     *   [token]
     * );
     * 
     * if (!emergencyRecord) {
     *   return NextResponse.json(
     *     { error: 'Invalid or expired emergency QR' },
     *     { status: 404 }
     *   );
     * }
     * 
     * const userInfo = await db.query(
     *   'SELECT emergency_info FROM users WHERE id = ?',
     *   [emergencyRecord.user_id]
     * );
     */

    // MOCK IMPLEMENTATION: This simulates database lookup
    const emergencyData = await getEmergencyDataFromToken(token);

    if (!emergencyData) {
      return NextResponse.json(
        { error: 'Invalid or expired emergency QR' },
        { status: 404 }
      );
    }

    // Return only public emergency fields
    return NextResponse.json(emergencyData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error in emergency info API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Validate UUID v4 format
 */
function isValidUUID(token: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(token);
}

/**
 * MOCK: Fetch emergency data by token
 * 
 * In production, this would query your database
 * For now, we simulate by checking if token exists in sessionStorage
 * and retrieving associated emergency info
 * 
 * Real implementation would:
 * 1. Query: SELECT * FROM emergency_tokens WHERE token = ?
 * 2. If found, Query: SELECT emergency_info FROM users WHERE id = token.user_id
 * 3. Return sanitized emergency info
 */
async function getEmergencyDataFromToken(token: string): Promise<EmergencyData | null> {
  // MOCK: Simulate database storage
  // In production, this retrieves from actual database
  
  // This is a placeholder implementation
  // In a real app:
  // - Database would store: { token, user_id, created_at, expires_at }
  // - User table would store emergency_info mapped by user_id
  // - This function would query both tables

  // For now, return mock data if token matches a pattern
  // In production, replace with actual DB query
  
  // Simulate: if token exists in database, return associated emergency info
  if (isValidUUID(token)) {
    // Check if we're in a server context where we might have database access
    // For this MVP, we'll return mock data
    // Real implementation would query the database here
    
    return {
      userName: 'John Doe',
      bloodGroup: 'O+',
      bloodGroupOther: '',
      allergies: 'Peanuts, Penicillin',
      allergiesOther: '',
      medications: 'Metformin 500mg (daily), Lisinopril 10mg (daily)',
      medicationsOther: '',
      emergencyContact: 'Jane Doe - 555-123-4567',
    };
  }

  return null;
}

/**
 * Login Route Handler
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { getQRPublicUrl } from '@/lib/qr';

export async function POST(request: NextRequest) {
  try {
    await db;

    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email);

    // Get QR public URL if QR code exists
    const qrPublicUrl = user.qrCode ? getQRPublicUrl(user.qrCode) : null;

    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          qrCode: user.qrCode,
          qrPublicUrl: qrPublicUrl,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}

/**
 * Signup Route Handler
 * POST /api/auth/signup
 * Creates a new user and returns JWT token with QR code
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import User from '@/models/User';
import MedicalInfo from '@/models/MedicalInfo';
import { generateToken } from '@/lib/auth';
import { generateQRCode, getQRPublicUrl } from '@/lib/qr';

export async function POST(request: NextRequest) {
  try {
    await db;

    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Generate unique QR code
    const qrCode = generateQRCode();

    // Create new user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      qrCode,
    });

    // Create empty medical info record for this user
    await MedicalInfo.create({
      userId: user._id,
    });

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email);

    // Construct response
    const qrPublicUrl = getQRPublicUrl(qrCode);

    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          qrCode: qrCode,
          qrPublicUrl: qrPublicUrl,
        },
        message: 'Signup successful. Please update your medical information.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

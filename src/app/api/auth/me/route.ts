/**
 * Get Current User Route Handler
 * GET /api/auth/me
 * Returns the current authenticated user from JWT cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getAuthenticatedUser } from '@/lib/auth';
import { getQRPublicUrl } from '@/lib/qr';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(authUser.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const qrPublicUrl = user.qrCode ? getQRPublicUrl(user.qrCode) : null;

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        qrCode: user.qrCode,
        qrPublicUrl: qrPublicUrl,
        emergencyDetailsCompleted: user.emergencyDetailsCompleted,
      },
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}


/**
 * Public QR Code Route
 * GET /api/qr/[qrCode] - Get public medical information for QR code
 * No authentication required - Emergency access feature
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import User from '@/models/User';
import MedicalInfo from '@/models/MedicalInfo';
import { isValidQRCode } from '@/lib/qr';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  try {
    await db;

    const { qrCode } = await params;

    // Validate QR code format
    if (!isValidQRCode(qrCode)) {
      return NextResponse.json(
        { error: 'Invalid QR code format' },
        { status: 400 }
      );
    }

    // Find user by QR code
    const user = await User.findOne({ qrCode });
    if (!user) {
      return NextResponse.json(
        { error: 'QR code not found or has been deactivated' },
        { status: 404 }
      );
    }

    // Fetch medical information for this user
    const medicalInfo = await MedicalInfo.findOne({ userId: user._id });

    // Return only public medical information
    // Do NOT expose passwords, email, or private user data
    const publicData = {
      success: true,
      patient: {
        name: `${user.firstName} ${user.lastName}`,
        // Only expose this if medical info exists and has data
      },
      medical: medicalInfo
        ? {
            bloodGroup: medicalInfo.bloodGroup || 'Not specified',
            allergies: medicalInfo.allergies || [],
            chronicConditions: medicalInfo.chronicConditions || [],
            emergencyContact: medicalInfo.emergencyContact || null,
            medications: medicalInfo.medications || [],
          }
        : {
            bloodGroup: 'Not specified',
            allergies: [],
            chronicConditions: [],
            emergencyContact: null,
            medications: [],
          },
    };

    // Set cache headers - Cache for 5 minutes
    // This is safe because QR codes point to immutable emergency data
    return NextResponse.json(publicData, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('QR code retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve QR information' },
      { status: 500 }
    );
  }
}

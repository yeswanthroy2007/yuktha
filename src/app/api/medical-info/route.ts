/**
 * Medical Info Routes
 * GET /api/medical-info - Get user's medical info
 * POST /api/medical-info - Create/update user's medical info
 * PATCH /api/medical-info - Update specific fields
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import MedicalInfo from '@/models/MedicalInfo';
import { getAuthenticatedUser } from '@/lib/auth';

// GET - Fetch user's medical information
export async function GET(request: NextRequest) {
  try {
    await db;

    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const medicalInfo = await MedicalInfo.findOne({ userId: authUser.userId });

    if (!medicalInfo) {
      return NextResponse.json(
        { error: 'Medical information not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: medicalInfo,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get medical info error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical information' },
      { status: 500 }
    );
  }
}

// POST - Create or update medical information
export async function POST(request: NextRequest) {
  try {
    await db;

    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bloodGroup, allergies, chronicConditions, emergencyContact, medications } = body;

    // Find and update, or create if doesn't exist
    let medicalInfo = await MedicalInfo.findOne({ userId: authUser.userId });

    if (!medicalInfo) {
      medicalInfo = new MedicalInfo({ userId: authUser.userId });
    }

    // Update fields
    if (bloodGroup) medicalInfo.bloodGroup = bloodGroup;
    if (allergies) medicalInfo.allergies = allergies;
    if (chronicConditions) medicalInfo.chronicConditions = chronicConditions;
    if (emergencyContact) medicalInfo.emergencyContact = emergencyContact;
    if (medications) medicalInfo.medications = medications;

    await medicalInfo.save();

    return NextResponse.json(
      {
        success: true,
        data: medicalInfo,
        message: 'Medical information updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update medical info error:', error);
    return NextResponse.json(
      { error: 'Failed to update medical information' },
      { status: 500 }
    );
  }
}

// PATCH - Update specific fields
export async function PATCH(request: NextRequest) {
  try {
    await db;

    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const medicalInfo = await MedicalInfo.findOneAndUpdate(
      { userId: authUser.userId },
      body,
      { new: true, runValidators: true }
    );

    if (!medicalInfo) {
      return NextResponse.json(
        { error: 'Medical information not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: medicalInfo,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Patch medical info error:', error);
    return NextResponse.json(
      { error: 'Failed to update medical information' },
      { status: 500 }
    );
  }
}

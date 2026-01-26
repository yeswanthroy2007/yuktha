/**
 * Medical Info Routes
 * GET /api/medical-info - Get user's medical info
 * POST /api/medical-info - Create/update user's medical info
 * PATCH /api/medical-info - Update specific fields
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MedicalInfo from '@/models/MedicalInfo';
import User from '@/models/User';
import { getAuthenticatedUser } from '@/lib/auth';

// GET - Fetch user's medical information
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching medical info...');
    await dbConnect();

    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const medicalInfo = await MedicalInfo.findOne({ userId: authUser.userId });

    if (!medicalInfo) {
      // Return empty structure if not found
      return NextResponse.json(
        {
          success: true,
          data: {
            bloodGroup: '',
            bloodGroupOther: '',
            allergies: '',
            allergiesOther: '',
            medications: '',
            medicationsOther: '',
            emergencyContact: '',
          },
        },
        { status: 200 }
      );
    }

    // Return in format expected by frontend
    return NextResponse.json(
      {
        success: true,
        data: {
          bloodGroup: medicalInfo.bloodGroup || '',
          bloodGroupOther: medicalInfo.bloodGroupOther || '',
          allergies: medicalInfo.allergies || '',
          allergiesOther: medicalInfo.allergiesOther || '',
          medications: medicalInfo.medications || '',
          medicationsOther: medicalInfo.medicationsOther || '',
          emergencyContact: medicalInfo.emergencyContact || '',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Get medical info error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical information' },
      { status: 500 }
    );
  }
}

// POST - Create or update medical information
export async function POST(request: NextRequest) {
  try {
    console.log('💾 Saving medical info...');
    await dbConnect();

    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      bloodGroup, 
      bloodGroupOther, 
      allergies, 
      allergiesOther, 
      medications, 
      medicationsOther, 
      emergencyContact 
    } = body;

    // Validate required fields
    if (!bloodGroup || !allergies || !medications || !emergencyContact) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Process blood group
    const finalBloodGroup = bloodGroup === 'Other' ? (bloodGroupOther || 'Unknown') : bloodGroup;

    // Process allergies
    const finalAllergies = allergies === 'Other' ? (allergiesOther || '') : allergies;

    // Process medications
    const finalMedications = medications === 'Other' ? (medicationsOther || '') : medications;

    // Find and update, or create if doesn't exist
    let medicalInfo = await MedicalInfo.findOne({ userId: authUser.userId });

    if (!medicalInfo) {
      medicalInfo = new MedicalInfo({ userId: authUser.userId });
    }

    // Update fields
    medicalInfo.bloodGroup = finalBloodGroup;
    medicalInfo.bloodGroupOther = bloodGroupOther || '';
    medicalInfo.allergies = finalAllergies;
    medicalInfo.allergiesOther = allergiesOther || '';
    medicalInfo.medications = finalMedications;
    medicalInfo.medicationsOther = medicationsOther || '';
    medicalInfo.emergencyContact = emergencyContact;

    await medicalInfo.save();

    // Update user's emergencyDetailsCompleted flag
    await User.findByIdAndUpdate(authUser.userId, {
      emergencyDetailsCompleted: true,
    });

    console.log('✅ Medical info saved successfully');

    return NextResponse.json(
      {
        success: true,
        message: 'Medical information updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Update medical info error:', error);
    return NextResponse.json(
      { error: 'Failed to update medical information' },
      { status: 500 }
    );
  }
}

// PATCH - Update specific fields
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

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
      { new: true, runValidators: true, upsert: true }
    );

    return NextResponse.json(
      {
        success: true,
        data: medicalInfo,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Patch medical info error:', error);
    return NextResponse.json(
      { error: 'Failed to update medical information' },
      { status: 500 }
    );
  }
}

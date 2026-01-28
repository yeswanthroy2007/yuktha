import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Medicine from '@/models/Medicine';
import MedicalRecord from '@/models/MedicalRecord';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const hospital = await getAuthenticatedUser(request);
        if (!hospital || hospital.role !== 'hospital') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (!hospital.hospitalRoles?.includes('doctor')) {
            return NextResponse.json({ error: 'Only Doctors can prescribe medicines' }, { status: 403 });
        }

        await dbConnect();
        const { userId, name, dosage, time, instructions } = await request.json();

        if (!userId || !name || !dosage || !time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create Medicine entry for User Tracker
        const medicine = await Medicine.create({
            userId,
            name,
            dosage,
            time,
            instructions,
            taken: false,
            prescribedBy: hospital.email,
        });

        // 2. Create/Update Medical Record for history
        await MedicalRecord.create({
            userId,
            hospitalId: hospital.userId,
            prescribedBy: hospital.email,
            medicines: [{
                name,
                dosage,
                frequency: time,
                instructions,
                status: 'Prescribed'
            }]
        });

        return NextResponse.json({
            success: true,
            medicine,
            message: 'Medicine prescribed and recorded successfully'
        });

    } catch (error: any) {
        console.error('Prescribe Error:', error);
        return NextResponse.json({ error: 'Failed to prescribe medicine' }, { status: 500 });
    }
}

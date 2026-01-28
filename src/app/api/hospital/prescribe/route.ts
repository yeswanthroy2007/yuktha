import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Prescription from '@/models/Prescription';
import User from '@/models/User';
import Hospital from '@/models/Hospital';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        console.log('💊 Prescription Request Received');
        await dbConnect();

        // 1. Authentication Check
        const authUser = await getAuthenticatedUser(request);
        if (!authUser || authUser.role !== 'hospital') {
            console.warn('❌ Unauthorized prescription attempt');
            return NextResponse.json({ error: 'Unauthorized: Hospital access required' }, { status: 401 });
        }

        const hospitalId = authUser.userId;
        console.log('🏥 Hospital ID from JWT:', hospitalId);

        // 2. Body Validation
        let body;
        try {
            body = await request.json();
        } catch (e) {
            console.error('❌ Failed to parse body');
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        console.log('📝 Request Body:', JSON.stringify(body, null, 2));

        const { userId, name, dosage, time, instructions, route } = body;

        // Map frontend fields (medForm) to schema fields
        // Frontend: userId, name, dosage, time, instructions, route
        // Schema: patientId, medicineName, dosage, frequency, instructions, route

        if (!userId || !name || !dosage || !time) {
            console.error('❌ Missing required fields');
            return NextResponse.json({
                error: 'Missing required fields: userId, name, dosage, or time'
            }, { status: 400 });
        }

        // 3. Patient Lookup
        console.log('🔍 verifying patient:', userId);
        let patient;
        try {
            patient = await User.findById(userId);
        } catch (err) {
            console.error('❌ Invalid User ID format:', err);
            return NextResponse.json({ error: 'Invalid Patient ID' }, { status: 400 });
        }

        if (!patient) {
            console.error('❌ Patient not found in DB');
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }
        console.log('✅ Patient found:', patient.name);

        // 4. Create Prescription
        const prescriptionData = {
            patientId: userId,
            hospitalId: hospitalId,
            medicineName: name,
            dosage: dosage,
            frequency: time, // mapped from 'time'
            instructions: instructions || '',
            route: route || 'Oral',
            creatorEmail: authUser.email
        };

        console.log('💾 Saving Prescription:', prescriptionData);

        const newPrescription = await Prescription.create(prescriptionData);

        console.log('✅ Prescription Saved! ID:', newPrescription._id);

        return NextResponse.json({
            success: true,
            message: 'Prescription issued successfully',
            prescription: newPrescription
        }, { status: 200 });

    } catch (error: any) {
        console.error('🔥 Prescription API CRASH:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

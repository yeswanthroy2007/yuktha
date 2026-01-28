import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Hospital from '@/models/Hospital';
import { generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if hospital exists
        const hospital = await Hospital.findOne({ email: normalizedEmail }).select('+password');

        if (!hospital) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        if (hospital.status === 'Disabled') {
            return NextResponse.json({ error: 'Account is disabled. Contact Admin.' }, { status: 403 });
        }

        const isMatch = await hospital.comparePassword(password);

        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Generate Token with Role and HospitalType
        const hospitalId = hospital._id.toString();
        console.log('🔑 Hospital Login: Generating token for hospital ID:', hospitalId);
        console.log('🔑 Hospital Login: Hospital name:', hospital.name);
        console.log('🔑 Hospital Login: Hospital email:', hospital.email);

        const token = await generateToken(
            hospitalId,
            hospital.email,
            'hospital',
            hospital.roles as any // Pass the roles array
        );

        console.log('✅ Hospital Login: Token generated successfully');

        const response = NextResponse.json({
            success: true,
            user: {
                id: hospital._id.toString(),
                email: hospital.email,
                name: hospital.name,
                role: 'hospital',
                hospitalRoles: hospital.roles,
            },
            message: 'Login successful',
        });

        setAuthCookie(response, token);

        return response;
    } catch (error: any) {
        console.error('Hospital Login Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

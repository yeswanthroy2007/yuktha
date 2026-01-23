/**
 * Public Emergency Information Page
 * Displays patient emergency information when accessed via QR code token
 * NO AUTHENTICATION REQUIRED
 */

'use client';

import { useParams } from 'next/navigation';
import { useEmergencyInfoFetch } from '@/hooks/use-emergency-info-fetch';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function EmergencyPage() {
  const params = useParams();
  const token = params.token as string;

  const { data: emergencyInfo, loading, error } = useEmergencyInfoFetch(token);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">
            Loading emergency information...
          </p>
        </div>
      </div>
    );
  }

  if (error || !emergencyInfo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 max-w-sm">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900">
            Invalid or Expired QR Code
          </h1>
          <p className="text-center text-gray-600">
            {error || 'Unable to retrieve emergency information'}
          </p>
          <p className="text-center text-sm text-gray-500 mt-4">
            Please contact the patient or try scanning the QR code again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-center">EMERGENCY MEDICAL INFORMATION</h1>
        <p className="text-center text-red-100 text-sm mt-2">Important: This information may be life-saving</p>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Patient Name */}
        <section className="bg-white rounded-lg shadow-md border-l-4 border-red-600 overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-200">
            <h2 className="text-2xl font-bold text-gray-900">{emergencyInfo.userName}</h2>
          </div>
        </section>

        {/* Blood Group - Most Important */}
        <section className="bg-white rounded-lg shadow-md border-l-4 border-blue-600 overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
            <h2 className="text-lg font-bold text-gray-900">BLOOD GROUP</h2>
          </div>
          <div className="px-6 py-6">
            <p className="text-5xl font-bold text-blue-600 text-center">
              {emergencyInfo.bloodGroup || 'NOT PROVIDED'}
            </p>
          </div>
        </section>

        {/* Allergies - Critical */}
        {emergencyInfo.allergies && (
          <section className="bg-white rounded-lg shadow-md border-l-4 border-yellow-600 overflow-hidden">
            <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200">
              <h2 className="text-lg font-bold text-gray-900">⚠️ ALLERGIES</h2>
            </div>
            <div className="px-6 py-6">
              <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
                {emergencyInfo.allergies}
              </p>
            </div>
          </section>
        )}

        {/* Medical Conditions */}
        {emergencyInfo.bloodGroupOther && (
          <section className="bg-white rounded-lg shadow-md border-l-4 border-purple-600 overflow-hidden">
            <div className="bg-purple-50 px-6 py-4 border-b border-purple-200">
              <h2 className="text-lg font-bold text-gray-900">MEDICAL CONDITIONS</h2>
            </div>
            <div className="px-6 py-6">
              <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
                {emergencyInfo.bloodGroupOther}
              </p>
            </div>
          </section>
        )}

        {/* Current Medications */}
        {emergencyInfo.medications && (
          <section className="bg-white rounded-lg shadow-md border-l-4 border-green-600 overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b border-green-200">
              <h2 className="text-lg font-bold text-gray-900">CURRENT MEDICATIONS</h2>
            </div>
            <div className="px-6 py-6">
              <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
                {emergencyInfo.medications}
              </p>
            </div>
          </section>
        )}

        {/* Emergency Contacts */}
        {emergencyInfo.emergencyContact && (
          <section className="bg-white rounded-lg shadow-md border-l-4 border-orange-600 overflow-hidden">
            <div className="bg-orange-50 px-6 py-4 border-b border-orange-200">
              <h2 className="text-lg font-bold text-gray-900">EMERGENCY CONTACT</h2>
            </div>
            <div className="px-6 py-6">
              <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed font-semibold">
                {emergencyInfo.emergencyContact}
              </p>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="text-center py-6 text-sm text-gray-500 space-y-2">
          <p>This emergency information is time-sensitive and confidential.</p>
          <p>DO NOT SHARE or retain this information beyond immediate medical use.</p>
        </div>
      </div>
    </div>
  );
}

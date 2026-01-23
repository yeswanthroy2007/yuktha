'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface MedicalData {
  success: boolean;
  patient: {
    name: string;
  };
  medical: {
    bloodGroup: string;
    allergies: string[];
    chronicConditions: string[];
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    } | null;
    medications: string[];
  };
}

export default function QRPage() {
  const params = useParams();
  const qrCode = params.qrCode as string;
  const [data, setData] = useState<MedicalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/qr/${qrCode}`);
        if (!response.ok) {
          throw new Error('Failed to fetch medical information');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (qrCode) {
      fetchData();
    }
  }, [qrCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg text-gray-600">Loading medical information...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error || 'Could not retrieve medical information'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Emergency Medical Information</h1>
            <p className="text-gray-500">Patient: {data.patient.name}</p>
          </div>

          <div className="space-y-6">
            {/* Blood Group */}
            <div className="border-l-4 border-red-500 pl-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Blood Group</h2>
              <p className="text-2xl font-bold text-red-600">{data.medical.bloodGroup}</p>
            </div>

            {/* Allergies */}
            <div className="border-l-4 border-orange-500 pl-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Allergies</h2>
              {data.medical.allergies.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {data.medical.allergies.map((allergy, index) => (
                    <li key={index} className="text-gray-600">
                      {allergy}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No known allergies</p>
              )}
            </div>

            {/* Chronic Conditions */}
            <div className="border-l-4 border-yellow-500 pl-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Chronic Conditions</h2>
              {data.medical.chronicConditions.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {data.medical.chronicConditions.map((condition, index) => (
                    <li key={index} className="text-gray-600">
                      {condition}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No chronic conditions reported</p>
              )}
            </div>

            {/* Emergency Contact */}
            {data.medical.emergencyContact && (
              <div className="border-l-4 border-green-500 pl-4 bg-green-50 p-4 rounded">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Emergency Contact</h2>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-semibold">Name:</span> {data.medical.emergencyContact.name}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Phone:</span>{' '}
                    <a
                      href={`tel:${data.medical.emergencyContact.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {data.medical.emergencyContact.phone}
                    </a>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Relationship:</span>{' '}
                    {data.medical.emergencyContact.relationship}
                  </p>
                </div>
              </div>
            )}

            {/* Medications */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Current Medications</h2>
              {data.medical.medications.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {data.medical.medications.map((med, index) => (
                    <li key={index} className="text-gray-600">
                      {med}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No medications reported</p>
              )}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>This information is for emergency medical personnel only.</p>
            <p className="mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

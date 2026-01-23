
/**
 * Emergency QR Code Management Page
 * Allows users to view, regenerate, and manage their emergency QR code
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEmergencyInfo } from '@/context/emergency-info-context';
import { useAuth } from '@/context/auth-context';
import { QRCodeDisplay } from '@/components/qr-code-display';
import { generateAndStoreToken, getEmergencyUrl } from '@/lib/emergency-token';
import { RefreshCw, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function EmergencyQrPage() {
  const { user } = useAuth();
  const { emergencyInfo, emergencyToken, generateAndStoreToken: genToken, setIsModalOpen } = useEmergencyInfo();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  const bloodGroupText = emergencyInfo.bloodGroup === 'Other' ? emergencyInfo.bloodGroupOther : emergencyInfo.bloodGroup;
  const allergiesText = emergencyInfo.allergies === 'Other' ? emergencyInfo.allergiesOther : emergencyInfo.allergies;
  const medicationsText = emergencyInfo.medications === 'Other' ? emergencyInfo.medicationsOther : emergencyInfo.medications;
  const hasData = bloodGroupText || allergiesText || medicationsText || emergencyInfo.emergencyContact;

  const emergencyUrl = emergencyToken ? getEmergencyUrl(emergencyToken) : '';

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      genToken();
      setShowRegenerateConfirm(false);
    } catch (error) {
      console.error('Error regenerating token:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleGenerateFirst = () => {
    genToken();
  };

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Emergency QR Code</h1>
          <p className="text-muted-foreground mt-2">
            Share a secure QR code with first responders to access your emergency information.
          </p>
        </div>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">No Emergency Data</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Please complete your emergency medical information first. This includes blood group, allergies, medications, and emergency contacts.
                </p>
                <Button onClick={() => setIsModalOpen(true)}>
                  Fill Emergency Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Emergency QR Code</h1>
        <p className="text-muted-foreground mt-2">
          Share a secure QR code with first responders to access your emergency information instantly.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* QR Code Display */}
        <Card className="md:col-span-1 md:order-1 flex flex-col items-center justify-center p-6">
          {emergencyToken ? (
            <>
              <QRCodeDisplay
                qrData={emergencyUrl}
                size={200}
                showDescription={false}
                copyableUrl={emergencyUrl}
              />
              <p className="mt-4 text-sm text-center text-muted-foreground">
                Scan to view emergency file securely
              </p>
              <Button
                variant="outline"
                className="w-full mt-6"
                onClick={() => setShowRegenerateConfirm(true)}
                disabled={isRegenerating}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {isRegenerating ? 'Regenerating...' : 'Regenerate'}
              </Button>
            </>
          ) : (
            <div className="text-center p-4">
              <h3 className="font-semibold">Generate QR Code</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Create a unique QR code for first responders.
              </p>
              <Button onClick={handleGenerateFirst} className="w-full">
                Generate QR Code
              </Button>
            </div>
          )}
        </Card>

        {/* Emergency Information Summary */}
        <Card className="md:col-span-2 md:order-2">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Your Emergency Information</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(true)}
              >
                Edit
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col pb-4 border-b">
                <span className="text-sm font-medium text-muted-foreground">Blood Group</span>
                <span className="font-semibold text-lg text-blue-600">{bloodGroupText || 'Not set'}</span>
              </div>
              {allergiesText && (
                <div className="flex flex-col pb-4 border-b">
                  <span className="text-sm font-medium text-muted-foreground">Allergies</span>
                  <span className="font-semibold">{allergiesText}</span>
                </div>
              )}
              {medicationsText && (
                <div className="flex flex-col pb-4 border-b">
                  <span className="text-sm font-medium text-muted-foreground">Current Medications</span>
                  <span className="font-semibold">{medicationsText}</span>
                </div>
              )}
              {emergencyInfo.emergencyContact && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">Emergency Contact</span>
                  <span className="font-semibold">{emergencyInfo.emergencyContact}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-blue-900">ℹ️ How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Your QR code encodes a secure link with a unique token</li>
            <li>✓ No personal identifiable information is visible in the code</li>
            <li>✓ First responders can access your medical info by scanning</li>
            <li>✓ Your information is only accessible via this token</li>
            <li>✓ You can regenerate the code at any time to change the token</li>
          </ul>
        </CardContent>
      </Card>

      {/* Regenerate Confirmation Dialog */}
      <AlertDialog open={showRegenerateConfirm} onOpenChange={setShowRegenerateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate QR Code?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new QR code with a different token. The old QR code will no longer work. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerate} disabled={isRegenerating}>
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

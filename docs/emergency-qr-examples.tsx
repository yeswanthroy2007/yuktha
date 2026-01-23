/**
 * Example usage of the Emergency QR system
 * Copy these examples to understand how to use the implementation
 */

'use client';

import { useState } from 'react';
import { useEmergencyInfo } from '@/context/emergency-info-context';
import { QRCodeDisplay } from '@/components/qr-code-display';
import { Button } from '@/components/ui/button';
import {
  generateEmergencyTokenBrowser,
  isValidEmergencyToken,
  getEmergencyUrl,
  storeEmergencyToken,
  getStoredEmergencyToken,
  clearEmergencyToken
} from '@/lib/emergency-token';
import { useEmergencyInfoFetch } from '@/hooks/use-emergency-info-fetch';
import { Loader2, AlertCircle } from 'lucide-react';

// ============================================
// Example 1: Using the Emergency Context
// ============================================

function MyComponent() {
  const {
    emergencyInfo,           // Current emergency details
    setEmergencyInfo,        // Update emergency info
    emergencyToken,          // Current token (null if not generated)
    generateAndStoreToken    // Generate new token
  } = useEmergencyInfo();

  // Display current token
  console.log('Current token:', emergencyToken);

  // Generate token when needed
  const handleGenerateQR = () => {
    const newToken = generateAndStoreToken();
    console.log('New token generated:', newToken);
  };

  return (
    <div>
      <p>Blood Group: {emergencyInfo.bloodGroup}</p>
      <button onClick={handleGenerateQR}>
        {emergencyToken ? 'Regenerate QR' : 'Generate QR'}
      </button>
    </div>
  );
}

// ============================================
// Example 2: Displaying QR Code
// ============================================

function QRCodeExample() {
  const token = 'a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5';
  const emergencyUrl = getEmergencyUrl(token);

  return (
    <QRCodeDisplay
      qrData={emergencyUrl}        // URL to encode in QR
      size={250}                   // Size in pixels
      showDescription={true}       // Show helper text
      copyableUrl={emergencyUrl}   // Allow copy button
    />
  );
}

// ============================================
// Example 3: Fetching Emergency Info (Public Page)
// ============================================

function PublicEmergencyPage({ token }: { token: string }) {
  const { data, loading, error } = useEmergencyInfoFetch(token);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="animate-spin" />
        <p>Loading emergency information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center gap-4">
        <AlertCircle className="text-red-600" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>{data?.userName}</h1>
      <p>Blood Group: {data?.bloodGroup}</p>
      <p>Allergies: {data?.allergies}</p>
      <p>Medications: {data?.medications}</p>
      <p>Emergency Contact: {data?.emergencyContact}</p>
    </div>
  );
}

// ============================================
// Example 4: Token Utilities Usage
// ============================================

function TokenUtilitiesExample() {
  // Generate a new token (async - Web Crypto API is used in browser)
  const generateToken = async () => {
    const token = await generateEmergencyTokenBrowser();
    console.log('Generated token:', token);

    // Validate token format
    if (isValidEmergencyToken(token)) {
      console.log('Token is valid');
    }

    // Get public URL
    const url = getEmergencyUrl(token);
    console.log('Emergency URL:', url);

    // Store token (client-side)
    storeEmergencyToken(token);

    // Retrieve stored token
    const storedToken = getStoredEmergencyToken();
    console.log('Stored token:', storedToken);

    // Clear token (optional)
    // clearEmergencyToken();
  };

  // Call the async function
  generateToken();
}

// ============================================
// Example 5: Complete Flow (from submission to QR)
// ============================================

function EmergencyFormExample() {
  const { setEmergencyInfo, emergencyToken, generateAndStoreToken } = useEmergencyInfo();

  const handleSubmit = async (formData: unknown) => {
    try {
      // 1. Save emergency info
      setEmergencyInfo({
        bloodGroup: 'O+',
        bloodGroupOther: '',
        allergies: 'Peanuts, Penicillin',
        allergiesOther: '',
        medications: 'Metformin 500mg',
        medicationsOther: '',
        emergencyContact: 'Jane Doe - 555-1234'
      });

      // 2. Generate token (can be done immediately after)
      const newToken = generateAndStoreToken();
      console.log('QR code token:', newToken);

      // 3. Show success
      alert('Emergency info saved! QR code ready for sharing.');
    } catch (error) {
      console.error('Error saving emergency info:', error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({});
    }}>
      <input type="text" placeholder="Blood Group" />
      <input type="text" placeholder="Allergies" />
      <button type="submit">Save & Generate QR</button>
      {emergencyToken && <p>✓ QR code ready: {emergencyToken.slice(0, 8)}...</p>}
    </form>
  );
}

// ============================================
// Example 6: API Call (if needed in custom code)
// ============================================

async function fetchEmergencyInfo(token: string) {
  try {
    const response = await fetch(`/api/emergency/${token}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Invalid or expired emergency QR');
      }
      throw new Error('Failed to fetch emergency information');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching emergency info:', error);
    throw error;
  }
}

// Usage
async function showEmergencyInfo(token: string) {
  try {
    const info = await fetchEmergencyInfo(token);
    console.log('Emergency Info:', info);
    // Display info in UI
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(errorMessage);
  }
}

// ============================================
// Example 7: Integrating into Existing Components
// ============================================

function IntegratedEmergencyPanel() {
  const { emergencyInfo, emergencyToken, generateAndStoreToken } = useEmergencyInfo();

  const hasData = emergencyInfo.bloodGroup || emergencyInfo.allergies;

  if (!hasData) {
    return <p>Complete emergency info to generate QR code</p>;
  }

  const emergencyUrl = emergencyToken ? getEmergencyUrl(emergencyToken) : '';

  return (
    <div className="p-4 border rounded-lg">
      <h3>Emergency QR Code</h3>
      {emergencyToken ? (
        <>
          <p>Token: {emergencyToken}</p>
          <p>URL: {emergencyUrl}</p>
          <Button onClick={() => navigator.clipboard.writeText(emergencyUrl)}>
            Copy Link
          </Button>
        </>
      ) : (
        <Button onClick={generateAndStoreToken}>
          Generate QR Code
        </Button>
      )}
    </div>
  );
}

// ============================================
// Example 8: Testing the Flow
// ============================================

async function testEmergencyQRFlow() {
  console.log('=== Emergency QR Test ===\n');

  // 1. Generate token
  const token = await generateEmergencyTokenBrowser();
  console.log('1. Generated token:', token);

  // 2. Validate token
  const isValid = isValidEmergencyToken(token);
  console.log('2. Token valid:', isValid);

  // 3. Create URL
  const url = getEmergencyUrl(token);
  console.log('3. Emergency URL:', url);

  // 4. Store token
  storeEmergencyToken(token);
  console.log('4. Token stored');

  // 5. Retrieve token
  const retrieved = getStoredEmergencyToken();
  console.log('5. Retrieved token:', retrieved);

  // 6. Verify match
  console.log('6. Tokens match:', token === retrieved);

  console.log('\n=== Test Complete ===');
}

// Run test: testEmergencyQRFlow();

// ============================================
// Example 9: Error Handling
// ============================================

async function robustEmergencyFetch(token: string) {
  if (!token) {
    return { error: 'No token provided', data: null };
  }

  if (!isValidEmergencyToken(token)) {
    return { error: 'Invalid token format', data: null };
  }

  try {
    const response = await fetch(`/api/emergency/${token}`);

    if (response.status === 400) {
      return { error: 'Invalid token format', data: null };
    }

    if (response.status === 404) {
      return { error: 'Emergency QR code not found or expired', data: null };
    }

    if (response.status === 410) {
      return { error: 'Emergency QR code has been deactivated', data: null };
    }

    if (!response.ok) {
      return { error: 'Server error', data: null };
    }

    const data = await response.json();
    return { error: null, data };
  } catch (error) {
    console.error('Fetch error:', error);
    return { error: 'Network error', data: null };
  }
}

// ============================================
// Example 10: QR Code Regeneration
// ============================================

function QRRegenerationExample() {
  const { emergencyToken, generateAndStoreToken } = useEmergencyInfo();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    if (!window.confirm('This will create a new QR code and invalidate the old one. Continue?')) {
      return;
    }

    setIsRegenerating(true);
    try {
      const newToken = await generateAndStoreToken();
      console.log('New token generated:', newToken);
      alert('QR code regenerated successfully!');
    } catch (error) {
      console.error('Error regenerating:', error);
      alert('Failed to regenerate QR code');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div>
      {emergencyToken && (
        <>
          <p>Current QR: {emergencyToken.slice(0, 12)}...</p>
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            {isRegenerating ? 'Regenerating...' : 'Regenerate QR Code'}
          </button>
        </>
      )}
    </div>
  );
}

export {
  MyComponent,
  QRCodeExample,
  PublicEmergencyPage,
  TokenUtilitiesExample,
  EmergencyFormExample,
  fetchEmergencyInfo,
  IntegratedEmergencyPanel,
  testEmergencyQRFlow,
  robustEmergencyFetch,
  QRRegenerationExample
};

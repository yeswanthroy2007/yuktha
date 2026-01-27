
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { EmergencyInfo } from '@/lib/data';
import { generateEmergencyTokenBrowser, storeEmergencyToken, getStoredEmergencyToken } from '@/lib/emergency-token';

interface EmergencyInfoContextType {
  emergencyInfo: EmergencyInfo;
  setEmergencyInfo: React.Dispatch<React.SetStateAction<EmergencyInfo>>;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  emergencyToken: string | null;
  generateAndStoreToken: () => Promise<string>;
}

const EmergencyInfoContext = createContext<EmergencyInfoContextType | undefined>(undefined);

const getInitialState = (): EmergencyInfo => {
  if (typeof window === 'undefined') {
    // Return empty state during SSR
    return {
      bloodGroup: '',
      bloodGroupOther: '',
      allergies: '',
      allergiesOther: '',
      medications: '',
      medicationsOther: '',
      emergencyContact: ''
    };
  }
  const storedInfo = localStorage.getItem('yuktha-emergency-info');
  if (storedInfo) {
    try {
      const parsedInfo = JSON.parse(storedInfo);
      // Ensure all fields are present, if not, initialize
      return {
        bloodGroup: parsedInfo.bloodGroup || '',
        bloodGroupOther: parsedInfo.bloodGroupOther || '',
        allergies: parsedInfo.allergies || '',
        allergiesOther: parsedInfo.allergiesOther || '',
        medications: parsedInfo.medications || '',
        medicationsOther: parsedInfo.medicationsOther || '',
        emergencyContact: parsedInfo.emergencyContact || '',
      };
    } catch (error) {
      console.error("Failed to parse emergency info from localStorage", error);
    }
  }
  return {
    bloodGroup: '',
    bloodGroupOther: '',
    allergies: '',
    allergiesOther: '',
    medications: '',
    medicationsOther: '',
    emergencyContact: ''
  };
};

export const EmergencyInfoProvider = ({ children }: { children: ReactNode }) => {
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo>(getInitialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emergencyToken, setEmergencyToken] = useState<string | null>(null);

  // Load token on mount from backend
  useEffect(() => {
    const loadToken = async () => {
      try {
        const response = await fetch('/api/emergency-token');
        if (response.ok) {
          const data = await response.json();
          if (data.data?.token) {
            setEmergencyToken(data.data.token);
            // Also store locally as cache
            storeEmergencyToken(data.data.token);
          } else {
            // Fallback to localStorage if backend has no token
            const storedToken = getStoredEmergencyToken();
            if (storedToken) {
              setEmergencyToken(storedToken);
            }
          }
        } else {
          // Fallback to localStorage if backend request fails
          const storedToken = getStoredEmergencyToken();
          if (storedToken) {
            setEmergencyToken(storedToken);
          }
        }
      } catch (error) {
        console.error('Error loading emergency token:', error);
        // Fallback to localStorage
        const storedToken = getStoredEmergencyToken();
        if (storedToken) {
          setEmergencyToken(storedToken);
        }
      }
    };

    if (typeof window !== 'undefined') {
      loadToken();
    }
  }, []);

  const generateAndStoreToken = async (): Promise<string> => {
    // Generate token on server side
    try {
      const response = await fetch('/api/emergency-token', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.token) {
          const newToken = data.data.token;
          setEmergencyToken(newToken);
          storeEmergencyToken(newToken);
          return newToken;
        }
      }

      throw new Error('Failed to generate token from server');
    } catch (error) {
      console.error('Error storing emergency token:', error);
      // Fallback only if absolutely necessary, but preferably fail to warn user
      // For now, if server fails, we don't set a token to avoid false security
      throw error;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasFilledInfo = localStorage.getItem('yuktha-emergency-info-filled');
      if (!hasFilledInfo) {
        const timer = setTimeout(() => setIsModalOpen(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('yuktha-emergency-info', JSON.stringify(emergencyInfo));
      const isInfoEmpty = !emergencyInfo.bloodGroup && !emergencyInfo.allergies && !emergencyInfo.medications && !emergencyInfo.emergencyContact;

      if (!isInfoEmpty) {
        localStorage.setItem('yuktha-emergency-info-filled', 'true');
      }
    }
  }, [emergencyInfo]);

  return (
    <EmergencyInfoContext.Provider value={{ emergencyInfo, setEmergencyInfo, isModalOpen, setIsModalOpen, emergencyToken, generateAndStoreToken }}>
      {children}
    </EmergencyInfoContext.Provider>
  );
};

export const useEmergencyInfo = () => {
  const context = useContext(EmergencyInfoContext);
  if (context === undefined) {
    throw new Error('useEmergencyInfo must be used within an EmergencyInfoProvider');
  }
  return context;
};


"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { EmergencyInfo, mockEmergencyInfo } from '@/lib/data';
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
        return mockEmergencyInfo; // Return mock data during SSR
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

  // Load token on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = getStoredEmergencyToken();
      if (storedToken) {
        setEmergencyToken(storedToken);
      }
    }
  }, []);

  const generateAndStoreToken = async (): Promise<string> => {
    const token = await generateEmergencyTokenBrowser();
    storeEmergencyToken(token);
    setEmergencyToken(token);
    return token;
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

        if(!isInfoEmpty) {
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

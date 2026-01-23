
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockReports, Report } from '@/lib/data';

interface ReportContextType {
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  addReport: (report: Report) => void;
  removeReport: (reportId: string) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider = ({ children }: { children: ReactNode }) => {
  const [reports, setReports] = useState<Report[]>(mockReports);

  const addReport = (report: Report) => {
    setReports(prevReports => [...prevReports, report]);
  };

  const removeReport = (reportId: string) => {
    setReports(prevReports => prevReports.filter(report => report.id !== reportId));
  }

  return (
    <ReportContext.Provider value={{ reports, setReports, addReport, removeReport }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportProvider');
  }
  return context;
};

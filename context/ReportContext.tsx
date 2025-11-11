import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { NGReport, ReportStatus } from '../types';
import { INITIAL_DEFECT_TYPE_OPTIONS, INITIAL_ITEM_OPTIONS } from '../constants';


interface ReportContextType {
  reports: NGReport[];
  defectTypes: string[];
  items: string[];
  addDefectType: (newType: string) => void;
  addItem: (newItem: string) => void;
  getReportById: (id: string) => NGReport | undefined;
  addReport: (report: Omit<NGReport, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => NGReport;
  updateReport: (id: string, updates: Partial<NGReport>) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

const initialReports: NGReport[] = [];


export const ReportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<NGReport[]>(initialReports);
  const [defectTypes, setDefectTypes] = useState<string[]>(INITIAL_DEFECT_TYPE_OPTIONS);
  const [items, setItems] = useState<string[]>(INITIAL_ITEM_OPTIONS);

  const getReportById = useCallback((id: string) => {
    return reports.find(report => report.id === id);
  }, [reports]);

  const addDefectType = (newType: string) => {
    if (newType && !defectTypes.includes(newType)) {
      setDefectTypes(prevTypes => [...prevTypes, newType]);
    }
  };
  
  const addItem = (newItem: string) => {
    if (newItem && !items.includes(newItem)) {
      setItems(prevItems => [...prevItems, newItem]);
    }
  };

  const addReport = (reportData: Omit<NGReport, 'id' | 'createdAt' | 'updatedAt' | 'status'>): NGReport => {
    const newReport: NGReport = {
      ...reportData,
      id: `NG-${String(reports.length + 1).padStart(3, '0')}`,
      status: ReportStatus.NEW,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setReports(prevReports => [newReport, ...prevReports]);
    return newReport;
  };

  const updateReport = (id: string, updates: Partial<NGReport>) => {
    setReports(prevReports =>
      prevReports.map(report =>
        report.id === id ? { ...report, ...updates, updatedAt: new Date().toISOString() } : report
      )
    );
  };

  return (
    <ReportContext.Provider value={{ reports, getReportById, addReport, updateReport, defectTypes, addDefectType, items, addItem }}>
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
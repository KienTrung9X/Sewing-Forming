import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { NGReport, ReportStatus } from '../types';

// =================================================================================
// TODO: CONFIGURE YOUR SUPABASE CREDENTIALS
// =================================================================================
// 1. Go to your Supabase project dashboard.
// 2. Navigate to Project Settings > API.
// 3. Find your Project URL and your `anon` public key.
// 4. Paste them into the `supabaseUrl` and `supabaseKey` variables below.
// =================================================================================
const supabaseUrl = 'https://your-project-id.supabase.co'; // <-- PASTE YOUR SUPABASE URL HERE
const supabaseKey = 'your-anon-key'; // <-- PASTE YOUR SUPABASE ANON KEY HERE

// A check to remind the developer to replace the placeholder values.
// This prevents the app from crashing, but functionality will be broken until configured.
if (supabaseUrl === 'https://your-project-id.supabase.co' || supabaseKey === 'your-anon-key') {
  console.warn(`
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    !!!                    ATTENTION                         !!!
    !!!                                                      !!!
    !!!    You have not configured your Supabase credentials.  !!!
    !!!    Please open 'context/ReportContext.tsx' and       !!!
    !!!    replace the placeholder URL and Key with your own.  !!!
    !!!                                                      !!!
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  `);
}


export const supabase = createClient(supabaseUrl, supabaseKey);

interface ReportContextType {
  reports: NGReport[];
  defectTypes: string[];
  items: string[];
  loading: boolean;
  error: Error | null;
  addDefectType: (newType: string) => Promise<void>;
  addItem: (newItem: string) => Promise<void>;
  addReport: (report: Omit<NGReport, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<NGReport>;
  updateReport: (id: string, updates: Partial<NGReport>) => Promise<void>;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<NGReport[]>([]);
  const [defectTypes, setDefectTypes] = useState<string[]>([]);
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Prevent API calls with placeholder credentials for a better DX.
    if (supabaseUrl === 'https://your-project-id.supabase.co' || supabaseKey === 'your-anon-key') {
      setError(new Error("Supabase is not configured. Please update credentials in 'context/ReportContext.tsx'"));
      setLoading(false);
      return;
    }

    try {
      const [reportsRes, defectTypesRes, itemsRes] = await Promise.all([
        supabase.from('reports').select('*').order('created_at', { ascending: false }),
        supabase.from('defect_types').select('name'),
        supabase.from('items').select('name'),
      ]);

      if (reportsRes.error) throw reportsRes.error;
      if (defectTypesRes.error) throw defectTypesRes.error;
      if (itemsRes.error) throw itemsRes.error;
      
      // Supabase returns snake_case, we map to camelCase to match our NGReport type
      const formattedReports = reportsRes.data.map((r: any) => ({
        id: r.id,
        item: r.item,
        machineName: r.machine_name,
        formingMachineName: r.forming_machine_name,
        model: r.model,
        lotNo: r.lot_no,
        qtyNg: r.qty_ng,
        defectType: r.defect_type,
        images: r.images,
        notes: r.notes,
        status: r.status,
        rootCause: r.root_cause,
        action: r.action,
        pic: r.pic,
        deadline: r.deadline,
        reporter: r.reporter,
        occurrenceDate: r.occurrence_date,
        shift: r.shift,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));


      setReports(formattedReports);
      setDefectTypes(defectTypesRes.data?.map(d => d.name) || []);
      setItems(itemsRes.data?.map(i => i.name) || []);

    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addDefectType = async (newType: string) => {
    if (newType && !defectTypes.includes(newType)) {
       const { data, error } = await supabase.from('defect_types').insert({ name: newType }).select();
       if (error) {
         console.error("Error adding defect type:", error);
         throw error;
       }
       if (data) {
         setDefectTypes(prev => [...prev, newType]);
       }
    }
  };
  
  const addItem = async (newItem: string) => {
    if (newItem && !items.includes(newItem)) {
      const { data, error } = await supabase.from('items').insert({ name: newItem }).select();
       if (error) {
         console.error("Error adding item:", error);
         throw error;
       }
       if (data) {
          setItems(prev => [...prev, newItem]);
       }
    }
  };

  const addReport = async (reportData: Omit<NGReport, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<NGReport> => {
     const reportToInsert = {
        item: reportData.item,
        machine_name: reportData.machineName,
        forming_machine_name: reportData.formingMachineName,
        model: reportData.model,
        lot_no: reportData.lotNo,
        qty_ng: reportData.qtyNg,
        defect_type: reportData.defectType,
        images: reportData.images,
        notes: reportData.notes,
        reporter: reportData.reporter,
        occurrence_date: reportData.occurrenceDate,
        shift: reportData.shift,
        status: ReportStatus.NEW,
     };

     const { data, error } = await supabase.from('reports').insert(reportToInsert).select().single();
     if (error) {
         console.error("Error adding report:", error);
         throw error;
     }

     const newReport = { // Map back to camelCase
        id: data.id,
        item: data.item,
        machineName: data.machine_name,
        formingMachineName: data.forming_machine_name,
        model: data.model,
        lotNo: data.lot_no,
        qtyNg: data.qty_ng,
        defectType: data.defect_type,
        images: data.images,
        notes: data.notes,
        status: data.status,
        rootCause: data.root_cause,
        action: data.action,
        pic: data.pic,
        deadline: data.deadline,
        reporter: data.reporter,
        occurrenceDate: data.occurrence_date,
        shift: data.shift,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
     }

     setReports(prev => [newReport, ...prev]);
     return newReport;
  };

  const updateReport = async (id: string, updates: Partial<NGReport>) => {
    const updatesForDb: { [key: string]: any } = {};
    for (const key in updates) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        updatesForDb[dbKey] = (updates as any)[key];
      }
    }
    updatesForDb.updated_at = new Date().toISOString();


    const { error } = await supabase.from('reports').update(updatesForDb).eq('id', id);
    if (error) {
        console.error("Error updating report:", error);
        throw error;
    }
    
    setReports(prevReports =>
      prevReports.map(report =>
        report.id === id ? { ...report, ...updates, updatedAt: updatesForDb.updated_at } : report
      )
    );
  };

  return (
    <ReportContext.Provider value={{ reports, addReport, updateReport, defectTypes, addDefectType, items, addItem, loading, error }}>
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
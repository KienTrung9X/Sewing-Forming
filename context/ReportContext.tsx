import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NGReport, ReportStatus } from '../types';

// =================================================================================
// TODO: CONFIGURE YOUR SUPABASE CREDENTIALS
// =================================================================================
// 1. Go to your Supabase project dashboard.
// 2. Navigate to Project Settings > API.
// 3. Find your Project URL and your `anon` public key.
// 4. Paste them into the `supabaseUrl` and `supabaseKey` variables below.
// =================================================================================
const supabaseUrl = 'https://ngxyslapfugyvecfrjit.supabase.co'; // <-- PASTE YOUR SUPABASE URL HERE
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5neHlzbGFwZnVneXZlY2Zyaml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MTAzMTEsImV4cCI6MjA3ODQ4NjMxMX0.ALWzTjly2c1Ju91dfvmVi0ciRIoav5iNMmKgO0hrEW0'; // <-- PASTE YOUR SUPABASE ANON KEY HERE

const isSupabaseConfigured = supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id') && !supabaseKey.includes('your-anon-key');

interface ReportContextType {
  reports: NGReport[];
  defectTypes: string[];
  items: string[];
  loading: boolean;
  error: string | null;
  supabase: SupabaseClient | null;
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
  const [error, setError] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    if (isSupabaseConfigured) {
      try {
        const supabaseClient = createClient(supabaseUrl, supabaseKey);
        setSupabase(supabaseClient);
      } catch (e: any) {
        console.error("Supabase client initialization failed:", e);
        setError(`Lỗi khởi tạo kết nối Supabase: ${e.message}. Vui lòng kiểm tra lại URL và Key trong file 'context/ReportContext.tsx'.`);
        setLoading(false);
      }
    } else {
      setError("Cấu hình Supabase chưa chính xác. Vui lòng mở file 'context/ReportContext.tsx' và điền thông tin của bạn.");
      setLoading(false);
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
  }, []); // Run this effect only once on mount

  const fetchData = useCallback(async () => {
    if (!supabase) return; // Guard clause if supabase is not initialized

    setLoading(true);
    
    try {
      const [reportsRes, defectTypesRes, itemsRes] = await Promise.all([
        supabase.from('reports').select('*').order('created_at', { ascending: false }),
        supabase.from('defect_types').select('name'),
        supabase.from('items').select('name'),
      ]);

      if (reportsRes.error) throw reportsRes.error;
      if (defectTypesRes.error) throw defectTypesRes.error;
      if (itemsRes.error) throw itemsRes.error;
      
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
      setError(null); // Clear previous errors on successful fetch

    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(`Lỗi tải dữ liệu từ Supabase: ${err.message}. Vui lòng kiểm tra lại quyền (policies) của các bảng.`);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (supabase) {
      fetchData();
    }
  }, [supabase, fetchData]);

  const addDefectType = async (newType: string) => {
    if (!supabase) throw new Error("Supabase client is not initialized.");
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
    if (!supabase) throw new Error("Supabase client is not initialized.");
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
     if (!supabase) throw new Error("Supabase client is not initialized.");
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
    if (!supabase) throw new Error("Supabase client is not initialized.");
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
    <ReportContext.Provider value={{ reports, addReport, updateReport, defectTypes, addDefectType, items, addItem, loading, error, supabase }}>
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

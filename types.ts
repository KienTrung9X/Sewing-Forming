// FIX: Removed circular self-import that caused name conflicts.
// The file was importing types from itself, which is not allowed.

export enum ReportStatus {
  NEW = 'Mới',
  IN_PROGRESS = 'Đang xử lý',
  ROOT_CAUSE_FOUND = 'Đã tìm ra nguyên nhân',
  FIXED = 'Đã khắc phục',
}

export enum DefectType {
  STITCHING = 'Lỗi đường may',
  MATERIAL = 'Lỗi vật liệu',
  ALIGNMENT = 'Lỗi lệch',
  DIMENSION = 'Sai kích thước',
  OTHER = 'Khác',
}

export interface NGReport {
  id: string;
  item: string; 
  machineName: string; // Sewing Machine Name
  formingMachineName: string; // Forming Machine Name
  model: string;
  lotNo: string;
  qtyNg: number;
  unit: 'KG' | 'M';
  defectType: string; 
  images: string[]; 
  notes?: string;
  status: ReportStatus;
  rootCause?: string;
  action?: string;
  pic?: string;
  deadline?: string;
  reporter: string; // 'Người nhập lỗi'
  occurrenceDate: string; // 'Ngày phát sinh'
  shift: 'Ca 1' | 'Ca 2' | 'Ca 3'; // 'Ca phát sinh'
  createdAt: string;
  updatedAt: string;
}
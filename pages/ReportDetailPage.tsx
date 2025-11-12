import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReports } from '../context/ReportContext';
import { NGReport, ReportStatus } from '../types';
import { REPORT_STATUS_OPTIONS } from '../constants';
import Modal from '../components/Modal';

const statusColorMap: Record<ReportStatus, string> = {
  [ReportStatus.NEW]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  [ReportStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  [ReportStatus.ROOT_CAUSE_FOUND]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  [ReportStatus.FIXED]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
};

const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateReport, supabase } = useReports();
  
  const [report, setReport] = useState<NGReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [status, setStatus] = useState<ReportStatus>(ReportStatus.NEW);
  const [rootCause, setRootCause] = useState('');
  const [action, setAction] = useState('');
  const [pic, setPic] = useState('');
  const [deadline, setDeadline] = useState('');
  const [modalImage, setModalImage] = useState<string | null>(null);

  const inputFieldClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  const fetchReport = useCallback(async () => {
    if (!id || !supabase) return;
    setLoading(true);
    setError(null);
    try {
        const { data, error } = await supabase.from('reports').select('*').eq('id', id).single();
        if (error) throw error;
        if (data) {
             const fetchedReport = { // Map back to camelCase
                id: data.id,
                item: data.item,
                machineName: data.machine_name,
                formingMachineName: data.forming_machine_name,
                model: data.model,
                lotNo: data.lot_no,
                qtyNg: data.qty_ng,
                unit: data.unit,
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
             };
            setReport(fetchedReport);
            setStatus(fetchedReport.status);
            setRootCause(fetchedReport.rootCause || '');
            setAction(fetchedReport.action || '');
            setPic(fetchedReport.pic || '');
            setDeadline(fetchedReport.deadline || '');
        } else {
            setError("Không tìm thấy báo cáo.");
        }
    } catch (err: any) {
        console.error("Error fetching report:", err);
        setError(err.message);
    } finally {
        setLoading(false);
    }
  }, [id, supabase]);


  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleUpdate = async () => {
    if (id) {
        const updates = { status, rootCause, action, pic, deadline };
        try {
            await updateReport(id, updates);
            setIsEditing(false);
            if(report) {
                setReport({ ...report, ...updates, updatedAt: new Date().toISOString() });
            }
        } catch(err) {
            alert("Lỗi khi cập nhật báo cáo. Vui lòng thử lại.");
        }
    }
  };

  const handlePrintClick = () => {
    if (report && window.confirm('Bạn có chắc muốn in phiếu NG này không?')) {
      navigate(`/print/${report.id}`);
    }
  };

  const handleEditClick = () => {
    if (report && report.status === ReportStatus.FIXED) {
      if (window.confirm("Báo cáo này đã được đánh dấu là 'Đã khắc phục'. Bạn có chắc chắn muốn chỉnh sửa lại không?")) {
        setIsEditing(true);
      }
    } else {
      setIsEditing(true);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500 dark:text-gray-400">Đang tải báo cáo...</div>;
  }
  
  if (error) {
    return <div className="text-center text-red-500">Lỗi: {error}</div>;
  }

  if (!report) {
    return <div className="text-center text-gray-500 dark:text-gray-400">Không tìm thấy báo cáo.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
    Chi tiết Báo cáo Lỗi NG - {report.item} - {new Date(report.occurrenceDate).toLocaleDateString()}
</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tạo phiếu lúc {new Date(report.createdAt).toLocaleString()}</p>
        </div>
        <span className={`px-4 py-1 text-sm font-bold rounded-full ${statusColorMap[report.status]}`}>
            {report.status}
        </span>
      </div>

      {/* Report Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 border-t border-gray-200 dark:border-slate-700 pt-6">
        <div className="space-y-4">
          <InfoItem label="Item" value={report.item} />
          <InfoItem label="PR Sewing" value={report.model} />
          <InfoItem label="PR Forming" value={report.lotNo} />
          <InfoItem label="Tên máy Forming" value={report.formingMachineName} />
          <InfoItem label="Số lượng NG" value={`${report.qtyNg} ${report.unit}`} highlight />
        </div>
        <div className="space-y-4">
          <InfoItem label="Tên máy Sewing" value={report.machineName} />
          <InfoItem label="loại lỗi Element" value={report.defectType} />
          <InfoItem label="Người báo cáo" value={report.reporter} />
          <InfoItem label="Ngày phát sinh" value={new Date(report.occurrenceDate).toLocaleDateString()} />
          <InfoItem label="Ca phát sinh" value={report.shift} />
          <InfoItem label="Cập nhật lần cuối" value={new Date(report.updatedAt).toLocaleString()} />
        </div>
      </div>
      {report.notes && <div className="mt-6 border-t border-gray-200 dark:border-slate-700 pt-6"><InfoItem label="Ghi chú" value={report.notes} /></div>}

      {/* Images */}
      <div className="mt-6 border-t border-gray-200 dark:border-slate-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Hình ảnh lỗi</h3>
        <div className="flex flex-wrap gap-4">
          {report.images.map((img, index) => (
            <img key={index} src={img} alt={`Defect ${index + 1}`} className="h-32 w-32 object-cover rounded-md cursor-pointer border border-gray-200 dark:border-slate-600 hover:opacity-80" onClick={() => setModalImage(img)}/>
          ))}
        </div>
      </div>

      {/* Forming Update Section */}
      <div className="mt-8 border-t border-gray-200 dark:border-slate-700 pt-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Cập nhật từ Bộ phận Forming</h2>
        {!isEditing ? (
          <div className="space-y-4">
            <InfoItem label="Trạng thái hiện tại" value={report.status} />
            <InfoItem label="Nguyên nhân gốc" value={report.rootCause || 'Chưa xác định'} />
            <InfoItem label="Hành động khắc phục" value={report.action || 'Chưa xác định'} />
            <InfoItem label="Người phụ trách" value={report.pic || 'Chưa gán'} />
            <InfoItem label="Hạn chót" value={report.deadline ? new Date(report.deadline).toLocaleDateString() : 'Chưa đặt'} />
            <div className="flex justify-end mt-4">
                <button onClick={handleEditClick} className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">Cập nhật Trạng thái</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className={labelClasses}>Trạng thái</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as ReportStatus)} className={inputFieldClasses}>
                {REPORT_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClasses}>Nguyên nhân gốc (5 Why)</label>
              <textarea value={rootCause} onChange={(e) => setRootCause(e.target.value)} rows={3} className={inputFieldClasses} />
            </div>
            <div>
              <label className={labelClasses}>Hành động khắc phục</label>
              <textarea value={action} onChange={(e) => setAction(e.target.value)} rows={3} className={inputFieldClasses} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Người phụ trách</label>
                <input type="text" value={pic} onChange={(e) => setPic(e.target.value)} className={inputFieldClasses} />
              </div>
              <div>
                <label className={labelClasses}>Hạn chót</label>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputFieldClasses} />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setIsEditing(false)} className="py-2 px-4 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">Hủy</button>
              <button onClick={handleUpdate} className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700">Lưu thay đổi</button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-between">
         <button onClick={() => navigate('/dashboard')} className="py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600">Quay lại Bảng điều khiển</button>
         <button onClick={handlePrintClick} className="py-2 px-4 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">In Phiếu</button>
      </div>
      <Modal isOpen={!!modalImage} onClose={() => setModalImage(null)}>
        {modalImage && <img src={modalImage} alt="Enlarged defect" className="max-w-full max-h-[80vh]"/>}
      </Modal>
    </div>
  );
};

const InfoItem: React.FC<{label: string, value: string, highlight?: boolean}> = ({label, value, highlight = false}) => (
    <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className={`text-md text-gray-900 dark:text-gray-100 ${highlight ? 'font-bold text-red-500' : ''}`}>{value}</p>
    </div>
)

export default ReportDetailPage;
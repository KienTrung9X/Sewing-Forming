import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../context/ReportContext';
import { NGReport } from '../types';

const PrintReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<NGReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchReport = useCallback(async () => {
    if (!id) return;
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
        } else {
            setError("Không tìm thấy báo cáo.");
        }
    } catch (err: any) {
        console.error("Error fetching report:", err);
        setError(err.message);
    } finally {
        setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleConfirmAndPrint = () => {
    window.print();
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
     return <div className="text-center text-gray-500">Đang tải dữ liệu in...</div>
  }

  if (error || !report) {
    return (
      <div className="text-center">
        <p className="text-red-500">{error || "Không tìm thấy báo cáo."}</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-md">Quay lại Bảng điều khiển</button>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto p-4 print:p-0">
        <div id="print-content" className="p-6 border-2 border-dashed border-black bg-white text-black" style={{ width: '100%', maxWidth: '800px' }}>
          <h1 className="text-3xl font-bold text-center mb-4">PHIẾU BÁO CÁO LỖI NG</h1>
          <h2 className="text-xl font-semibold text-center mb-6">CHUYỀN MAY → FORMING</h2>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-lg">
            <div><strong>Item:</strong> {report.item}</div>
            <div><strong>Model:</strong> {report.model}</div>
            <div><strong>Tên máy Sewing:</strong> {report.machineName}</div>
            <div><strong>Mã lô Forming:</strong> {report.lotNo}</div>
            <div><strong>Tên máy Forming:</strong> {report.formingMachineName}</div>
            <div><strong>Loại lỗi:</strong> {report.defectType}</div>
            <div className="font-bold text-red-600"><strong>Số lượng NG:</strong> {report.qtyNg}</div>
            <div><strong>Người báo:</strong> {report.reporter}</div>
            <div><strong>Ngày phát sinh:</strong> {new Date(report.occurrenceDate).toLocaleDateString()}</div>
            <div><strong>Ca phát sinh:</strong> {report.shift}</div>
            <div className="col-span-2"><strong>Thời gian báo:</strong> {new Date(report.createdAt).toLocaleString()}</div>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-dashed border-black">
            <h3 className="font-bold text-xl mb-2">Ảnh lỗi:</h3>
            <div className="flex flex-wrap gap-4">
              {report.images.map((img, index) => (
                <img key={index} src={img} alt={`Defect ${index + 1}`} className="w-48 h-48 object-contain border border-gray-400" />
              ))}
            </div>
             {report.notes && <div className="mt-4"><strong className="text-lg">Ghi chú:</strong><p className="text-md mt-1">{report.notes}</p></div>}
          </div>
        </div>
      </div>
      <div className="mt-8 text-center print:hidden">
        <p className="mb-2 font-semibold text-gray-700 dark:text-gray-300">Đây là bản xem trước của phiếu NG.</p>
        <p className="mb-4 text-gray-600 dark:text-gray-400">Nhấn "Xác nhận & In" để tiếp tục, hoặc "Hủy" để quay lại.</p>
        <button onClick={handleConfirmAndPrint} className="py-2 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
          Xác nhận & In
        </button>
         <button onClick={handleCancel} className="ml-4 py-2 px-6 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600">
          Hủy
        </button>
      </div>
    </div>
  );
};

export default PrintReportPage;
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../context/ReportContext';
import { NGReport, ReportStatus } from '../types';
import Modal from '../components/Modal';

const statusColorMap: Record<ReportStatus, string> = {
  [ReportStatus.NEW]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  [ReportStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  [ReportStatus.ROOT_CAUSE_FOUND]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  [ReportStatus.FIXED]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
};

const DashboardPage: React.FC = () => {
  const { reports, defectTypes, items, loading, error } = useReports();
  const navigate = useNavigate();
  const [filterItem, setFilterItem] = useState<string>('');
  const [filterDefect, setFilterDefect] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [modalImage, setModalImage] = useState<string | null>(null);

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const itemMatch = filterItem ? report.item === filterItem : true;
      const defectMatch = filterDefect ? report.defectType === filterDefect : true;
      const dateMatch = filterDate ? report.occurrenceDate === filterDate : true;
      return itemMatch && defectMatch && dateMatch;
    });
  }, [reports, filterItem, filterDefect, filterDate]);

  const viewReportDetails = (id: string) => {
    navigate(`/report/${id}`);
  };

  const inputClasses = "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white";

  if (loading) {
    return <div className="text-center text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</div>
  }
  
  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-10 p-6 bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg text-center">
        <h2 className="text-xl font-bold text-red-800 dark:text-red-200">Đã xảy ra lỗi</h2>
        <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Vui lòng kiểm tra lại thông tin cấu hình Supabase trong file `context/ReportContext.tsx` và chắc chắn rằng bạn có kết nối mạng.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Bảng điều khiển Lỗi NG</h1>

      {/* Filters */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="itemFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lọc theo Item</label>
          <select id="itemFilter" value={filterItem} onChange={e => setFilterItem(e.target.value)} className={inputClasses}>
            <option value="">Tất cả Item</option>
            {items.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="defectFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lọc theo loại lỗi</label>
          <select id="defectFilter" value={filterDefect} onChange={e => setFilterDefect(e.target.value)} className={inputClasses}>
            <option value="">Tất cả loại lỗi</option>
            {defectTypes.map(defect => <option key={defect} value={defect}>{defect}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lọc theo ngày phát sinh</label>
          <input type="date" id="dateFilter" value={filterDate} onChange={e => setFilterDate(e.target.value)} className={inputClasses}/>
        </div>
      </div>
      
      {/* Report List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-900">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item/Model</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã Lô / Máy Forming</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Số lượng NG</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loại lỗi</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ảnh</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng thái</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Người báo / Ngày</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredReports.map(report => (
                        <tr key={report.id} onClick={() => viewReportDetails(report.id)} className="hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{report.item} / {report.model}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <div>{report.lotNo}</div>
                                <div className="text-xs">{report.formingMachineName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-bold">{report.qtyNg}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{report.defectType}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {report.images && report.images.length > 0 && (
                                  <img src={report.images[0]} alt="Defect" className="h-10 w-10 rounded-md object-cover cursor-pointer" onClick={(e) => { e.stopPropagation(); setModalImage(report.images[0]); }} />
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[report.status]}`}>
                                    {report.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <div>{report.reporter}</div>
                                <div className="text-xs">{report.shift} - {new Date(report.occurrenceDate).toLocaleDateString()}</div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {/* Mobile Cards */}
        <div className="md:hidden space-y-4 p-4">
            {filteredReports.map(report => (
                <div key={report.id} onClick={() => viewReportDetails(report.id)} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{report.item} / {report.model}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Lô: {report.lotNo} / Máy: {report.formingMachineName}</p>
                        </div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[report.status]}`}>{report.status}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm">
                            <p className="text-gray-700 dark:text-gray-300"><strong>Loại lỗi:</strong> {report.defectType}</p>
                            <p className="text-gray-700 dark:text-gray-300"><strong>Số lượng NG:</strong> <span className="text-red-500 font-bold">{report.qtyNg}</span></p>
                        </div>
                         {report.images && report.images.length > 0 && (
                            <img src={report.images[0]} alt="Defect" className="h-16 w-16 rounded-md object-cover cursor-pointer" onClick={(e) => { e.stopPropagation(); setModalImage(report.images[0]); }}/>
                         )}
                    </div>
                    <div className="mt-2 text-right text-xs text-gray-400 dark:text-gray-500">
                        {report.shift} - {new Date(report.occurrenceDate).toLocaleDateString()} bởi {report.reporter}
                    </div>
                </div>
            ))}
        </div>
      </div>
      <Modal isOpen={!!modalImage} onClose={() => setModalImage(null)}>
        {modalImage && <img src={modalImage} alt="Enlarged defect" className="max-w-full max-h-[80vh]"/>}
      </Modal>
    </div>
  );
};

export default DashboardPage;
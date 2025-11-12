import React, { useMemo, useState, useEffect } from 'react';
import { useReports } from '../context/ReportContext';
import { useTheme } from '../context/ThemeContext';

// Recharts is loaded from CDN. We declare its presence on the window object for TypeScript.
declare global {
  interface Window {
    Recharts: any;
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#775DD0'];

const AnalyticsPage: React.FC = () => {
  const { reports, loading, error } = useReports();
  const { theme } = useTheme();
  const [isRechartsLoaded, setIsRechartsLoaded] = useState(typeof window.Recharts !== 'undefined');

  useEffect(() => {
    if (isRechartsLoaded) return;

    const interval = setInterval(() => {
      if (typeof window.Recharts !== 'undefined') {
        setIsRechartsLoaded(true);
        clearInterval(interval);
      }
    }, 100); // Check every 100ms

    return () => clearInterval(interval); // Cleanup on unmount
  }, [isRechartsLoaded]);


  const defectsByType = useMemo(() => {
    const counts: { [key: string]: { [unit: string]: number } } = {};
    for (const report of reports) {
      if (!counts[report.defectType]) {
        counts[report.defectType] = {};
      }
      counts[report.defectType][report.unit] = (counts[report.defectType][report.unit] || 0) + report.qtyNg;
    }
    return Object.entries(counts).map(([name, quantities]) => ({ name, quantities })).sort((a, b) => {
      const aTotal = Object.values(a.quantities).reduce((sum, qty) => sum + qty, 0);
      const bTotal = Object.values(b.quantities).reduce((sum, qty) => sum + qty, 0);
      return bTotal - aTotal;
    });
  }, [reports]);

  const defectsByItem = useMemo(() => {
    const counts: { [key: string]: { [unit: string]: number } } = {};
    for (const report of reports) {
      if (!counts[report.item]) {
        counts[report.item] = {};
      }
      counts[report.item][report.unit] = (counts[report.item][report.unit] || 0) + report.qtyNg;
    }
    return Object.entries(counts).map(([name, quantities]) => ({ name, quantities })).sort((a, b) => {
        const aTotal = Object.values(a.quantities).reduce((sum, qty) => sum + qty, 0);
        const bTotal = Object.values(b.quantities).reduce((sum, qty) => sum + qty, 0);
        return bTotal - aTotal;
    });
  }, [reports]);

  const defectsByShift = useMemo(() => {
    const counts: { [key: string]: { [unit: string]: number } } = {};
    for (const report of reports) {
      if (!counts[report.shift]) {
        counts[report.shift] = {};
      }
      counts[report.shift][report.unit] = (counts[report.shift][report.unit] || 0) + report.qtyNg;
    }
    return Object.entries(counts).map(([name, quantities]) => ({ name, quantities }));
  }, [reports]);

  if (loading) {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Bảng Thống Kê</h1>
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md text-center">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Đang tải dữ liệu thống kê...</h2>
            </div>
        </div>
    );
  }

  if (error) {
     return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Bảng Thống Kê</h1>
            <div className="max-w-2xl mx-auto my-10 p-6 bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg text-center">
              <h2 className="text-xl font-bold text-red-800 dark:text-red-200">Không thể tải dữ liệu thống kê</h2>
              <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
            </div>
        </div>
     );
  }

  if (!isRechartsLoaded) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Bảng Thống Kê</h1>
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Đang tải thư viện biểu đồ...</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Biểu đồ sẽ xuất hiện ở đây. Nếu không, vui lòng tải lại trang.</p>
        </div>
      </div>
    );
  }

  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } = window.Recharts;
  
  const tickColor = theme === 'dark' ? '#a0aec0' : '#4a5568';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';
  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#2d3748' : '#ffffff',
    border: '1px solid',
    borderColor: theme === 'dark' ? '#4a5568' : '#e2e8f0',
    color: theme === 'dark' ? '#ffffff' : '#000000'
  };

  const defectsByTypeForChart = useMemo(() => {
    return defectsByType.map(item => ({
      name: item.name,
      qty: Object.values(item.quantities).reduce((sum, qty) => sum + qty, 0)
    }));
  }, [defectsByType]);

  const defectsByItemForChart = useMemo(() => {
    return defectsByItem.map(item => ({
      name: item.name,
      value: Object.values(item.quantities).reduce((sum, qty) => sum + qty, 0)
    }));
  }, [defectsByItem]);

  const defectsByShiftForChart = useMemo(() => {
    return defectsByShift.map(item => ({
      name: item.name,
      qty: Object.values(item.quantities).reduce((sum, qty) => sum + qty, 0)
    }));
  }, [defectsByShift]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Bảng Thống Kê</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md space-y-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Số lượng NG theo loại lỗi Element</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={defectsByTypeForChart} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
                <XAxis dataKey="name" tick={{ fill: tickColor }} />
                <YAxis allowDecimals={false} tick={{ fill: tickColor }}/>
                <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(128, 128, 128, 0.1)'}}/>
                <Legend wrapperStyle={{ color: tickColor }}/>
                <Bar dataKey="qty" name="Số lượng NG" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">loại lỗi Element</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tổng số lượng NG</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {defectsByType.map((item) => (
                  <tr key={item.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-bold">
                      {Object.entries(item.quantities).map(([unit, qty]) => `${qty} ${unit}`).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md space-y-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Phân bổ NG theo Item</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={defectsByItemForChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {defectsByItemForChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: tickColor }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
           <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tổng số lượng NG</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {defectsByItem.map((item) => (
                  <tr key={item.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-bold">
                        {Object.entries(item.quantities).map(([unit, qty]) => `${qty} ${unit}`).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md space-y-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Số lượng NG theo Ca</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={defectsByShiftForChart} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
                <XAxis dataKey="name" tick={{ fill: tickColor }} />
                <YAxis allowDecimals={false} tick={{ fill: tickColor }}/>
                <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(128, 128, 128, 0.1)'}}/>
                <Legend wrapperStyle={{ color: tickColor }}/>
                <Bar dataKey="qty" name="Số lượng NG" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
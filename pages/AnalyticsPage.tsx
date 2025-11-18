import React, { useMemo, useEffect, useRef } from 'react';
import { useReports } from '../context/ReportContext';
import { useTheme } from '../context/ThemeContext';

declare const Chart: any;

const AnalyticsPage: React.FC = () => {
  const { reports, loading, error } = useReports();
  const { theme } = useTheme();
  const defectChartRef = useRef<HTMLCanvasElement>(null);
  const itemChartRef = useRef<HTMLCanvasElement>(null);
  const shiftChartRef = useRef<HTMLCanvasElement>(null);


  const defectsByType = useMemo(() => {
    const counts: { [key: string]: number } = {};
    reports.forEach(r => counts[r.defectType] = (counts[r.defectType] || 0) + r.qtyNg);
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [reports]);

  const defectsByItem = useMemo(() => {
    const counts: { [key: string]: number } = {};
    reports.forEach(r => counts[r.item] = (counts[r.item] || 0) + r.qtyNg);
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [reports]);

  const defectsByShift = useMemo(() => {
    const counts: { [key: string]: number } = {};
    reports.forEach(r => counts[r.shift] = (counts[r.shift] || 0) + r.qtyNg);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [reports]);

  useEffect(() => {
    if (!reports.length || typeof Chart === 'undefined') return;

    const textColor = theme === 'dark' ? '#e2e8f0' : '#1f2937';
    const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    if (defectChartRef.current) {
      const ctx = defectChartRef.current.getContext('2d');
      if (ctx) {
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: defectsByType.map(d => d.name),
            datasets: [{ label: 'Số lượng NG (KG)', data: defectsByType.map(d => d.value), backgroundColor: '#3b82f6' }]
          },
          options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } }, x: { ticks: { color: textColor }, grid: { color: gridColor } } }, plugins: { legend: { labels: { color: textColor } } } }
        });
      }
    }

    if (itemChartRef.current) {
      const ctx = itemChartRef.current.getContext('2d');
      if (ctx) {
        new Chart(ctx, {
          type: 'pie',
          data: {
            labels: defectsByItem.map(d => d.name),
            datasets: [{ data: defectsByItem.map(d => d.value), backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'] }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: textColor } } } }
        });
      }
    }

    if (shiftChartRef.current) {
      const ctx = shiftChartRef.current.getContext('2d');
      if (ctx) {
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: defectsByShift.map(d => d.name),
            datasets: [{ label: 'Số lượng NG (KG)', data: defectsByShift.map(d => d.value), backgroundColor: '#ef4444' }]
          },
          options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } }, x: { ticks: { color: textColor }, grid: { color: gridColor } } }, plugins: { legend: { labels: { color: textColor } } } }
        });
      }
    }
  }, [reports, defectsByType, defectsByItem, defectsByShift, theme]);

  if (loading) return <div className="text-center text-gray-500 dark:text-gray-400">Đang tải...</div>;
  if (error) return <div className="text-center text-red-500">Lỗi: {error}</div>;

  const totalNG = reports.reduce((sum, r) => sum + r.qtyNg, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Bảng Thống Kê</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <h3 className="text-sm text-gray-600 dark:text-gray-400">Tổng báo cáo</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{reports.length}</p>
        </div>
        <div className="p-6 bg-red-50 dark:bg-red-900/30 rounded-lg">
          <h3 className="text-sm text-gray-600 dark:text-gray-400">Tổng NG</h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{totalNG} KG</p>
        </div>
        <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg">
          <h3 className="text-sm text-gray-600 dark:text-gray-400">Loại lỗi</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{defectsByType.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Số lượng NG theo loại lỗi</h2>
          <div style={{ height: '300px' }}>
            <canvas ref={defectChartRef}></canvas>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Top 10 Item có NG nhiều nhất</h2>
          <div style={{ height: '300px' }}>
            <canvas ref={itemChartRef}></canvas>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Số lượng NG theo Ca</h2>
          <div style={{ height: '300px' }}>
            <canvas ref={shiftChartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
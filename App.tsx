
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ReportProvider } from './context/ReportContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import CreateReportPage from './pages/CreateReportPage';
import ReportDetailPage from './pages/ReportDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PrintReportPage from './pages/PrintReportPage';

function App() {
  return (
    <ThemeProvider>
      <ReportProvider>
        <HashRouter>
          <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-800 font-sans transition-colors duration-300">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/create" element={<CreateReportPage />} />
                <Route path="/report/:id" element={<ReportDetailPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/print/:id" element={<PrintReportPage />} />
              </Routes>
            </main>
          </div>
        </HashRouter>
      </ReportProvider>
    </ThemeProvider>
  );
}

export default App;
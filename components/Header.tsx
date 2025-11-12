import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
    }`;

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10 print:hidden transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex flex-col">
              <span className="font-bold text-xl ml-2 text-gray-800 dark:text-gray-100">
                Quản lý Lỗi NG giữa Sewing và Fomring
              </span>
              <span className="text-xs ml-2 text-gray-500 dark:text-gray-400">
                Design by Kiên
              </span>
            </div>
          </div>
          <div className="flex items-center">
             <nav className="hidden md:flex items-center space-x-4">
              <NavLink to="/dashboard" className={navLinkClass}>Bảng điều khiển</NavLink>
              <NavLink to="/create" className={navLinkClass}>Tạo Báo Cáo</NavLink>
              <NavLink to="/analytics" className={navLinkClass}>Thống Kê</NavLink>
            </nav>
            <button
              onClick={toggleTheme}
              className="ml-4 p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>
        </div>
      </div>
       {/* Mobile Navigation */}
      <nav className="md:hidden bg-gray-100 dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex justify-around">
            <NavLink to="/dashboard" className={navLinkClass}>Bảng điều khiển</NavLink>
            <NavLink to="/create" className={navLinkClass}>Tạo</NavLink>
            <NavLink to="/analytics" className={navLinkClass}>Thống Kê</NavLink>
          </div>
      </nav>
    </header>
  );
};

export default Header;

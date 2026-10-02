// Download Menu Dropdown Component for Tables & Charts
import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, Image, ChevronDown } from 'lucide-react';
import { exportToExcel, exportToCSV, exportChartToPNG } from '../../utils/exportUtils';

export function DownloadMenu({
  data = null,
  fileName = 'Export_Data',
  chartContainerId = null,
  label = 'Download',
  size = 'xs'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportExcel = () => {
    if (data && data.length > 0) {
      exportToExcel(data, `${fileName}.xlsx`);
    }
    setIsOpen(false);
  };

  const handleExportCSV = () => {
    if (data && data.length > 0) {
      exportToCSV(data, `${fileName}.csv`);
    }
    setIsOpen(false);
  };

  const handleExportPNG = () => {
    if (chartContainerId) {
      exportChartToPNG(chartContainerId, `${fileName}.png`);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-[#344054] bg-white hover:bg-[#F9FAFB] border border-[#D0D5DD] hover:border-[#1E74C7] rounded-lg transition-all shadow-2xs cursor-pointer active:scale-98"
        title="Download Menu"
      >
        <Download className="w-3 h-3 text-[#1E74C7]" />
        <span>{label}</span>
        <ChevronDown className={`w-2.5 h-2.5 text-[#667085] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white border border-[#E4E7EC] rounded-xl shadow-xl py-1 text-xs">
          {data && data.length > 0 && (
            <>
              <button
                onClick={handleExportExcel}
                className="w-full px-3 py-1.5 text-left text-[#344054] hover:bg-[#F2F7FD] hover:text-[#0D3E77] flex items-center gap-2 font-medium cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#12B76A]" />
                <span>Download Excel (.xlsx)</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="w-full px-3 py-1.5 text-left text-[#344054] hover:bg-[#F2F7FD] hover:text-[#0D3E77] flex items-center gap-2 font-medium cursor-pointer transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-[#1E74C7]" />
                <span>Download CSV (.csv)</span>
              </button>
            </>
          )}

          {chartContainerId && (
            <button
              onClick={handleExportPNG}
              className="w-full px-3 py-1.5 text-left text-[#344054] hover:bg-[#F2F7FD] hover:text-[#0D3E77] flex items-center gap-2 font-medium cursor-pointer transition-colors border-t border-[#E4E7EC]"
            >
              <Image className="w-3.5 h-3.5 text-[#C89B3C]" />
              <span>Download Gambar (.png)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

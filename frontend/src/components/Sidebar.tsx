import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <aside
      className="w-sidebar-width h-screen fixed left-0 top-0 bg-white dark:bg-inverse-surface border-r border-outline-variant dark:border-outline shadow-sm flex flex-col py-stack-md z-30 transition-all duration-300"
      id="sidebar"
    >
      <div className="px-gutter mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg">
          <span
            className="material-symbols-outlined text-white"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            domain
          </span>
        </div>
        <div>
          <p className="font-caption text-secondary">Property Management</p>
        </div>
      </div>

      {/* Booking / Customer links (Liem) */}
      <div className="mt-8 mb-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Booking & Lưu trú (Liêm)
      </div>
      <nav className="flex-1 px-4 space-y-1">
        <NavLink 
          to="/dat-coc" 
          className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive ? 'bg-[#1E3A8A] text-white shadow-md' : 'text-[#64748B] hover:bg-blue-50 hover:text-[#1E3A8A]'}`}
        >
          <span className="material-symbols-outlined mr-3 text-[20px]">add_circle</span>
          Đặt cọc (KH)
        </NavLink>
        <NavLink 
          to="/thanh-toan-coc" 
          className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive ? 'bg-[#1E3A8A] text-white shadow-md' : 'text-[#64748B] hover:bg-blue-50 hover:text-[#1E3A8A]'}`}
        >
          <span className="material-symbols-outlined mr-3 text-[20px]">payments</span>
          Thanh toán cọc (KH)
        </NavLink>
        <NavLink 
          to="/ho-so-dat-coc" 
          className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive ? 'bg-[#1E3A8A] text-white shadow-md' : 'text-[#64748B] hover:bg-blue-50 hover:text-[#1E3A8A]'}`}
        >
          <span className="material-symbols-outlined mr-3 text-[20px]">folder_supervised</span>
          Hồ sơ đặt cọc (Admin)
        </NavLink>
        <NavLink 
          to="/yeu-cau-tra-phong" 
          className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive ? 'bg-[#1E3A8A] text-white shadow-md' : 'text-[#64748B] hover:bg-blue-50 hover:text-[#1E3A8A]'}`}
        >
          <span className="material-symbols-outlined mr-3 text-[20px]">output</span>
          Yêu cầu trả phòng (KH)
        </NavLink>
      </nav>

      {/* Settings section */}
      <div className="p-4 border-t border-gray-100">
        <NavLink
          to="/room_check"
          className={({ isActive }) =>
            `w-full flex items-center px-gutter py-3 gap-3 transition-all ${
              isActive
                ? 'text-primary dark:text-inverse-primary font-bold border-l-4 border-primary dark:border-inverse-primary bg-surface-container-low dark:bg-surface-container-high'
                : 'text-secondary hover:bg-surface-container hover:text-primary font-body border-l-4 border-transparent'
            }`
          }
        >
          <span className="material-symbols-outlined">exit_to_app</span>
          <span className="font-body">Xử lý trả phòng</span>
        </NavLink>

        <NavLink
          to="/refund_check"
          className={({ isActive }) =>
            `w-full flex items-center px-gutter py-3 gap-3 transition-all ${
              isActive
                ? 'text-primary dark:text-inverse-primary font-bold border-l-4 border-primary dark:border-inverse-primary bg-surface-container-low dark:bg-surface-container-high'
                : 'text-secondary hover:bg-surface-container hover:text-primary font-body border-l-4 border-transparent'
            }`
          }
        >
          <span className="material-symbols-outlined">payments</span>
          <span className="font-body">Xử lý hoàn cọc</span>
        </NavLink>
      </div>
      <div className="px-gutter pt-4 mt-auto border-t border-outline-variant">
        <button className="flex items-center w-full px-4 py-2 gap-3 text-secondary hover:text-primary hover:bg-surface-container transition-colors rounded-lg mb-2">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-body">Settings</span>
        </button>
        <button className="flex items-center w-full px-4 py-2 gap-3 text-secondary hover:text-primary hover:bg-surface-container transition-colors rounded-lg">
          <span className="material-symbols-outlined">help</span>
          <span className="font-body">Support</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

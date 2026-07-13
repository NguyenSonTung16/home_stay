import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  return (
    <aside
      className="w-sidebar-width h-screen hidden md:flex fixed left-0 top-0 bg-white dark:bg-inverse-surface border-r border-outline-variant dark:border-outline shadow-sm flex-col py-stack-md z-30 transition-all duration-300"
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

      <nav className="flex-1 space-y-1">
        {/* Khách hàng hoặc người dùng thường */}
        <div className="mt-4 mb-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Dịch vụ Khách hàng
        </div>
        <NavLink 
          to="/dat-coc" 
          className={({isActive}) => `w-full flex items-center px-gutter py-3 gap-3 transition-all ${isActive ? 'text-primary font-bold border-l-4 border-primary bg-surface-container-low' : 'text-secondary hover:bg-surface-container hover:text-primary font-body border-l-4 border-transparent'}`}
        >
          <span className="material-symbols-outlined">add_circle</span>
          <span className="font-body">Đặt cọc</span>
        </NavLink>
        <NavLink 
          to="/thanh-toan-coc" 
          className={({isActive}) => `w-full flex items-center px-gutter py-3 gap-3 transition-all ${isActive ? 'text-primary font-bold border-l-4 border-primary bg-surface-container-low' : 'text-secondary hover:bg-surface-container hover:text-primary font-body border-l-4 border-transparent'}`}
        >
          <span className="material-symbols-outlined">payments</span>
          <span className="font-body">Thanh toán cọc</span>
        </NavLink>
        <NavLink 
          to="/yeu-cau-tra-phong" 
          className={({isActive}) => `w-full flex items-center px-gutter py-3 gap-3 transition-all ${isActive ? 'text-primary font-bold border-l-4 border-primary bg-surface-container-low' : 'text-secondary hover:bg-surface-container hover:text-primary font-body border-l-4 border-transparent'}`}
        >
          <span className="material-symbols-outlined">output</span>
          <span className="font-body">Yêu cầu trả phòng</span>
        </NavLink>

        {/* Quản lý / Admin / Nhân viên */}
        {(user?.role === 'QuanLy' || user?.role === 'Admin' || user?.role === 'KeToan' || user?.role === 'Sale') && (
          <>
            <div className="mt-8 mb-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quản lý (Nội bộ)
            </div>

            {(user?.role === 'QuanLy' || user?.role === 'Admin' || user?.role === 'KeToan') && (
              <NavLink 
                to="/ho-so-dat-coc" 
                className={({isActive}) => `w-full flex items-center px-gutter py-3 gap-3 transition-all ${isActive ? 'text-primary font-bold border-l-4 border-primary bg-surface-container-low' : 'text-secondary hover:bg-surface-container hover:text-primary font-body border-l-4 border-transparent'}`}
              >
                <span className="material-symbols-outlined">folder_supervised</span>
                <span className="font-body">Hồ sơ đặt cọc</span>
              </NavLink>
            )}

            {(user?.role === 'QuanLy' || user?.role === 'Admin') && (
              <NavLink
                to="/room_check"
                className={({ isActive }) =>
                  `w-full flex items-center px-gutter py-3 gap-3 transition-all ${
                    isActive
                      ? 'text-primary font-bold border-l-4 border-primary bg-surface-container-low'
                      : 'text-secondary hover:bg-surface-container hover:text-primary font-body border-l-4 border-transparent'
                  }`
                }
              >
                <span className="material-symbols-outlined">exit_to_app</span>
                <span className="font-body">Xử lý trả phòng</span>
              </NavLink>
            )}

            {(user?.role === 'KeToan' || user?.role === 'Admin') && (
              <NavLink
                to="/refund_check"
                className={({ isActive }) =>
                  `w-full flex items-center px-gutter py-3 gap-3 transition-all ${
                    isActive
                      ? 'text-primary font-bold border-l-4 border-primary bg-surface-container-low'
                      : 'text-secondary hover:bg-surface-container hover:text-primary font-body border-l-4 border-transparent'
                  }`
                }
              >
                <span className="material-symbols-outlined">payments</span>
                <span className="font-body">Xử lý hoàn cọc</span>
              </NavLink>
            )}
            
            {(user?.role === 'Sale' || user?.role === 'Admin') && (
              <NavLink
                to="/appointment_check"
                className={({ isActive }) =>
                  `w-full flex items-center px-gutter py-3 gap-3 transition-all ${
                    isActive
                      ? 'text-primary font-bold border-l-4 border-primary bg-surface-container-low'
                      : 'text-secondary hover:bg-surface-container hover:text-primary font-body border-l-4 border-transparent'
                  }`
                }
              >
                <span className="material-symbols-outlined">calendar_month</span>
                <span className="font-body">Xử lý lịch hẹn</span>
              </NavLink>
            )}
          </>
        )}
      </nav>

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

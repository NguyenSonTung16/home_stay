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
        {user?.role === 'QuanLy' && (
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
        )}

        {user?.role === 'KeToan' && (
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
        )}
        
        {user?.role === 'Khach' && (
          <NavLink
            to="/request_checkout"
            className={({ isActive }) =>
              `w-full flex items-center px-gutter py-3 gap-3 transition-all ${
                isActive
                  ? 'text-primary dark:text-inverse-primary font-bold border-l-4 border-primary dark:border-inverse-primary bg-surface-container-low dark:bg-surface-container-high'
                  : 'text-secondary hover:bg-surface-container hover:text-primary font-body border-l-4 border-transparent'
              }`
            }
          >
            <span className="material-symbols-outlined">outbox</span>
            <span className="font-body">Yêu cầu trả phòng</span>
          </NavLink>
        )}
      </nav>
      
      <div className="mt-auto px-gutter space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container hover:text-primary rounded-lg transition-colors">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-body">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container hover:text-primary rounded-lg transition-colors">
          <span className="material-symbols-outlined">help</span>
          <span className="font-body">Support</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
